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
const db_1 = __importDefault(require("@auctioneer/db"));
const conversationServices = {
    createConversation: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const conversation = yield db_1.default.conversation.create({ data });
        return conversation;
    }),
    getConversationById: (id_1, ...args_1) => __awaiter(void 0, [id_1, ...args_1], void 0, function* (id, includeMessages = false) {
        const conversation = yield db_1.default.conversation.findUnique({
            where: { id },
            include: {
                messages: includeMessages ? { orderBy: { createdAt: 'asc' } } : false,
            },
        });
        return conversation;
    }),
    listConversationsByUser: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        const conversations = yield db_1.default.conversation.findMany({
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
    }),
};
exports.default = conversationServices;
