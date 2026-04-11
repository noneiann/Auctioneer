"use client";

import Link from "next/link";
import Image from "next/image";
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
	ChevronLeft,
	ChevronRight,
	MessageSquare,
	LayoutDashboard,
	PanelRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LeftSidebarProps {
	collapsed: boolean;
	onToggle: () => void;
	rightPanelOpen: boolean;
	onToggleRight: () => void;
}

const menuSections = [
	{
		title: "Create",
		items: [
			{ name: "Overview",     href: "/seller",               icon: LayoutDashboard },
			{ name: "New Auction",  href: "/seller/auctions/create", icon: Hammer },
			{ name: "Sell Item",    href: "/seller/items/sell",      icon: DollarSign },
			{ name: "Barter Item",  href: "/seller/items/barter",    icon: RefreshCw },
		],
	},
	{
		title: "Manage",
		items: [
			{ name: "My Auctions",  href: "/seller/auctions", icon: Eye },
			{ name: "My Items",     href: "/seller/items",    icon: Package },
			{ name: "Messages",     href: "/seller/chat",     icon: MessageSquare },
			{ name: "Alerts",       href: "/seller/alerts",   icon: Bell },
			{ name: "Reports",      href: "/seller/reports",  icon: BarChart3 },
		],
	},
	{
		title: "Account",
		items: [
			{ name: "Profile",  href: "/seller/profile",  icon: User },
			{ name: "Settings", href: "/seller/settings", icon: Settings },
		],
	},
];

export default function LeftSidebar({ collapsed, onToggle, rightPanelOpen, onToggleRight }: LeftSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { user, logout } = useAuth();

	const handleLogout = () => {
		logout();
		router.push("/login");
	};

	const isActive = (href: string) =>
		href === "/seller" ? pathname === "/seller" : pathname.startsWith(href);

	return (
		<aside
			className={`fixed left-0 top-0 h-full bg-[#111] border-r border-[#1f1f1f] transition-all duration-300 z-40 flex flex-col ${
				collapsed ? "w-[60px]" : "w-[220px]"
			}`}
		>
			{/* Logo + collapse toggle */}
			<div className={`flex items-center border-b border-[#1f1f1f] h-[60px] shrink-0 ${collapsed ? "justify-center px-0" : "justify-between px-4"}`}>
				{!collapsed && (
					<Link href="/seller" className="flex items-center gap-2 group">
						<Image src="/logo-white.svg" alt="Auctioneer" width={24} height={24} className="h-6 w-6 dark:block hidden" />
						<Image src="/logo-dark.svg"  alt="Auctioneer" width={24} height={24} className="h-6 w-6 block dark:hidden" />
						<span className="font-bold text-[12px] tracking-[0.1em] uppercase text-white">
							Auctioneer
						</span>
					</Link>
				)}
				<button
					onClick={onToggle}
					className="p-1.5 rounded-lg text-[#4a4a4a] hover:text-white hover:bg-[#1f1f1f] transition-colors"
					title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
				>
					{collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
				</button>
			</div>

			{/* Nav */}
			<nav className="flex-1 overflow-y-auto py-4 scrollbar-none">
				{menuSections.map((section) => (
					<div key={section.title} className="mb-5">
						{!collapsed && (
							<p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
								{section.title}
							</p>
						)}
						<div className="space-y-0.5 px-2">
							{section.items.map((item) => {
								const Icon = item.icon;
								const active = isActive(item.href);
								return (
									<Link
										key={item.href}
										href={item.href}
										title={collapsed ? item.name : undefined}
										className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group ${
											active
												? "bg-white/8 text-white"
												: "text-[#737373] hover:text-white hover:bg-[#1a1a1a]"
										} ${collapsed ? "justify-center" : ""}`}
									>
										<Icon className="w-4 h-4 shrink-0" />
										{!collapsed && <span>{item.name}</span>}
										{/* Tooltip when collapsed */}
										{collapsed && (
											<div className="absolute left-[52px] bg-[#181818] border border-[#2a2a2a] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
												{item.name}
											</div>
										)}
									</Link>
								);
							})}
						</div>
					</div>
				))}
			</nav>

			{/* Bottom: user + right panel toggle + logout */}
			<div className="shrink-0 border-t border-[#1f1f1f] p-2 space-y-1">
				{/* Right panel toggle */}
				<button
					onClick={onToggleRight}
					title={rightPanelOpen ? "Close activity panel" : "Open activity panel"}
					className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#737373] hover:text-white hover:bg-[#1a1a1a] transition-colors group ${collapsed ? "justify-center" : ""}`}
				>
					<PanelRight className="w-4 h-4 shrink-0" />
					{!collapsed && <span>Activity Panel</span>}
					{collapsed && (
						<div className="absolute left-[52px] bg-[#181818] border border-[#2a2a2a] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
							Activity Panel
						</div>
					)}
				</button>

				{/* Logout */}
				<button
					onClick={handleLogout}
					title="Sign Out"
					className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#737373] hover:text-red-400 hover:bg-red-950/20 transition-colors group ${collapsed ? "justify-center" : ""}`}
				>
					<LogOut className="w-4 h-4 shrink-0" />
					{!collapsed && <span>Sign Out</span>}
					{collapsed && (
						<div className="absolute left-[52px] bg-[#181818] border border-[#2a2a2a] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
							Sign Out
						</div>
					)}
				</button>

				{/* User pill */}
				{!collapsed && user && (
					<div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-lg bg-[#181818] border border-[#1f1f1f]">
						<div className="w-7 h-7 rounded-full bg-[#2a2a2a] border border-[#333] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
							{user.firstName.charAt(0).toUpperCase()}
						</div>
						<div className="min-w-0">
							<p className="text-[12px] font-semibold text-white truncate">
								{user.firstName} {user.lastName}
							</p>
							<p className="text-[10px] text-[#4a4a4a] truncate">{user.email}</p>
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}
