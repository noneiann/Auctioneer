import React from "react";
import Link from "next/link";
import { Hammer, DollarSign, RefreshCw, BarChart3, ArrowRight } from "lucide-react";

const quickActions = [
	{
		title: "New Auction",
		description: "Start a competitive live bid",
		icon: Hammer,
		href: "/seller/auctions/create",
		accentClass: "text-brand-400",
		bgClass: "bg-brand-500/10 group-hover:bg-brand-500/20",
	},
	{
		title: "Sell Direct",
		description: "List at a fixed buy-now price",
		icon: DollarSign,
		href: "/seller/items/sell",
		accentClass: "text-emerald-400",
		bgClass: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
	},
	{
		title: "Barter Item",
		description: "Offer an item for trade",
		icon: RefreshCw,
		href: "/seller/items/barter",
		accentClass: "text-purple-400",
		bgClass: "bg-purple-500/10 group-hover:bg-purple-500/20",
	},
	{
		title: "View Reports",
		description: "Check your sales analytics",
		icon: BarChart3,
		href: "/seller/reports",
		accentClass: "text-amber-400",
		bgClass: "bg-amber-500/10 group-hover:bg-amber-500/20",
	},
];

export default function QuickActions() {
	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">Quick Actions</p>
			</div>
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
				{quickActions.map((action) => {
					const Icon = action.icon;
					return (
						<Link
							key={action.href}
							href={action.href}
							className="group flex flex-col gap-3 p-4 rounded-xl bg-[#181818] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-all"
						>
							<div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${action.bgClass}`}>
								<Icon className={`w-4 h-4 ${action.accentClass}`} />
							</div>
							<div>
								<p className="text-[13px] font-semibold text-white">{action.title}</p>
								<p className="text-[11px] text-[#4a4a4a] mt-0.5 leading-snug">{action.description}</p>
							</div>
							<ArrowRight className="w-3.5 h-3.5 text-[#2a2a2a] group-hover:text-[#737373] transition-colors mt-auto" />
						</Link>
					);
				})}
			</div>
		</div>
	);
}
