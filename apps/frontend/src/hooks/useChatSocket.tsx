"use client";
import { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/contexts/SocketContext";

interface Message {
	id: string;
	chatId: string;
	senderId: string;
	senderEmail?: string;
	senderUsername?: string;
	senderName?: string;
	content: string;
	createdAt: string;
	read: boolean;
}

interface ChatState {
	chatId: string;
	messages: Message[];
	participantCount: number;
}

export function useChatSocket(chatId: string | null) {
	const { socket, isConnected } = useSocket();
	const [messages, setMessages] = useState<Message[]>([]);
	const [participantCount, setParticipantCount] = useState(0);
	const [typingUsers, setTypingUsers] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);

	// Join chat room
	useEffect(() => {
		if (!socket || !isConnected || !chatId) return;

		socket.emit("join_chat", { chatId, chatType: "auction" });

		// Listen for chat history
		socket.on("chat_history", (data: ChatState) => {
			setMessages(data.messages);
			setParticipantCount(data.participantCount);
		});

		// Listen for new messages
		socket.on("new_message", (message: Message) => {
			setMessages((prev) => [...prev, message]);
		});

		// Listen for message errors
		socket.on("message_error", (data: { message: string }) => {
			setError(data.message);
			setIsSending(false);
			setTimeout(() => setError(null), 5000);
		});

		// Listen for typing indicators
		socket.on(
			"user_typing",
			(data: { userId: string; username: string; typingUsers: string[] }) => {
				setTypingUsers(data.typingUsers);
			}
		);

		socket.on(
			"stop_typing",
			(data: { userId: string; typingUsers: string[] }) => {
				setTypingUsers(data.typingUsers);
			}
		);

		// Listen for message deleted
		socket.on(
			"message_deleted",
			(data: { chatId: string; messageId: string }) => {
				setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
			}
		);

		// Listen for messages read
		socket.on(
			"messages_read",
			(data: { chatId: string; messageIds: string[]; readBy: string }) => {
				setMessages((prev) =>
					prev.map((m) =>
						data.messageIds.includes(m.id) ? { ...m, read: true } : m
					)
				);
			}
		);

		// Listen for user joined/left
		socket.on(
			"user_joined_chat",
			(data: { userId: string; participantCount: number }) => {
				setParticipantCount(data.participantCount);
			}
		);

		socket.on(
			"user_left_chat",
			(data: { userId: string; participantCount: number }) => {
				setParticipantCount(data.participantCount);
			}
		);

		// Cleanup
		return () => {
			socket.emit("leave_chat", chatId);
			socket.off("chat_history");
			socket.off("new_message");
			socket.off("message_error");
			socket.off("user_typing");
			socket.off("stop_typing");
			socket.off("message_deleted");
			socket.off("messages_read");
			socket.off("user_joined_chat");
			socket.off("user_left_chat");
		};
	}, [socket, isConnected, chatId]);

	// Send message function
	const sendMessage = useCallback(
		(message: string) => {
			if (!socket || !isConnected || !chatId) {
				setError("Not connected to server");
				return;
			}

			if (!message.trim()) {
				setError("Message cannot be empty");
				return;
			}

			setIsSending(true);
			setError(null);
			socket.emit("send_message", { chatId, message: message.trim() });

			// Message will be added via new_message event
			setTimeout(() => setIsSending(false), 500);
		},
		[socket, isConnected, chatId]
	);

	// Typing indicator function
	const startTyping = useCallback(() => {
		if (!socket || !isConnected || !chatId) return;
		socket.emit("typing", chatId);
	}, [socket, isConnected, chatId]);

	const stopTyping = useCallback(() => {
		if (!socket || !isConnected || !chatId) return;
		socket.emit("stop_typing", chatId);
	}, [socket, isConnected, chatId]);

	// Mark messages as read
	const markAsRead = useCallback(
		(messageIds: string[]) => {
			if (!socket || !isConnected || !chatId) return;
			socket.emit("mark_read", { chatId, messageIds });
		},
		[socket, isConnected, chatId]
	);

	// Delete message
	const deleteMessage = useCallback(
		(messageId: string) => {
			if (!socket || !isConnected || !chatId) return;
			socket.emit("delete_message", { chatId, messageId });
		},
		[socket, isConnected, chatId]
	);

	return {
		messages,
		participantCount,
		typingUsers,
		error,
		isSending,
		sendMessage,
		startTyping,
		stopTyping,
		markAsRead,
		deleteMessage,
		isConnected,
	};
}
