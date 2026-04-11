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
exports.updatePurchaseStatus = exports.listUserPurchases = exports.getPurchase = exports.createPurchase = void 0;
const PurchaseServices_1 = __importDefault(require("../services/PurchaseServices"));
const ItemServices_1 = __importDefault(require("../services/ItemServices"));
const createPurchase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { itemId, amount, status } = req.body;
        if (!itemId || !amount) {
            return res.status(400).json({ success: false, data: "Missing required fields" });
        }
        const item = yield ItemServices_1.default.getItemById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, data: "Item not found" });
        }
        if (item.ownerId === req.user.userId) {
            return res.status(400).json({ success: false, data: "Cannot purchase your own item" });
        }
        const purchase = yield PurchaseServices_1.default.createPurchase({
            itemId,
            buyerId: req.user.userId,
            amount,
            status: status || "PENDING",
        });
        return res.status(201).json({ success: true, data: purchase });
    }
    catch (error) {
        console.error("Error creating purchase:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.createPurchase = createPurchase;
const getPurchase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { id } = req.params;
        const purchase = yield PurchaseServices_1.default.getPurchaseById(id);
        if (!purchase) {
            return res.status(404).json({ success: false, data: "Purchase not found" });
        }
        // Auth check: Must be buyer or seller
        if (purchase.buyerId !== req.user.userId && ((_a = purchase.item) === null || _a === void 0 ? void 0 : _a.ownerId) !== req.user.userId) {
            return res.status(403).json({ success: false, data: "Forbidden" });
        }
        return res.json({ success: true, data: purchase });
    }
    catch (error) {
        console.error("Error fetching purchase:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.getPurchase = getPurchase;
const listUserPurchases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const asBuyer = yield PurchaseServices_1.default.listPurchasesByBuyer(req.user.userId);
        const asSeller = yield PurchaseServices_1.default.listPurchasesBySeller(req.user.userId);
        return res.json({ success: true, data: { bought: asBuyer, sold: asSeller } });
    }
    catch (error) {
        console.error("Error listing user purchases:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.listUserPurchases = listUserPurchases;
const updatePurchaseStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { id } = req.params;
        const { status } = req.body;
        const purchase = yield PurchaseServices_1.default.getPurchaseById(id);
        if (!purchase) {
            return res.status(404).json({ success: false, data: "Purchase not found" });
        }
        // Typically seller configures it to "COMPLETED" or logic depends on role
        if (((_a = purchase.item) === null || _a === void 0 ? void 0 : _a.ownerId) !== req.user.userId) {
            return res.status(403).json({ success: false, data: "Only seller can update status" });
        }
        const updated = yield PurchaseServices_1.default.updatePurchaseStatus(id, status);
        return res.json({ success: true, data: updated });
    }
    catch (error) {
        console.error("Error updating purchase:", error);
        return res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.updatePurchaseStatus = updatePurchaseStatus;
