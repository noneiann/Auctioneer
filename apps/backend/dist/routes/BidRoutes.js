"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BidController_1 = require("../controllers/BidController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/my", authMiddleware_1.authenticateToken, BidController_1.getMyBids);
exports.default = router;
