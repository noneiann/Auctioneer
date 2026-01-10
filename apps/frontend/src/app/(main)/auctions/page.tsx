"use client";

import React from "react";
import ItemCard from "@/components/auction/ItemCard";
import CategorySidebar from "@/components/layout/CategorySidebar";
import Carousel from "@/components/ui/HeroCarousel";
import Breadcrumb from "@/components/layout/Breadcrumb";
import useAuctions from "@/hooks/useAuctions"; // <-- import your hook

export default function AuctionsPage() {
	const { data: auctions, loading, error } = useAuctions();
	console.log("Auctions data:", auctions);

	return (
		<div className='px-6 py-4 animate-fade-in'>
			{/* Carousel and Breadcrumb */}
			<Carousel />
			<Breadcrumb />

			<div className='flex gap-6'>
				{/* Sidebar */}
				<CategorySidebar />

				{/* Main Items Section */}
				<div className='flex-1'>
					<h2 className='text-xl font-semibold mb-4'>All Items</h2>

					{/* Loading & Error states */}
					{loading && <p>Loading auctions...</p>}
					{error && <p className='text-red-500'>{error}</p>}

					{/* Auction Items */}
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2'>
						{auctions.length > 0
							? auctions.map((auction: any) => (
									<ItemCard
										key={auction.id}
										id={auction.id}
										image={
											auction.item.imageUrl?.[0] ??
											"https://via.placeholder.com/300"
										}
										itemName={auction.title}
										price={auction.price ?? auction.startingBid}
										endDate={auction.endTime}
										category={auction.category}
									/>
							  ))
							: !loading && <p>No auctions found.</p>}
					</div>
				</div>
			</div>
		</div>
	);
}
