"use client";
import {
	auctionApi,
	CreateAuctionBody,
	UpdateAuctionBody,
} from "@/lib/AuctionApi";
import type { ApiResponse } from "@auctioneer/types";
import type { Auction } from "@/lib/AuctionApi";
import { useEffect, useState } from "react";

// Hook for fetching user's own auctions (seller dashboard)
export default function useMyAuctions() {
	const [data, setData] = useState<Auction[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchAuctions = async () => {
		setLoading(true);
		try {
			const response = await auctionApi.getMyAuctions();
			setData(response.data);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to fetch auctions";
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAuctions();
	}, []);

	const createAuction = async (
		body: CreateAuctionBody
	): Promise<ApiResponse<Auction> | null> => {
		setLoading(true);

		try {
			const response = await auctionApi.createAuction(body);
			setData((prev) => [response.data, ...prev]); // Add to beginning (newest first)
			return response;
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to create auction";
			setError(message);
			return null;
		} finally {
			setLoading(false);
		}
	};

	const updateAuction = async (
		id: string,
		body: UpdateAuctionBody
	): Promise<ApiResponse<Auction> | null> => {
		setLoading(true);

		try {
			const response = await auctionApi.updateAuction(id, body);
			setData((prev) =>
				prev.map((auction) => (auction.id === id ? response.data : auction))
			);
			return response;
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to update auction";
			setError(message);
			return null;
		} finally {
			setLoading(false);
		}
	};

	const deleteAuction = async (id: string): Promise<boolean> => {
		setLoading(true);

		try {
			await auctionApi.deleteAuction(id);
			setData((prev) => prev.filter((auction) => auction.id !== id));
			return true;
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to delete auction";
			setError(message);
			return false;
		} finally {
			setLoading(false);
		}
	};

	return {
		data,
		loading,
		error,
		refetch: fetchAuctions,
		createAuction,
		updateAuction,
		deleteAuction,
	};
}
