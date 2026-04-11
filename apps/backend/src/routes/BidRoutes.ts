import { Router } from "express";
import { getMyBids } from "../controllers/BidController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/my", authenticateToken, getMyBids);

export default router;
