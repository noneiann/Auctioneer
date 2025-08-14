import React from "react";
import {
	DollarSign,
	Hammer,
	RefreshCw,
	Clock,
	CheckCircle,
	AlertCircle,
} from "lucide-react";

const recentActivities = [
	{
		type: "sale",
		item: "Vintage Camera",
		action: "Sold",
		amount: "$450",
		time: "2 hours ago",
		status: "completed",
	},
	{
		type: "auction",
		item: "Mountain Bike",
		action: "New Bid",
		amount: "$280",
		time: "4 hours ago",
		status: "active",
	},
	{
		type: "barter",
		item: "Electric Guitar",
		action: "Trade Offer",
		amount: "Drum Kit",
		time: "6 hours ago",
		status: "pending",
	},
	{
		type: "sale",
		item: "Leather Jacket",
		action: "Listed",
		amount: "$120",
		time: "1 day ago",
		status: "active",
	},
	{
		type: "auction",
		item: "Vintage Watch",
		action: "Ended",
		amount: "$850",
		time: "2 days ago",
		status: "completed",
	},
];

const getActivityIcon = (type: string) => {
	switch (type) {
		case "sale":
			return DollarSign;
		case "auction":
			return Hammer;
		case "barter":
			return RefreshCw;
		default:
			return DollarSign;
	}
};

const getStatusIcon = (status: string) => {
	switch (status) {
		case "completed":
			return CheckCircle;
		case "active":
			return Clock;
		case "pending":
			return AlertCircle;
		default:
			return Clock;
	}
};

export default function RecentActivity() {
	return (
		<div className='bg-background rounded-lg shadow-sm border border-foreground/10 p-6 animate-fade-in-delay-2'>
			<div className='flex items-center justify-between mb-6'>
				<h3 className='text-lg font-semibold text-foreground'>
					Recent Activity
				</h3>
				<button className='text-sm text-main hover:text-main/80 font-medium transition-colors'>
					View All
				</button>
			</div>

			<div className='space-y-3'>
				{recentActivities.map((activity, index) => {
					const ActivityIcon = getActivityIcon(activity.type);
					const StatusIcon = getStatusIcon(activity.status);

					return (
						<div
							key={index}
							className='flex items-center justify-between p-4 hover:bg-foreground/5 rounded-lg transition-all duration-200 border border-transparent hover:border-foreground/10 group cursor-pointer'>
							<div className='flex items-center space-x-4'>
								{/* Activity Type Icon */}
								<div
									className={`w-11 h-11 rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-105 ${
										activity.type === "sale"
											? "bg-green-500"
											: activity.type === "auction"
											? "bg-main"
											: "bg-purple-500"
									}`}>
									<ActivityIcon size={20} />
								</div>

								{/* Activity Details */}
								<div className='flex-1'>
									<div className='flex items-center space-x-2'>
										<h4 className='font-medium text-foreground group-hover:text-main transition-colors'>
											{activity.item}
										</h4>
										<span className='text-foreground/40'>•</span>
										<span className='text-sm text-foreground/60'>
											{activity.action}
										</span>
									</div>
									<div className='flex items-center space-x-2 mt-1'>
										<Clock size={12} className='text-foreground/40' />
										<p className='text-sm text-foreground/60'>
											{activity.time}
										</p>
									</div>
								</div>
							</div>

							{/* Amount and Status */}
							<div className='text-right space-y-2'>
								<p className='font-semibold text-foreground'>
									{activity.amount}
								</p>
								<div className='flex items-center justify-end space-x-1'>
									<StatusIcon
										size={12}
										className={`${
											activity.status === "completed"
												? "text-green-600"
												: activity.status === "active"
												? "text-main"
												: "text-yellow-600"
										}`}
									/>
									<span
										className={`text-xs font-medium px-2 py-1 rounded-full ${
											activity.status === "completed"
												? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
												: activity.status === "active"
												? "bg-main/10 text-main dark:bg-main/20"
												: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
										}`}>
										{activity.status.charAt(0).toUpperCase() +
											activity.status.slice(1)}
									</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Empty State (if no activities) */}
			{recentActivities.length === 0 && (
				<div className='text-center py-8'>
					<Clock size={48} className='mx-auto text-foreground/20 mb-3' />
					<p className='text-foreground/60'>No recent activity</p>
					<p className='text-sm text-foreground/40 mt-1'>
						Your activity will appear here
					</p>
				</div>
			)}
		</div>
	);
}
