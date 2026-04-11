/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Hammer, RefreshCw, Package, TrendingUp } from "lucide-react";
import api from "@/lib/api";

const statConfig = [
	{
		key: "revenue",
		title: "Revenue",
		prefix: "$",
		icon: DollarSign,
		description: "Estimated earnings",
		accentClass: "text-emerald-400",
		bgClass: "bg-emerald-500/8",
	},
	{
		key: "totalAuctions",
		title: "Auctions",
		icon: Hammer,
		description: "Currently active",
		accentClass: "text-brand-400",
		bgClass: "bg-brand-500/8",
	},
	{
		key: "totalBarters",
		title: "Barters",
		icon: RefreshCw,
		description: "Pending or closed",
		accentClass: "text-purple-400",
		bgClass: "bg-purple-500/8",
	},
	{
		key: "totalSales",
		title: "Direct Sales",
		icon: Package,
		description: "Items sold directly",
		accentClass: "text-amber-400",
		bgClass: "bg-amber-500/8",
	},
];

export default function DashboardCards() {
	const [stats, setStats] = useState<Record<string, unknown> | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await api.get("/users/stats");
				if (response && response.success) setStats(response.data);
			} catch {
				// silently fail
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, []);

	return (
		<div>
			<div className="mb-6">
				<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">Overview</p>
				<h1 className="text-2xl font-bold text-white mt-0.5">Dashboard</h1>
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
				{statConfig.map((s, i) => {
					const Icon = s.icon;
					const raw = stats?.[s.key];
					const value = loading
						? "—"
						: s.prefix
						? `${s.prefix}${Number(raw || 0).toLocaleString()}`
						: String(raw || 0);

					return (
						<div
							key={s.key}
							className={`bg-[#181818] border border-[#1f1f1f] rounded-xl p-5 hover:border-[#2a2a2a] transition-all ${
								i === 0 ? "animate-fade-in" : i === 1 ? "animate-fade-in-delay" : i === 2 ? "animate-fade-in-delay-2" : "animate-fade-in-delay-3"
							}`}
						>
							<div className="flex items-start justify-between mb-4">
								<p className="text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a]">
									{s.title}
								</p>
								<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bgClass}`}>
									<Icon className={`w-4 h-4 ${s.accentClass}`} />
								</div>
							</div>
							<p className={`text-2xl font-bold text-white ${loading ? "animate-pulse" : ""}`}>
								{value}
							</p>
							<div className="flex items-center gap-1.5 mt-2">
								<TrendingUp className="w-3 h-3 text-emerald-400" />
								<p className="text-[11px] text-[#4a4a4a]">{s.description}</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
