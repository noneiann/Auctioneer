import prisma from "@auctioneer/db";

const conversationServices = {
	createConversation: async (data: any) => {
		const conversation = await prisma.conversation.create({ data });
		return conversation;
	},
	getConversationById: async (id: string, includeMessages = false) => {
		const conversation = await prisma.conversation.findUnique({
			where: { id },
			include: {
				messages: includeMessages ? { orderBy: { createdAt: 'asc' } } : false,
			},
		});
		return conversation;
	},
	listConversationsByUser: async (userId: string) => {
		const conversations = await prisma.conversation.findMany({
			where: {
				OR: [
					{ buyerId: userId },
					{ sellerId: userId }
				]
			},
			include: {
				buyer: true,
				seller: true,
				messages: {
					orderBy: { createdAt: "desc" },
					take: 1,
				},
			},
		});
		return conversations;
	},
};

export default conversationServices;
