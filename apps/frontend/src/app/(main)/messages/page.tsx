/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, RefreshCw, Send, Search } from "lucide-react";
import api from "@/lib/api";

export default function MessagesPage() {
	const { user, isAuthenticated } = useAuth();
	const [conversations, setConversations] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedConvo, setSelectedConvo] = useState<any | null>(null);

	const fetchConversations = async () => {
		try {
			setLoading(true);
			const response = await api.get("/conversations/my");
			if (response.data.success) {
				setConversations(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching conversations:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isAuthenticated) {
			fetchConversations();
		}
	}, [isAuthenticated]);

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<p className="text-foreground">Please log in to view your messages.</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background pt-[64px]">
			<div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 h-[calc(100vh-64px)] flex gap-4 sm:gap-6">
				{/* Sidebar List */}
				<div className={`w-full sm:w-80 md:w-96 flex flex-col bg-[#0f172a] rounded-xl border border-[#1e293b] shadow-sm overflow-hidden ${selectedConvo ? 'hidden sm:flex' : 'flex'}`}>
					<div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
						<h1 className="text-lg font-semibold text-white flex items-center gap-2">
							<MessageSquare className="w-5 h-5 text-brand-500" />
							Messages
						</h1>
						<button onClick={fetchConversations} className="text-brand-400 hover:text-white transition-colors" title="Refresh">
							<RefreshCw className="w-4 h-4" />
						</button>
					</div>

                    <div className="p-3 border-b border-[#1e293b]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400/50" />
                            <input 
                                type="text" 
                                placeholder="Search messages..." 
                                className="w-full pl-9 pr-4 py-2 bg-[#020617] border border-[#1e293b] rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                            />
                        </div>
                    </div>

					<div className="flex-1 overflow-y-auto custom-scrollbar">
						{loading ? (
							<div className="p-8 text-center text-brand-500/50">Loading conversations...</div>
						) : conversations.length === 0 ? (
							<div className="p-8 text-center text-brand-500/50">
								No messages yet.
							</div>
						) : (
							conversations.map((convo) => (
								<button
									key={convo.id}
									onClick={() => setSelectedConvo(convo)}
									className={`w-full text-left p-4 border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors ${selectedConvo?.id === convo.id ? 'bg-[#1e293b]/50' : ''}`}
								>
									<div className="flex justify-between items-start mb-1">
										<p className="font-medium text-white truncate max-w-[70%]">
											{convo.item?.name || convo.type}
										</p>
										{convo.messages?.[0] && (
											<span className="text-[10px] text-brand-400">
												{new Date(convo.messages[0].createdAt).toLocaleDateString()}
											</span>
										)}
									</div>
									<p className="text-xs text-brand-300 truncate">
										{convo.messages?.[0]?.content || 'Started a conversation'}
									</p>
								</button>
							))
						)}
					</div>
				</div>

				{/* Active Conversation Area */}
				<div className={`flex-1 flex flex-col bg-[#0f172a] rounded-xl border border-[#1e293b] shadow-sm overflow-hidden ${!selectedConvo ? 'hidden sm:flex' : 'flex'}`}>
					{selectedConvo ? (
						<>
							<div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
								<div className="flex items-center gap-3">
									<button onClick={() => setSelectedConvo(null)} className="sm:hidden text-brand-400 hover:text-white transition-colors mr-2">
										← Back
									</button>
									<h2 className="font-semibold text-white">{selectedConvo.item?.name || selectedConvo.type}</h2>
								</div>
								<span className="text-xs bg-brand-500/20 text-brand-300 px-2.5 py-1 rounded-full uppercase font-bold tracking-widest">{selectedConvo.type}</span>
							</div>

							<div className="flex-1 p-4 overflow-y-auto flex items-center justify-center">
								{/* Placeholder for unified chat socket client */}
								<div className="text-center">
									<MessageSquare className="w-12 h-12 text-brand-500/20 mx-auto mb-3" />
									<p className="text-brand-200/50">Chat integration loading...</p>
									<p className="text-xs text-brand-400 mt-2">ID: {selectedConvo.id}</p>
								</div>
							</div>

							<div className="p-4 border-t border-[#1e293b] bg-[#0f172a]">
								<div className="flex gap-2 relative">
									<input 
										type="text" 
										placeholder="Type a message..." 
										disabled
										className="flex-1 pl-4 pr-12 py-3 bg-[#020617] border border-[#1e293b] rounded-xl text-white placeholder-brand-600/50 outline-none opacity-50 cursor-not-allowed"
									/>
									<button disabled className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-brand-600 text-white rounded-lg opacity-50 cursor-not-allowed flex items-center justify-center">
										<Send className="w-4 h-4" />
									</button>
								</div>
							</div>
						</>
					) : (
						<div className="flex-1 flex flex-col items-center justify-center text-center p-8">
							<div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mb-4 text-brand-500 relative">
                                <MessageSquare className="w-8 h-8" />
                                <div className="absolute top-0 right-0 w-4 h-4 bg-brand-500 border-2 border-[#0f172a] rounded-full"></div>
                            </div>
							<h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
							<p className="text-brand-300 max-w-sm">
								Select a conversation from the sidebar to view chat history and start messaging buyers or sellers.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
