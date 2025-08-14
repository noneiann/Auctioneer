"use client";

import { useState } from "react";
interface RightPanelProps {
	isOpen: boolean;
	onClose: () => void;
}

const mockChats = [
	{
		id: 1,
		name: "John Buyer",
		message: "Interested in your vintage camera",
		time: "2m ago",
		unread: 2,
	},
	{
		id: 2,
		name: "Sarah M.",
		message: "Can you do $150 for the bike?",
		time: "15m ago",
		unread: 0,
	},
	{
		id: 3,
		name: "Mike Trading",
		message: "Want to barter my guitar?",
		time: "1h ago",
		unread: 1,
	},
];

const mockNotifications = [
	{
		id: 1,
		type: "auction",
		message: 'Your auction "Vintage Camera" received a new bid',
		time: "5m ago",
	},
	{
		id: 2,
		type: "sale",
		message: 'Item "Mountain Bike" was sold!',
		time: "30m ago",
	},
	{
		id: 3,
		type: "barter",
		message: 'New barter proposal for "Electric Guitar"',
		time: "1h ago",
	},
	{
		id: 4,
		type: "alert",
		message: "Auction ending in 2 hours",
		time: "2h ago",
	},
];

export default function RightPanel({ isOpen, onClose }: RightPanelProps) {
	const [activeTab, setActiveTab] = useState<"chats" | "notifications">(
		"chats"
	);

	if (!isOpen) return null;

	return (
		<div className='fixed right-0 top-0 h-full w-80 bg-background shadow-lg border-l border-foreground/10 z-30 animate-fade-in'>
			{/* Header */}
			<div className='p-4 border-b border-foreground/10'>
				<div className='flex items-center justify-between'>
					<div className='flex space-x-4'>
						<button
							onClick={() => setActiveTab("chats")}
							className={`pb-2 px-1 border-b-2 transition-colors ${
								activeTab === "chats"
									? "border-main text-main"
									: "border-transparent text-foreground/50 hover:text-foreground"
							}`}>
							Chats ({mockChats.filter((c) => c.unread > 0).length})
						</button>
						<button
							onClick={() => setActiveTab("notifications")}
							className={`pb-2 px-1 border-b-2 transition-colors ${
								activeTab === "notifications"
									? "border-main text-main"
									: "border-transparent text-foreground/50 hover:text-foreground"
							}`}>
							Alerts ({mockNotifications.length})
						</button>
					</div>
					<button
						onClick={onClose}
						className='p-1 rounded hover:bg-foreground/5 text-foreground'>
						✕
					</button>
				</div>
			</div>

			{/* Content */}
			<div className='h-full overflow-y-auto pb-20'>
				{activeTab === "chats" && (
					<div className='p-2 space-y-2'>
						{mockChats.map((chat) => (
							<div
								key={chat.id}
								className='p-3 rounded-lg hover:bg-foreground/5 cursor-pointer border border-foreground/10 transition-colors'>
								<div className='flex items-start justify-between'>
									<div className='flex-1'>
										<div className='flex items-center justify-between'>
											<h4 className='font-medium text-sm text-foreground'>
												{chat.name}
											</h4>
											{chat.unread > 0 && (
												<span className='bg-main text-white text-xs rounded-full px-2 py-1'>
													{chat.unread}
												</span>
											)}
										</div>
										<p className='text-xs text-foreground/70 mt-1 truncate'>
											{chat.message}
										</p>
										<span className='text-xs text-foreground/50'>
											{chat.time}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{activeTab === "notifications" && (
					<div className='p-2 space-y-2'>
						{mockNotifications.map((notification) => (
							<div
								key={notification.id}
								className='p-3 rounded-lg hover:bg-foreground/5 cursor-pointer border border-foreground/10 transition-colors'>
								<div className='flex items-start space-x-3'>
									<div
										className={`w-2 h-2 rounded-full mt-2 ${
											notification.type === "auction"
												? "bg-yellow-400"
												: notification.type === "sale"
												? "bg-green-400"
												: notification.type === "barter"
												? "bg-main"
												: "bg-red-400"
										}`}
									/>
									<div className='flex-1'>
										<p className='text-sm text-foreground'>
											{notification.message}
										</p>
										<span className='text-xs text-foreground/50'>
											{notification.time}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
