"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = auctionWebSocket;
const db_1 = __importDefault(require("@auctioneer/db"));
function auctionWebSocket(io, socket) {
    const user = socket.data.user;
    const userSelect = {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        permission: true,
        createdAt: true,
        updatedAt: true,
    };
    // Join auction room
    socket.on("join_auction", (auctionId) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Verify auction exists
            const auction = yield db_1.default.auction.findUnique({
                where: { id: auctionId },
                include: {
                    item: true,
                    owner: {
                        select: userSelect,
                    },
                    bids: {
                        include: {
                            bidder: {
                                select: userSelect,
                            },
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                        take: 10,
                    },
                },
            });
            if (!auction) {
                socket.emit("error", { message: "Auction not found" });
                return;
            }
            // Check if auction is still active
            const now = new Date();
            const isActive = now >= auction.startTime && now <= auction.endTime;
            const roomName = `auction:${auctionId}`;
            socket.join(roomName);
            console.log(`User ${user === null || user === void 0 ? void 0 : user.email} joined auction ${auctionId}`);
            // Send current auction state to the user
            socket.emit("auction_state", {
                auction,
                isActive,
                participantCount: ((_a = io.sockets.adapter.rooms.get(roomName)) === null || _a === void 0 ? void 0 : _a.size) || 0,
            });
            // Notify others in the room
            socket.to(roomName).emit("user_joined", {
                userId: user === null || user === void 0 ? void 0 : user.userId,
                username: user === null || user === void 0 ? void 0 : user.email,
                participantCount: ((_b = io.sockets.adapter.rooms.get(roomName)) === null || _b === void 0 ? void 0 : _b.size) || 0,
            });
        }
        catch (error) {
            console.error("Error joining auction:", error);
            socket.emit("error", { message: "Failed to join auction" });
        }
    }));
    // Leave auction room
    socket.on("leave_auction", (auctionId) => {
        var _a;
        const roomName = `auction:${auctionId}`;
        socket.leave(roomName);
        console.log(`User ${user === null || user === void 0 ? void 0 : user.email} left auction ${auctionId}`);
        // Notify others in the room
        socket.to(roomName).emit("user_left", {
            userId: user === null || user === void 0 ? void 0 : user.userId,
            participantCount: ((_a = io.sockets.adapter.rooms.get(roomName)) === null || _a === void 0 ? void 0 : _a.size) || 0,
        });
    });
    // Place bid
    socket.on("place_bid", (data) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { auctionId, amount } = data;
            if (!(user === null || user === void 0 ? void 0 : user.userId)) {
                socket.emit("bid_error", { message: "Unauthorized" });
                return;
            }
            const result = yield db_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const auction = yield tx.auction.findUnique({
                    where: { id: auctionId },
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true,
                        startingBid: true,
                        currentBid: true,
                        ownerId: true,
                    },
                });
                if (!auction) {
                    throw new Error("Auction not found");
                }
                const now = new Date();
                if (now < auction.startTime) {
                    throw new Error("Auction has not started yet");
                }
                if (now > auction.endTime) {
                    throw new Error("Auction has ended");
                }
                if (auction.ownerId === user.userId) {
                    throw new Error("Cannot bid on your own auction");
                }
                const currentBid = Math.max(auction.currentBid || 0, auction.startingBid);
                if (amount <= currentBid) {
                    throw new Error(`Bid must be higher than current bid of $${currentBid}`);
                }
                const updateResult = yield tx.auction.updateMany({
                    where: { id: auctionId, currentBid: auction.currentBid },
                    data: { currentBid: amount },
                });
                if (updateResult.count === 0) {
                    throw new Error("Bid conflict, please retry");
                }
                const newBid = yield tx.bid.create({
                    data: {
                        amount,
                        bidderId: user.userId,
                        auctionId,
                    },
                    include: {
                        bidder: {
                            select: userSelect,
                        },
                    },
                });
                const updatedAuction = yield tx.auction.findUnique({
                    where: { id: auctionId },
                    include: {
                        item: true,
                        owner: { select: userSelect },
                    },
                });
                return { newBid, updatedAuction };
            }));
            // Broadcast to all users in auction room
            const roomName = `auction:${auctionId}`;
            const bidCount = yield db_1.default.bid.count({ where: { auctionId } });
            io.to(roomName).emit("bid_placed", {
                bid: result.newBid,
                auction: result.updatedAuction,
                bidCount,
            });
            // Send success confirmation to bidder
            socket.emit("bid_success", {
                bid: result.newBid,
                auction: result.updatedAuction,
            });
            console.log(`Bid placed: $${amount} on auction ${auctionId} by ${user.email}`);
        }
        catch (error) {
            console.error("Error placing bid:", error);
            const message = error instanceof Error && error.message
                ? error.message
                : "Failed to place bid";
            socket.emit("bid_error", { message });
        }
    }));
    // Handle auction ending (can be triggered by server or admin)
    socket.on("end_auction", (auctionId) => __awaiter(this, void 0, void 0, function* () {
        try {
            const auction = yield db_1.default.auction.findUnique({
                where: { id: auctionId },
                include: { owner: true },
            });
            if (!auction) {
                socket.emit("error", { message: "Auction not found" });
                return;
            }
            // Only owner can manually end auction
            if (auction.ownerId !== (user === null || user === void 0 ? void 0 : user.userId)) {
                socket.emit("error", { message: "Only the owner can end the auction" });
                return;
            }
            // Update auction end time
            const updatedAuction = yield db_1.default.auction.update({
                where: { id: auctionId },
                data: { endTime: new Date() },
            });
            // Broadcast to all users in auction room
            const roomName = `auction:${auctionId}`;
            io.to(roomName).emit("auction_ended", {
                auction: updatedAuction,
                message: "The auction has ended",
            });
            console.log(`Auction ${auctionId} ended by owner ${user === null || user === void 0 ? void 0 : user.email}`);
        }
        catch (error) {
            console.error("Error ending auction:", error);
            socket.emit("error", { message: "Failed to end auction" });
        }
    }));
}
