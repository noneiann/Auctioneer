"use client";
import { useState, useEffect, useRef } from "react";
import { useChatSocket } from "@/hooks/useChatSocket";
import { Send, Trash2, Wifi, WifiOff, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuctionChatProps {
	auctionId: string;
    minimal?: boolean;
}

export default function AuctionChat({ auctionId, minimal }: AuctionChatProps) {
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
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
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

	const handleDeleteConfirm = (messageId: string) => {
        deleteMessage(messageId);
        setConfirmDeleteId(null);
	};

	return (
		<div className='flex flex-col h-[600px] bg-[#0f172a] rounded-lg border border-[#1e293b] overflow-hidden'>
			{/* Header */}
			<div className='bg-[#1e293b]/50 px-4 py-3 border-b border-[#1e293b]'>
				<div className='flex items-center justify-between'>
					<h3 className='font-medium text-white'>
						Auction Chat
					</h3>
					<div className='flex items-center gap-3 text-sm'>
						<span className='text-brand-400 flex items-center gap-1'>
							<Users className='w-4 h-4' />
							{participantCount}
						</span>
						{isConnected ? (
							<span className='text-emerald-400 flex items-center gap-1'>
								<Wifi className='w-4 h-4' />
								Live
							</span>
						) : (
							<span className='text-neutral-500 flex items-center gap-1'>
								<WifiOff className='w-4 h-4' />
								Offline
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Messages */}
			<div className='flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar'>
				{messages.length === 0 ? (
					<div className='h-full flex items-center justify-center text-brand-500/50'>
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
									className={`max-w-[70%] rounded-xl px-4 py-2 border shadow-sm ${
										isOwnMessage
											? "bg-brand-600 text-white border-brand-500"
											: "bg-[#1e293b] border-[#334155] text-brand-100"
									}`}>
									{!isOwnMessage && (
										<p className='text-xs font-semibold mb-1 opacity-80 text-brand-300'>
											{message.senderUsername || message.senderName || message.senderEmail?.split('@')[0] || "User"}
										</p>
									)}
									<p className='break-words leading-relaxed text-sm'>{message.content}</p>
									<div className='flex items-center justify-between mt-1.5 gap-3'>
										<p
											className={`text-[10px] uppercase tracking-wider font-medium ${
												isOwnMessage
													? "text-brand-200"
													: "text-brand-400/70"
											}`}>
											{new Date(message.createdAt).toLocaleTimeString()}
										</p>
										{isOwnMessage && confirmDeleteId !== message.id && (
											<button
												onClick={() => setConfirmDeleteId(message.id)}
												className='text-white/50 hover:text-white transition-colors'
												title='Delete message'>
												<Trash2 className='w-3.5 h-3.5' />
											</button>
										)}
										{isOwnMessage && confirmDeleteId === message.id && (
                                            <div className="flex items-center gap-2 bg-black/20 px-2 py-0.5 rounded">
                                                <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] uppercase font-bold text-white/70 hover:text-white transition-colors">Cancel</button>
                                                <button onClick={() => handleDeleteConfirm(message.id)} className="text-[10px] uppercase font-bold text-red-300 hover:text-red-200 transition-colors">Delete</button>
                                            </div>
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
					<div className='text-xs text-brand-400 italic px-2'>
						{typingUsers.length === 1
							? "Someone is typing..."
							: `${typingUsers.length} people are typing...`}
					</div>
				)}
			</div>

			{/* Error Message */}
			{error && (
				<div className='px-4 py-2 bg-red-900/40 text-red-400 border-t border-red-900/50 text-sm'>
					{error}
				</div>
			)}

			{/* Input */}
			<form
				onSubmit={handleSendMessage}
				className='border-t border-[#1e293b] p-4 bg-[#0f172a]'>
				<div className='flex gap-2 relative'>
					<input
						type='text'
						value={messageInput}
						onChange={handleInputChange}
						onBlur={stopTyping}
						placeholder='Type a message...'
						className='flex-1 pl-4 pr-12 py-3 border border-[#1e293b] rounded-xl bg-[#020617] text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder-brand-600/50 outline-none transition-all'
						disabled={!isConnected}
						maxLength={1000}
					/>
					<button
						type='submit'
						disabled={!messageInput.trim() || isSending || !isConnected}
						className='absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-brand-600 text-white rounded-lg hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors'>
						<Send className='w-4 h-4' />
					</button>
				</div>
				<p className='text-xs text-neutral-500 mt-2'>
					{messageInput.length}/1000 characters
				</p>
			</form>
		</div>
	);
}
