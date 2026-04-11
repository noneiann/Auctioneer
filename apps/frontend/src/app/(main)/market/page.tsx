import { Suspense } from "react";
import MarketClient from "./MarketClient";

export const metadata = {
	title: "Market | Auctioneer",
	description: "Buy items directly at fixed prices.",
};

export default function MarketPage() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-[#111] pt-32 pb-24 text-center text-white">Loading market...</div>}>
			<MarketClient />
		</Suspense>
	);
}
