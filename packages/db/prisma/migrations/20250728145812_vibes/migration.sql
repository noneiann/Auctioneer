/*
  Warnings:

  - You are about to drop the column `description` on the `auction` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `auction` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `bid` table. All the data in the column will be lost.
  - You are about to drop the column `currentBid` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `startingBid` on the `item` table. All the data in the column will be lost.
  - The `imageUrl` column on the `item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `startingBid` to the `auction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auctionId` to the `bid` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bid" DROP CONSTRAINT "bid_itemId_fkey";

-- AlterTable
ALTER TABLE "auction" DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "currentBid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "startingBid" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "bid" DROP COLUMN "itemId",
ADD COLUMN     "auctionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "item" DROP COLUMN "currentBid",
DROP COLUMN "startingBid",
DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrl" TEXT[];

-- AddForeignKey
ALTER TABLE "bid" ADD CONSTRAINT "bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
