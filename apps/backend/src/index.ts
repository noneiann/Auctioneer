import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/AuthRoutes";
import auctionRoutes from "./routes/AuctionRoutes";
import itemRoutes from "./routes/ItemRoutes";
import purchaseRoutes from "./routes/PurchaseRoutes";
import barterRoutes from "./routes/BarterRoutes";
import bidRoutes from "./routes/BidRoutes";
import conversationRoutes from "./routes/ConversationRoutes";
import userRoutes from "./routes/UserRoutes";
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
app.use("/items", itemRoutes);
app.use("/purchases", purchaseRoutes);
app.use("/barter", barterRoutes);
app.use("/bids", bidRoutes);
app.use("/conversations", conversationRoutes);
app.use("/users", userRoutes);

// Initialize WebSocket handlers
initializeWebSocket(io);

httpServer.listen(4000, () => {
	console.log("Backend running at http://localhost:4000");
	console.log("WebSocket server ready");
});
