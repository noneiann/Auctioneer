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
exports.respondToOffer = exports.listUserOffers = exports.getOffer = exports.createOffer = void 0;
const BarterServices_1 = __importDefault(require("../services/BarterServices"));
const ItemServices_1 = __importDefault(require("../services/ItemServices"));
const createOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { targetItemId, offeredItemId, cashAdded, message } = req.body;
        if (!targetItemId || !offeredItemId) {
            return res.status(400).json({ success: false, data: "Missing required fields" });
        }
        const targetItem = yield ItemServices_1.default.getItemById(targetItemId);
        if (!targetItem) {
            return res.status(404).json({ success: false, data: "Target item not found" });
        }
        if (targetItem.ownerId === req.user.userId) {
            return res.status(400).json({ success: false, data: "Cannot barter for your own item" });
        }
        const offeredItem = yield ItemServices_1.default.getItemById(offeredItemId);
        if (!offeredItem || offeredItem.ownerId !== req.user.userId) {
            return res.status(403).json({ success: false, data: "You do not own the offered item" });
        }
        const offer = yield BarterServices_1.default.createOffer({
            targetItem: { connect: { id: targetItemId } },
            offeredItems: { connect: [{ id: offeredItemId }] },
            offerer: { connect: { id: req.user.userId } },
            status: "PENDING",
            cashAdded: cashAdded ? parseFloat(cashAdded) : 0,
            message: message || null,
        });
        return res.status(201).json({ success: true, data: offer });
    }
    catch (error) {
        console.error("Error creating barter offer:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.createOffer = createOffer;
const getOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { id } = req.params;
        const offer = yield BarterServices_1.default.getOfferById(id);
        if (!offer) {
            return res.status(404).json({ success: false, data: "Offer not found" });
        }
        if (offer.offererId !== req.user.userId && ((_a = offer.targetItem) === null || _a === void 0 ? void 0 : _a.ownerId) !== req.user.userId) {
            return res.status(403).json({ success: false, data: "Forbidden" });
        }
        return res.json({ success: true, data: offer });
    }
    catch (error) {
        console.error("Error fetching barter offer:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.getOffer = getOffer;
const listUserOffers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const made = yield BarterServices_1.default.listOffersByOfferer(req.user.userId);
        const received = yield BarterServices_1.default.listOffersByReceiver(req.user.userId);
        return res.json({ success: true, data: { made, received } });
    }
    catch (error) {
        console.error("Error listing user offers:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.listUserOffers = listUserOffers;
const respondToOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { id } = req.params;
        const { status } = req.body; // ACCEPTED, REJECTED, CANCELLED
        const offer = yield BarterServices_1.default.getOfferById(id);
        if (!offer) {
            return res.status(404).json({ success: false, data: "Offer not found" });
        }
        // Offerer can cancel their own pending offer
        if (status === "CANCELLED" && offer.offererId !== req.user.userId) {
            return res.status(403).json({ success: false, data: "Only offerer can cancel" });
        }
        // Receiver can accept/reject
        if ((status === "ACCEPTED" || status === "REJECTED") &&
            ((_a = offer.targetItem) === null || _a === void 0 ? void 0 : _a.ownerId) !== req.user.userId) {
            return res.status(403).json({ success: false, data: "Only receiver can accept or reject" });
        }
        const updated = yield BarterServices_1.default.updateOfferStatus(id, status);
        return res.json({ success: true, data: updated });
    }
    catch (error) {
        console.error("Error updating offer:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.respondToOffer = respondToOffer;
