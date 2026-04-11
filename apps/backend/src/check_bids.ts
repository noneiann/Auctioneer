import prisma from "@auctioneer/db";

async function main() {
    console.log("Checking user bids in db...");
    const user = await prisma.user.findFirst({
        where: { email: { contains: "reyianntigley" } }
    });
    if (!user) {
        console.log("No user found");
        return;
    }
    console.log("Found user:", user.email, user.id);
    const bids = await prisma.bid.findMany({
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

    const purchases = await prisma.purchase.findMany({
        where: { buyerId: user.id }
    });
    console.log(`User has ${purchases.length} purchases.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
