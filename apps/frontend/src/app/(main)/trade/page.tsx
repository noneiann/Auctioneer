import { Suspense } from "react";
import TradeClient from "./TradeClient";

export const metadata = {
	title: "Trade Hub | Auctioneer",
	description: "Barter your items for other items.",
};

export default function TradePage() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-[#111] pt-32 pb-24 text-center text-white">Loading trade hub...</div>}>
			<TradeClient />
		</Suspense>
	);
}
