import api from "./api";
import { Item, ApiResponse } from "@auctioneer/types/src";

type GetItemsParams = {
	type?: string;
	page?: number;
	pageSize?: number;
	search?: string;
};

export const itemApi = {
	getItems: (params: GetItemsParams = {}): Promise<ApiResponse<{ items: Item[]; total: number }>> => {
		const query = new URLSearchParams();
		if (params.type) query.set("type", params.type);
		if (params.page) query.set("page", params.page.toString());
		if (params.pageSize) query.set("pageSize", params.pageSize.toString());
		if (params.search) query.set("search", params.search);
		return api.get(`/items?${query.toString()}`) as unknown as Promise<ApiResponse<{ items: Item[]; total: number }>>;
	},

	getItemById: (id: string): Promise<ApiResponse<Item>> => {
		return api.get(`/items/${id}`) as unknown as Promise<ApiResponse<Item>>;
	},

	getMyItems: (): Promise<ApiResponse<Item[]>> => {
		return api.get("/items/my") as unknown as Promise<ApiResponse<Item[]>>;
	},
};
