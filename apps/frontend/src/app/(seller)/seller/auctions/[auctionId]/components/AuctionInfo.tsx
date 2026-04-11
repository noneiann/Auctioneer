"use client";
import React, { useCallback, useEffect, useState } from "react";
import { auctionApi } from "@/lib/AuctionApi";
import type { Auction } from "@/lib/AuctionApi";
import {
	Calendar,
	Clock,
	DollarSign,
	Edit3,
	Eye,
	Package,
	Users,
	TrendingUp,
	AlertCircle,
	CheckCircle,
	Timer,
} from "lucide-react";
import Link from "next/link";
import EditAuctionModal from "@/components/modals/EditAuctionModal";
import Image from "next/image";

type UpdateAuctionData = {
	itemName?: string;
	description?: string;
	startingBid?: number;
	category?: string;
	imageUrl?: string | string[];
};

interface AuctionInfoProps {
	id: string;
}

export default function AuctionInfo({ id }: AuctionInfoProps) {
	const [auction, setAuction] = useState<Auction | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showExtendModal, setShowExtendModal] = useState(false);

	const fetchAuction = useCallback(async () => {
		try {
			setLoading(true);
			const response = await auctionApi.getAuctionById(id);
			setAuction(response.data);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to fetch auction";
			setError(message);
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetchAuction();
	}, [fetchAuction]);

	const handleEditSave = async (auctionId: string, data: UpdateAuctionData) => {
		await auctionApi.updateAuction(auctionId, data);
		await fetchAuction();
		setShowEditModal(false);
	};

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4'></div>
					<p className='text-brand-300'>Loading auction...</p>
				</div>
			</div>
		);
	}

	if (error || !auction) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center max-w-md'>
					<Package size={48} className='mx-auto text-red-500 mb-4' />
					<h3 className='text-lg font-medium text-white mb-2'>
						Error Loading Auction
					</h3>
					<p className='text-red-500 mb-2'>{error || "Auction not found"}</p>
					<p className='text-sm text-brand-300 mb-4'>
						Trying to load auction ID: {id}
					</p>
					<div className='text-xs text-brand-500 mb-4'>
						Check the browser console for more details
					</div>
					<Link href='/seller/auctions'>
						<button className='px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-500 transition-colors'>
							Back to Auctions
						</button>
					</Link>
				</div>
			</div>
		);
	}

	const endTimeMs = auction.endTime ? new Date(auction.endTime).getTime() : 0;
	const isActive = endTimeMs > Date.now();
	const timeLeft = endTimeMs - Date.now();
	const daysLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
	const hoursLeft = Math.max(
		0,
		Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	);

	const handleExtendTime = async (additionalHours: number) => {
		try {
			if (!auction.endTime) {
				throw new Error("Auction end time is missing");
			}
			const newEndTime = new Date(
				new Date(auction.endTime).getTime() + additionalHours * 60 * 60 * 1000
			);
			await auctionApi.updateAuction(id, { endTime: newEndTime.toISOString() });
			setAuction((prev) =>
				prev ? { ...prev, endTime: newEndTime.toISOString() } : null
			);
			setShowExtendModal(false);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to extend auction";
			setError(message);
		}
	};

	return (
		<div className='max-w-7xl mx-auto p-6'>
			{/* Header */}
			<div className='flex items-center justify-between mb-8'>
				<div>
					<div className='flex items-center space-x-2 mb-2'>
						<Link href='/seller/auctions' className='text-brand-500 hover:text-brand-400 transition-colors text-sm font-medium'>
							My Auctions
						</Link>
						<span className='text-brand-500'>/</span>
						<span className='text-brand-300 text-sm font-medium'>{auction.item.name}</span>
					</div>
					<h1 className='text-3xl font-bold text-white'>
						{auction.item.name}
					</h1>
					<div className='flex items-center space-x-4 mt-2'>
						<span
							className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
								isActive
									? "bg-emerald-900/30 text-emerald-400 border-emerald-900/50"
									: "bg-[#1e293b]/50 text-neutral-400 border-[#1e293b]"
							}`}>
							{isActive ? (
								<>
									<CheckCircle size={14} className='mr-1' />
									Active
								</>
							) : (
								<>
									<AlertCircle size={14} className='mr-1' />
									Ended
								</>
							)}
						</span>
						{isActive && (
							<span className='text-sm text-brand-400 font-medium'>
								<Timer size={14} className='inline mr-1' />
								{daysLeft > 0
									? `${daysLeft}d ${hoursLeft}h left`
									: `${hoursLeft}h left`}
							</span>
						)}
					</div>
				</div>
				<div className='flex items-center space-x-3'>
					<Link href={`/auctions/${auction.id}`}>
						<button className='px-4 py-2 bg-[#1e293b]/50 text-brand-200 border border-[#1e293b] rounded-lg hover:text-white hover:bg-[#1e293b] transition-colors flex items-center space-x-2 shadow-sm'>
							<Eye size={16} />
							<span>View Public</span>
						</button>
					</Link>
					<button
						onClick={() => setShowEditModal(true)}
						className='px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors flex items-center space-x-2 shadow-sm'>
						<Edit3 size={16} />
						<span>Edit Info</span>
					</button>
					{isActive && (
						<button
							onClick={() => setShowExtendModal(true)}
							className='px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors flex items-center space-x-2 shadow-sm'>
							<Clock size={16} />
							<span>Extend Time</span>
						</button>
					)}
				</div>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
				<div className='bg-[#0f172a]/50 border border-[#1e293b] rounded-lg p-6 shadow-sm'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-brand-300'>Starting Bid</p>
							<p className='text-2xl font-bold text-white flex items-center'>
								<DollarSign size={20} className='mr-1' />
								{auction.startingBid}
							</p>
						</div>
						<div className='p-2 bg-[#1e293b]/50 rounded-lg'>
							<TrendingUp className='text-brand-400' size={24} />
						</div>
					</div>
				</div>
				<div className='bg-[#0f172a]/50 border border-[#1e293b] rounded-lg p-6 shadow-sm'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-brand-300'>Current Bid</p>
							<p className='text-2xl font-bold text-emerald-400 flex items-center'>
								<DollarSign size={20} className='mr-1' />
								{auction.currentBid || auction.startingBid}
							</p>
						</div>
						<div className='p-2 bg-emerald-900/20 rounded-lg'>
							<DollarSign className='text-emerald-500' size={24} />
						</div>
					</div>
				</div>
				<div className='bg-[#0f172a]/50 border border-[#1e293b] rounded-lg p-6 shadow-sm'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-brand-300'>Total Bids</p>
							<p className='text-2xl font-bold text-brand-500'>
								{auction.bids?.length || 0}
							</p>
						</div>
						<div className='p-2 bg-brand-900/20 rounded-lg'>
							<Users className='text-brand-500' size={24} />
						</div>
					</div>
				</div>
				<div className='bg-[#0f172a]/50 border border-[#1e293b] rounded-lg p-6 shadow-sm'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-brand-300'>Time Remaining</p>
							<p className='text-2xl font-bold text-white'>
								{isActive
									? daysLeft > 0
										? `${daysLeft}d`
										: `${hoursLeft}h`
									: "Ended"}
							</p>
						</div>
						<div className='p-2 bg-[#1e293b]/50 rounded-lg'>
							<Clock
								className={isActive ? "text-orange-500" : "text-neutral-500"}
								size={24}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* Item Details */}
				<div className='lg:col-span-2 space-y-6'>
					{/* Item Images */}
					<div className='bg-[#0f172a]/50 border border-[#1e293b] rounded-lg p-6 shadow-sm'>
						<h3 className='text-lg font-semibold text-white mb-4'>
							Item Images
						</h3>
						<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
							{auction.item.imageUrl?.length > 0 ? (
								auction.item.imageUrl.map((url, index) => (
										<div
											key={index}
											className='relative w-full h-32'>
											<Image
												src={url}
												alt={`${auction.item.name} ${index + 1}`}
												fill
												sizes='(max-width: 768px) 50vw, 33vw'
												className='object-cover rounded-lg border border-[#1e293b]'
											/>
										</div>
								))
							) : (
								<div className='col-span-full flex items-center justify-center h-32 bg-[#1e293b]/30 rounded-lg border border-dashed border-[#1e293b]/50 text-brand-400'>
									<Package size={32} className='text-brand-500/50' />
									<span className='ml-2 text-brand-400'>
										No images available
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Item Description */}
					<div className='bg-[#0f172a]/50 border border-[#1e293b] rounded-lg p-6 shadow-sm'>
						<h3 className='text-lg font-semibold text-white mb-4'>
							Description
						</h3>
						<p className='text-brand-200 leading-relaxed whitespace-pre-wrap'>
							{auction.item.description || "No description available."}
						</p>
					</div>

					{/* Auction Details */}
					<div className='bg-[#0f172a]/50 border border-[#1e293b] rounded-lg p-6 shadow-sm'>
						<h3 className='text-lg font-semibold text-white mb-4'>
							Auction Details
						</h3>
						<div className='space-y-3'>
							<div className='flex items-center justify-between pb-3 border-b border-[#1e293b]'>
								<span className='text-brand-400'>Created:</span>
								<span className='text-white flex items-center font-medium'>
									<Calendar size={14} className='mr-2 text-brand-500' />
									{auction.createdAt
										? new Date(auction.createdAt).toLocaleDateString()
										: "Unknown"}
								</span>
							</div>
							<div className='flex items-center justify-between pb-3 border-b border-[#1e293b]'>
								<span className='text-brand-400'>Ends:</span>
								<span className='text-white flex items-center font-medium'>
									<Clock size={14} className='mr-2 text-brand-500' />
									{auction.endTime
										? new Date(auction.endTime).toLocaleString()
										: "Unknown"}
								</span>
							</div>
							<div className='flex items-center justify-between pt-1'>
								<span className='text-brand-400'>Auction ID:</span>
								<span className='text-white font-mono text-sm px-2 py-1 bg-[#1e293b]/50 rounded text-brand-300'>
									{auction.id}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Bids Section */}
				<div className='space-y-6'>
					<div className='bg-[#0f172a]/50 border border-[#1e293b] rounded-lg p-6 shadow-sm max-h-[600px] flex flex-col'>
						<h3 className='text-lg font-semibold text-white mb-4'>
							Recent Bids
						</h3>
						{auction.bids && auction.bids.length > 0 ? (
							<div className='space-y-3 overflow-y-auto pr-2 custom-scrollbar'>
								{auction.bids
									.sort(
										(a, b) =>
											new Date(b.createdAt).getTime() -
											new Date(a.createdAt).getTime()
									)
									.map((bid) => (
										<div
											key={bid.id}
											className='flex items-center justify-between p-3 bg-[#1e293b]/50 border border-[#1e293b] hover:border-[#334155] rounded-lg transition-colors'>
											<div>
												<p className='font-medium text-white'>
													{bid.bidder?.username || "Anonymous"}
												</p>
												<p className='text-xs text-brand-400 mt-0.5'>
													{new Date(bid.createdAt).toLocaleString()}
												</p>
											</div>
											<div className='text-right'>
												<p className='font-bold text-brand-500 font-mono flex items-center justify-end'>
													<DollarSign size={14} className='mr-1' />
													{bid.amount}
												</p>
											</div>
										</div>
									))}
							</div>
						) : (
							<div className='flex-1 flex flex-col items-center justify-center text-center py-8'>
								<div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mb-4">
									<Users size={32} className='text-brand-400/50' />
								</div>
								<p className='text-brand-300 font-medium'>No bids yet</p>
								<p className='text-brand-500 text-sm mt-1'>Share your auction to attract bidders</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Extend Time Modal */}
			{showExtendModal && (
				<div className='fixed inset-0 bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center z-50'>
					<div className='bg-[#0f172a] border border-[#1e293b] shadow-2xl rounded-xl p-6 max-w-md w-full mx-4'>
						<h3 className='text-xl font-bold text-white mb-2'>
							Extend Auction
						</h3>
						<p className='text-brand-300 text-sm mb-6'>
							Choose how much time to add to this active auction:
						</p>
						<div className='space-y-3 mb-6'>
							{[1, 6, 12, 24, 48].map((hours) => (
								<button
									key={hours}
									onClick={() => handleExtendTime(hours)}
									className='w-full p-4 flex items-center justify-between group border border-[#1e293b] rounded-lg hover:border-brand-500 hover:bg-[#1e293b]/50 transition-all'>
									<span className='font-semibold text-brand-200 group-hover:text-white transition-colors'>
										+{hours} hour{hours > 1 ? "s" : ""}
									</span>
									<span className='text-brand-400 text-xs font-medium'>
										Until{" "}
										{new Date(
											new Date(auction.endTime).getTime() +
												hours * 60 * 60 * 1000
										).toLocaleString()}
									</span>
								</button>
							))}
						</div>
						<div className='flex justify-end'>
							<button
								onClick={() => setShowExtendModal(false)}
								className='px-5 py-2.5 bg-[#1e293b] text-brand-200 font-medium rounded-lg hover:bg-[#334155] hover:text-white transition-colors'>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Edit Modal - Using shared component */}
			<EditAuctionModal
				auction={auction}
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
				onSave={handleEditSave}
			/>
		</div>
	);
}
