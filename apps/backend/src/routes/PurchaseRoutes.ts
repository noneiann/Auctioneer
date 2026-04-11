import { Router } from "express";
import {
	createPurchase,
	getPurchase,
	listUserPurchases,
	updatePurchaseStatus,
} from "../controllers/PurchaseController";
import { authenticateToken } from "../middleware/authMiddleware";
const router = Router();

router.post("/", authenticateToken, createPurchase);
router.get("/my", authenticateToken, listUserPurchases);
router.get("/:id", authenticateToken, getPurchase);
router.put("/:id/status", authenticateToken, updatePurchaseStatus);

export default router;
