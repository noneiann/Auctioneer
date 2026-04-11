"use client";

import React, { useState } from "react";
import { Auction } from "@/lib/AuctionApi";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";
import { Clock, WifiOff, Users, TrendingUp, Gavel, MessageSquare, History, Trophy } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import AuctionChat from "./AuctionChat";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/stores/CartStore";

interface AuctionBiddingPanelProps {
    auction: Auction;
    timeLeft: string;
    urgency: "normal" | "warning" | "urgent" | "ended";
}

export default function AuctionBiddingPanel({ auction, timeLeft, urgency }: AuctionBiddingPanelProps) {
    const { auctionState, recentBids, error, isBidding, placeBid, isConnected } = useAuctionSocket(auction.id);
    const { user } = useAuth();
    const { addItem } = useCartStore();
    const [activeTab, setActiveTab] = useState<"history" | "chat">("history");
    const [bidAmount, setBidAmount] = useState<number>(0);

    const currentBid = auctionState?.auction?.currentBid || auctionState?.auction?.startingBid || auction.startingBid;
    const minBid = currentBid + 1;

    // Determine the winner: bidder who placed the highest bid
    const allBids = auctionState?.auction?.bids ?? auction.bids ?? [];
    const winningBid = allBids.length > 0
        ? allBids.reduce((top, b) => (b.amount > top.amount ? b : top), allBids[0])
        : null;
    const winnerBidderId = winningBid?.bidder?.id ?? null;
    const currentUserId = user?.id ?? null;
    const isWinner = urgency === "ended" && !!currentUserId && currentUserId === winnerBidderId;
    const isOwner  = auction.owner?.id === currentUserId;

    const handlePlaceBid = (e: React.FormEvent) => {
        e.preventDefault();
        if (bidAmount >= minBid) {
            placeBid(bidAmount);
            setBidAmount(0);
        }
    };

    const urgencyColor =
        urgency === "urgent"
            ? "text-red-500"
            : urgency === "warning"
                ? "text-amber-500"
                : urgency === "ended"
                    ? "text-neutral-400"
                    : "text-brand-300";

    return (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
            {/* Header Status Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1e293b]/50 border-b border-[#1e293b]">
                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-medium text-emerald-500">Live</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-500/10 border border-neutral-500/20">
                            <WifiOff className="w-3 h-3 text-neutral-400" />
                            <span className="text-xs font-medium text-neutral-400">Connecting</span>
                        </div>
                    )}
                    {auctionState && (
                        <div className="flex items-center gap-1 text-xs text-brand-300">
                            <Users className="w-3 h-3" />
                            <span>{auctionState.participantCount} viewing</span>
                        </div>
                    )}
                </div>
                <div className={cn("flex items-center gap-1.5 font-mono font-medium", urgencyColor)}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeLeft}</span>
                </div>
            </div>

            <div className="p-5 space-y-6">
                {/* Price Display */}
                <div>
                    <p className="text-sm text-brand-400 font-medium mb-1">Current Bid</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white tracking-tight">
                            ${currentBid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        {auctionState?.auction?.bids && auctionState.auction.bids.length > 0 && (
                            <span className="text-sm text-brand-400">
                                {auctionState.auction.bids.length} bids
                            </span>
                        )}
                    </div>
                </div>

                {/* Bidding Controls */}
                {urgency !== "ended" ? (
                    <form onSubmit={handlePlaceBid} className="space-y-3">
                        <div className="flex gap-2">
                            {[10, 50, 100].map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() => setBidAmount(currentBid + amount)}
                                    className="flex-1 py-2 px-3 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-brand-200 text-sm font-medium rounded-lg transition-colors"
                                >
                                    +${amount}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400">$</span>
                                <input
                                    type="number"
                                    value={bidAmount || ""}
                                    onChange={(e) => setBidAmount(parseFloat(e.target.value))}
                                    placeholder={minBid.toFixed(2)}
                                    min={minBid}
                                    step="0.01"
                                    className="w-full bg-[#020617] text-white border border-[#1e293b] rounded-lg py-2.5 pl-7 pr-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-brand-700"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isBidding || !isConnected || (bidAmount > 0 && bidAmount < minBid)}
                                className="bg-brand-600 hover:bg-brand-500 text-white px-6"
                            >
                                {isBidding ? <Gavel className="w-4 h-4 animate-bounce" /> : "Bid"}
                            </Button>
                        </div>
                        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                    </form>
                ) : (
                    <div className="p-5 bg-[#1e293b]/50 border border-[#1e293b] rounded-xl text-center flex flex-col gap-3">
                        {isWinner ? (
                            <>
                                {/* Winner state */}
                                <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-1 ring-4 ring-[#0f172a]">
                                    <Trophy className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">Congratulations!</p>
                                    <p className="text-white font-bold text-lg">You Won This Auction</p>
                                    <p className="text-sm text-brand-400 mt-1">
                                        Winning Bid: <span className="text-white font-mono font-bold">${currentBid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </p>
                                </div>
                                <div className="mt-2 pt-4 border-t border-[#1e293b]/50 flex flex-col gap-2.5">
                                    <Button
                                        variant="primary"
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-transparent"
                                        onClick={() => {
                                            addItem({
                                                id: auction.item?.id || auction.id,
                                                name: auction.item?.name || "Auction Win",
                                                imageUrl: auction.item?.imageUrl?.[0] || "",
                                                price: currentBid,
                                                type: "AUCTION_WIN",
                                                auctionId: auction.id
                                            });
                                        }}
                                    >
                                        Proceed to Checkout
                                    </Button>
                                    <Button variant="secondary" className="w-full border-[#334155] text-brand-300 hover:text-white hover:bg-[#334155] flex items-center justify-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Message Seller
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Non-winner / not logged in / owner state */}
                                <div className="mx-auto w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center mb-1 ring-4 ring-[#0f172a]">
                                    <Gavel className="w-6 h-6 text-brand-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">Auction Ended</p>
                                    <p className="text-sm text-brand-400 mt-1">
                                        Final Price: <span className="text-white font-mono font-bold">${currentBid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </p>
                                    {allBids.length === 0 && (
                                        <p className="text-xs text-brand-500 mt-2">No bids were placed on this auction.</p>
                                    )}
                                </div>
                                {!isOwner && allBids.length > 0 && (
                                    <div className="mt-2 pt-4 border-t border-[#1e293b]/50">
                                        <Button variant="secondary" className="w-full border-[#334155] text-brand-300 hover:text-white hover:bg-[#334155] flex items-center justify-center gap-2">
                                            <MessageSquare className="w-4 h-4" /> Message Seller
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                )}

                <div className="h-px bg-[#1e293b]" />

                {/* Tabs: History & Chat */}
                <div className="flex flex-col h-[300px]">
                    <div className="flex border-b border-[#1e293b] mb-4">
                        <button
                            onClick={() => setActiveTab("history")}
                            className={cn(
                                "flex-1 pb-3 text-sm font-medium transition-colors relative",
                                activeTab === "history" ? "text-white" : "text-brand-400 hover:text-brand-200"
                            )}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <History className="w-4 h-4" />
                                <span>History</span>
                            </div>
                            {activeTab === "history" && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("chat")}
                            className={cn(
                                "flex-1 pb-3 text-sm font-medium transition-colors relative",
                                activeTab === "chat" ? "text-white" : "text-brand-400 hover:text-brand-200"
                            )}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span>Chat</span>
                            </div>
                            {activeTab === "chat" && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
                            )}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {activeTab === "history" ? (
                            <div className="space-y-1">
                                {recentBids.length === 0 ? (
                                    <div className="text-center py-8 text-brand-500/50">
                                        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No bids yet</p>
                                    </div>
                                ) : (
                                    recentBids.map((bid) => (
                                        <div key={bid.id} className="flex items-center justify-between p-2 rounded hover:bg-[#1e293b]/50 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-brand-300">
                                                    {bid.bidder?.firstName || "Anonymous"} {bid.bidder?.lastName?.charAt(0)}.
                                                </span>
                                                <span className="text-[10px] text-brand-500">
                                                    {new Date(bid.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-white font-mono">
                                                ${bid.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="h-full">
                                <AuctionChat auctionId={auction.id} minimal />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
