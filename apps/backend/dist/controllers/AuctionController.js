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
exports.deleteAuction = exports.updateAuction = exports.listUserAuctions = exports.listAuctions = exports.getAuction = exports.createAuction = void 0;
const AuctionServices_1 = __importDefault(require("../services/AuctionServices"));
const ItemServices_1 = __importDefault(require("../services/ItemServices"));
// Create a new auction
const createAuction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { title, description, imageUrl, type, price, startTime, endTime, startingBid, category, } = req.body;
        if (!title ||
            !description ||
            !Array.isArray(imageUrl) ||
            !type ||
            startingBid == null ||
            !startTime ||
            !endTime ||
            !category) {
            return res
                .status(400)
                .json({ success: false, data: "Missing required fields" });
        }
        const newItem = yield ItemServices_1.default.createItem({
            name: title,
            description,
            imageUrl,
            type,
            price,
            category,
            ownerId: req.user.userId,
        });
        const newAuction = yield AuctionServices_1.default.createAuction({
            ownerId: req.user.userId,
            itemId: newItem.id,
            startingBid,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            category,
        });
        return res.status(201).json({ success: true, data: newAuction });
    }
    catch (error) {
        console.error("Error creating auction:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.createAuction = createAuction;
// Get a single auction by ID
const getAuction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const auction = yield AuctionServices_1.default.getAuctionById(id);
        if (!auction) {
            return res
                .status(404)
                .json({ success: false, data: "Auction not found" });
        }
        return res.json({ success: true, data: auction });
    }
    catch (error) {
        console.error("Error fetching auction:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.getAuction = getAuction;
// List all auctions (with optional pagination / filters)
const listAuctions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page) || 1);
        const pageSize = Math.min(Math.max(1, Number.parseInt(req.query.pageSize) || 20), 100);
        const category = typeof req.query.category === "string" ? req.query.category : undefined;
        const ownerId = typeof req.query.ownerId === "string" ? req.query.ownerId : undefined;
        const rawItemType = typeof req.query.itemType === "string" ? req.query.itemType : undefined;
        const itemType = rawItemType && ["AUCTION", "DIRECT", "BARTER"].includes(rawItemType)
            ? rawItemType
            : undefined;
        const { items, total } = yield AuctionServices_1.default.listAuctions({
            page,
            pageSize,
            category,
            ownerId,
            itemType: itemType,
        });
        return res.json({
            success: true,
            data: {
                items,
                meta: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.max(1, Math.ceil(total / pageSize)),
                    hasNextPage: page * pageSize < total,
                    hasPreviousPage: page > 1,
                },
            },
        });
    }
    catch (error) {
        console.error("Error listing auctions:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.listAuctions = listAuctions;
// List auctions for the authenticated user (seller dashboard)
const listUserAuctions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const auctions = yield AuctionServices_1.default.listUserAuctions(req.user.userId);
        return res.json({ success: true, data: auctions });
    }
    catch (error) {
        console.error("Error listing user auctions:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.listUserAuctions = listUserAuctions;
// Update an existing auction by ID
const updateAuction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { id } = req.params;
        const updateData = req.body;
        const updated = yield AuctionServices_1.default.updateAuction(id, req.user.userId, updateData);
        if (!updated) {
            return res
                .status(404)
                .json({ success: false, data: "Auction not found or unauthorized" });
        }
        return res.json({ success: true, data: updated });
    }
    catch (error) {
        console.error("Error updating auction:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.updateAuction = updateAuction;
// Delete an auction by ID
const deleteAuction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { id } = req.params;
        const deleted = yield AuctionServices_1.default.deleteAuction(id, req.user.userId);
        if (!deleted) {
            return res
                .status(404)
                .json({ success: false, data: "Auction not found or unauthorized" });
        }
        return res.json({ success: true, data: null });
    }
    catch (error) {
        console.error("Error deleting auction:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.deleteAuction = deleteAuction;
