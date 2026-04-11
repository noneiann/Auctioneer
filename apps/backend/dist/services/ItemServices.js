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
const prisma_1 = require("@auctioneer/db/generated/prisma");
const db_1 = __importDefault(require("@auctioneer/db"));
const userSelect = {
    id: true,
    email: true,
    username: true,
    firstName: true,
    lastName: true,
};
const itemServices = {
    createItem: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const item = yield db_1.default.item.create({ data });
        return item;
    }),
    getItemById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const item = yield db_1.default.item.findUnique({
            where: { id },
            include: { owner: { select: userSelect } },
        });
        return item;
    }),
    listItems: () => __awaiter(void 0, void 0, void 0, function* () {
        const items = yield db_1.default.item.findMany();
        return items;
    }),
    listUserItems: (ownerId) => __awaiter(void 0, void 0, void 0, function* () {
        const items = yield db_1.default.item.findMany({
            where: { ownerId },
            include: { owner: { select: userSelect } },
            orderBy: { createdAt: "desc" },
        });
        return items;
    }),
    listPublicItems: (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (options = {}) {
        const { type, page = 1, pageSize = 20, search, excludeOwnerId } = options;
        const where = {
            status: prisma_1.ItemStatus.AVAILABLE,
        };
        if (type)
            where.type = type;
        if (search) {
            where.name = { contains: search, mode: "insensitive" };
        }
        if (excludeOwnerId) {
            where.ownerId = { not: excludeOwnerId };
        }
        const skip = (page - 1) * Math.min(pageSize, 100);
        const take = Math.min(pageSize, 100);
        const [items, total] = yield db_1.default.$transaction([
            db_1.default.item.findMany({
                where,
                include: { owner: { select: userSelect } },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            db_1.default.item.count({ where }),
        ]);
        return { items, total };
    }),
    updateItem: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const item = yield db_1.default.item.update({ where: { id }, data });
        return item;
    }),
    deleteItem: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const item = yield db_1.default.item.delete({ where: { id } });
        return item;
    }),
};
exports.default = itemServices;
