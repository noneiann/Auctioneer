import React from "react";
import { DollarSign, Hammer, RefreshCw, Package } from "lucide-react";

const dashboardStats = [
	{
		title: "Total Sales",
		value: "$12,450",
		change: "+12%",
		changeType: "positive",
		icon: DollarSign,
		description: "This month",
	},
	{
		title: "Active Auctions",
		value: "23",
		change: "+5",
		changeType: "positive",
		icon: Hammer,
		description: "Currently running",
	},
	{
		title: "Barter Deals",
		value: "8",
		change: "+2",
		changeType: "positive",
		icon: RefreshCw,
		description: "This week",
	},
	{
		title: "Total Items",
		value: "156",
		change: "+15",
		changeType: "positive",
		icon: Package,
		description: "In inventory",
	},
];

export default function DashboardCards() {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
			{dashboardStats.map((stat, index) => {
				const IconComponent = stat.icon;

				return (
					<div
						key={index}
						className={`bg-background rounded-lg shadow-sm border border-foreground/10 p-6 hover:shadow-md transition-all hover:border-main/30 ${
							index === 0
								? "animate-fade-in"
								: index === 1
								? "animate-fade-in-delay"
								: index === 2
								? "animate-fade-in-delay-2"
								: "animate-fade-in"
						}`}>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-foreground/70'>
									{stat.title}
								</p>
								<p className='text-2xl font-bold text-foreground mt-2'>
									{stat.value}
								</p>
							</div>
							<div className='p-3 bg-main/10 rounded-full'>
								<IconComponent size={24} className='text-main' />
							</div>
						</div>

						<div className='mt-4 flex items-center justify-between'>
							<div className='flex items-center'>
								<span
									className={`text-sm font-medium ${
										stat.changeType === "positive"
											? "text-green-600"
											: "text-red-600"
									}`}>
									{stat.change}
								</span>
								<span className='text-sm text-foreground/50 ml-2'>
									{stat.description}
								</span>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
