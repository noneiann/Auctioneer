import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { JwtPayloadUser } from "@auctioneer/types";
import auctionWebSocket from "./auctionWebSocket";
import chatWebSocket from "./chatWebSocket";

interface AuthenticatedSocket extends Socket {
	data: {
		user?: JwtPayloadUser;
	};
}

export function initializeWebSocket(io: Server) {
	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret) {
		throw new Error("JWT_SECRET environment variable is not set");
	}

	// Authentication middleware
	io.use((socket: AuthenticatedSocket, next) => {
		const token = socket.handshake.auth.token;

		if (!token) {
			return next(new Error("Authentication error: No token provided"));
		}

		try {
			const decoded = jwt.verify(token, jwtSecret) as JwtPayloadUser;
			socket.data.user = decoded;
			next();
		} catch (error) {
			console.error("WebSocket auth error:", error);
			next(new Error("Authentication error: Invalid token"));
		}
	});

	io.on("connection", (socket: AuthenticatedSocket) => {
		const user = socket.data.user;
		console.log(`User connected: ${user?.email} (${socket.id})`);

		// Initialize auction WebSocket handlers
		auctionWebSocket(io, socket);

		// Initialize chat WebSocket handlers
		chatWebSocket(io, socket);

		socket.on("disconnect", (reason) => {
			console.log(`User disconnected: ${user?.email} - Reason: ${reason}`);
		});

		socket.on("error", (error) => {
			console.error(`Socket error for user ${user?.email}:`, error);
		});
	});

	console.log("WebSocket handlers initialized");
}
