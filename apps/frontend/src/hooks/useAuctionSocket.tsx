"use client";
import { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/contexts/SocketContext";
import type { Auction, AuctionBid } from "@/lib/AuctionApi";

interface AuctionState {
	auction: Auction | null;
	isActive: boolean;
	participantCount: number;
}

export function useAuctionSocket(auctionId: string | null) {
	const { socket, isConnected } = useSocket();
	const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
	const [recentBids, setRecentBids] = useState<AuctionBid[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isBidding, setIsBidding] = useState(false);

	// Join auction room
	useEffect(() => {
		if (!socket || !isConnected || !auctionId) return;

		socket.emit("join_auction", auctionId);

		// Listen for auction state
		socket.on("auction_state", (data: AuctionState) => {
			setAuctionState(data);
			if (data.auction?.bids) {
				setRecentBids(data.auction.bids);
			}
		});

		// Listen for new bids
		socket.on("bid_placed", (data: { bid: AuctionBid; auction: Auction }) => {
			setRecentBids((prev) => [data.bid, ...prev.slice(0, 9)]);
			setAuctionState((prev) =>
				prev ? { ...prev, auction: data.auction } : null
			);
		});

		// Listen for bid errors
		socket.on("bid_error", (data: { message: string }) => {
			setError(data.message);
			setIsBidding(false);
			setTimeout(() => setError(null), 5000);
		});

		// Listen for bid success
		socket.on("bid_success", () => {
			setIsBidding(false);
			setError(null);
		});

		// Listen for auction ended
		socket.on("auction_ended", (data: { auction: Auction; message: string }) => {
			setAuctionState((prev) =>
				prev ? { ...prev, auction: data.auction, isActive: false } : null
			);
		});

		// Listen for user joined/left
		socket.on(
			"user_joined",
			(data: { userId: string; participantCount: number }) => {
				setAuctionState((prev) =>
					prev ? { ...prev, participantCount: data.participantCount } : null
				);
			}
		);

		socket.on(
			"user_left",
			(data: { userId: string; participantCount: number }) => {
				setAuctionState((prev) =>
					prev ? { ...prev, participantCount: data.participantCount } : null
				);
			}
		);

		// Cleanup
		return () => {
			socket.emit("leave_auction", auctionId);
			socket.off("auction_state");
			socket.off("bid_placed");
			socket.off("bid_error");
			socket.off("bid_success");
			socket.off("auction_ended");
			socket.off("user_joined");
			socket.off("user_left");
		};
	}, [socket, isConnected, auctionId]);

	// Place bid function
	const placeBid = useCallback(
		(amount: number) => {
			if (!socket || !isConnected || !auctionId) {
				setError("Not connected to server");
				return;
			}

			setIsBidding(true);
			setError(null);
			socket.emit("place_bid", { auctionId, amount });
		},
		[socket, isConnected, auctionId]
	);

	return {
		auctionState,
		recentBids,
		error,
		isBidding,
		placeBid,
		isConnected,
	};
}
