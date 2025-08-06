import { ApiRequest, ApiResponse, User } from "@auctioneer/types";
type CreateAuctionBody = {
	title: string;
	description: string;
	imageUrl: string[];
	type: string;
	price?: number;
	startTime: string; // ISO date string
	endTime: string; // ISO date string
	startingBid: number;
};
