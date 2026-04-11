"use client";

import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuctionChat from "../auction/AuctionChat";

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    // Context needed to know what we are chatting about
    contextId: string;
    contextType: "auction" | "direct" | "barter";
    targetUserId?: string; // The person we are chatting with
}

export default function ChatDrawer({ isOpen, onClose, contextId, contextType, targetUserId }: ChatDrawerProps) {
	const { isAuthenticated } = useAuth();

    // The drawer acts as a floating slide-over panel on desktop, and a full-screen modal on mobile
	return (
		<>
			{/* Backdrop overlay */}
			{isOpen && (
				<div 
					className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300" 
					onClick={onClose}
					aria-hidden="true" 
				/>
			)}

			{/* Sliding Drawer */}
			<div 
				className={`fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] bg-[#0f172a] shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out border-l border-[#1e293b] flex flex-col ${
					isOpen ? "translate-x-0" : "translate-x-full"
				}`}
			>
				{/* Drawer Header */}
				<div className="flex items-center justify-between p-4 border-b border-[#1e293b] bg-[#1e293b]/50">
					<div className="flex items-center gap-3 text-white">
						<MessageSquare className="w-5 h-5 text-brand-500" />
						<h2 className="font-semibold text-lg tracking-tight">Messages</h2>
                        <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest">{contextType}</span>
					</div>
					<button 
						onClick={onClose}
						className="p-2 text-brand-400 hover:text-white rounded-full hover:bg-black/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Drawer Content Area */}
				<div className="flex-1 overflow-hidden relative">
                    {!isAuthenticated ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mb-4 text-brand-500">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Sign in required</h3>
                            <p className="text-brand-300 mb-6 max-w-xs">
                                You must be signed in to communicate with other members.
                            </p>
                            <a 
                                href="/login" 
                                className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-500 transition-colors"
                            >
                                Sign In
                            </a>
                        </div>
                    ) : (
                        // For auctions, reuse the AuctionChat component. For others, we assume a unified interface in the future.
                        <div className="h-full w-full">
                            {contextType === "auction" ? (
                                <AuctionChat auctionId={contextId} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-brand-200/50">
                                    <MessageSquare className="w-12 h-12 text-brand-500/20 mb-3" />
                                    <p>Conversation stream for {contextType} not yet initialized.</p>
                                    <p className="text-xs text-brand-400 mt-2">Context ID: {contextId}</p>
                                </div>
                            )}
                        </div>
                    )}
				</div>
			</div>
		</>
	);
}
