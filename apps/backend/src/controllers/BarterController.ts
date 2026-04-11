import { Request, Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "@auctioneer/types/src";
import barterServices from "../services/BarterServices";
import itemServices from "../services/ItemServices";

export const createOffer = async (
	req: AuthenticatedRequest,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}

		const { targetItemId, offeredItemId, cashAdded, message } = req.body;
		if (!targetItemId || !offeredItemId) {
			return res.status(400).json({ success: false, data: "Missing required fields" });
		}

		const targetItem = await itemServices.getItemById(targetItemId);
		if (!targetItem) {
			return res.status(404).json({ success: false, data: "Target item not found" });
		}
		if (targetItem.ownerId === req.user.userId) {
			return res.status(400).json({ success: false, data: "Cannot barter for your own item" });
		}

		const offeredItem = await itemServices.getItemById(offeredItemId);
		if (!offeredItem || offeredItem.ownerId !== req.user.userId) {
			return res.status(403).json({ success: false, data: "You do not own the offered item" });
		}

		const offer = await barterServices.createOffer({
			targetItem: { connect: { id: targetItemId } },
			offeredItems: { connect: [{ id: offeredItemId }] },
			offerer: { connect: { id: req.user.userId } },
			status: "PENDING",
			cashAdded: cashAdded ? parseFloat(cashAdded) : 0,
			message: message || null,
		});

		return res.status(201).json({ success: true, data: offer });
	} catch (error) {
		console.error("Error creating barter offer:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

export const getOffer = async (
	req: AuthenticatedRequest & Request<{ id: string }>,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}

		const { id } = req.params;
		const offer = await barterServices.getOfferById(id);

		if (!offer) {
			return res.status(404).json({ success: false, data: "Offer not found" });
		}

		if (offer.offererId !== req.user.userId && offer.targetItem?.ownerId !== req.user.userId) {
			return res.status(403).json({ success: false, data: "Forbidden" });
		}

		return res.json({ success: true, data: offer });
	} catch (error) {
		console.error("Error fetching barter offer:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

export const listUserOffers = async (
	req: AuthenticatedRequest,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		const made = await barterServices.listOffersByOfferer(req.user.userId);
		const received = await barterServices.listOffersByReceiver(req.user.userId);

		return res.json({ success: true, data: { made, received } });
	} catch (error) {
		console.error("Error listing user offers:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

export const respondToOffer = async (
	req: AuthenticatedRequest & Request<{ id: string }>,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		const { id } = req.params;
		const { status } = req.body; // ACCEPTED, REJECTED, CANCELLED

		const offer = await barterServices.getOfferById(id);
		if (!offer) {
			return res.status(404).json({ success: false, data: "Offer not found" });
		}

		// Offerer can cancel their own pending offer
		if (status === "CANCELLED" && offer.offererId !== req.user.userId) {
			return res.status(403).json({ success: false, data: "Only offerer can cancel" });
		}

		// Receiver can accept/reject
		if (
			(status === "ACCEPTED" || status === "REJECTED") &&
			offer.targetItem?.ownerId !== req.user.userId
		) {
			return res.status(403).json({ success: false, data: "Only receiver can accept or reject" });
		}

		const updated = await barterServices.updateOfferStatus(id, status);
		return res.json({ success: true, data: updated });
	} catch (error) {
		console.error("Error updating offer:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};
