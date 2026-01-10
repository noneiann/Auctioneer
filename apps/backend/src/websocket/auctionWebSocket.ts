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

	// Join auction room
	socket.on("join_auction", async (auctionId: string) => {
		try {
			// Verify auction exists
			const auction = await prisma.auction.findUnique({
				where: { id: auctionId },
				include: {
					item: true,
					owner: {
						select: {
							id: true,
							username: true,
							firstName: true,
							lastName: true,
						},
					},
					bids: {
						include: {
							bidder: {
								select: {
									id: true,
									username: true,
									firstName: true,
									lastName: true,
								},
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

				// Fetch auction with current state
				const auction = await prisma.auction.findUnique({
					where: { id: auctionId },
					include: {
						item: true,
						bids: {
							orderBy: { createdAt: "desc" },
							take: 1,
						},
					},
				});

				if (!auction) {
					socket.emit("bid_error", { message: "Auction not found" });
					return;
				}

				// Validation checks
				const now = new Date();
				if (now < auction.startTime) {
					socket.emit("bid_error", { message: "Auction has not started yet" });
					return;
				}

				if (now > auction.endTime) {
					socket.emit("bid_error", { message: "Auction has ended" });
					return;
				}

				if (auction.ownerId === user.userId) {
					socket.emit("bid_error", {
						message: "Cannot bid on your own auction",
					});
					return;
				}

				const currentBid = auction.currentBid || auction.startingBid;
				if (amount <= currentBid) {
					socket.emit("bid_error", {
						message: `Bid must be higher than current bid of $${currentBid}`,
					});
					return;
				}

				// Create bid in database
				const newBid = await prisma.bid.create({
					data: {
						amount,
						bidderId: user.userId,
						auctionId,
					},
					include: {
						bidder: {
							select: {
								id: true,
								username: true,
								firstName: true,
								lastName: true,
							},
						},
					},
				});

				// Update auction current bid
				const updatedAuction = await prisma.auction.update({
					where: { id: auctionId },
					data: { currentBid: amount },
					include: {
						item: true,
						owner: {
							select: {
								id: true,
								username: true,
								firstName: true,
								lastName: true,
							},
						},
					},
				});

				// Broadcast to all users in auction room
				const roomName = `auction:${auctionId}`;
				io.to(roomName).emit("bid_placed", {
					bid: newBid,
					auction: updatedAuction,
					bidCount:
						(io.sockets.adapter.rooms.get(roomName)?.size || 0) +
						(auction.bids?.length || 0),
				});

				// Send success confirmation to bidder
				socket.emit("bid_success", {
					bid: newBid,
					auction: updatedAuction,
				});

				console.log(
					`Bid placed: $${amount} on auction ${auctionId} by ${user.email}`
				);
			} catch (error) {
				console.error("Error placing bid:", error);
				socket.emit("bid_error", { message: "Failed to place bid" });
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
