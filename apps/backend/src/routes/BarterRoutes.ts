import { Router } from "express";
import {
	createOffer,
	getOffer,
	listUserOffers,
	respondToOffer,
} from "../controllers/BarterController";
import { authenticateToken } from "../middleware/authMiddleware";
const router = Router();

router.post("/", authenticateToken, createOffer);
router.get("/my", authenticateToken, listUserOffers);
router.get("/:id", authenticateToken, getOffer);
router.put("/:id/respond", authenticateToken, respondToOffer);

export default router;
