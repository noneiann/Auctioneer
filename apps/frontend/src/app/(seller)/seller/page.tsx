import DashboardCards from "./components/DashboardCards";
import RecentActivity from "./components/RecentActivity";
import QuickActions from "./components/QuickActions";

export default function SellerDashboardPage() {
	return (
		<div className='space-y-6'>
			{/* Dashboard Cards */}
			<DashboardCards />

			{/* Quick Actions */}
			<QuickActions />

			{/* Recent Activity */}
			<RecentActivity />
		</div>
	);
}
