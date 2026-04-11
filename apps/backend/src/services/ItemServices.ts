import { Prisma, ItemType, ItemStatus } from "@auctioneer/db/generated/prisma";
import prisma from "@auctioneer/db";
import { CreateItemPayload } from "@auctioneer/types";

const userSelect = {
	id: true,
	email: true,
	username: true,
	firstName: true,
	lastName: true,
};

const itemServices = {
	createItem: async (data: CreateItemPayload) => {
		const item = await prisma.item.create({ data });
		return item;
	},

	getItemById: async (id: string) => {
		const item = await prisma.item.findUnique({
			where: { id },
			include: { owner: { select: userSelect } },
		});
		return item;
	},

	listItems: async () => {
		const items = await prisma.item.findMany();
		return items;
	},

	listUserItems: async (ownerId: string) => {
		const items = await prisma.item.findMany({
			where: { ownerId },
			include: { owner: { select: userSelect } },
			orderBy: { createdAt: "desc" },
		});
		return items;
	},

	listPublicItems: async (options: {
		type?: ItemType;
		page?: number;
		pageSize?: number;
		search?: string;
		excludeOwnerId?: string;
	} = {}) => {
		const { type, page = 1, pageSize = 20, search, excludeOwnerId } = options;

		const where: Prisma.itemWhereInput = {
			status: ItemStatus.AVAILABLE,
		};
		if (type) where.type = type;
		if (search) {
			where.name = { contains: search, mode: "insensitive" };
		}
		if (excludeOwnerId) {
			where.ownerId = { not: excludeOwnerId };
		}

		const skip = (page - 1) * Math.min(pageSize, 100);
		const take = Math.min(pageSize, 100);

		const [items, total] = await prisma.$transaction([
			prisma.item.findMany({
				where,
				include: { owner: { select: userSelect } },
				orderBy: { createdAt: "desc" },
				skip,
				take,
			}),
			prisma.item.count({ where }),
		]);

		return { items, total };
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
