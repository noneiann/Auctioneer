import api from "./api";
import { ApiResponse, Item, User } from "@auctioneer/types/src";

export interface BarterOffer {
	id: string;
	targetItemId: string;
	offererId: string;
	status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
	message?: string;
	cashAdded?: number;
	createdAt: string;
	targetItem?: Item & { owner?: User };
	offeredItems?: Item[];
	offerer?: User;
}

export const barterApi = {
	createOffer: (data: {
		targetItemId: string;
		offeredItemId: string;
		cashAdded?: number;
		message?: string;
	}): Promise<ApiResponse<BarterOffer>> => {
		return api.post("/barter", data) as unknown as Promise<ApiResponse<BarterOffer>>;
	},

	getMyOffers: (): Promise<ApiResponse<{ made: BarterOffer[]; received: BarterOffer[] }>> => {
		return api.get("/barter/my") as unknown as Promise<ApiResponse<{ made: BarterOffer[]; received: BarterOffer[] }>>;
	},

	getOfferById: (id: string): Promise<ApiResponse<BarterOffer>> => {
		return api.get(`/barter/${id}`) as unknown as Promise<ApiResponse<BarterOffer>>;
	},

	respondToOffer: (id: string, status: "ACCEPTED" | "REJECTED" | "CANCELLED"): Promise<ApiResponse<BarterOffer>> => {
		return api.put(`/barter/${id}/respond`, { status }) as unknown as Promise<ApiResponse<BarterOffer>>;
	},
};
