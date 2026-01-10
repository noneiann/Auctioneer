"use client";
import { useState, useEffect, useRef } from "react";
import { useChatSocket } from "@/hooks/useChatSocket";
import { Send, Trash2, Wifi, WifiOff, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuctionChatProps {
	auctionId: string;
}

export default function AuctionChat({ auctionId }: AuctionChatProps) {
	const chatId = `auction-${auctionId}`;
	const { user } = useAuth();
	const {
		messages,
		participantCount,
		typingUsers,
		error,
		isSending,
		sendMessage,
		startTyping,
		stopTyping,
		deleteMessage,
		isConnected,
	} = useChatSocket(chatId);

	const [messageInput, setMessageInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (messageInput.trim()) {
			sendMessage(messageInput);
			setMessageInput("");
			stopTyping();
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageInput(e.target.value);

		// Start typing indicator
		startTyping();

		// Clear existing timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		// Stop typing after 3 seconds of inactivity
		typingTimeoutRef.current = setTimeout(() => {
			stopTyping();
		}, 3000);
	};

	const handleDeleteMessage = (messageId: string) => {
		if (window.confirm("Are you sure you want to delete this message?")) {
			deleteMessage(messageId);
		}
	};

	return (
		<div className='flex flex-col h-[600px] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
			{/* Header */}
			<div className='bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
				<div className='flex items-center justify-between'>
					<h3 className='font-medium text-gray-900 dark:text-white'>
						Auction Chat
					</h3>
					<div className='flex items-center gap-3 text-sm'>
						<span className='text-gray-500 dark:text-gray-400 flex items-center gap-1'>
							<Users className='w-4 h-4' />
							{participantCount}
						</span>
						{isConnected ? (
							<span className='text-green-600 flex items-center gap-1'>
								<Wifi className='w-4 h-4' />
								Live
							</span>
						) : (
							<span className='text-gray-400 flex items-center gap-1'>
								<WifiOff className='w-4 h-4' />
								Offline
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Messages */}
			<div className='flex-1 overflow-y-auto p-4 space-y-3'>
				{messages.length === 0 ? (
					<div className='h-full flex items-center justify-center text-gray-500 dark:text-gray-400'>
						<p>No messages yet. Start the conversation!</p>
					</div>
				) : (
					messages.map((message) => {
						const isOwnMessage = message.senderId === user?.id;
						return (
							<div
								key={message.id}
								className={`flex ${
									isOwnMessage ? "justify-end" : "justify-start"
								}`}>
								<div
									className={`max-w-[70%] rounded-lg px-4 py-2 ${
										isOwnMessage
											? "bg-blue-600 text-white"
											: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
									}`}>
									{!isOwnMessage && (
										<p className='text-xs font-medium mb-1 opacity-75'>
											{message.senderEmail}
										</p>
									)}
									<p className='break-words'>{message.content}</p>
									<div className='flex items-center justify-between mt-1 gap-2'>
										<p
											className={`text-xs ${
												isOwnMessage
													? "text-blue-100"
													: "text-gray-500 dark:text-gray-400"
											}`}>
											{new Date(message.createdAt).toLocaleTimeString()}
										</p>
										{isOwnMessage && (
											<button
												onClick={() => handleDeleteMessage(message.id)}
												className='text-white/70 hover:text-white'
												title='Delete message'>
												<Trash2 className='w-3 h-3' />
											</button>
										)}
									</div>
								</div>
							</div>
						);
					})
				)}
				<div ref={messagesEndRef} />

				{/* Typing Indicator */}
				{typingUsers.length > 0 && (
					<div className='text-sm text-gray-500 dark:text-gray-400 italic'>
						{typingUsers.length === 1
							? "Someone is typing..."
							: `${typingUsers.length} people are typing...`}
					</div>
				)}
			</div>

			{/* Error Message */}
			{error && (
				<div className='px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm'>
					{error}
				</div>
			)}

			{/* Input */}
			<form
				onSubmit={handleSendMessage}
				className='border-t border-gray-200 dark:border-gray-700 p-4'>
				<div className='flex gap-2'>
					<input
						type='text'
						value={messageInput}
						onChange={handleInputChange}
						onBlur={stopTyping}
						placeholder='Type a message...'
						className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						disabled={!isConnected}
						maxLength={1000}
					/>
					<button
						type='submit'
						disabled={!messageInput.trim() || isSending || !isConnected}
						className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'>
						<Send className='w-4 h-4' />
						{isSending ? "Sending..." : "Send"}
					</button>
				</div>
				<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
					{messageInput.length}/1000 characters
				</p>
			</form>
		</div>
	);
}
