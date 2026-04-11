import { Router } from "express";
import { getProfile, updateProfile, getReportsStats } from "../controllers/UserController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.get("/stats", authenticateToken, getReportsStats);

export default router;
