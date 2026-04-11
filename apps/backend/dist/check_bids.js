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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Checking user bids in db...");
        const user = yield db_1.default.user.findFirst({
            where: { email: { contains: "reyianntigley" } }
        });
        if (!user) {
            console.log("No user found");
            return;
        }
        console.log("Found user:", user.email, user.id);
        const bids = yield db_1.default.bid.findMany({
            where: { bidderId: user.id },
            include: {
                auction: {
                    include: { item: true }
                }
            }
        });
        console.log(`User has ${bids.length} bids.`);
        for (const b of bids) {
            console.log(`- Bid ID: ${b.id}, Amount: ${b.amount}, Auction: ${b.auctionId}, CurrentBid: ${b.auction.currentBid}`);
        }
        const purchases = yield db_1.default.purchase.findMany({
            where: { buyerId: user.id }
        });
        console.log(`User has ${purchases.length} purchases.`);
    });
}
main().catch(console.error).finally(() => db_1.default.$disconnect());
