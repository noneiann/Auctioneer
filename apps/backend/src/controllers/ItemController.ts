import { Request, Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "@auctioneer/types/src";
import itemServices from "../services/ItemServices";
import { ItemType } from "@auctioneer/db/generated/prisma";

const VALID_TYPES = ["AUCTION", "DIRECT", "BARTER"] as const;

// Public: list items by type for marketplace browsing
export const listPublicItems = async (
	req: Request,
	res: Response<ApiResponse<any>>
) => {
	try {
		const { type, page, pageSize, search } = req.query;
		const itemType =
			typeof type === "string" && VALID_TYPES.includes(type as ItemType)
				? (type as ItemType)
				: undefined;

		const result = await itemServices.listPublicItems({
			type: itemType,
			page: Math.max(1, parseInt(page as string) || 1),
			pageSize: Math.min(100, parseInt(pageSize as string) || 20),
			search: typeof search === "string" ? search : undefined,
		});
		return res.json({ success: true, data: { items: result.items, total: result.total } });
	} catch (error: any) {
		console.error("Error listing public items:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

// Public: get single item by ID
export const getPublicItem = async (
	req: Request<{ id: string }>,
	res: Response<ApiResponse<any>>
) => {
	try {
		const { id } = req.params;
		const item = await itemServices.getItemById(id);
		if (!item) return res.status(404).json({ success: false, data: "Item not found" });
		return res.json({ success: true, data: item });
	} catch (error: any) {
		console.error("Error fetching item:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

// Authenticated: list items for the current user
export const listUserItems = async (
	req: AuthenticatedRequest,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		const items = await itemServices.listUserItems(req.user.userId);
		return res.json({ success: true, data: items });
	} catch (error: any) {
		console.error("Error listing user items:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

export const updateItem = async (
	req: AuthenticatedRequest & Request<{ id: string }>,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		const { id } = req.params;
		const updateData = req.body;

		const item = await itemServices.getItemById(id);
		if (!item || item.ownerId !== req.user.userId) {
			return res.status(404).json({ success: false, data: "Item not found or unauthorized" });
		}

		const updated = await itemServices.updateItem(id, updateData);
		return res.json({ success: true, data: updated });
	} catch (error: any) {
		console.error("Error updating item:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

export const deleteItem = async (
	req: AuthenticatedRequest & Request<{ id: string }>,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		const { id } = req.params;
		const item = await itemServices.getItemById(id);
		if (!item || item.ownerId !== req.user.userId) {
			return res.status(404).json({ success: false, data: "Item not found or unauthorized" });
		}
		await itemServices.deleteItem(id);
		return res.json({ success: true, data: null });
	} catch (error: any) {
		console.error("Error deleting item:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

export const createItem = async (
	req: AuthenticatedRequest,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		
		const { name, description, category, imageUrl, type, price } = req.body;
		if (!name || !description || !category || !type) {
			return res.status(400).json({ success: false, data: "Missing required fields" });
		}

		const item = await itemServices.createItem({
			name,
			description,
			category,
			imageUrl: Array.isArray(imageUrl) ? imageUrl : [imageUrl],
			type,
			price: price ? parseFloat(price) : undefined,
			ownerId: req.user.userId,
		});

		return res.status(201).json({ success: true, data: item });
	} catch (error: any) {
		console.error("Error creating item:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};
