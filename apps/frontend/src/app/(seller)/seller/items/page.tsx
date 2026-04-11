/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Plus, Package, Gavel, RefreshCw, Layers } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function MyItemsPage() {
    const [activeTab, setActiveTab] = useState<"all" | "auctions" | "direct" | "barter">("all");
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await api.get("/items/my");
            if (response && response.success) {
                setItems(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch user items", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const filteredItems = items.filter(item => {
        if (activeTab === "all") return true;
        return item.type?.toLowerCase() === activeTab;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Package className="w-6 h-6 text-brand-500" />
                        My Items
                    </h1>
                    <p className="text-brand-300 mt-1">Manage everything you are selling, auctioning, or trading.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Link href="/seller/items/sell" className="flex-1 sm:flex-none">
                        <button className="w-full px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-white rounded-lg transition-colors border border-[#334155] flex items-center justify-center gap-2 font-medium">
                            <Plus className="w-4 h-4 text-brand-400" />
                            Sell/Trade
                        </button>
                    </Link>
                    <Link href="/seller/auctions/create" className="flex-1 sm:flex-none">
                        <button className="w-full px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium shadow-lg shadow-brand-500/20">
                            <Gavel className="w-4 h-4" />
                            Auction
                        </button>
                    </Link>
                </div>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-sm">
                <div className="border-b border-[#1e293b] flex overflow-x-auto custom-scrollbar">
                    {["all", "auctions", "direct", "barter"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as "all" | "auctions" | "direct" | "barter")}
                            className={`px-6 py-4 text-sm font-medium capitalize transition-colors border-b-2 whitespace-nowrap ${
                                activeTab === tab 
                                    ? "border-brand-500 text-brand-400 bg-brand-500/5" 
                                    : "border-transparent text-brand-300 hover:text-white hover:bg-[#1e293b]/50"
                            }`}
                        >
                            {tab === "all" ? "All Items" : tab + (tab === "direct" ? " Sales" : "")}
                        </button>
                    ))}
                    <div className="ml-auto px-4 flex items-center border-l border-[#1e293b]">
                        <button 
                            onClick={fetchItems}
                            className="p-2 text-brand-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-brand-500/50">
                            <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                            <p>Loading your inventory...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[#1e293b] rounded-xl bg-[#020617]/50">
                            <Layers className="w-12 h-12 text-brand-500/20 mb-3" />
                            <h3 className="text-lg font-medium text-white mb-1">No items found</h3>
                            <p className="text-brand-300 max-w-sm mb-6">
                                You haven&apos;t listed any items in this category yet.
                            </p>
                            <Link href="/seller/items/sell">
                                <button className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-white rounded-lg transition-colors border border-[#334155] flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Create Listing
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredItems.map(item => (
                                <div key={item.id} className="bg-[#1e293b]/30 border border-[#1e293b] rounded-lg p-4 flex flex-col gap-3 hover:border-brand-500/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-white line-clamp-1">{item.name}</h3>
                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                            item.type === 'AUCTION' ? 'bg-amber-500/20 text-amber-500' :
                                            item.type === 'DIRECT' ? 'bg-emerald-500/20 text-emerald-500' :
                                            'bg-brand-500/20 text-brand-400'
                                        }`}>
                                            {item.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-brand-300 line-clamp-2 min-h-[32px]">{item.description}</p>
                                    <div className="mt-auto pt-3 border-t border-[#1e293b]/50 flex justify-between items-center">
                                        <span className="font-mono font-bold text-white">
                                            ${item.price?.toLocaleString() || item.estimatedValue?.toLocaleString() || '---'}
                                        </span>
                                        <span className={`text-xs ${item.status === 'AVAILABLE' ? 'text-emerald-500' : 'text-neutral-500'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
