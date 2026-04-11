"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuctionController_1 = require("../controllers/AuctionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Mutations — require auth
router.post("/", authMiddleware_1.authenticateToken, AuctionController_1.createAuction);
// Public reads — no auth so server-side rendering works
router.get("/", AuctionController_1.listAuctions);
// Auth reads — must come before /:id
router.get("/my", authMiddleware_1.authenticateToken, AuctionController_1.listUserAuctions);
// Public single auction
router.get("/:id", AuctionController_1.getAuction);
// Mutations
router.put("/:id", authMiddleware_1.authenticateToken, AuctionController_1.updateAuction);
router.delete("/:id", authMiddleware_1.authenticateToken, AuctionController_1.deleteAuction);
exports.default = router;
