"use client";
import { auctionApi, CreateAuctionBody } from "@/lib/AuctionApi";
import { ApiResponse } from "@auctioneer/types";
import React, { useEffect, useState } from "react";

export default function useAuctions() {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		auctionApi
			.getAuctions()
			.then((response) => {
				setData(response.data);
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
	): Promise<ApiResponse<any> | null> => {
		setLoading(true);

		try {
			const response = await auctionApi.createAuction(body);
			setData((prev) => [...prev, response.data]);
			return response;
		} catch (err: any) {
			setError(err.message);
			return null;
		} finally {
			setLoading(false);
		}
	};

	return { data, loading, error, createAuction };
}
