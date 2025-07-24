import { Router, Request, Response } from "express";
import {
	ApiResponse,
	GetUserRequest,
	RegisterRequest,
	LoginRequest,
} from "@auctioneer/types/src";
import authServices, { login } from "../services/AuthServices";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
if (!secret) {
	throw new Error("JWT_SECRET environment variable is not set");
}
export const loginOne = async (
	req: LoginRequest,
	res: Response<ApiResponse<any>>
) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res
				.status(400)
				.json({ success: false, data: "Missing email or password" });
		}
		const user = await authServices.login(email, password);

		const token = jwt.sign({ userId: user.id, email: user.email }, secret, {
			expiresIn: "2d",
		});

		const response: ApiResponse<any> = {
			success: true,
			data: {
				user,
				token,
			},
		};

		return res.json(response);
	} catch (error: any) {
		console.error(error);
		res
			.status(500)
			.json({ success: false, data: error.message || "Login failed" });
	}
};

export const registerOne = async (
	req: RegisterRequest,
	res: Response<ApiResponse<any>>
) => {
	try {
		const { email, username, password } = req.body;
		if (!email || !username || !password) {
			return res
				.status(400)
				.json({ success: false, data: "Missing required fields" });
		}

		if (password.length < 6) {
			return res.status(400).json({
				success: false,
				data: "Password must be at least 6 characters",
			});
		}

		await authServices.register(email, username, password);

		const user = await authServices.login(email, password);

		const token = jwt.sign({ userId: user.id, email: user.email }, secret, {
			expiresIn: "2d",
		});

		const response: ApiResponse<any> = {
			success: true,
			data: {
				user,
				token,
			},
		};

		return res.status(201).json(response);
	} catch (error: any) {
		console.error(error);
		res
			.status(500)
			.json({ success: false, data: error.message || "Registration failed" });
	}
};
