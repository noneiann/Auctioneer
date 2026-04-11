// services/auctionApi.ts
import { ApiResponse } from "@auctioneer/types";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type CreateAuctionBody = {
	title: string;
	description: string;
	category: string;
	imageUrl: string[];
	type: string;
	price?: number;
	startTime: string; // ISO date string
	endTime: string; // ISO date string
	startingBid: number;
};

export type AuctionUser = {
	id: string;
	email?: string;
	username?: string;
	firstName?: string;
	lastName?: string;
};

export type AuctionItem = {
	id: string;
	name: string;
	description: string;
	imageUrl: string[];
	price?: number;
};

export type AuctionBid = {
	id: string;
	amount: number;
	createdAt: string;
	bidder?: AuctionUser | null;
};

export type Auction = {
	id: string;
	startingBid: number;
	currentBid: number;
	startTime: string;
	endTime: string;
	createdAt?: string;
	category: string;
	item: AuctionItem;
	bids?: AuctionBid[];
	owner?: AuctionUser;
};

export type AuctionListMeta = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

export type AuctionListData = {
	items: Auction[];
	meta: AuctionListMeta;
};

// More flexible type for updates - allows single string or array for imageUrl
export type UpdateAuctionBody = {
	itemName?: string;
	description?: string;
	category?: string;
	imageUrl?: string | string[];
	startTime?: string;
	endTime?: string;
	startingBid?: number;
};

// Helper function to get token from Zustand persist storage
function getAuthToken(): string | null {
	try {
		const authStorage = localStorage.getItem("auth-storage");
		if (authStorage) {
			const parsed = JSON.parse(authStorage);
			return parsed.state?.token || null;
		}
		return null;
	} catch (error) {
		console.error("Error parsing auth storage:", error);
		return null;
	}
}

async function createAuction(
	body: CreateAuctionBody
): Promise<ApiResponse<Auction>> {
	const token = getAuthToken();

	const res = await fetch(`${API_BASE_URL}/auctions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
		},
		body: JSON.stringify(body),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.data || "Failed to create auction");
	}

	return data;
}

type GetAuctionsParams = {
	page?: number;
	pageSize?: number;
	category?: string;
	ownerId?: string;
	itemType?: string;
};

async function getAuctions(
	params: GetAuctionsParams = {}
): Promise<ApiResponse<AuctionListData>> {
	const token = getAuthToken();
	const query = new URLSearchParams();

	if (params.page) query.set("page", String(params.page));
	if (params.pageSize) query.set("pageSize", String(params.pageSize));
	if (params.category) query.set("category", params.category);
	if (params.ownerId) query.set("ownerId", params.ownerId);
	if (params.itemType) query.set("itemType", params.itemType);

	const queryString = query.toString();
	const url = queryString
		? `${API_BASE_URL}/auctions?${queryString}`
		: `${API_BASE_URL}/auctions`;

	const res = await fetch(url, {
		headers: {
			...(token && { Authorization: `Bearer ${token}` }),
		},
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.data || "Failed to fetch auctions");
	}

	return data;
}

async function getMyAuctions(): Promise<ApiResponse<Auction[]>> {
	const token = getAuthToken();

	const res = await fetch(`${API_BASE_URL}/auctions/my`, {
		headers: {
			...(token && { Authorization: `Bearer ${token}` }),
		},
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.data || "Failed to fetch user auctions");
	}

	return data;
}

async function getAuctionById(id: string): Promise<ApiResponse<Auction>> {
	const token = getAuthToken();

	const res = await fetch(`${API_BASE_URL}/auctions/${id}`, {
		headers: {
			...(token && { Authorization: `Bearer ${token}` }),
		},
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.data || "Failed to fetch auction");
	}

	return data;
}

async function updateAuction(
	id: string,
	body: UpdateAuctionBody
): Promise<ApiResponse<Auction>> {
	const token = getAuthToken();

	const res = await fetch(`${API_BASE_URL}/auctions/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
		},
		body: JSON.stringify(body),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.data || "Failed to update auction");
	}

	return data;
}

async function deleteAuction(id: string): Promise<ApiResponse<null>> {
	const token = getAuthToken();

	const res = await fetch(`${API_BASE_URL}/auctions/${id}`, {
		method: "DELETE",
		headers: {
			...(token && { Authorization: `Bearer ${token}` }),
		},
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.data || "Failed to delete auction");
	}

	return data;
}

export const auctionApi = {
	createAuction,
	getAuctions,
	getMyAuctions,
	getAuctionById,
	updateAuction,
	deleteAuction,
};
