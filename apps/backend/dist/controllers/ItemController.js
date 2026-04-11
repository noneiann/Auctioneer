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
exports.createItem = exports.deleteItem = exports.updateItem = exports.listUserItems = exports.getPublicItem = exports.listPublicItems = void 0;
const ItemServices_1 = __importDefault(require("../services/ItemServices"));
const VALID_TYPES = ["AUCTION", "DIRECT", "BARTER"];
// Public: list items by type for marketplace browsing
const listPublicItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, page, pageSize, search } = req.query;
        const itemType = typeof type === "string" && VALID_TYPES.includes(type)
            ? type
            : undefined;
        const result = yield ItemServices_1.default.listPublicItems({
            type: itemType,
            page: Math.max(1, parseInt(page) || 1),
            pageSize: Math.min(100, parseInt(pageSize) || 20),
            search: typeof search === "string" ? search : undefined,
        });
        return res.json({ success: true, data: { items: result.items, total: result.total } });
    }
    catch (error) {
        console.error("Error listing public items:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.listPublicItems = listPublicItems;
// Public: get single item by ID
const getPublicItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const item = yield ItemServices_1.default.getItemById(id);
        if (!item)
            return res.status(404).json({ success: false, data: "Item not found" });
        return res.json({ success: true, data: item });
    }
    catch (error) {
        console.error("Error fetching item:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.getPublicItem = getPublicItem;
// Authenticated: list items for the current user
const listUserItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const items = yield ItemServices_1.default.listUserItems(req.user.userId);
        return res.json({ success: true, data: items });
    }
    catch (error) {
        console.error("Error listing user items:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.listUserItems = listUserItems;
const updateItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { id } = req.params;
        const updateData = req.body;
        const item = yield ItemServices_1.default.getItemById(id);
        if (!item || item.ownerId !== req.user.userId) {
            return res.status(404).json({ success: false, data: "Item not found or unauthorized" });
        }
        const updated = yield ItemServices_1.default.updateItem(id, updateData);
        return res.json({ success: true, data: updated });
    }
    catch (error) {
        console.error("Error updating item:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.updateItem = updateItem;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { id } = req.params;
        const item = yield ItemServices_1.default.getItemById(id);
        if (!item || item.ownerId !== req.user.userId) {
            return res.status(404).json({ success: false, data: "Item not found or unauthorized" });
        }
        yield ItemServices_1.default.deleteItem(id);
        return res.json({ success: true, data: null });
    }
    catch (error) {
        console.error("Error deleting item:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.deleteItem = deleteItem;
const createItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { name, description, category, imageUrl, type, price } = req.body;
        if (!name || !description || !category || !type) {
            return res.status(400).json({ success: false, data: "Missing required fields" });
        }
        const item = yield ItemServices_1.default.createItem({
            name,
            description,
            category,
            imageUrl: Array.isArray(imageUrl) ? imageUrl : [imageUrl],
            type,
            price: price ? parseFloat(price) : undefined,
            ownerId: req.user.userId,
        });
        return res.status(201).json({ success: true, data: item });
    }
    catch (error) {
        console.error("Error creating item:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.createItem = createItem;
