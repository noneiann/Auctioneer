import React from "react";
import { DollarSign, Hammer, RefreshCw, Clock, CheckCircle, AlertCircle } from "lucide-react";

const recentActivities = [
	{ type: "sale",    item: "Vintage Camera",  action: "Sold",        amount: "$450",    time: "2h ago",    status: "completed" },
	{ type: "auction", item: "Mountain Bike",   action: "New Bid",     amount: "$280",    time: "4h ago",    status: "active"    },
	{ type: "barter",  item: "Electric Guitar", action: "Trade Offer", amount: "Drum Kit", time: "6h ago",   status: "pending"   },
	{ type: "sale",    item: "Leather Jacket",  action: "Listed",      amount: "$120",    time: "1d ago",    status: "active"    },
	{ type: "auction", item: "Vintage Watch",   action: "Ended",       amount: "$850",    time: "2d ago",    status: "completed" },
];

const typeIcon = { sale: DollarSign, auction: Hammer, barter: RefreshCw };
const typeColor: Record<string, string> = {
	sale:    "bg-emerald-500/10 text-emerald-400",
	auction: "bg-brand-500/10 text-brand-400",
	barter:  "bg-purple-500/10 text-purple-400",
};
const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
	completed: { label: "Completed", icon: CheckCircle, color: "text-emerald-400 bg-emerald-950/40" },
	active:    { label: "Active",    icon: Clock,        color: "text-brand-400 bg-brand-950/40"    },
	pending:   { label: "Pending",   icon: AlertCircle,  color: "text-amber-400 bg-amber-950/40"    },
};

export default function RecentActivity() {
	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">Recent Activity</p>
				<button className="text-[12px] text-[#737373] hover:text-white transition-colors font-medium">
					View All
				</button>
			</div>

			<div className="bg-[#181818] border border-[#1f1f1f] rounded-xl overflow-hidden">
				{recentActivities.map((activity, index) => {
					const Icon = typeIcon[activity.type as keyof typeof typeIcon] ?? DollarSign;
					const { label, icon: StatusIcon, color } = statusConfig[activity.status] ?? statusConfig.active;

					return (
						<div
							key={index}
							className={`flex items-center gap-4 px-5 py-4 hover:bg-[#1f1f1f] transition-colors cursor-pointer group ${
								index < recentActivities.length - 1 ? "border-b border-[#1a1a1a]" : ""
							}`}
						>
							{/* Type icon */}
							<div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColor[activity.type] ?? "bg-[#222] text-[#737373]"}`}>
								<Icon className="w-4 h-4" />
							</div>

							{/* Details */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-0.5">
									<h4 className="text-[13px] font-semibold text-white truncate group-hover:text-white transition-colors">
										{activity.item}
									</h4>
									<span className="text-[#2a2a2a]">·</span>
									<span className="text-[12px] text-[#737373] shrink-0">{activity.action}</span>
								</div>
								<div className="flex items-center gap-1 text-[11px] text-[#4a4a4a]">
									<Clock className="w-3 h-3" />
									{activity.time}
								</div>
							</div>

							{/* Amount + status */}
							<div className="text-right shrink-0">
								<p className="text-[13px] font-bold text-white mb-1">{activity.amount}</p>
								<span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>
									<StatusIcon className="w-2.5 h-2.5" />
									{label}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
