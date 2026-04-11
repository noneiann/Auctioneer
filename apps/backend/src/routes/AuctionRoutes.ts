import { Router } from "express";
import {
	createAuction,
	listAuctions,
	listUserAuctions,
	getAuction,
	updateAuction,
	deleteAuction,
} from "../controllers/AuctionController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Mutations — require auth
router.post("/", authenticateToken, createAuction);

// Public reads — no auth so server-side rendering works
router.get("/", listAuctions);

// Auth reads — must come before /:id
router.get("/my", authenticateToken, listUserAuctions);

// Public single auction
router.get("/:id", getAuction);

// Mutations
router.put("/:id", authenticateToken, updateAuction);
router.delete("/:id", authenticateToken, deleteAuction);

export default router;
