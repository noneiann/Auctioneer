import { Router, Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, JwtPayloadUser } from "@auctioneer/types";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
	throw new Error("JWT_SECRET environment variable is not set");
}

export const authenticateToken = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ error: "Authorization header is missing" });
	}

	const token = authHeader.split(" ")[1];

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({ error: "Invalid token" });
		}
		if (!user) {
			return res.status(401).json({ error: "User not found" });
		}

		const payload = user as JwtPayloadUser;
		req.user = payload;
		next();
	});
};
