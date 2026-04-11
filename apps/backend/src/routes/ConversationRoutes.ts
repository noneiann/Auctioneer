import { Router } from "express";
import {
	createConversation,
	getConversation,
	listUserConversations,
} from "../controllers/ConversationController";
import { authenticateToken } from "../middleware/authMiddleware";
const router = Router();

router.post("/", authenticateToken, createConversation);
router.get("/my", authenticateToken, listUserConversations);
router.get("/:id", authenticateToken, getConversation);

export default router;
