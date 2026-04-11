"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ItemController_1 = require("../controllers/ItemController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes (marketplace browsing)
router.get("/", ItemController_1.listPublicItems);
// Auth routes — must come before /:id to avoid being swallowed
router.get("/my", authMiddleware_1.authenticateToken, ItemController_1.listUserItems);
// Public single item
router.get("/:id", ItemController_1.getPublicItem);
// Auth mutation routes
router.post("/", authMiddleware_1.authenticateToken, ItemController_1.createItem);
router.put("/:id", authMiddleware_1.authenticateToken, ItemController_1.updateItem);
router.delete("/:id", authMiddleware_1.authenticateToken, ItemController_1.deleteItem);
exports.default = router;
