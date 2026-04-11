"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { itemApi } from "@/lib/ItemApi";
import { Item } from "@auctioneer/types/src";
import PageHero from "@/components/ui/PageHero";
import { Package, AlertCircle, ShoppingCart } from "lucide-react";
import { SkeletonCard } from "@/components/ui/Skeleton";
import Image from "next/image";
import { useCartStore } from "@/stores/CartStore";

export default function MarketClient() {
	const [items, setItems] = useState<Item[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const searchParams = useSearchParams();
	const router = useRouter();
	const { addItem } = useCartStore();

	const search = searchParams.get("search") || "";
	const page = parseInt(searchParams.get("page") || "1", 10);

	useEffect(() => {
		const fetchItems = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await itemApi.getItems({ type: "DIRECT", search, page, pageSize: 24 });
				if (response.success && response.data) {
					// Handle unauthenticated requests differently? No, the endpoint handles it. Let's assume it returns what we need
					// We'll filter out already bought stuff via status = AVAILABLE which backend already does.
					setItems(response.data.items || []);
					setTotal(response.data.total || 0);
				} else {
					setError("Failed to load market items");
				}
			} catch (err: any) {
				setError(err.message || "An error occurred");
			} finally {
				setLoading(false);
			}
		};

		fetchItems();
	}, [search, page]);

	const handleSearch = (q: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (q) params.set("search", q);
		else params.delete("search");
		params.delete("page"); // reset to page 1 on new search
		router.push(`/market?${params.toString()}`);
	};

	return (
		<div className="min-h-screen bg-[#111] pb-24">
			<PageHero
				label="Fixed Price"
				title="Direct Market"
				description="Buy items instantly without waiting for an auction to end. Add to cart and checkout in seconds."
				accentColor="emerald"
				searchable
				searchPlaceholder="Search market items..."
				onSearch={handleSearch}
			/>

			<div className="max-w-7xl mx-auto px-6 md:px-16 pt-12">
				{loading ? (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{Array.from({ length: 8 }).map((_, i) => (
							<SkeletonCard key={i} />
						))}
					</div>
				) : error ? (
					<div className="flex flex-col items-center justify-center py-32 text-center">
						<AlertCircle className="w-10 h-10 text-[#2a2a2a] mb-4" />
						<p className="text-[#737373] text-sm">{error}</p>
					</div>
				) : items.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-32 text-center">
						<Package className="w-12 h-12 text-[#222] mb-4" />
						<h3 className="text-xl font-bold text-white mb-2">No items found</h3>
						<p className="text-[#737373] max-w-sm text-sm">
							{search ? "No direct market items match your search." : "The direct market is currently empty."}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{items.map((item) => (
							<div key={item.id} className="group flex flex-col bg-[#181818] rounded-xl overflow-hidden border border-[#1f1f1f] hover:border-[#333] transition-colors">
								<div className="relative aspect-square bg-[#222] overflow-hidden">
									<Image
										src={item.imageUrl?.[0] || "/placeholder.png"}
										alt={item.name}
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-500"
									/>
								</div>
								<div className="p-4 flex flex-col gap-2">
									<h3 className="text-sm font-semibold text-white line-clamp-1">{item.name}</h3>
									<p className="text-emerald-400 font-mono font-bold">
										${item.price?.toLocaleString("en-US", { minimumFractionDigits: 2 }) ?? "0.00"}
									</p>
									<button
										onClick={() =>
											addItem({
												id: item.id,
												name: item.name,
												imageUrl: item.imageUrl?.[0] || "",
												price: item.price || 0,
												type: "DIRECT",
											})
										}
										className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-colors"
									>
										<ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
