"use client";
import {
	auctionApi,
	CreateAuctionBody,
	UpdateAuctionBody,
} from "@/lib/AuctionApi";
import { ApiResponse } from "@auctioneer/types";
import { useEffect, useState } from "react";

// Hook for fetching user's own auctions (seller dashboard)
export default function useMyAuctions() {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchAuctions = async () => {
		setLoading(true);
		try {
			const response = await auctionApi.getMyAuctions();
			setData(response.data);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAuctions();
	}, []);

	const createAuction = async (
		body: CreateAuctionBody
	): Promise<ApiResponse<any> | null> => {
		setLoading(true);

		try {
			const response = await auctionApi.createAuction(body);
			setData((prev) => [response.data, ...prev]); // Add to beginning (newest first)
			return response;
		} catch (err: any) {
			setError(err.message);
			return null;
		} finally {
			setLoading(false);
		}
	};

	const updateAuction = async (
		id: string,
		body: UpdateAuctionBody
	): Promise<ApiResponse<any> | null> => {
		setLoading(true);

		try {
			const response = await auctionApi.updateAuction(id, body);
			setData((prev) =>
				prev.map((auction) => (auction.id === id ? response.data : auction))
			);
			return response;
		} catch (err: any) {
			setError(err.message);
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
		} catch (err: any) {
			setError(err.message);
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
