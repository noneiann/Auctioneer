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
exports.getReportsStats = exports.updateProfile = exports.getProfile = void 0;
const db_1 = __importDefault(require("@auctioneer/db"));
// Get user profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const user = yield db_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, email: true, firstName: true, lastName: true, username: true, createdAt: true }
        });
        if (!user)
            return res.status(404).json({ success: false, data: "User not found" });
        res.json({ success: true, data: user });
    }
    catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.getProfile = getProfile;
// Update user profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { firstName, lastName, username } = req.body;
        const updated = yield db_1.default.user.update({
            where: { id: req.user.userId },
            data: { firstName, lastName, username },
            select: { id: true, email: true, firstName: true, lastName: true, username: true }
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.updateProfile = updateProfile;
// Get reports stats (admin dashboard overview)
const getReportsStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        // Example stats logic
        const auctionCount = yield db_1.default.auction.count({ where: { ownerId: req.user.userId } });
        const purchaseCount = yield db_1.default.purchase.count({ where: { item: { ownerId: req.user.userId } } });
        const barterCount = yield db_1.default.barterOffer.count({ where: { targetItem: { ownerId: req.user.userId } } });
        res.json({
            success: true,
            data: {
                totalAuctions: auctionCount,
                totalSales: purchaseCount,
                totalBarters: barterCount,
                revenue: 0 // placeholder
            }
        });
    }
    catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ success: false, data: "Server error" });
    }
});
exports.getReportsStats = getReportsStats;
