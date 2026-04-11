/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, DollarSign, ArrowUpRight, Package, Replace } from "lucide-react";
import api from "@/lib/api";

export default function ReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/users/stats");
                if (response && response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const metrics = [
        { title: "Total Auctions", value: stats?.totalAuctions || 0, icon: <TrendingUp className="w-5 h-5" />, trend: "+12%" },
        { title: "Direct Sales", value: stats?.totalSales || 0, icon: <Package className="w-5 h-5" />, trend: "+5%" },
        { title: "Barters Completed", value: stats?.totalBarters || 0, icon: <Replace className="w-5 h-5" />, trend: "+2%" },
        { title: "Est. Revenue", value: `$${(stats?.revenue || 0).toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, trend: "+18%" }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-brand-500" />
                    Reports & Analytics
                </h1>
                <p className="text-brand-300 mt-1">Track your marketplace performance across all listing types.</p>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center text-brand-500/50">Loading metrics...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {metrics.map((metric, i) => (
                            <div key={i} className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-[#1e293b] rounded-lg text-brand-400">
                                        {metric.icon}
                                    </div>
                                    <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                                        <ArrowUpRight className="w-3 h-3 mr-1" />
                                        {metric.trend}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-bold text-white tracking-tight mb-1">{metric.value}</h3>
                                <p className="text-sm text-brand-400 font-medium">{metric.title}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-brand-500/30">
                            <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                            <p className="font-medium text-lg text-brand-300">Revenue Chart</p>
                            <p className="text-sm">Historical data visualization coming soon.</p>
                        </div>
                        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 shadow-sm flex flex-col">
                            <h3 className="font-bold text-white mb-4">Recent Activity</h3>
                            <div className="flex-1 flex items-center justify-center text-brand-500/30 text-center">
                                <p className="text-sm">Not enough data to generate activity feed.</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
