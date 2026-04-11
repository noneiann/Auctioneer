"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { itemApi } from "@/lib/ItemApi";
import { barterApi } from "@/lib/BarterApi";
import { Item } from "@auctioneer/types/src";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";
import { Package, AlertCircle, ArrowLeftRight, X } from "lucide-react";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from "@headlessui/react";
import { useAuth } from "@/hooks/useAuth";

export default function TradeClient() {
	const [items, setItems] = useState<Item[]>([]);
	const [myItems, setMyItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Barter Modal State
	const [selectedTarget, setSelectedTarget] = useState<Item | null>(null);
	const [selectedOfferedId, setSelectedOfferedId] = useState<string>("");
	const [cashAdded, setCashAdded] = useState<string>("");
	const [message, setMessage] = useState<string>("");
	const [submitting, setSubmitting] = useState(false);

	const searchParams = useSearchParams();
	const router = useRouter();
	const { isAuthenticated } = useAuth();

	const search = searchParams.get("search") || "";
	const page = parseInt(searchParams.get("page") || "1", 10);

	useEffect(() => {
		const fetchItems = async () => {
			setLoading(true);
			setError(null);
			try {
				const [marketRes, myRes] = await Promise.all([
					itemApi.getItems({ type: "BARTER", search, page, pageSize: 24 }),
					isAuthenticated ? itemApi.getMyItems() : Promise.resolve({ success: true, data: [] }),
				]);

				if (marketRes.success && marketRes.data) {
					setItems(marketRes.data.items || []);
				} else {
					setError("Failed to load trade items");
				}

				if (myRes.success && myRes.data) {
					// User can only offer their own AVAILABLE items
					setMyItems(myRes.data.filter((i) => i.status === "AVAILABLE"));
				}
			} catch (err: any) {
				setError(err.message || "An error occurred");
			} finally {
				setLoading(false);
			}
		};

		fetchItems();
	}, [search, page, isAuthenticated]);

	const handleSearch = (q: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (q) params.set("search", q);
		else params.delete("search");
		params.delete("page");
		router.push(`/trade?${params.toString()}`);
	};

	const handleMakeOffer = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedTarget || !selectedOfferedId) return;

		setSubmitting(true);
		try {
			const res = await barterApi.createOffer({
				targetItemId: selectedTarget.id,
				offeredItemId: selectedOfferedId,
				cashAdded: cashAdded ? parseFloat(cashAdded) : 0,
				message: message.trim() || undefined,
			});

			if (res.success) {
				alert("Offer sent successfully!");
				setSelectedTarget(null);
				setSelectedOfferedId("");
				setCashAdded("");
				setMessage("");
			} else {
				alert("Failed to send offer");
			}
		} catch (err: any) {
			alert(err.message || "Error submitting offer");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#111] pb-24">
			<PageHero
				label="Peer-to-Peer"
				title="Trade Hub"
				description="Propose item-for-item swaps. Sweeten the deal with cash. Barter your way up."
				accentColor="purple"
				searchable
				searchPlaceholder="Search barter items..."
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
						<ArrowLeftRight className="w-12 h-12 text-[#222] mb-4" />
						<h3 className="text-xl font-bold text-white mb-2">No swap targets found</h3>
						<p className="text-[#737373] max-w-sm text-sm">
							{search ? "No barter items match your search." : "The trade hub is currently empty."}
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
									<p className="text-purple-400 font-mono text-xs">
										Est. Value: ${item.price?.toLocaleString("en-US", { minimumFractionDigits: 2 }) ?? "Unknown"}
									</p>
									<button
										onClick={() => {
											if (isAuthenticated) {
												setSelectedTarget(item);
											} else {
												router.push("/login?redirect=/trade");
											}
										}}
										className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold transition-colors"
									>
										<ArrowLeftRight className="w-3.5 h-3.5" /> Make Offer
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Offer Modal */}
			<Dialog open={!!selectedTarget} onClose={() => setSelectedTarget(null)} className="relative z-50">
				<DialogBackdrop className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
				<div className="fixed inset-0 flex items-center justify-center p-4">
					<DialogPanel className="w-full max-w-md bg-[#181818] border border-[#2a2a2a] rounded-2xl shadow-2xl p-6">
						<div className="flex items-center justify-between mb-6">
							<DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
								<ArrowLeftRight className="w-5 h-5 text-purple-400" /> Propose Swap
							</DialogTitle>
							<button onClick={() => setSelectedTarget(null)} className="text-[#737373] hover:text-white">
								<X className="w-5 h-5" />
							</button>
						</div>

						{selectedTarget && (
							<form onSubmit={handleMakeOffer} className="space-y-5">
								{/* Target Info */}
								<div className="flex gap-3 items-center p-3 bg-[#111] rounded-xl border border-[#222]">
									<Image src={selectedTarget.imageUrl?.[0] || "/placeholder.png"} alt="Target" width={48} height={48} className="rounded-md object-cover h-12 w-12" />
									<div>
										<p className="text-xs text-[#737373]">Target Item</p>
										<p className="text-sm text-white font-medium">{selectedTarget.name}</p>
									</div>
								</div>

								{/* Select Offer Item */}
								<div>
									<label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">Your Item to Offer</label>
									<select
										required
										value={selectedOfferedId}
										onChange={(e) => setSelectedOfferedId(e.target.value)}
										className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
									>
										<option value="">Select an item...</option>
										{myItems.map(item => (
											<option key={item.id} value={item.id}>{item.name}</option>
										))}
									</select>
									{myItems.length === 0 && (
										<p className="text-xs text-red-400 mt-1">You don't have any items available to trade.</p>
									)}
								</div>

								{/* Cash Added */}
								<div>
									<label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">Cash Sweetener ($) <span className="text-[#4a4a4a]">- Optional</span></label>
									<div className="relative">
										<span className="absolute left-4 top-3 text-[#737373]">$</span>
										<input
											type="number"
											min="0"
											step="0.01"
											value={cashAdded}
											onChange={(e) => setCashAdded(e.target.value)}
											className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl pl-8 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
											placeholder="0.00"
										/>
									</div>
								</div>

								{/* Message */}
								<div>
									<label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">Message <span className="text-[#4a4a4a]">- Optional</span></label>
									<textarea
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										rows={2}
										className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
										placeholder="Why is it a fair trade?"
									/>
								</div>

								<Button
									type="submit"
									disabled={submitting || !selectedOfferedId}
									className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-11"
								>
									{submitting ? "Sending..." : "Send Offer"}
								</Button>
							</form>
						)}
					</DialogPanel>
				</div>
			</Dialog>
		</div>
	);
}
