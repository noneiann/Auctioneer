import prisma from "@auctioneer/db";

const userSelect = {
	id: true,
	email: true,
	username: true,
	firstName: true,
	lastName: true,
};

const bidServices = {
	getUserBids: async (userId: string) => {
		return prisma.bid.findMany({
			where: { bidderId: userId },
			include: {
				auction: {
					include: {
						item: true,
						owner: { select: userSelect },
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	},
};

export default bidServices;
