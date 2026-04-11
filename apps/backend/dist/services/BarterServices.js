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
    createOffer: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const offer = yield db_1.default.barterOffer.create({
            data,
            include: {
                targetItem: { select: Object.assign(Object.assign({}, itemSelect), { owner: { select: userSelect } }) },
                offeredItems: { select: itemSelect },
                offerer: { select: userSelect },
            },
        });
        return offer;
    }),
    getOfferById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const offer = yield db_1.default.barterOffer.findUnique({
            where: { id },
            include: {
                targetItem: { include: { owner: { select: userSelect } } },
                offeredItems: true,
                offerer: { select: userSelect },
            },
        });
        return offer;
    }),
    listOffersByOfferer: (offererId) => __awaiter(void 0, void 0, void 0, function* () {
        const offers = yield db_1.default.barterOffer.findMany({
            where: { offererId },
            include: {
                targetItem: { include: { owner: { select: userSelect } } },
                offeredItems: { select: itemSelect },
                offerer: { select: userSelect },
            },
            orderBy: { createdAt: "desc" },
        });
        return offers;
    }),
    listOffersByReceiver: (receiverId) => __awaiter(void 0, void 0, void 0, function* () {
        const offers = yield db_1.default.barterOffer.findMany({
            where: { targetItem: { ownerId: receiverId } },
            include: {
                targetItem: { select: itemSelect },
                offeredItems: { select: itemSelect },
                offerer: { select: userSelect },
            },
            orderBy: { createdAt: "desc" },
        });
        return offers;
    }),
    updateOfferStatus: (id, status) => __awaiter(void 0, void 0, void 0, function* () {
        const offer = yield db_1.default.barterOffer.update({
            where: { id },
            data: { status },
            include: {
                targetItem: { include: { owner: { select: userSelect } } },
                offeredItems: { select: itemSelect },
                offerer: { select: userSelect },
            },
        });
        return offer;
    }),
};
exports.default = barterServices;
