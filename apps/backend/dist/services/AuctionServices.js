"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("@auctioneer/db"));
const ItemServices_1 = __importDefault(require("./ItemServices"));
const userSelect = {
    id: true,
    email: true,
    username: true,
    firstName: true,
    lastName: true,
    permission: true,
    createdAt: true,
    updatedAt: true,
};
const auctionServices = {
    createAuction: (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const auction = yield db_1.default.auction.create({
                data: {
                    startTime: data.startTime,
                    endTime: data.endTime,
                    startingBid: data.startingBid,
                    currentBid: data.startingBid,
                    category: data.category,
                    // you can let Prisma set currentBid to default if you omit it:
                    // currentBid: data.startingBid,
                    // connect the existing user by ID
                    owner: { connect: { id: data.ownerId } },
                    // connect the existing item by ID
                    item: { connect: { id: data.itemId } }, // note: itemId should be required
                    // no bids to create initially
                },
                include: {
                    owner: { select: userSelect },
                    item: true,
                },
            });
            return auction;
        }
        catch (error) {
            console.error("Error creating auction:", error);
            // Optionally, you can check for Prisma-specific errors here
            throw new Error((error === null || error === void 0 ? void 0 : error.message) || "Failed to create auction");
        }
    }),
    getAuctionById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const auction = yield db_1.default.auction.findUnique({
                where: { id },
                include: {
                    owner: { select: userSelect },
                    item: true,
                    bids: {
                        include: {
                            bidder: { select: userSelect },
                        },
                        orderBy: { createdAt: "desc" },
                    },
                },
            });
            if (!auction) {
                throw new Error("Auction not found");
            }
            return auction;
        }
        catch (error) {
            console.error("Error fetching auction:", error);
            throw new Error((error === null || error === void 0 ? void 0 : error.message) || "Failed to fetch auction");
        }
    }),
    listAuctions: (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (options = {}) {
        try {
            const page = Math.max(1, options.page || 1);
            const pageSize = Math.min(Math.max(1, options.pageSize || 20), 100);
            const where = {};
            if (options.category) {
                where.category = options.category;
            }
            if (options.ownerId) {
                where.ownerId = options.ownerId;
            }
            if (options.itemType) {
                where.item = { type: options.itemType };
            }
            const [items, total] = yield db_1.default.$transaction([
                db_1.default.auction.findMany({
                    where,
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    orderBy: { createdAt: "desc" },
                    include: {
                        owner: { select: userSelect },
                        item: true,
                        bids: {
                            include: {
                                bidder: { select: userSelect },
                            },
                            orderBy: { createdAt: "desc" },
                        },
                    },
                }),
                db_1.default.auction.count({ where }),
            ]);
            return { items, total };
        }
        catch (error) {
            console.error("Error listing auctions:", error);
            throw new Error((error === null || error === void 0 ? void 0 : error.message) || "Failed to list auctions");
        }
    }),
    listUserAuctions: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const auctions = yield db_1.default.auction.findMany({
                where: { ownerId: userId },
                include: {
                    owner: { select: userSelect },
                    item: true,
                    bids: {
                        include: {
                            bidder: { select: userSelect },
                        },
                        orderBy: { createdAt: "desc" },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
            return auctions;
        }
        catch (error) {
            console.error("Error listing user auctions:", error);
            throw new Error((error === null || error === void 0 ? void 0 : error.message) || "Failed to list user auctions");
        }
    }),
    updateAuction: (id, ownerId, data // Accept any body data from frontend
    ) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const auctionExists = yield db_1.default.auction.findUnique({
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
                const itemUpdateData = {};
                if (data.itemName !== undefined)
                    itemUpdateData.name = data.itemName;
                if (data.description !== undefined)
                    itemUpdateData.description = data.description;
                if (data.imageUrl !== undefined) {
                    // imageUrl should be an array; handle both string and array inputs
                    const existingUrls = ((_a = auctionExists.item) === null || _a === void 0 ? void 0 : _a.imageUrl) || [];
                    if (Array.isArray(data.imageUrl)) {
                        itemUpdateData.imageUrl = data.imageUrl;
                    }
                    else if (typeof data.imageUrl === "string" &&
                        data.imageUrl.trim()) {
                        // Replace with new single image as an array
                        itemUpdateData.imageUrl = [data.imageUrl];
                    }
                }
                if (Object.keys(itemUpdateData).length > 0) {
                    yield ItemServices_1.default.updateItem(auctionExists.itemId, itemUpdateData);
                }
            }
            // Update the auction with the provided data
            const auctionUpdateData = {};
            if (data.startingBid !== undefined)
                auctionUpdateData.startingBid = data.startingBid;
            if (data.category !== undefined)
                auctionUpdateData.category = data.category;
            if (data.startTime !== undefined)
                auctionUpdateData.startTime = new Date(data.startTime);
            if (data.endTime !== undefined)
                auctionUpdateData.endTime = new Date(data.endTime);
            const auction = yield db_1.default.auction.update({
                where: { id },
                data: auctionUpdateData,
                include: {
                    owner: { select: userSelect },
                    item: true,
                },
            });
            return auction;
        }
        catch (error) {
            console.error("Error updating auction:", error);
            throw new Error((error === null || error === void 0 ? void 0 : error.message) || "Failed to update auction");
        }
    }),
    deleteAuction: (id, ownerId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const auctionExists = yield db_1.default.auction.findUnique({
                where: { id },
            });
            if (!auctionExists) {
                throw new Error("Auction not found");
            }
            if (auctionExists.ownerId !== ownerId) {
                throw new Error("Unauthorized to delete this auction");
            }
            const auction = yield db_1.default.auction.delete({
                where: { id },
            });
            return auction;
        }
        catch (error) {
            console.error("Error deleting auction:", error);
            throw new Error((error === null || error === void 0 ? void 0 : error.message) || "Failed to delete auction");
        }
    }),
};
exports.default = auctionServices;
