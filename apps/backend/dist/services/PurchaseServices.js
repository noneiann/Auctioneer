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
const purchaseServices = {
    createPurchase: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const purchase = yield db_1.default.purchase.create({ data });
        return purchase;
    }),
    getPurchaseById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const purchase = yield db_1.default.purchase.findUnique({
            where: { id },
            include: {
                item: { include: { owner: true } },
                buyer: true,
            },
        });
        return purchase;
    }),
    listPurchasesByBuyer: (buyerId) => __awaiter(void 0, void 0, void 0, function* () {
        const purchases = yield db_1.default.purchase.findMany({
            where: { buyerId },
            include: { item: true },
            orderBy: { createdAt: "desc" }
        });
        return purchases;
    }),
    listPurchasesBySeller: (sellerId) => __awaiter(void 0, void 0, void 0, function* () {
        const purchases = yield db_1.default.purchase.findMany({
            where: { item: { ownerId: sellerId } },
            include: { item: { include: { owner: true } }, buyer: true },
            orderBy: { createdAt: "desc" }
        });
        return purchases;
    }),
    updatePurchaseStatus: (id, status) => __awaiter(void 0, void 0, void 0, function* () {
        const purchase = yield db_1.default.purchase.update({
            where: { id },
            data: { status },
        });
        return purchase;
    }),
};
exports.default = purchaseServices;
