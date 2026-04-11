"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { purchaseApi, Purchase } from "@/lib/PurchaseApi";
import { bidApi, Bid } from "@/lib/BidApi";
import { barterApi, BarterOffer } from "@/lib/BarterApi";
import PageHero from "@/components/ui/PageHero";
import { Package, Clock, ShieldCheck, Tag, X, Check, SearchX } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

type Tab = "purchases" | "bids" | "barters";

export default function ActivityPage() {
	const searchParams = useSearchParams();
	const initialTab = (searchParams.get("tab") as Tab) || "purchases";

	const [activeTab, setActiveTab] = useState<Tab>(initialTab);
	const [loading, setLoading] = useState(true);

	const [purchases, setPurchases] = useState<{ bought: Purchase[]; sold: Purchase[] }>({ bought: [], sold: [] });
	const [bids, setBids] = useState<Bid[]>([]);
	const [barters, setBarters] = useState<{ made: BarterOffer[]; received: BarterOffer[] }>({ made: [], received: [] });

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [pRes, bRes, oRes] = await Promise.all([
					purchaseApi.getMyPurchases(),
					bidApi.getMyBids(),
					barterApi.getMyOffers(),
				]);

				if (pRes.success) setPurchases(pRes.data);
				if (bRes.success) setBids(bRes.data);
				if (oRes.success) setBarters(oRes.data);
			} catch (err) {
				console.error("Error fetching activity:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleRespond = async (offerId: string, status: "ACCEPTED" | "REJECTED" | "CANCELLED") => {
		try {
			const res = await barterApi.respondToOffer(offerId, status);
			if (res.success) {
				// Refresh barters
				const oRes = await barterApi.getMyOffers();
				if (oRes.success) setBarters(oRes.data);
			}
		} catch (err) {
			alert("Failed to respond to offer");
		}
	};

	return (
		<div className="min-h-screen bg-[#111] pb-24">
			<PageHero
				label="Your History"
				title="Activity"
				description="Track your purchases, active bids, and barter deals."
				accentColor="blue"
			/>

			<div className="max-w-5xl mx-auto px-6 md:px-16 pt-8">
				<div className="flex gap-0 overflow-x-auto scrollbar-none border-b border-[#1f1f1f] w-full mb-8">
					{[
						{ id: "purchases", label: "My Purchases" },
						{ id: "bids", label: "Auction Bids" },
						{ id: "barters", label: "Barter Offers" },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id as Tab)}
							className={`px-4 py-3 text-[13px] font-medium whitespace-nowrap border-b-2 transition-all -mb-px ${
								activeTab === tab.id
									? "border-white text-white"
									: "border-transparent text-[#737373] hover:text-[#c8c8c8]"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				<div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl p-6 min-h-[400px]">
					{loading ? (
						<div className="flex justify-center items-center h-[300px] text-[#737373]">Loading...</div>
					) : (
						<>
							{activeTab === "purchases" && (
								<div className="space-y-4">
									<h3 className="text-sm font-bold text-[#a0a0a0] mb-4">Orders You've Placed</h3>
									{purchases.bought.length === 0 ? (
										<div className="flex flex-col items-center justify-center p-12 text-[#737373]">
											<Package className="w-8 h-8 mb-3 opacity-50" />
											<p>No purchases yet.</p>
										</div>
									) : (
										<ul className="space-y-4">
											{purchases.bought.map((p) => (
												<li key={p.id} className="flex gap-4 p-4 rounded-xl border border-[#2a2a2a] bg-[#111]">
													<Image src={p.item?.imageUrl?.[0] || "/placeholder.png"} alt="Item" width={64} height={64} className="rounded-lg object-cover w-16 h-16 border border-[#2a2a2a]" />
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-white mb-1">{p.item?.name}</p>
														<div className="flex items-center gap-3 text-[11px] text-[#737373]">
															<span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> Order #{p.id.slice(-6).toUpperCase()}</span>
															<span>•</span>
															<span>{new Date(p.createdAt).toLocaleDateString()}</span>
														</div>
													</div>
													<div className="flex flex-col items-end gap-2">
														<p className="text-sm font-bold text-white font-mono">${p.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
														<Badge variant={p.status === "COMPLETED" ? "live" : "ended"}>{p.status}</Badge>
													</div>
												</li>
											))}
										</ul>
									)}
								</div>
							)}

							{activeTab === "bids" && (
								<div className="space-y-4">
									<h3 className="text-sm font-bold text-[#a0a0a0] mb-4">Your Bid History</h3>
									{bids.length === 0 ? (
										<div className="flex flex-col items-center justify-center p-12 text-[#737373]">
											<Tag className="w-8 h-8 mb-3 opacity-50" />
											<p>You haven't placed any bids yet.</p>
										</div>
									) : (
										<ul className="space-y-4">
											{bids.map((b) => {
												const auctionEnd = new Date(b.auction?.endTime || "").getTime();
												const isEnded = auctionEnd <= Date.now();
												const isWinning = b.auction && b.amount === b.auction.currentBid;
												const resultStatus = isEnded ? (isWinning ? "WON" : "OUTBID") : (isWinning ? "LEADING" : "OUTBID");
												
												return (
													<li key={b.id}>
														<Link href={`/auctions/${b.auctionId}`} className="flex gap-4 p-4 rounded-xl border border-[#2a2a2a] bg-[#111] hover:bg-[#151515] hover:border-[#404040] transition-colors cursor-pointer group">
															<Image src={b.auction?.item?.imageUrl?.[0] || "/placeholder.png"} alt="Item" width={64} height={64} className="rounded-lg object-cover w-16 h-16 border border-[#2a2a2a] group-hover:border-[#404040] transition-colors" />
															<div className="flex-1 min-w-0 flex flex-col justify-center">
																<p className="text-sm font-medium text-white mb-2 tracking-wide group-hover:text-brand-400 transition-colors">{b.auction?.item?.name}</p>
																<div className="flex items-center gap-3 text-[11px] text-[#737373]">
																	<span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {isEnded ? "Ended" : "Live"}</span>
																	<span>•</span>
																	<span>Placed {new Date(b.createdAt).toLocaleDateString()}</span>
																</div>
															</div>
															<div className="flex flex-col items-end gap-2 justify-center">
																<p className="text-sm font-bold text-white font-mono">${b.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
																<Badge variant={isWinning && !isEnded ? "live" : isEnded && isWinning ? "ending" : "ended"}>{resultStatus}</Badge>
															</div>
														</Link>
													</li>
												);
											})}
										</ul>
									)}
								</div>
							)}

							{activeTab === "barters" && (
								<div className="space-y-8">
									{/* Offers Received */}
									<div>
										<h3 className="text-sm font-bold text-[#a0a0a0] mb-4">Offers Received (Action Required)</h3>
										{barters.received.length === 0 ? (
											<div className="flex items-center gap-3 p-4 bg-[#111] border border-[#222] rounded-xl text-sm text-[#737373]">
												<SearchX className="w-4 h-4" /> No incoming offers.
											</div>
										) : (
											<ul className="space-y-4">
												{barters.received.map(o => (
													<li key={o.id} className="p-4 rounded-xl border border-[#2a2a2a] bg-[#111] flex flex-col md:flex-row gap-6 items-center">
														<div className="flex items-center gap-4 flex-1">
															<Image src={o.offeredItems?.[0]?.imageUrl?.[0] || "/placeholder.png"} alt="Offered" width={48} height={48} className="rounded-lg object-cover w-12 h-12" />
															<div className="flex-1 text-xs">
																<span className="text-[#737373]">They offered</span>
																<p className="text-white font-medium">{o.offeredItems?.[0]?.name}</p>
																{!!o.cashAdded && o.cashAdded > 0 && <p className="text-emerald-400 font-mono">+ ${o.cashAdded}</p>}
															</div>
														</div>
														
														<div className="w-8 h-[1px] bg-[#2a2a2a] md:hidden" />
														
														<div className="flex items-center gap-4 flex-1 justify-end">
															<div className="text-right text-xs">
																<span className="text-[#737373]">For your</span>
																<p className="text-white font-medium">{o.targetItem?.name}</p>
															</div>
															<Image src={o.targetItem?.imageUrl?.[0] || "/placeholder.png"} alt="Target" width={48} height={48} className="rounded-lg object-cover w-12 h-12 border border-[#2a2a2a]" />
														</div>

														<div className="flex flex-col gap-2 shrink-0">
															{o.status === "PENDING" ? (
																<div className="flex gap-2">
																	<Button onClick={() => handleRespond(o.id, "ACCEPTED")} className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px]"><Check className="w-3.5 h-3.5 mr-1" /> Accept</Button>
																	<Button onClick={() => handleRespond(o.id, "REJECTED")} variant="secondary" className="h-8 px-3 text-[#737373] hover:text-white border-[#2a2a2a] text-[11px]"><X className="w-3.5 h-3.5 mr-1" /> Reject</Button>
																</div>
															) : (
																<Badge variant="ended">{o.status}</Badge>
															)}
														</div>
													</li>
												))}
											</ul>
										)}
									</div>

									{/* Offers Made */}
									<div>
										<h3 className="text-sm font-bold text-[#a0a0a0] mb-4">Offers You Made</h3>
										{barters.made.length === 0 ? (
											<div className="flex items-center gap-3 p-4 bg-[#111] border border-[#222] rounded-xl text-sm text-[#737373]">
												<SearchX className="w-4 h-4" /> You haven't made any offers.
											</div>
										) : (
											<ul className="space-y-4">
												{barters.made.map(o => (
													<li key={o.id} className="p-4 rounded-xl border border-[#2a2a2a] bg-[#111] flex flex-col md:flex-row gap-6 items-center">
														<div className="flex items-center gap-4 flex-1">
															<Image src={o.targetItem?.imageUrl?.[0] || "/placeholder.png"} alt="Target" width={48} height={48} className="rounded-lg object-cover w-12 h-12" />
															<div className="flex-1 text-xs">
																<span className="text-[#737373]">You wanted</span>
																<p className="text-white font-medium">{o.targetItem?.name}</p>
															</div>
														</div>

														<div className="w-8 h-[1px] bg-[#2a2a2a] md:hidden" />
														
														<div className="flex items-center gap-4 flex-1 justify-end">
															<div className="text-right text-xs">
																<span className="text-[#737373]">You offered</span>
																<p className="text-white font-medium">{o.offeredItems?.[0]?.name}</p>
																{!!o.cashAdded && o.cashAdded > 0 && <p className="text-emerald-400 font-mono">+ ${o.cashAdded}</p>}
															</div>
															<Image src={o.offeredItems?.[0]?.imageUrl?.[0] || "/placeholder.png"} alt="Offered" width={48} height={48} className="rounded-lg object-cover w-12 h-12 border border-[#2a2a2a]" />
														</div>

														<div className="flex flex-col gap-2 shrink-0">
															{o.status === "PENDING" ? (
																<Button onClick={() => handleRespond(o.id, "CANCELLED")} variant="secondary" className="h-8 px-3 text-[#737373] hover:text-white border-[#2a2a2a] text-[11px]">Cancel Offer</Button>
															) : (
																<Badge variant="ended">{o.status}</Badge>
															)}
														</div>
													</li>
												))}
											</ul>
										)}
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
