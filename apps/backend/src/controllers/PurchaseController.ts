import { Request, Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "@auctioneer/types/src";
import purchaseServices from "../services/PurchaseServices";
import itemServices from "../services/ItemServices";

export const createPurchase = async (
	req: AuthenticatedRequest,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		
		const { itemId, amount, status } = req.body;
		if (!itemId || !amount) {
			return res.status(400).json({ success: false, data: "Missing required fields" });
		}

		const item = await itemServices.getItemById(itemId);
		if (!item) {
			return res.status(404).json({ success: false, data: "Item not found" });
		}
		if (item.ownerId === req.user.userId) {
			return res.status(400).json({ success: false, data: "Cannot purchase your own item" });
		}

		const purchase = await purchaseServices.createPurchase({
			itemId,
			buyerId: req.user.userId,
			amount,
			status: status || "PENDING",
		});

		return res.status(201).json({ success: true, data: purchase });
	} catch (error) {
		console.error("Error creating purchase:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

export const getPurchase = async (
	req: AuthenticatedRequest & Request<{ id: string }>,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}

		const { id } = req.params;
		const purchase = await purchaseServices.getPurchaseById(id);
		
		if (!purchase) {
			return res.status(404).json({ success: false, data: "Purchase not found" });
		}
		
		// Auth check: Must be buyer or seller
		if (purchase.buyerId !== req.user.userId && purchase.item?.ownerId !== req.user.userId) {
			return res.status(403).json({ success: false, data: "Forbidden" });
		}

		return res.json({ success: true, data: purchase });
	} catch (error) {
		console.error("Error fetching purchase:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

export const listUserPurchases = async (
	req: AuthenticatedRequest,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		const asBuyer = await purchaseServices.listPurchasesByBuyer(req.user.userId);
		const asSeller = await purchaseServices.listPurchasesBySeller(req.user.userId);

		return res.json({ success: true, data: { bought: asBuyer, sold: asSeller } });
	} catch (error) {
		console.error("Error listing user purchases:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

export const updatePurchaseStatus = async (
	req: AuthenticatedRequest & Request<{ id: string }>,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		const { id } = req.params;
		const { status } = req.body;
		
		const purchase = await purchaseServices.getPurchaseById(id);
		if (!purchase) {
			return res.status(404).json({ success: false, data: "Purchase not found" });
		}
		// Typically seller configures it to "COMPLETED" or logic depends on role
		if (purchase.item?.ownerId !== req.user.userId) {
			return res.status(403).json({ success: false, data: "Only seller can update status" });
		}

		const updated = await purchaseServices.updatePurchaseStatus(id, status);
		return res.json({ success: true, data: updated });
	} catch (error) {
		console.error("Error updating purchase:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};
