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
exports.listUserConversations = exports.getConversation = exports.createConversation = void 0;
const ConversationServices_1 = __importDefault(require("../services/ConversationServices"));
const ItemServices_1 = __importDefault(require("../services/ItemServices"));
const createConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { itemId, type, sellerId } = req.body;
        // Verify seller if passed, otherwise default to item owner
        let targetSellerId = sellerId;
        if (itemId) {
            const item = yield ItemServices_1.default.getItemById(itemId);
            if (item) {
                targetSellerId = item.ownerId;
            }
        }
        if (!targetSellerId) {
            return res.status(400).json({ success: false, data: "Need sellerId or valid itemId" });
        }
        const conversation = yield ConversationServices_1.default.createConversation({
            item: itemId ? { connect: { id: itemId } } : undefined,
            type: type || "INQUIRY",
            buyer: { connect: { id: req.user.userId } },
            seller: { connect: { id: targetSellerId } },
        });
        return res.status(201).json({ success: true, data: conversation });
    }
    catch (error) {
        console.error("Error creating conversation:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.createConversation = createConversation;
const getConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { id } = req.params;
        const conversation = yield ConversationServices_1.default.getConversationById(id, true);
        if (!conversation) {
            return res.status(404).json({ success: false, data: "Conversation not found" });
        }
        // Auth check
        if (conversation.buyerId !== req.user.userId && conversation.sellerId !== req.user.userId) {
            return res.status(403).json({ success: false, data: "Forbidden" });
        }
        return res.json({ success: true, data: conversation });
    }
    catch (error) {
        console.error("Error fetching conversation:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.getConversation = getConversation;
const listUserConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const conversations = yield ConversationServices_1.default.listConversationsByUser(req.user.userId);
        return res.json({ success: true, data: conversations });
    }
    catch (error) {
        console.error("Error listing user conversations:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.listUserConversations = listUserConversations;
