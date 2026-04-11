import api from "./api";
import { ApiResponse, Item, User } from "@auctioneer/types/src";

export interface Purchase {
	id: string;
	itemId: string;
	buyerId: string;
	amount: number;
	status: "PENDING" | "COMPLETED" | "CANCELLED";
	createdAt: Date;
	item?: Item & { owner?: User };
	buyer?: User;
}

export const purchaseApi = {
	createPurchase: (data: { itemId: string; amount: number }): Promise<ApiResponse<Purchase>> => {
		return api.post("/purchases", data) as unknown as Promise<ApiResponse<Purchase>>;
	},

	getMyPurchases: (): Promise<ApiResponse<{ bought: Purchase[]; sold: Purchase[] }>> => {
		return api.get("/purchases/my") as unknown as Promise<ApiResponse<{ bought: Purchase[]; sold: Purchase[] }>>;
	},

	getPurchaseById: (id: string): Promise<ApiResponse<Purchase>> => {
		return api.get(`/purchases/${id}`) as unknown as Promise<ApiResponse<Purchase>>;
	},

	updatePurchaseStatus: (id: string, status: string): Promise<ApiResponse<Purchase>> => {
		return api.put(`/purchases/${id}/status`, { status }) as unknown as Promise<ApiResponse<Purchase>>;
	},
};
