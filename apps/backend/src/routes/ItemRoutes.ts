import { Router } from "express";
import {
	listPublicItems,
	getPublicItem,
	listUserItems,
	updateItem,
	deleteItem,
	createItem
} from "../controllers/ItemController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Public routes (marketplace browsing)
router.get("/", listPublicItems);

// Auth routes — must come before /:id to avoid being swallowed
router.get("/my", authenticateToken, listUserItems);

// Public single item
router.get("/:id", getPublicItem);

// Auth mutation routes
router.post("/", authenticateToken, createItem);
router.put("/:id", authenticateToken, updateItem);
router.delete("/:id", authenticateToken, deleteItem);

export default router;
