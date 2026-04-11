import prisma from "@auctioneer/db";
import { Prisma } from "@auctioneer/db/generated/prisma";

const userSelect = {
	id: true,
	email: true,
	username: true,
	firstName: true,
	lastName: true,
};

const itemSelect = {
	id: true,
	name: true,
	imageUrl: true,
	price: true,
	estimatedValue: true,
	type: true,
	status: true,
};

const barterServices = {
	createOffer: async (data: Prisma.BarterOfferCreateInput) => {
		const offer = await prisma.barterOffer.create({
			data,
			include: {
				targetItem: { select: { ...itemSelect, owner: { select: userSelect } } },
				offeredItems: { select: itemSelect },
				offerer: { select: userSelect },
			},
		});
		return offer;
	},

	getOfferById: async (id: string) => {
		const offer = await prisma.barterOffer.findUnique({
			where: { id },
			include: {
				targetItem: { include: { owner: { select: userSelect } } },
				offeredItems: true,
				offerer: { select: userSelect },
			},
		});
		return offer;
	},

	listOffersByOfferer: async (offererId: string) => {
		const offers = await prisma.barterOffer.findMany({
			where: { offererId },
			include: {
				targetItem: { include: { owner: { select: userSelect } } },
				offeredItems: { select: itemSelect },
				offerer: { select: userSelect },
			},
			orderBy: { createdAt: "desc" },
		});
		return offers;
	},

	listOffersByReceiver: async (receiverId: string) => {
		const offers = await prisma.barterOffer.findMany({
			where: { targetItem: { ownerId: receiverId } },
			include: {
				targetItem: { select: itemSelect },
				offeredItems: { select: itemSelect },
				offerer: { select: userSelect },
			},
			orderBy: { createdAt: "desc" },
		});
		return offers;
	},

	updateOfferStatus: async (id: string, status: any) => {
		const offer = await prisma.barterOffer.update({
			where: { id },
			data: { status },
			include: {
				targetItem: { include: { owner: { select: userSelect } } },
				offeredItems: { select: itemSelect },
				offerer: { select: userSelect },
			},
		});
		return offer;
	},
};

export default barterServices;
