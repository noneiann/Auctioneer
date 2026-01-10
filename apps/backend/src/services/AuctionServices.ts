import prisma from "@auctioneer/db";
import {
	ApiResponse,
	GetUserRequest,
	RegisterRequest,
	LoginRequest,
	CreateAuctionPayload,
} from "@auctioneer/types/src";
import bcrypt from "bcrypt";
import { get } from "http";
import { getAuction, updateAuction } from "../controllers/AuctionController";
import itemServices from "./ItemServices";

const auctionServices = {
	createAuction: async (data: CreateAuctionPayload): Promise<any> => {
		try {
			const auction = await prisma.auction.create({
				data: {
					startTime: data.startTime,
					endTime: data.endTime,
					startingBid: data.startingBid,
					category: data.category,
					// you can let Prisma set currentBid to default if you omit it:
					// currentBid: data.startingBid,

					// connect the existing user by ID
					owner: { connect: { id: data.ownerId } },

					// connect the existing item by ID
					item: { connect: { id: data.itemId! } }, // note: itemId should be required

					// no bids to create initially
				},
				include: {
					owner: true,
					item: true,
				},
			});
			return auction;
		} catch (error: any) {
			console.error("Error creating auction:", error);
			// Optionally, you can check for Prisma-specific errors here
			throw new Error(error?.message || "Failed to create auction");
		}
	},

	getAuctionById: async (id: string) => {
		try {
			const auction = await prisma.auction.findUnique({
				where: { id },
				include: {
					owner: true,
					item: true,
					bids: {
						include: {
							bidder: true, // if you want bidder info as well
						},
					},
				},
			});

			if (!auction) {
				throw new Error("Auction not found");
			}

			return auction;
		} catch (error: any) {
			console.error("Error fetching auction:", error);
			throw new Error(error?.message || "Failed to fetch auction");
		}
	},

	listAuctions: async () => {
		try {
			const auctions = await prisma.auction.findMany({
				include: {
					owner: true,
					item: true,
					bids: {
						include: {
							bidder: true, // if you want bidder info as well
						},
					},
				},
			});
			return auctions;
		} catch (error: any) {
			console.error("Error listing auctions:", error);
			throw new Error(error?.message || "Failed to list auctions");
		}
	},

	listUserAuctions: async (userId: string) => {
		try {
			const auctions = await prisma.auction.findMany({
				where: { ownerId: userId },
				include: {
					owner: true,
					item: true,
					bids: {
						include: {
							bidder: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});
			return auctions;
		} catch (error: any) {
			console.error("Error listing user auctions:", error);
			throw new Error(error?.message || "Failed to list user auctions");
		}
	},

	updateAuction: async (
		id: string,
		ownerId: string,
		data: any // Accept any body data from frontend
	) => {
		try {
			const auctionExists = await prisma.auction.findUnique({
				where: { id },
				include: { item: true },
			});
			if (!auctionExists) {
				throw new Error("Auction not found");
			}
			if (auctionExists.ownerId !== ownerId) {
				throw new Error("Unauthorized to update this auction");
			}

			// Update the associated item if item data is provided
			if (auctionExists.itemId) {
				const itemUpdateData: any = {};
				if (data.itemName !== undefined) itemUpdateData.name = data.itemName;
				if (data.description !== undefined)
					itemUpdateData.description = data.description;
				if (data.imageUrl !== undefined) {
					// imageUrl should be an array; handle both string and array inputs
					const existingUrls = auctionExists.item?.imageUrl || [];
					if (Array.isArray(data.imageUrl)) {
						itemUpdateData.imageUrl = data.imageUrl;
					} else if (
						typeof data.imageUrl === "string" &&
						data.imageUrl.trim()
					) {
						// Replace with new single image as an array
						itemUpdateData.imageUrl = [data.imageUrl];
					}
				}

				if (Object.keys(itemUpdateData).length > 0) {
					await itemServices.updateItem(auctionExists.itemId, itemUpdateData);
				}
			}

			// Update the auction with the provided data
			const auctionUpdateData: any = {};
			if (data.startingBid !== undefined)
				auctionUpdateData.startingBid = data.startingBid;
			if (data.category !== undefined)
				auctionUpdateData.category = data.category;
			if (data.startTime !== undefined)
				auctionUpdateData.startTime = new Date(data.startTime);
			if (data.endTime !== undefined)
				auctionUpdateData.endTime = new Date(data.endTime);

			const auction = await prisma.auction.update({
				where: { id },
				data: auctionUpdateData,
				include: {
					owner: true,
					item: true,
				},
			});
			return auction;
		} catch (error: any) {
			console.error("Error updating auction:", error);
			throw new Error(error?.message || "Failed to update auction");
		}
	},

	deleteAuction: async (id: string, ownerId: string) => {
		try {
			const auctionExists = await prisma.auction.findUnique({
				where: { id },
			});
			if (!auctionExists) {
				throw new Error("Auction not found");
			}
			if (auctionExists.ownerId !== ownerId) {
				throw new Error("Unauthorized to delete this auction");
			}
			const auction = await prisma.auction.delete({
				where: { id },
			});
			return auction;
		} catch (error: any) {
			console.error("Error deleting auction:", error);
			throw new Error(error?.message || "Failed to delete auction");
		}
	},
};

export default auctionServices;
