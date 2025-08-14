"use client";

import { useState } from "react";
import LeftSidebar from "./components/LeftSidebar";
import RightPanel from "./components/RightPanel";
import { ChevronRight } from "lucide-react";

export default function SellerDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [rightPanelOpen, setRightPanelOpen] = useState(true);

	return (
		<div className='flex h-screen bg-background text-foreground'>
			{/* Left Sidebar */}
			<LeftSidebar
				collapsed={sidebarCollapsed}
				onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
			/>

			{/* Main Content */}
			<div
				className={`flex-1 flex flex-col transition-all duration-300 ${
					sidebarCollapsed ? "ml-16" : "ml-64"
				} ${rightPanelOpen ? "mr-80" : "mr-0"}`}>
				{/* Header */}
				<header className='bg-background shadow-sm border-b border-foreground/10 px-6 py-4 flex items-center justify-between'>
					<h1 className='text-2xl font-semibold text-foreground'>
						Seller Dashboard
					</h1>
					<div className='flex items-center gap-4'>
						<button
							onClick={() => setRightPanelOpen(!rightPanelOpen)}
							className='p-2 rounded-lg hover:bg-[var(--main)]/80 transition-colors animate-fade-in'>
							<ChevronRight
								size={16}
								className={`transform transition-transform ${
									rightPanelOpen ? "" : "rotate-180"
								}`}
							/>
						</button>
					</div>
				</header>

				{/* Page Content */}
				<main className='flex-1 overflow-auto p-6 animate-fade-in'>
					{children}
				</main>
			</div>

			{/* Right Panel */}
			<RightPanel
				isOpen={rightPanelOpen}
				onClose={() => setRightPanelOpen(false)}
			/>
		</div>
	);
}
