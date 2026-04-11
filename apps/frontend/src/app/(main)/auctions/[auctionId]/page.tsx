"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Clock, ChevronRight, AlertCircle, Calendar, Tag, Hash } from "lucide-react";
import { auctionApi, Auction } from "@/lib/AuctionApi";
import AuctionImageViewer from "@/components/auction/AuctionImageViewer";
import AuctionChat from "@/components/auction/AuctionChat";
import AuctionBiddingPanel from "@/components/auction/AuctionBiddingPanel";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

type TabKey = "details";

function useCountdown(endTime: string) {
	const [timeLeft, setTimeLeft] = useState("");
	const [urgency, setUrgency] = useState<"normal" | "warning" | "urgent" | "ended">("normal");

	useEffect(() => {
		const update = () => {
			const now = Date.now();
			const end = new Date(endTime).getTime();
			const diff = end - now;

			if (diff <= 0) {
				setTimeLeft("Auction ended");
				setUrgency("ended");
				return;
			}

			if (diff < 1000 * 60 * 60) {
				setUrgency("urgent");
			} else if (diff < 1000 * 60 * 60 * 6) {
				setUrgency("warning");
			} else {
				setUrgency("normal");
			}

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
			const minutes = Math.floor((diff / (1000 * 60)) % 60);
			const seconds = Math.floor((diff / 1000) % 60);

			if (days > 0) {
				setTimeLeft(`${days}d ${hours}h ${minutes}m`);
			} else if (hours > 0) {
				setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
			} else {
				setTimeLeft(`${minutes}m ${seconds}s`);
			}
		};

		update();
		const timer = setInterval(update, 1000);
		return () => clearInterval(timer);
	}, [endTime]);

	return { timeLeft, urgency };
}

function LoadingSkeleton() {
	return (
		<div className="max-w-7xl mx-auto px-6 md:px-16 py-8">
			<Skeleton className="h-4 w-48 mb-6" />
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mt-6">
				<Skeleton className="aspect-square w-full rounded-xl" />
				<div className="flex flex-col gap-4">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-9 w-3/4" />
					<Skeleton className="h-4 w-40" />
					<Skeleton className="h-40 w-full rounded-xl" />
					<Skeleton className="h-10 w-full rounded-lg" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
					<Skeleton className="h-4 w-2/3" />
				</div>
			</div>
		</div>
	);
}

function ErrorState({ message }: { message: string }) {
	return (
		<div className="max-w-7xl mx-auto px-6 md:px-16 py-24 flex flex-col items-center justify-center text-center gap-4">
			<AlertCircle className="w-12 h-12 text-neutral-400" />
			<h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
			<p className="text-neutral-500">{message}</p>
			<Link href="/auctions">
				<Button variant="secondary">Back to Auctions</Button>
			</Link>
		</div>
	);
}

export default function AuctionInfoPage() {
	const params = useParams();
	const id = Array.isArray(params.auctionId)
		? params.auctionId[0]
		: params.auctionId;

	const [auction, setAuction] = useState<Auction | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchAuction = async () => {
			if (!id) return;
			try {
				const res = await auctionApi.getAuctionById(id);
				setAuction(res.data);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to load auction";
				setError(message);
				toast.error(message);
			} finally {
				setLoading(false);
			}
		};
		fetchAuction();
	}, [id]);

	if (loading) return <LoadingSkeleton />;
	if (error || !auction) return <ErrorState message={error || "Auction not found"} />;

	return <AuctionContent auction={auction} />;
}

function AuctionContent({ auction }: { auction: Auction }) {
	const { timeLeft, urgency } = useCountdown(auction.endTime);

	return (
		<div className="w-full min-h-screen bg-[#020617]">
			<div className="max-w-7xl mx-auto px-6 md:px-16 py-8">
				{/* Breadcrumb */}
				<nav className="flex items-center gap-1.5 text-sm text-brand-300 mb-6">
					<Link href="/" className="hover:text-white transition-colors">
						Home
					</Link>
					<ChevronRight className="w-3.5 h-3.5" />
					<Link href="/auctions" className="hover:text-white transition-colors">
						Auctions
					</Link>
					<ChevronRight className="w-3.5 h-3.5" />
					<span className="text-white font-medium truncate max-w-[200px]">
						{auction.item.name}
					</span>
				</nav>

				{/* Two-Column E-commerce Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
					{/* Left Column - Media & Details (8 columns) */}
					<div className="lg:col-span-8 flex flex-col gap-8">
						{/* Main Image Viewer */}
						<AuctionImageViewer images={auction.item.imageUrl} />

						{/* Product Title & Basic Info */}
						<div>
							<div className="flex items-center gap-3 mb-3">
								<Badge variant="category">{auction.category}</Badge>
								<span className="text-sm text-brand-300 flex items-center gap-1">
									<Hash className="w-3.5 h-3.5" />
									ID: {auction.id.slice(-8)}
								</span>
							</div>

							<h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
								{auction.item.name}
							</h1>

							{auction.owner && (
								<p className="text-sm text-brand-300">
									Seller: <span className="text-white font-medium hover:underline cursor-pointer">{auction.owner.firstName || "User"} {auction.owner.lastName || ""}</span>
									<span className="mx-2 text-brand-700">•</span>
									<span className="text-brand-400">98% Positive Feedback</span>
								</p>
							)}
						</div>

						{/* Description */}
						<div className="prose prose-invert prose-brand max-w-none">
							<h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
								Description
							</h3>
							<div className="text-brand-200 leading-relaxed whitespace-pre-wrap bg-[#0f172a]/30 p-6 rounded-xl border border-[#1e293b]">
								{auction.item.description}
							</div>
						</div>

						{/* Details Grid */}
						<div>
							<h3 className="text-lg font-semibold text-white mb-3">Item Details</h3>
							<DetailsTab auction={auction} />
						</div>
					</div>

					{/* Right Column - Sticky Bidding Panel (4 columns) */}
					<div className="lg:col-span-4">
						<div>
							{/* New Bidding Panel Component */}
							<AuctionBiddingPanel
								auction={auction}
								timeLeft={timeLeft}
								urgency={urgency}
							/>

							{/* Trust/Safety Badges (Optional addition below panel) */}
							<div className="mt-4 grid grid-cols-2 gap-3">
								<div className="bg-[#0f172a]/30 p-3 rounded-lg border border-[#1e293b] flex flex-col items-center text-center gap-2">
									<div className="p-1.5 bg-emerald-500/10 rounded-full text-emerald-500">
										<Tag className="w-4 h-4" />
									</div>
									<p className="text-xs text-brand-300 font-medium">Buyer Protection</p>
								</div>
								<div className="bg-[#0f172a]/30 p-3 rounded-lg border border-[#1e293b] flex flex-col items-center text-center gap-2">
									<div className="p-1.5 bg-blue-500/10 rounded-full text-blue-500">
										<Calendar className="w-4 h-4" />
									</div>
									<p className="text-xs text-brand-300 font-medium">Fast Shipping</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function DetailsTab({ auction }: { auction: Auction }) {
	const details = [
		{
			icon: <Calendar className="w-4 h-4 text-brand-400" />,
			label: "Start Time",
			value: new Date(auction.startTime).toLocaleString(),
		},
		{
			icon: <Calendar className="w-4 h-4 text-brand-400" />,
			label: "End Time",
			value: new Date(auction.endTime).toLocaleString(),
		},
		{
			icon: <Tag className="w-4 h-4 text-brand-400" />,
			label: "Category",
			value: auction.category,
		},
		{
			icon: <Hash className="w-4 h-4 text-brand-400" />,
			label: "Auction ID",
			value: auction.id,
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
			{details.map((detail) => (
				<div
					key={detail.label}
					className="flex items-start gap-3 bg-[#0f172a]/50 rounded-lg p-4 border border-[#1e293b]"
				>
					<div className="mt-0.5">{detail.icon}</div>
					<div>
						<p className="text-xs text-brand-400 uppercase tracking-wider">{detail.label}</p>
						<p className="text-sm font-medium text-white mt-0.5 break-all">{detail.value}</p>
					</div>
				</div>
			))}
		</div>
	);
}
