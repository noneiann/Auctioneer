"use client";

import { useState } from "react";
import { MessageSquare, Bell, X, User } from "lucide-react";
import Link from "next/link";

interface RightPanelProps {
	isOpen: boolean;
	onClose: () => void;
}

const mockChats = [
	{ id: 1, name: "John Buyer",    item: "Vintage Camera",  message: "Interested in your vintage camera", time: "2m ago",  unread: 2, online: true },
	{ id: 2, name: "Sarah M.",      item: "Mountain Bike",   message: "Can you do $150 for the bike?",    time: "15m ago", unread: 0, online: false },
	{ id: 3, name: "Mike Trading",  item: "Electric Guitar", message: "Want to barter my guitar?",        time: "1h ago",  unread: 1, online: false },
];

const mockNotifications = [
	{ id: 1, type: "auction", title: "New Bid",         message: "Your auction \"Vintage Camera\" received a new bid of $450", time: "5m ago",  read: false },
	{ id: 2, type: "sale",    title: "Item Sold",        message: "Item \"Mountain Bike\" was sold for $200!",                 time: "30m ago", read: false },
	{ id: 3, type: "barter",  title: "Barter Proposal",  message: "New barter proposal for \"Electric Guitar\"",              time: "1h ago",  read: true },
	{ id: 4, type: "alert",   title: "Auction Ending",   message: "Auction 'Gaming Laptop' ending in 2 hours",               time: "2h ago",  read: true },
];

const typeColor: Record<string, string> = {
	auction: "bg-amber-400",
	sale:    "bg-emerald-400",
	barter:  "bg-brand-500",
	alert:   "bg-red-400",
};

export default function RightPanel({ isOpen, onClose }: RightPanelProps) {
	const [activeTab, setActiveTab] = useState<"chats" | "notifications">("chats");

	if (!isOpen) return null;

	const unreadChats = mockChats.filter((c) => c.unread > 0).length;
	const unreadNotifs = mockNotifications.filter((n) => !n.read).length;

	return (
		<div className="fixed right-0 top-0 h-full w-[280px] bg-[#111] border-l border-[#1f1f1f] z-30 flex flex-col animate-fade-in">
			{/* Header */}
			<div className="flex items-center justify-between px-4 h-[60px] border-b border-[#1f1f1f] shrink-0">
				<h2 className="text-[13px] font-semibold text-white">Activity</h2>
				<button
					onClick={onClose}
					className="p-1.5 rounded-lg text-[#4a4a4a] hover:text-white hover:bg-[#1a1a1a] transition-colors"
				>
					<X className="w-4 h-4" />
				</button>
			</div>

			{/* Tabs */}
			<div className="flex border-b border-[#1f1f1f] shrink-0">
				<button
					onClick={() => setActiveTab("chats")}
					className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-medium border-b-2 transition-all ${
						activeTab === "chats"
							? "border-white text-white"
							: "border-transparent text-[#737373] hover:text-[#c8c8c8]"
					}`}
				>
					<MessageSquare className="w-3.5 h-3.5" />
					Chats
					{unreadChats > 0 && (
						<span className="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full min-w-[16px] h-4 flex items-center justify-center leading-none">
							{unreadChats}
						</span>
					)}
				</button>
				<button
					onClick={() => setActiveTab("notifications")}
					className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-medium border-b-2 transition-all ${
						activeTab === "notifications"
							? "border-white text-white"
							: "border-transparent text-[#737373] hover:text-[#c8c8c8]"
					}`}
				>
					<Bell className="w-3.5 h-3.5" />
					Alerts
					{unreadNotifs > 0 && (
						<span className="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full min-w-[16px] h-4 flex items-center justify-center leading-none">
							{unreadNotifs}
						</span>
					)}
				</button>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto scrollbar-none">
				{activeTab === "chats" && (
					<div className="p-2 space-y-0.5">
						{mockChats.map((chat) => (
							<div
								key={chat.id}
								className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] cursor-pointer transition-colors group"
							>
								<div className="relative shrink-0">
									<div className="w-8 h-8 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center text-[#737373]">
										<User className="w-4 h-4" />
									</div>
									{chat.online && (
										<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#111] rounded-full" />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between mb-0.5">
										<h4 className={`text-[13px] font-medium truncate ${chat.unread > 0 ? "text-white" : "text-[#a0a0a0]"}`}>
											{chat.name}
										</h4>
										<span className="text-[10px] text-[#4a4a4a] shrink-0 ml-2">{chat.time}</span>
									</div>
									<p className="text-[11px] text-[#4a4a4a] truncate mb-0.5">re: {chat.item}</p>
									<p className={`text-[12px] truncate ${chat.unread > 0 ? "text-[#a0a0a0] font-medium" : "text-[#4a4a4a]"}`}>
										{chat.message}
									</p>
								</div>
								{chat.unread > 0 && (
									<div className="self-center w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0" />
								)}
							</div>
						))}
					</div>
				)}

				{activeTab === "notifications" && (
					<div className="p-2 space-y-0.5">
						{mockNotifications.map((n) => (
							<div
								key={n.id}
								className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
									!n.read ? "bg-[#181818] hover:bg-[#1f1f1f]" : "hover:bg-[#1a1a1a]"
								}`}
							>
								<div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${typeColor[n.type] ?? "bg-[#4a4a4a]"}`} />
								<div className="flex-1 min-w-0">
									<div className="flex justify-between items-start mb-0.5">
										<h4 className={`text-[13px] font-medium ${!n.read ? "text-white" : "text-[#737373]"}`}>
											{n.title}
										</h4>
										<span className="text-[10px] text-[#4a4a4a] shrink-0 ml-2">{n.time}</span>
									</div>
									<p className="text-[12px] text-[#4a4a4a] leading-relaxed">{n.message}</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="shrink-0 border-t border-[#1f1f1f] p-3">
				<Link
					href={activeTab === "chats" ? "/seller/chat" : "/seller/alerts"}
					className="block w-full text-center py-2.5 text-[12px] font-medium text-[#737373] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors border border-[#1f1f1f] hover:border-[#2a2a2a]"
				>
					View All {activeTab === "chats" ? "Messages" : "Alerts"}
				</Link>
			</div>
		</div>
	);
}
