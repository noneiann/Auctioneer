"use client";

import { useState } from "react";
import LeftSidebar from "./components/LeftSidebar";
import RightPanel from "./components/RightPanel";

export default function SellerDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [rightPanelOpen, setRightPanelOpen] = useState(true);

	return (
		<div className="flex h-screen bg-[#111] text-white overflow-hidden">
			{/* Left Sidebar */}
			<LeftSidebar
				collapsed={sidebarCollapsed}
				onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
				rightPanelOpen={rightPanelOpen}
				onToggleRight={() => setRightPanelOpen(!rightPanelOpen)}
			/>

			{/* Main Content */}
			<div
				className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
					sidebarCollapsed ? "ml-[60px]" : "ml-[220px]"
				} ${rightPanelOpen ? "mr-[280px]" : "mr-0"}`}
			>
				{/* Page Content */}
				<main className="flex-1 overflow-y-auto p-6 animate-fade-in">
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
