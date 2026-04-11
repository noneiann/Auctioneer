"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocket = initializeWebSocket;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auctionWebSocket_1 = __importDefault(require("./auctionWebSocket"));
const chatWebSocket_1 = __importDefault(require("./chatWebSocket"));
function initializeWebSocket(io) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET environment variable is not set");
    }
    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            socket.data.user = decoded;
            next();
        }
        catch (error) {
            console.error("WebSocket auth error:", error);
            next(new Error("Authentication error: Invalid token"));
        }
    });
    io.on("connection", (socket) => {
        const user = socket.data.user;
        console.log(`User connected: ${user === null || user === void 0 ? void 0 : user.email} (${socket.id})`);
        // Initialize auction WebSocket handlers
        (0, auctionWebSocket_1.default)(io, socket);
        // Initialize chat WebSocket handlers
        (0, chatWebSocket_1.default)(io, socket);
        socket.on("disconnect", (reason) => {
            console.log(`User disconnected: ${user === null || user === void 0 ? void 0 : user.email} - Reason: ${reason}`);
        });
        socket.on("error", (error) => {
            console.error(`Socket error for user ${user === null || user === void 0 ? void 0 : user.email}:`, error);
        });
    });
    console.log("WebSocket handlers initialized");
}
