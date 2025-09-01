import React from "react";
import AuctionInfo from "./components/AuctionInfo";

export default async function sellerAuctionInfo({
  params,
}: {
  params: Promise<{ auctionId: string }>;
}) {
  const { auctionId } = await params;
  return <AuctionInfo id={auctionId} />;
}
