import prisma from "@auctioneer/db";
import { Prisma } from "@auctioneer/db/generated/prisma";

const purchaseServices = {
	createPurchase: async (data: Prisma.PurchaseUncheckedCreateInput) => {
		const purchase = await prisma.purchase.create({ data });
		return purchase;
	},
	getPurchaseById: async (id: string) => {
		const purchase = await prisma.purchase.findUnique({
			where: { id },
			include: {
				item: { include: { owner: true } },
				buyer: true,
			},
		});
		return purchase;
	},
	listPurchasesByBuyer: async (buyerId: string) => {
		const purchases = await prisma.purchase.findMany({
			where: { buyerId },
			include: { item: true },
            orderBy: { createdAt: "desc" }
		});
		return purchases;
	},
	listPurchasesBySeller: async (sellerId: string) => {
		const purchases = await prisma.purchase.findMany({
			where: { item: { ownerId: sellerId } },
			include: { item: { include: { owner: true } }, buyer: true },
            orderBy: { createdAt: "desc" }
		});
		return purchases;
	},
	updatePurchaseStatus: async (id: string, status: any) => {
		const purchase = await prisma.purchase.update({
			where: { id },
			data: { status },
		});
		return purchase;
	},
};

export default purchaseServices;
