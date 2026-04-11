import api from "./api";
import { ApiResponse, Auction, User } from "@auctioneer/types/src";
import { AuctionItem } from "./AuctionApi";

export interface Bid {
	id: string;
	amount: number;
	createdAt: string;
	bidderId: string;
	auctionId: string;
	auction?: Auction & { item?: AuctionItem; owner?: User; bids?: Bid[] };
}

export const bidApi = {
	getMyBids: (): Promise<ApiResponse<Bid[]>> => {
		return api.get("/bids/my") as unknown as Promise<ApiResponse<Bid[]>>;
	},
};
