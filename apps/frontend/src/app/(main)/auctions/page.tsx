"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, PackageOpen, SlidersHorizontal } from "lucide-react";
import ItemCard from "@/components/auction/ItemCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import HeroCarousel from "@/components/ui/HeroCarousel";
import PageHero from "@/components/ui/PageHero";
import useAuctions from "@/hooks/useAuctions";
import type { Auction } from "@/lib/AuctionApi";

const CATEGORIES = [
	"All",
	"Shoes",
	"Watches",
	"Electronics",
	"Clothing",
	"Collectibles",
	"Art",
	"Books",
	"Sports Equipment",
] as const;

type SortOption = "newest" | "ending-soon" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
	{ value: "newest",      label: "Newest" },
	{ value: "ending-soon", label: "Ending Soon" },
	{ value: "price-asc",   label: "Price: Low → High" },
	{ value: "price-desc",  label: "Price: High → Low" },
];

function getEffectivePrice(auction: Auction): number {
	return auction.currentBid || auction.startingBid;
}

export default function AuctionsPage() {
	const { data: auctions, loading, error } = useAuctions();
	const searchParams = useSearchParams();
	const router = useRouter();
	const [sort, setSort] = useState<SortOption>("newest");
	const [search, setSearch] = useState("");

	const activeCategory = searchParams.get("category") ?? "All";

	const handleCategoryClick = (category: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (category === "All") {
			params.delete("category");
		} else {
			params.set("category", category);
		}
		const query = params.toString();
		router.push(query ? `/auctions?${query}` : "/auctions");
	};

	const filtered = useMemo(() => {
		let result = [...auctions];

		// Search
		if (search.trim()) {
			const q = search.toLowerCase();
			result = result.filter(
				(a) =>
					a.item?.name?.toLowerCase().includes(q) ||
					a.category?.toLowerCase().includes(q)
			);
		}

		// Category
		if (activeCategory && activeCategory !== "All") {
			result = result.filter(
				(a) => a.category.toLowerCase() === activeCategory.toLowerCase()
			);
		}

		// Sort
		switch (sort) {
			case "newest":
				result.sort((a, b) => {
					const dateA = new Date(a.createdAt ?? a.startTime).getTime();
					const dateB = new Date(b.createdAt ?? b.startTime).getTime();
					return dateB - dateA;
				});
				break;
			case "ending-soon":
				result = result.filter((a) => new Date(a.endTime).getTime() > Date.now());
				result.sort(
					(a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
				);
				break;
			case "price-asc":
				result.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
				break;
			case "price-desc":
				result.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
				break;
		}

		return result;
	}, [auctions, activeCategory, sort, search]);

	return (
		<div className="min-h-screen bg-[#111] pb-24">
			{/* Page Header */}
			<PageHero
				label="Live Now"
				title="Auctions"
				description="Compete in real-time bidding on rare finds, limited editions, and exclusive items from verified sellers."
				accentColor="blue"
				searchable
				searchPlaceholder="Search auctions by name or category..."
				onSearch={setSearch}
				stats={
					loading
						? undefined
						: [
								{ label: "Active Lots", value: auctions.filter((a) => new Date(a.endTime).getTime() > Date.now()).length.toString() },
								{ label: "Total Items", value: auctions.length.toString() },
						  ]
				}
			/>

			{/* Featured Carousel */}
			{!loading && auctions.length > 0 && (
				<div className="border-b border-[#1f1f1f]">
					<HeroCarousel />
				</div>
			)}

			{/* Controls */}
			<div className="max-w-7xl mx-auto px-6 md:px-16 pt-8">
				<div className="flex items-center justify-between gap-4 flex-wrap">
					{/* Category Tabs */}
					<div className="flex gap-0 overflow-x-auto scrollbar-none border-b border-[#1f1f1f] w-full">
						{CATEGORIES.map((category) => {
							const active =
								category === "All"
									? activeCategory === "All"
									: activeCategory === category;
							return (
								<button
									key={category}
									onClick={() => handleCategoryClick(category)}
									className={`px-4 py-3 text-[13px] font-medium whitespace-nowrap border-b-2 transition-all -mb-px ${
										active
											? "border-white text-white"
											: "border-transparent text-[#737373] hover:text-[#c8c8c8]"
									}`}
								>
									{category}
								</button>
							);
						})}
					</div>
				</div>

				{/* Sort + count row */}
				<div className="flex items-center justify-between mt-6 mb-8">
					<p className="text-[13px] text-[#737373]">
						{loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "result" : "results"}`}
					</p>
					<div className="flex items-center gap-2">
						<SlidersHorizontal className="w-4 h-4 text-[#4a4a4a]" />
						<select
							value={sort}
							onChange={(e) => setSort(e.target.value as SortOption)}
							className="bg-transparent border border-[#2a2a2a] text-[13px] text-[#a0a0a0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#404040] cursor-pointer appearance-none hover:border-[#404040] transition-colors pr-8"
						>
							{SORT_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value} className="bg-[#181818]">
									{opt.label}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Grid */}
			<div className="max-w-7xl mx-auto px-6 md:px-16">
				{loading ? (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
						{Array.from({ length: 8 }).map((_, i) => (
							<SkeletonCard key={i} />
						))}
					</div>
				) : error ? (
					<div className="flex flex-col items-center justify-center py-32 text-center">
						<AlertCircle className="w-10 h-10 text-[#2a2a2a] mb-4" />
						<p className="text-[#737373] mb-6 text-sm">{error}</p>
						<button
							onClick={() => window.location.reload()}
							className="px-6 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors"
						>
							Retry
						</button>
					</div>
				) : auctions.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-32 text-center">
						<PackageOpen className="w-12 h-12 text-[#222] mb-4" />
						<h3 className="text-xl font-bold text-white mb-2">No auctions yet</h3>
						<p className="text-[#737373] mb-8 max-w-sm text-sm">
							Be the first to list an item and start selling today.
						</p>
						<Link
							href="/seller/auctions/create"
							className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors"
						>
							Create Auction
						</Link>
					</div>
				) : filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-32 text-center">
						<p className="text-[#737373] mb-6 text-sm">No results for this filter.</p>
						<button
							onClick={() => {
								setSort("newest");
								setSearch("");
								handleCategoryClick("All");
							}}
							className="px-6 py-2.5 rounded-lg border border-[#2a2a2a] text-white text-sm font-medium hover:border-[#404040] transition-colors"
						>
							Clear Filters
						</button>
					</div>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
						{filtered.map((auction: Auction) => (
							<ItemCard
								key={auction.id}
								id={auction.id}
								image={auction.item?.imageUrl?.[0] ?? "https://via.placeholder.com/300"}
								itemName={auction.item?.name ?? "Untitled Item"}
								price={auction.currentBid || auction.startingBid}
								endDate={auction.endTime}
								category={auction.category}
								bidCount={auction.bids?.length}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
