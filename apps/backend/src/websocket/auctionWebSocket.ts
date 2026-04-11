import { Server, Socket } from "socket.io";
import { JwtPayloadUser } from "@auctioneer/types";
import prisma from "@auctioneer/db";

interface AuthenticatedSocket extends Socket {
	data: {
		user?: JwtPayloadUser;
	};
}

export default function auctionWebSocket(
	io: Server,
	socket: AuthenticatedSocket
) {
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
	socket.on("join_auction", async (auctionId: string) => {
		try {
			// Verify auction exists
			const auction = await prisma.auction.findUnique({
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

			console.log(`User ${user?.email} joined auction ${auctionId}`);

			// Send current auction state to the user
			socket.emit("auction_state", {
				auction,
				isActive,
				participantCount: io.sockets.adapter.rooms.get(roomName)?.size || 0,
			});

			// Notify others in the room
			socket.to(roomName).emit("user_joined", {
				userId: user?.userId,
				username: user?.email,
				participantCount: io.sockets.adapter.rooms.get(roomName)?.size || 0,
			});
		} catch (error) {
			console.error("Error joining auction:", error);
			socket.emit("error", { message: "Failed to join auction" });
		}
	});

	// Leave auction room
	socket.on("leave_auction", (auctionId: string) => {
		const roomName = `auction:${auctionId}`;
		socket.leave(roomName);

		console.log(`User ${user?.email} left auction ${auctionId}`);

		// Notify others in the room
		socket.to(roomName).emit("user_left", {
			userId: user?.userId,
			participantCount: io.sockets.adapter.rooms.get(roomName)?.size || 0,
		});
	});

	// Place bid
	socket.on(
		"place_bid",
		async (data: { auctionId: string; amount: number }) => {
			try {
				const { auctionId, amount } = data;

				if (!user?.userId) {
					socket.emit("bid_error", { message: "Unauthorized" });
					return;
				}

				const result = await prisma.$transaction(async (tx) => {
					const auction = await tx.auction.findUnique({
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

					const currentBid = Math.max(
						auction.currentBid || 0,
						auction.startingBid
					);
					if (amount <= currentBid) {
						throw new Error(
							`Bid must be higher than current bid of $${currentBid}`
						);
					}

					const updateResult = await tx.auction.updateMany({
						where: { id: auctionId, currentBid: auction.currentBid },
						data: { currentBid: amount },
					});
					if (updateResult.count === 0) {
						throw new Error("Bid conflict, please retry");
					}

					const newBid = await tx.bid.create({
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

					const updatedAuction = await tx.auction.findUnique({
						where: { id: auctionId },
						include: {
							item: true,
							owner: { select: userSelect },
						},
					});

					return { newBid, updatedAuction };
				});

				// Broadcast to all users in auction room
				const roomName = `auction:${auctionId}`;
				const bidCount = await prisma.bid.count({ where: { auctionId } });
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

				console.log(
					`Bid placed: $${amount} on auction ${auctionId} by ${user.email}`
				);
			} catch (error) {
				console.error("Error placing bid:", error);
				const message =
					error instanceof Error && error.message
						? error.message
						: "Failed to place bid";
				socket.emit("bid_error", { message });
			}
		}
	);

	// Handle auction ending (can be triggered by server or admin)
	socket.on("end_auction", async (auctionId: string) => {
		try {
			const auction = await prisma.auction.findUnique({
				where: { id: auctionId },
				include: { owner: true },
			});

			if (!auction) {
				socket.emit("error", { message: "Auction not found" });
				return;
			}

			// Only owner can manually end auction
			if (auction.ownerId !== user?.userId) {
				socket.emit("error", { message: "Only the owner can end the auction" });
				return;
			}

			// Update auction end time
			const updatedAuction = await prisma.auction.update({
				where: { id: auctionId },
				data: { endTime: new Date() },
			});

			// Broadcast to all users in auction room
			const roomName = `auction:${auctionId}`;
			io.to(roomName).emit("auction_ended", {
				auction: updatedAuction,
				message: "The auction has ended",
			});

			console.log(`Auction ${auctionId} ended by owner ${user?.email}`);
		} catch (error) {
			console.error("Error ending auction:", error);
			socket.emit("error", { message: "Failed to end auction" });
		}
	});
}
