"use client";

import Link from "next/link";
import { ArrowRight, Gavel, Package, ArrowLeftRight, Clock } from "lucide-react";
import useAuctions from "@/hooks/useAuctions";
import type { Auction } from "@/lib/AuctionApi";
import ItemCard from "@/components/auction/ItemCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import {
	Footprints,
	Watch,
	Monitor,
	Shirt,
	Diamond,
	Palette,
	BookOpen,
	Dumbbell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Category = { name: string; icon: LucideIcon };

const categories: Category[] = [
	{ name: "Shoes",            icon: Footprints },
	{ name: "Watches",          icon: Watch },
	{ name: "Electronics",      icon: Monitor },
	{ name: "Clothing",         icon: Shirt },
	{ name: "Collectibles",     icon: Diamond },
	{ name: "Art",              icon: Palette },
	{ name: "Books",            icon: BookOpen },
	{ name: "Sports Equipment", icon: Dumbbell },
];

const modes = [
	{
		icon: Gavel,
		label: "Auctions",
		href: "/auctions",
		description: "Bid competitively. Win exclusively.",
		accent: "group-hover:text-brand-500",
		accentBg: "bg-brand-500/10 group-hover:bg-brand-500/20",
	},
	{
		icon: Package,
		label: "Market",
		href: "/market",
		description: "Buy instantly. No waiting.",
		accent: "group-hover:text-emerald-400",
		accentBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
	},
	{
		icon: ArrowLeftRight,
		label: "Trade Hub",
		href: "/trade",
		description: "Swap what you have for what you want.",
		accent: "group-hover:text-purple-400",
		accentBg: "bg-purple-500/10 group-hover:bg-purple-500/20",
	},
];

export default function Home() {
	const { data, loading } = useAuctions();

	const now = Date.now();
	const endingSoon: Auction[] = data
		.filter((a) => {
			const end = new Date(a.endTime).getTime();
			return end > now && end < now + 24 * 60 * 60 * 1000;
		})
		.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
		.slice(0, 10);

	const featured = data.slice(0, 8);

	return (
		<div className="min-h-screen bg-[#111]">

			{/* ─── Hero ─── */}
			<section className="relative w-full border-b border-[#1f1f1f] overflow-hidden">
				{/* Background texture */}
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1a2f52_0%,_transparent_60%)] opacity-40 pointer-events-none" />

				<div className="max-w-7xl mx-auto px-6 md:px-16 pt-20 pb-16 md:pt-28 md:pb-24">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500 animate-fade-in">
						The Complete Marketplace
					</p>
					<h1 className="mt-4 text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.0] tracking-tight max-w-4xl animate-fade-in-delay">
						Bid. Buy.<br />Barter.
					</h1>
					<p className="mt-6 text-base md:text-lg text-[#737373] max-w-xl leading-relaxed animate-fade-in-delay-2">
						Discover rare finds, limited editions, and exclusive items from trusted sellers across three powerful trading modes.
					</p>

					{/* Mode CTAs */}
					<div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl animate-fade-in-delay-3">
						{modes.map((mode) => {
							const Icon = mode.icon;
							return (
								<Link
									key={mode.href}
									href={mode.href}
									className="group flex items-center justify-between gap-3 p-4 rounded-xl bg-[#181818] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all duration-200"
								>
									<div className="flex items-center gap-3">
										<div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${mode.accentBg}`}>
											<Icon className={`w-4 h-4 text-[#737373] transition-colors ${mode.accent}`} />
										</div>
										<div>
											<p className="text-sm font-semibold text-white">{mode.label}</p>
											<p className="text-[11px] text-[#4a4a4a] leading-snug">{mode.description}</p>
										</div>
									</div>
									<ArrowRight className="w-4 h-4 text-[#2a2a2a] group-hover:text-[#737373] transition-colors shrink-0" />
								</Link>
							);
						})}
					</div>
				</div>
			</section>

			{/* ─── Ending Soon ─── */}
			{(loading || endingSoon.length > 0) && (
				<section className="border-b border-[#1f1f1f] py-16">
					<div className="max-w-7xl mx-auto px-6 md:px-16">
						<div className="flex items-end justify-between mb-8">
							<div>
								<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-400 flex items-center gap-1.5">
									<Clock className="w-3.5 h-3.5" />
									Ending Today
								</p>
								<h2 className="text-2xl md:text-3xl font-bold text-white mt-1">
									Don&apos;t Miss Out
								</h2>
							</div>
							<Link
								href="/auctions?sort=ending-soon"
								className="text-[13px] font-medium text-[#737373] hover:text-white transition-colors flex items-center gap-1"
							>
								View all <ArrowRight className="w-3.5 h-3.5" />
							</Link>
						</div>
						<div
							className="flex gap-4 overflow-x-auto scrollbar-none pb-2"
						>
							{loading
								? Array.from({ length: 5 }).map((_, i) => (
										<div key={i} className="min-w-[200px] w-[200px]">
											<SkeletonCard />
										</div>
								  ))
								: endingSoon.map((auction) => (
										<div key={auction.id} className="flex-shrink-0">
											<ItemCard
												id={auction.id}
												image={auction.item.imageUrl?.[0] ?? "/placeholder.png"}
												itemName={auction.item.name}
												price={auction.currentBid || auction.startingBid}
												endDate={auction.endTime}
												category={auction.category}
												bidCount={auction.bids?.length}
												variant="compact"
											/>
										</div>
								  ))}
						</div>
					</div>
				</section>
			)}

			{/* ─── Browse by Category ─── */}
			<section className="border-b border-[#1f1f1f] py-16">
				<div className="max-w-7xl mx-auto px-6 md:px-16">
					<div className="mb-8">
						<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">
							Categories
						</p>
						<h2 className="text-2xl md:text-3xl font-bold text-white mt-1">
							Browse by Category
						</h2>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
						{categories.map((cat) => {
							const Icon = cat.icon;
							return (
								<Link
									key={cat.name}
									href={`/auctions?category=${cat.name}`}
									className="group flex flex-col items-center gap-2.5 p-4 rounded-xl bg-[#181818] border border-[#1f1f1f] hover:border-[#2a2a2a] hover:bg-[#1f1f1f] transition-all duration-200"
								>
									<Icon className="w-5 h-5 text-[#4a4a4a] group-hover:text-white transition-colors" />
									<span className="text-[11px] font-medium text-[#737373] group-hover:text-white transition-colors text-center leading-tight">
										{cat.name}
									</span>
								</Link>
							);
						})}
					</div>
				</div>
			</section>

			{/* ─── Featured Auctions ─── */}
			<section className="border-b border-[#1f1f1f] py-16">
				<div className="max-w-7xl mx-auto px-6 md:px-16">
					<div className="flex items-end justify-between mb-8">
						<div>
							<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">
								Featured
							</p>
							<h2 className="text-2xl md:text-3xl font-bold text-white mt-1">
								Trending Auctions
							</h2>
						</div>
						<Link
							href="/auctions"
							className="text-[13px] font-medium text-[#737373] hover:text-white transition-colors flex items-center gap-1"
						>
							View all <ArrowRight className="w-3.5 h-3.5" />
						</Link>
					</div>
					{loading ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
							{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
						</div>
					) : featured.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
							{featured.map((auction) => (
								<ItemCard
									key={auction.id}
									id={auction.id}
									image={auction.item.imageUrl?.[0] ?? "/placeholder.png"}
									itemName={auction.item.name}
									price={auction.currentBid || auction.startingBid}
									endDate={auction.endTime}
									category={auction.category}
									bidCount={auction.bids?.length}
								/>
							))}
						</div>
					) : null}
				</div>
			</section>

			{/* ─── Marketplace Modes Promo ─── */}
			<section className="py-16">
				<div className="max-w-7xl mx-auto px-6 md:px-16">
					<div className="mb-10">
						<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">
							Explore More
						</p>
						<h2 className="text-2xl md:text-3xl font-bold text-white mt-1">
							More Ways to Trade
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Market */}
						<Link
							href="/market"
							className="group relative overflow-hidden rounded-2xl bg-[#181818] border border-[#2a2a2a] hover:border-emerald-500/30 p-10 flex flex-col justify-between min-h-[260px] transition-all duration-300"
						>
							<div className="absolute right-8 top-8 opacity-5 group-hover:opacity-10 transition-opacity">
								<Package className="w-28 h-28 text-emerald-400" />
							</div>
							<div>
								<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400 mb-3">
									Direct Sales
								</p>
								<h3 className="text-2xl font-bold text-white mb-3">
									Marketplace
								</h3>
								<p className="text-[#737373] text-sm max-w-xs leading-relaxed">
									Buy now at the seller&apos;s asking price. No bidding wars, no countdowns.
								</p>
							</div>
							<div className="mt-8 flex items-center gap-2 text-sm font-semibold text-emerald-400 group-hover:gap-3 transition-all">
								Shop Direct <ArrowRight className="w-4 h-4" />
							</div>
						</Link>

						{/* Trade */}
						<Link
							href="/trade"
							className="group relative overflow-hidden rounded-2xl bg-[#181818] border border-[#2a2a2a] hover:border-purple-500/30 p-10 flex flex-col justify-between min-h-[260px] transition-all duration-300"
						>
							<div className="absolute right-8 top-8 opacity-5 group-hover:opacity-10 transition-opacity">
								<ArrowLeftRight className="w-28 h-28 text-purple-400" />
							</div>
							<div>
								<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-400 mb-3">
									Barter System
								</p>
								<h3 className="text-2xl font-bold text-white mb-3">
									Trade Hub
								</h3>
								<p className="text-[#737373] text-sm max-w-xs leading-relaxed">
									Item rich, cash poor? Trade unneeded valuables for items you actually want.
								</p>
							</div>
							<div className="mt-8 flex items-center gap-2 text-sm font-semibold text-purple-400 group-hover:gap-3 transition-all">
								Explore Trades <ArrowRight className="w-4 h-4" />
							</div>
						</Link>
					</div>
				</div>
			</section>

			{/* ─── How It Works ─── */}
			<section className="border-t border-[#1f1f1f] py-16">
				<div className="max-w-7xl mx-auto px-6 md:px-16">
					<div className="mb-12">
						<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">
							Process
						</p>
						<h2 className="text-2xl md:text-3xl font-bold text-white mt-1">
							How It Works
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[
							{
								n: "01",
								title: "Browse & Discover",
								body: "Explore thousands of unique items from verified sellers across multiple categories.",
							},
							{
								n: "02",
								title: "Bid, Buy or Barter",
								body: "Place a bid, buy directly, or propose a trade. Three modes, one platform.",
							},
							{
								n: "03",
								title: "Win & Collect",
								body: "Secure your item and complete the transaction through our safe payment system.",
							},
						].map((step) => (
							<div key={step.n} className="group">
								<p className="text-4xl font-bold text-[#1f1f1f] group-hover:text-[#2a2a2a] transition-colors leading-none mb-5">
									{step.n}
								</p>
								<h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
								<p className="text-sm text-[#737373] leading-relaxed">{step.body}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
