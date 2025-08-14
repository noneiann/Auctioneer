import React from "react";
import Link from "next/link";
import { Hammer, DollarSign, RefreshCw, BarChart3 } from "lucide-react";

const quickActions = [
	{
		title: "Create Auction",
		description: "Start a new auction for your item",
		icon: Hammer,
		href: "/seller/auction/create",
		color: "bg-main",
	},
	{
		title: "Sell Instantly",
		description: "List an item for immediate sale",
		icon: DollarSign,
		href: "/seller/items/sell",
		color: "bg-green-500",
	},
	{
		title: "Barter Item",
		description: "Trade your item",
		icon: RefreshCw,
		href: "/seller/items/barter",
		color: "bg-purple-500",
	},
	{
		title: "View Reports",
		description: "Check your sales analytics",
		icon: BarChart3,
		href: "/seller/reports",
		color: "bg-orange-500",
	},
];

export default function QuickActions() {
	return (
		<div className='bg-background rounded-lg shadow-sm border border-foreground/10 p-6 animate-fade-in-delay'>
			<h3 className='text-lg font-semibold text-foreground mb-4'>
				Quick Actions
			</h3>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
				{quickActions.map((action, index) => {
					const IconComponent = action.icon;
					return (
						<Link key={index} href={action.href}>
							<button className='w-full text-left p-4 rounded-lg border-2 border-foreground/10 hover:border-main/50 transition-all group hover:shadow-md'>
								<div
									className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
									<IconComponent size={24} />
								</div>
								<h4 className='font-medium text-foreground'>{action.title}</h4>
								<p className='text-sm text-foreground/70 mt-1'>
									{action.description}
								</p>
							</button>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
