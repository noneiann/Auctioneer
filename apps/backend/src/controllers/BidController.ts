import { Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "@auctioneer/types/src";
import bidServices from "../services/BidServices";

export const getMyBids = async (
	req: AuthenticatedRequest,
	res: Response<ApiResponse<any>>
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, data: "Unauthorized" });
		}
		const bids = await bidServices.getUserBids(req.user.userId);
		return res.json({ success: true, data: bids });
	} catch (error: any) {
		console.error("Error fetching user bids:", error);
		return res.status(500).json({ success: false, data: "Server error" });
	}
};
