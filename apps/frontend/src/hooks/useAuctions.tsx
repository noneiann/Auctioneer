"use client";
import {
	auctionApi,
	CreateAuctionBody,
	UpdateAuctionBody,
} from "@/lib/AuctionApi";
import type { ApiResponse } from "@auctioneer/types";
import { useEffect, useState } from "react";
import type { Auction } from "@/lib/AuctionApi";

export default function useAuctions() {
	const [data, setData] = useState<Auction[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		auctionApi
			.getAuctions()
			.then((response) => {
				setData(response.data.items);
			})
			.catch((err) => {
				setError(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const createAuction = async (
		body: CreateAuctionBody
	): Promise<ApiResponse<Auction> | null> => {
		setLoading(true);

		try {
			const response = await auctionApi.createAuction(body);
			setData((prev) => [...prev, response.data]);
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

	return { data, loading, error, createAuction, updateAuction, deleteAuction };
}
