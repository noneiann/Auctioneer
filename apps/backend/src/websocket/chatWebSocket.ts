import { Server, Socket } from "socket.io";
import { JwtPayloadUser } from "@auctioneer/types";

interface AuthenticatedSocket extends Socket {
	data: {
		user?: JwtPayloadUser;
	};
}

// In-memory storage for chat messages (replace with database in production)
const chatRooms = new Map<string, any[]>();
const typingUsers = new Map<string, Set<string>>();

export default function chatWebSocket(io: Server, socket: AuthenticatedSocket) {
	const user = socket.data.user;

	// Join chat room
	socket.on(
		"join_chat",
		async (data: { chatId: string; chatType?: "auction" | "direct" }) => {
			try {
				const { chatId, chatType = "auction" } = data;
				const roomName = `chat:${chatId}`;

				socket.join(roomName);
				console.log(`User ${user?.email} joined chat ${chatId}`);

				// Initialize chat room if it doesn't exist
				if (!chatRooms.has(chatId)) {
					chatRooms.set(chatId, []);
				}

				// Send chat history to the user
				const messages = chatRooms.get(chatId) || [];
				socket.emit("chat_history", {
					chatId,
					messages: messages.slice(-50), // Last 50 messages
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

				// Create message object
				const newMessage = {
					id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					chatId,
					senderId: user?.userId,
					senderEmail: user?.email,
					content: message.trim(),
					createdAt: new Date().toISOString(),
					read: false,
				};

				// Store message in memory (replace with database)
				const messages = chatRooms.get(chatId) || [];
				messages.push(newMessage);
				chatRooms.set(chatId, messages);

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
	socket.on("mark_read", (data: { chatId: string; messageIds: string[] }) => {
		const { chatId, messageIds } = data;
		const roomName = `chat:${chatId}`;

		// Update messages in memory (replace with database)
		const messages = chatRooms.get(chatId) || [];
		messages.forEach((msg) => {
			if (messageIds.includes(msg.id)) {
				msg.read = true;
			}
		});

		// Notify others that messages were read
		socket.to(roomName).emit("messages_read", {
			chatId,
			messageIds,
			readBy: user?.userId,
		});
	});

	// Delete message (optional feature)
	socket.on("delete_message", (data: { chatId: string; messageId: string }) => {
		try {
			const { chatId, messageId } = data;
			const messages = chatRooms.get(chatId) || [];

			// Find message and verify ownership
			const messageIndex = messages.findIndex((m) => m.id === messageId);
			if (messageIndex === -1) {
				socket.emit("error", { message: "Message not found" });
				return;
			}

			const message = messages[messageIndex];
			if (message.senderId !== user?.userId) {
				socket.emit("error", {
					message: "Cannot delete someone else's message",
				});
				return;
			}

			// Remove message
			messages.splice(messageIndex, 1);
			chatRooms.set(chatId, messages);

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
	});
}
