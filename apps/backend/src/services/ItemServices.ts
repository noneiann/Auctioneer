import { PrismaClient, Prisma } from "@auctioneer/db/generated/prisma";
import prisma from "@auctioneer/db";
import { CreateItemPayload } from "@auctioneer/types";

const itemServices = {
	createItem: async (data: CreateItemPayload) => {
		const item = await prisma.item.create({ data });
		return item;
	},
	getItemById: async (id: string) => {
		const item = await prisma.item.findUnique({ where: { id } });
		return item;
	},
	listItems: async () => {
		const items = await prisma.item.findMany();
		return items;
	},
	updateItem: async (id: string, data: Prisma.itemUpdateInput) => {
		const item = await prisma.item.update({ where: { id }, data });
		return item;
	},
	deleteItem: async (id: string) => {
		const item = await prisma.item.delete({ where: { id } });
		return item;
	},
};

export default itemServices;
