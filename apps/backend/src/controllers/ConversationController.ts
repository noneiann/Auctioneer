import { Request, Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "@auctioneer/types/src";
import conversationServices from "../services/ConversationServices";
import itemServices from "../services/ItemServices";

export const createConversation = async (
	req: AuthenticatedRequest,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		
		const { itemId, type, sellerId } = req.body;

        // Verify seller if passed, otherwise default to item owner
        let targetSellerId = sellerId;
        if (itemId) {
            const item = await itemServices.getItemById(itemId);
            if (item) {
                targetSellerId = item.ownerId;
            }
        }

        if (!targetSellerId) {
            return res.status(400).json({ success: false, data: "Need sellerId or valid itemId" });
        }

		const conversation = await conversationServices.createConversation({
            item: itemId ? { connect: { id: itemId } } : undefined,
			type: type || "INQUIRY",
            buyer: { connect: { id: req.user.userId } },
            seller: { connect: { id: targetSellerId } },
		});

		return res.status(201).json({ success: true, data: conversation });
	} catch (error) {
		console.error("Error creating conversation:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

export const getConversation = async (
	req: AuthenticatedRequest & Request<{ id: string }>,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}

		const { id } = req.params;
		const conversation = await conversationServices.getConversationById(id, true);
		
		if (!conversation) {
			return res.status(404).json({ success: false, data: "Conversation not found" });
		}
		
		// Auth check
		if (conversation.buyerId !== req.user.userId && conversation.sellerId !== req.user.userId) {
			return res.status(403).json({ success: false, data: "Forbidden" });
		}

		return res.json({ success: true, data: conversation });
	} catch (error) {
		console.error("Error fetching conversation:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};

export const listUserConversations = async (
	req: AuthenticatedRequest,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		const conversations = await conversationServices.listConversationsByUser(req.user.userId);
		return res.json({ success: true, data: conversations });
	} catch (error) {
		console.error("Error listing user conversations:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};
