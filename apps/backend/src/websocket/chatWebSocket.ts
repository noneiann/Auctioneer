import { Server, Socket } from "socket.io";
import { JwtPayloadUser } from "@auctioneer/types";
import prisma from "@auctioneer/db";

interface AuthenticatedSocket extends Socket {
	data: {
		user?: JwtPayloadUser;
	};
}

const typingUsers = new Map<string, Set<string>>();

export default function chatWebSocket(io: Server, socket: AuthenticatedSocket) {
	const user = socket.data.user;

	// Join chat room
	socket.on(
		"join_chat",
		async (data: { chatId: string; chatType?: "auction" | "direct" }) => {
			try {
				const { chatId } = data;
				const roomName = `chat:${chatId}`;

				socket.join(roomName);
				console.log(`User ${user?.email} joined chat ${chatId}`);

				// Send chat history to the user
				const messages = await prisma.chatMessage.findMany({
					where: { conversationId: chatId },
					orderBy: { createdAt: "desc" },
					take: 50,
					include: {
						sender: { select: { email: true } },
					},
				});

				const history = messages
					.slice()
					.reverse()
					.map((message) => ({
						id: message.id,
						chatId: message.conversationId,
						senderId: message.senderId,
						senderEmail: message.sender.email,
						content: message.content,
						createdAt: message.createdAt.toISOString(),
						read: message.read,
					}));
				socket.emit("chat_history", {
					chatId,
					messages: history,
					participantCount: io.sockets.adapter.rooms.get(roomName)?.size || 0,
				});

				// Notify others in the room
				socket.to(roomName).emit("user_joined_chat", {
					userId: user?.userId,
					username: user?.email,
					participantCount: io.sockets.adapter.rooms.get(roomName)?.size || 0,
				});
			} catch (error) {
				console.error("Error joining chat:", error);
				socket.emit("error", { message: "Failed to join chat" });
			}
		}
	);

	// Leave chat room
	socket.on("leave_chat", (chatId: string) => {
		const roomName = `chat:${chatId}`;
		socket.leave(roomName);

		// Remove from typing users
		const typingSet = typingUsers.get(chatId);
		if (typingSet) {
			typingSet.delete(user?.userId || "");
			if (typingSet.size === 0) {
				typingUsers.delete(chatId);
			}
		}

		console.log(`User ${user?.email} left chat ${chatId}`);

		// Notify others in the room
		socket.to(roomName).emit("user_left_chat", {
			userId: user?.userId,
			participantCount: io.sockets.adapter.rooms.get(roomName)?.size || 0,
		});
	});

	// Send message
	socket.on(
		"send_message",
		async (data: { chatId: string; message: string }) => {
			try {
				const { chatId, message } = data;

				if (!message || message.trim().length === 0) {
					socket.emit("message_error", { message: "Message cannot be empty" });
					return;
				}

				if (message.length > 1000) {
					socket.emit("message_error", {
						message: "Message too long (max 1000 characters)",
					});
					return;
				}

				if (!user?.userId || !user?.email) {
					socket.emit("message_error", { message: "Unauthorized" });
					return;
				}

				const savedMessage = await prisma.chatMessage.create({
					data: {
						conversationId: chatId,
						senderId: user.userId,
						content: message.trim(),
					},
					include: {
						sender: { select: { email: true } },
					},
				});

				const newMessage = {
					id: savedMessage.id,
					chatId: savedMessage.conversationId,
					senderId: savedMessage.senderId,
					senderEmail: savedMessage.sender.email,
					content: savedMessage.content,
					createdAt: savedMessage.createdAt.toISOString(),
					read: savedMessage.read,
				};

				// Broadcast to all users in chat room
				const roomName = `chat:${chatId}`;
				io.to(roomName).emit("new_message", newMessage);

				// Clear typing indicator for this user
				const typingSet = typingUsers.get(chatId);
				if (typingSet) {
					typingSet.delete(user?.userId || "");
					socket.to(roomName).emit("stop_typing", {
						userId: user?.userId,
						typingUsers: Array.from(typingSet),
					});
				}

				console.log(`Message sent in chat ${chatId} by ${user?.email}`);
			} catch (error) {
				console.error("Error sending message:", error);
				socket.emit("message_error", { message: "Failed to send message" });
			}
		}
	);

	// Typing indicator
	socket.on("typing", (chatId: string) => {
		const roomName = `chat:${chatId}`;

		// Add user to typing set
		if (!typingUsers.has(chatId)) {
			typingUsers.set(chatId, new Set());
		}
		const typingSet = typingUsers.get(chatId)!;
		typingSet.add(user?.userId || "");

		// Broadcast to others in the room
		socket.to(roomName).emit("user_typing", {
			userId: user?.userId,
			username: user?.email,
			typingUsers: Array.from(typingSet),
		});
	});

	// Stop typing indicator
	socket.on("stop_typing", (chatId: string) => {
		const roomName = `chat:${chatId}`;

		// Remove user from typing set
		const typingSet = typingUsers.get(chatId);
		if (typingSet) {
			typingSet.delete(user?.userId || "");

			// Broadcast to others in the room
			socket.to(roomName).emit("stop_typing", {
				userId: user?.userId,
				typingUsers: Array.from(typingSet),
			});

			if (typingSet.size === 0) {
				typingUsers.delete(chatId);
			}
		}
	});

	// Mark messages as read
	socket.on(
		"mark_read",
		async (data: { chatId: string; messageIds: string[] }) => {
			const { chatId, messageIds } = data;
			const roomName = `chat:${chatId}`;

			// Update messages in database
			await prisma.chatMessage.updateMany({
				where: { id: { in: messageIds }, conversationId: chatId },
				data: { read: true },
			});

			// Notify others that messages were read
			socket.to(roomName).emit("messages_read", {
				chatId,
				messageIds,
				readBy: user?.userId,
			});
		}
	);

	// Delete message (optional feature)
	socket.on(
		"delete_message",
		async (data: { chatId: string; messageId: string }) => {
			try {
				const { chatId, messageId } = data;
				if (!user?.userId) {
					socket.emit("error", { message: "Unauthorized" });
					return;
				}

				const message = await prisma.chatMessage.findUnique({
					where: { id: messageId },
					select: { senderId: true, conversationId: true },
				});

				if (!message || message.conversationId !== chatId) {
					socket.emit("error", { message: "Message not found" });
					return;
				}

				if (message.senderId !== user.userId) {
					socket.emit("error", {
						message: "Cannot delete someone else's message",
					});
					return;
				}

				await prisma.chatMessage.delete({ where: { id: messageId } });

				// Broadcast deletion to all users in chat room
				const roomName = `chat:${chatId}`;
				io.to(roomName).emit("message_deleted", {
					chatId,
					messageId,
					deletedBy: user?.userId,
				});

				console.log(`Message ${messageId} deleted by ${user?.email}`);
			} catch (error) {
				console.error("Error deleting message:", error);
				socket.emit("error", { message: "Failed to delete message" });
			}
		}
	);
}
