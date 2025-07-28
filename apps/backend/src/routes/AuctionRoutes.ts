import { Router } from "express";
import {
	createAuction,
	listAuctions,
	getAuction,
	updateAuction,
	deleteAuction,
} from "../controllers/AuctionController";
import { authenticateToken } from "../middleware/authMiddleware";
const router = Router();

router.post("/", authenticateToken, createAuction);
router.get("/", authenticateToken, listAuctions);
router.get("/:id", authenticateToken, getAuction);
router.put("/:id", authenticateToken, updateAuction);
router.delete("/:id", authenticateToken, deleteAuction);
