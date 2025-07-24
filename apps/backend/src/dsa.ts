import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@auctioneer/db";
import {
	ApiResponse,
	GetUserRequest,
	RegisterRequest,
	LoginRequest,
} from "@auctioneer/types/src";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
	throw new Error("JWT_SECRET environment variable is not set");
}
router.get(
	"/user/:id",
	async (req: GetUserRequest, res: Response<ApiResponse<any>>) => {
		const userId = req.params.id;

		if (!userId) {
			return res
				.status(400)
				.json({ success: false, data: "User ID is required" });
		}

		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { id: true, email: true, username: true },
			});

			if (!user) {
				return res.status(404).json({ success: false, data: "User not found" });
			}

			const response: ApiResponse<typeof user> = {
				success: true,
				data: user,
			};

			res.json(response);
		} catch (error: any) {
			console.error(error);
			res.status(500).json({ success: false, data: "Failed to fetch user" });
		}
	}
);
// POST /auth/register
router.post(
	"/register",
	async (req: RegisterRequest, res: Response<ApiResponse<any>>) => {
		const { email, username, password } = req.body;

		if (!email || !username || !password) {
			return res
				.status(400)
				.json({ success: false, data: "Missing required fields" });
		}

		try {
			const hashedPassword = await bcrypt.hash(password, 10);

			const user = await prisma.user.create({
				data: {
					email,
					username,
					password: hashedPassword,
				},
			});

			const response: ApiResponse<{
				id: string;
				email: string;
				username: string;
			}> = {
				success: true,
				data: { id: user.id, email: user.email, username: user.username },
			};

			res.status(201).json(response);
		} catch (error: any) {
			console.error(error);
			res.status(500).json({ success: false, data: "Registration failed" });
		}
	}
);

// POST /auth/login
router.post(
	"/login",
	async (req: LoginRequest, res: Response<ApiResponse<any>>) => {
		const { email, password } = req.body;

		if (!email || !password)
			return res
				.status(400)
				.json({ success: false, data: "Missing email or password" });

		try {
			const user = await prisma.user.findUnique({
				where: { email },
			});

			if (!user)
				return res
					.status(401)
					.json({ success: false, data: "Invalid credentials" });

			const passwordMatch = await bcrypt.compare(password, user.password);

			if (!passwordMatch)
				return res
					.status(401)
					.json({ success: false, data: "Invalid credentials" });

			const token = jwt.sign(
				{ userId: user.id, email: user.email },
				JWT_SECRET,
				{ expiresIn: "1d" }
			);

			const response: ApiResponse<{ token: string }> = {
				success: true,
				data: { token },
			};

			res.json(response);
		} catch (error: any) {
			console.error(error);
			res.status(500).json({ success: false, data: "Login failed" });
		}
	}
);

export default router;
