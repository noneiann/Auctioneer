"use client";

import React from "react";
import { Bell, CheckCircle, AlertTriangle, Info, Clock, X } from "lucide-react";

type AlertType = "info" | "success" | "warning";

interface Alert {
    id: string;
    type: AlertType;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const mockAlerts: Alert[] = [
    {
        id: "1",
        type: "success",
        title: "Auction Ended",
        message: "Your auction for 'Vintage Camera' has ended successfully with a winning bid of $450.",
        time: "2 hours ago",
        read: false,
    },
    {
        id: "2",
        type: "info",
        title: "New Bid",
        message: "Someone placed a bid of $120 on 'Modern Sofa'.",
        time: "5 hours ago",
        read: false,
    },
    {
        id: "3",
        type: "warning",
        title: "Low Inventory",
        message: "You are running low on 'Packing Materials'. Restock soon.",
        time: "1 day ago",
        read: true,
    },
    {
        id: "4",
        type: "info",
        title: "System Update",
        message: "Scheduled maintenance will occur on Sunday at 2 AM EST.",
        time: "2 days ago",
        read: true,
    },
];

export default function SellerAlertsPage() {
    const getIcon = (type: AlertType) => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-emerald-400" />;
            case "warning":
                return <AlertTriangle className="w-5 h-5 text-amber-400" />;
            case "info":
            default:
                return <Info className="w-5 h-5 text-brand-400" />;
        }
    };

    const getBorderColor = (type: AlertType) => {
        switch (type) {
            case "success":
                return "border-emerald-900/50 hover:border-emerald-700";
            case "warning":
                return "border-amber-900/50 hover:border-amber-700";
            case "info":
            default:
                return "border-[#1e293b] hover:border-brand-700";
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Alerts & Notifications</h1>
                    <p className="text-brand-300">Stay updated with your account activity</p>
                </div>
                <button className="text-sm text-brand-400 hover:text-white transition-colors">
                    Mark all as read
                </button>
            </div>

            <div className="space-y-4">
                {mockAlerts.length > 0 ? (
                    mockAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`relative flex items-start gap-4 p-5 rounded-xl border transition-all bg-[#0f172a]/50 ${getBorderColor(
                                alert.type
                            )} ${!alert.read ? "bg-[#1e293b]/30" : ""}`}
                        >
                            <div className="mt-1">{getIcon(alert.type)}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`font-semibold ${!alert.read ? "text-white" : "text-brand-200"}`}>
                                        {alert.title}
                                    </h3>
                                    <span className="text-xs text-brand-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {alert.time}
                                    </span>
                                </div>
                                <p className="text-brand-300 text-sm leading-relaxed">{alert.message}</p>
                            </div>
                            {!alert.read && (
                                <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                            )}
                            <button className="absolute top-2 right-2 p-2 text-brand-500/20 hover:text-brand-400 transition-colors opacity-0 group-hover:opacity-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[#1e293b] rounded-xl bg-[#0f172a]/30">
                        <Bell className="w-12 h-12 text-brand-800 mb-4" />
                        <h3 className="text-lg font-medium text-white">No new alerts</h3>
                        <p className="text-brand-400 text-sm">You&apos;re all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
