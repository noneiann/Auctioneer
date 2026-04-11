"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const AuctionRoutes_1 = __importDefault(require("./routes/AuctionRoutes"));
const ItemRoutes_1 = __importDefault(require("./routes/ItemRoutes"));
const PurchaseRoutes_1 = __importDefault(require("./routes/PurchaseRoutes"));
const BarterRoutes_1 = __importDefault(require("./routes/BarterRoutes"));
const BidRoutes_1 = __importDefault(require("./routes/BidRoutes"));
const ConversationRoutes_1 = __importDefault(require("./routes/ConversationRoutes"));
const UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
const websocket_1 = require("./websocket");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
        credentials: true,
    },
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello, World!");
});
app.use("/auth", AuthRoutes_1.default);
app.use("/auctions", AuctionRoutes_1.default);
app.use("/items", ItemRoutes_1.default);
app.use("/purchases", PurchaseRoutes_1.default);
app.use("/barter", BarterRoutes_1.default);
app.use("/bids", BidRoutes_1.default);
app.use("/conversations", ConversationRoutes_1.default);
app.use("/users", UserRoutes_1.default);
// Initialize WebSocket handlers
(0, websocket_1.initializeWebSocket)(io);
httpServer.listen(4000, () => {
    console.log("Backend running at http://localhost:4000");
    console.log("WebSocket server ready");
});
