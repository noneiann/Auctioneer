"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	Hammer,
	DollarSign,
	RefreshCw,
	Eye,
	Bell,
	BarChart3,
	Package,
	User,
	Settings,
	LogOut,
	ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

interface LeftSidebarProps {
	collapsed: boolean;
	onToggle: () => void;
}

const menuSections = [
	{
		title: "Actions",
		items: [
			{ name: "Make Auction", href: "/seller/auctions/create", icon: Hammer },
			{ name: "Sell Item", href: "/seller/items/sell", icon: DollarSign },
			{ name: "Barter Item", href: "/seller/items/barter", icon: RefreshCw },
		],
	},
	{
		title: "Management",
		items: [
			{ name: "View Auctions", href: "/seller/auctions", icon: Eye },
			{ name: "Alerts", href: "/seller/alerts", icon: Bell },
			{ name: "Reports", href: "/seller/reports", icon: BarChart3 },
			{ name: "My Items", href: "/seller/items", icon: Package },
		],
	},
	{
		title: "Account",
		items: [
			{ name: "Profile", href: "/seller/profile", icon: User },
			{ name: "Settings", href: "/seller/settings", icon: Settings },
			{ name: "Logout", href: "/logout", icon: LogOut },
		],
	},
];

export default function LeftSidebar({ collapsed, onToggle }: LeftSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { logout } = useAuth();
	const [expandedSections, setExpandedSections] = useState<number[]>([0, 1, 2]);

	const handleLogout = () => {
		logout();
		router.push("/login");
	};

	const toggleSection = (index: number) => {
		setExpandedSections((prev) =>
			prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
		);
	};

	return (
		<div
			className={`fixed left-0 top-0 h-full bg-background shadow-lg border-r border-foreground/10 transition-all duration-300 z-40 animate-fade-in ${
				collapsed ? "w-16" : "w-64"
			}`}>
			{/* Header */}
			<div className='p-4 border-b border-foreground/10'>
				<div className='flex  items-center justify-between'>
					{!collapsed && (
						<Link
							href='/seller'
							className='flex flex-row items-center space-x-2'>
							<Image
								src='/logo.svg'
								alt='Auctioneer Logo'
								width={30}
								height={30}
							/>
							<h2 className='text-xl font-bold text-main'>Auctioneer</h2>
						</Link>
					)}
					<button
						onClick={onToggle}
						className='p-2 rounded-lg hover:bg-[var(--main)]/80 transition-colors text-foreground'>
						<ChevronRight
							size={16}
							className={`transform transition-transform ${
								collapsed ? "" : "rotate-180"
							}`}
						/>
					</button>
				</div>
			</div>

			{/* Navigation */}
			<nav className='p-2 space-y-2 overflow-y-auto h-full pb-20'>
				{menuSections.map((section, sectionIndex) => (
					<div key={sectionIndex} className='space-y-1'>
						{!collapsed && (
							<button
								onClick={() => toggleSection(sectionIndex)}
								className='w-full text-left px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground flex items-center justify-between transition-colors'>
								{section.title}
								<ChevronRight
									size={14}
									className={`transform transition-transform ${
										expandedSections.includes(sectionIndex) ? "rotate-90" : ""
									}`}
								/>
							</button>
						)}

						{(collapsed || expandedSections.includes(sectionIndex)) && (
							<div className='space-y-1'>
								{section.items.map((item, itemIndex) => {
									const IconComponent = item.icon;
									const isLogout = item.name === "Logout";

									if (isLogout) {
										return (
											<button
												key={itemIndex}
												onClick={handleLogout}
												className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors group relative text-foreground/70 hover:bg-foreground/5 hover:text-foreground`}>
												{collapsed && (
													<IconComponent size={18} className='self-center' />
												)}
												{!collapsed && (
													<IconComponent size={18} className='mr-2' />
												)}
												{!collapsed && (
													<span className='text-sm font-medium'>
														{item.name}
													</span>
												)}
												{collapsed && (
													<div className='absolute left-16 bg-foreground text-background px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none'>
														{item.name}
													</div>
												)}
											</button>
										);
									}

									return (
										<Link
											key={itemIndex}
											href={item.href}
											className={`flex items-center px-3 py-3 rounded-lg transition-colors group relative ${
												pathname === item.href
													? "bg-main text-white"
													: "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
											}`}>
											{collapsed && (
												<IconComponent size={18} className='self-center' />
											)}
											{!collapsed && (
												<IconComponent size={18} className='mr-2' />
											)}
											{!collapsed && (
												<span className='text-sm font-medium'>{item.name}</span>
											)}
											{collapsed && (
												<div className='absolute left-16 bg-foreground text-background px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none'>
													{item.name}
												</div>
											)}
										</Link>
									);
								})}
							</div>
						)}
					</div>
				))}
			</nav>
		</div>
	);
}
