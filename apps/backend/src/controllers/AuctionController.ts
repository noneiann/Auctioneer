import { Router, Request, Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "@auctioneer/types/src";
import auctionServices from "../services/AuctionServices";

import { PrismaClient, Prisma } from "@auctioneer/db/generated/prisma";
import itemServices from "../services/ItemServices";

// Create a new auction
export const createAuction = async (
	req: AuthenticatedRequest,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}

		const {
			title,
			description,
			imageUrl,
			type,
			price,
			startTime,
			endTime,
			startingBid,
		} = req.body;

		if (
			!title ||
			!description ||
			!Array.isArray(imageUrl) ||
			!type ||
			startingBid == null ||
			!startTime ||
			!endTime
		) {
			return res
				.status(400)
				.json({ success: false, data: "Missing required fields" });
		}

		const newItem = await itemServices.createItem({
			name: title,
			description,
			imageUrl,
			type,
			price,
			ownerId: req.user.userId,
		});

		const newAuction = await auctionServices.createAuction({
			ownerId: req.user.userId,
			itemId: newItem.id,
			startingBid,
			startTime: new Date(startTime),
			endTime: new Date(endTime),
		});

		return res.status(201).json({ success: true, data: newAuction });
	} catch (error: any) {
		console.error("Error creating auction:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

// Get a single auction by ID
export const getAuction = async (
	req: Request<{ id: string }>,
	res: Response<ApiResponse<any>>
) => {
	try {
		const { id } = req.params;
		const auction = await auctionServices.getAuctionById(id);
		if (!auction) {
			return res
				.status(404)
				.json({ success: false, data: "Auction not found" });
		}
		return res.json({ success: true, data: auction });
	} catch (error: any) {
		console.error("Error fetching auction:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

// List all auctions (with optional pagination / filters)
export const listAuctions = async (
	req: Request,
	res: Response<ApiResponse<any>>
) => {
	try {
		const auctions = await auctionServices.listAuctions();
		return res.json({ success: true, data: auctions });
	} catch (error: any) {
		console.error("Error listing auctions:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

// Update an existing auction by ID
export const updateAuction = async (
	req: AuthenticatedRequest & Request<{ id: string }>,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		const { id } = req.params;
		const updateData = req.body;
		const updated = await auctionServices.updateAuction(
			id,
			req.user.userId,
			updateData
		);
		if (!updated) {
			return res
				.status(404)
				.json({ success: false, data: "Auction not found or unauthorized" });
		}
		return res.json({ success: true, data: updated });
	} catch (error: any) {
		console.error("Error updating auction:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

// Delete an auction by ID
export const deleteAuction = async (
	req: AuthenticatedRequest & Request<{ id: string }>,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		const { id } = req.params;
		const deleted = await auctionServices.deleteAuction(id, req.user.userId);
		if (!deleted) {
			return res
				.status(404)
				.json({ success: false, data: "Auction not found or unauthorized" });
		}
		return res.json({ success: true, data: null });
	} catch (error: any) {
		console.error("Error deleting auction:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};
