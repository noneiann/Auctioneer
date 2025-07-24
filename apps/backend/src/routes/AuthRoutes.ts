import { Router } from "express";
import { loginOne, registerOne } from "../controllers/AuthController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", loginOne);
router.post("/register", registerOne);

// Example of a protected route
// router.get("/protected", authenticateToken, <Controller Function Here>);
export default router;
