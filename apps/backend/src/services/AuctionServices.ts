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

const auctionServices = {
	createAuction: async (data: CreateAuctionPayload): Promise<any> => {
		try {
			const auction = await prisma.auction.create({
				data: {
					startTime: data.startTime,
					endTime: data.endTime,
					startingBid: data.startingBid,
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
				},
			});
			return auctions;
		} catch (error: any) {
			console.error("Error listing auctions:", error);
			throw new Error(error?.message || "Failed to list auctions");
		}
	},

	updateAuction: async (
		id: string,
		ownerId: string,
		data: Partial<CreateAuctionPayload>
	) => {
		try {
			const auctionExists = await prisma.auction.findUnique({
				where: { id },
			});
			if (!auctionExists) {
				throw new Error("Auction not found");
			}
			if (auctionExists.ownerId !== ownerId) {
				throw new Error("Unauthorized to update this auction");
			}
			// Update the auction with the provided data
			const auction = await prisma.auction.update({
				where: { id },
				data: {
					...data,
				},
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
