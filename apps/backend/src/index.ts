import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/AuthRoutes";
import auctionRoutes from "./routes/AuctionRoutes";
import { initializeWebSocket } from "./websocket";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
		credentials: true,
	},
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello, World!");
});

app.use("/auth", authRoutes);
app.use("/auctions", auctionRoutes);

// Initialize WebSocket handlers
initializeWebSocket(io);

httpServer.listen(4000, () => {
	console.log("Backend running at http://localhost:4000");
	console.log("WebSocket server ready");
});
