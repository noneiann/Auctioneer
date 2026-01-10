"use client";
import React, { useEffect, useState } from "react";
import { auctionApi } from "@/lib/AuctionApi";
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

interface AuctionData {
	id: string;
	title: string;
	description: string;
	startingBid: number;
	currentBid: number;
	endTime: string;
	createdAt: string;
	status: "active" | "ended";
	item: {
		id: string;
		name: string;
		description: string;
		imageUrl: string[];
	};
	bids: Array<{
		id: string;
		amount: number;
		bidder: {
			username: string;
		};
		createdAt: string;
	}>;
}

export default function AuctionInfo({ id }: AuctionInfoProps) {
	const [auction, setAuction] = useState<AuctionData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showExtendModal, setShowExtendModal] = useState(false);

	const fetchAuction = async () => {
		try {
			setLoading(true);
			console.log("Fetching auction with ID:", id);
			const response = await auctionApi.getAuctionById(id);
			console.log("Auction response:", response);
			setAuction(response.data);
		} catch (err: any) {
			console.error("Error fetching auction:", err);
			setError(err.message);

			// For debugging: Create mock data when API fails
			console.log("Using mock data for debugging");
			setAuction({
				id: id,
				title: "Mock Auction Title",
				description: "Mock auction description",
				startingBid: 100,
				currentBid: 150,
				endTime: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
				createdAt: new Date().toISOString(),
				status: "active",
				item: {
					id: "mock-item-id",
					name: "Mock Item Name",
					description:
						"This is a mock item description for debugging purposes.",
					imageUrl: [],
				},
				bids: [
					{
						id: "bid1",
						amount: 150,
						bidder: { username: "testuser1" },
						createdAt: new Date().toISOString(),
					},
				],
			});
			setError(null); // Clear error to show mock data
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAuction();
	}, [id]);

	const handleEditSave = async (auctionId: string, data: UpdateAuctionData) => {
		try {
			await auctionApi.updateAuction(auctionId, data);
			// Refresh auction data after update
			await fetchAuction();
			setShowEditModal(false);
		} catch (err: any) {
			console.error("Error updating auction:", err);
			throw err;
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-main mx-auto mb-4'></div>
					<p className='text-foreground/60'>Loading auction...</p>
				</div>
			</div>
		);
	}

	if (error || !auction) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center max-w-md'>
					<Package size={48} className='mx-auto text-red-500 mb-4' />
					<h3 className='text-lg font-medium text-foreground mb-2'>
						Error Loading Auction
					</h3>
					<p className='text-red-500 mb-2'>{error || "Auction not found"}</p>
					<p className='text-sm text-foreground/60 mb-4'>
						Trying to load auction ID: {id}
					</p>
					<div className='text-xs text-foreground/40 mb-4'>
						Check the browser console for more details
					</div>
					<Link href='/seller/auctions'>
						<button className='px-4 py-2 bg-main text-white rounded-md hover:bg-main/90 transition-colors'>
							Back to Auctions
						</button>
					</Link>
				</div>
			</div>
		);
	}

	const isActive = new Date(auction.endTime) > new Date();
	const timeLeft = new Date(auction.endTime).getTime() - new Date().getTime();
	const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
	const hoursLeft = Math.floor(
		(timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
	);

	const handleExtendTime = async (additionalHours: number) => {
		try {
			const newEndTime = new Date(
				new Date(auction.endTime).getTime() + additionalHours * 60 * 60 * 1000
			);
			await auctionApi.updateAuction(id, { endTime: newEndTime.toISOString() });
			setAuction((prev) =>
				prev ? { ...prev, endTime: newEndTime.toISOString() } : null
			);
			setShowExtendModal(false);
		} catch (err: any) {
			setError(err.message);
		}
	};

	return (
		<div className='max-w-7xl mx-auto p-6'>
			{/* Header */}
			<div className='flex items-center justify-between mb-8'>
				<div>
					<div className='flex items-center space-x-2 mb-2'>
						<Link href='/seller/auctions' className='text-main hover:underline'>
							My Auctions
						</Link>
						<span className='text-foreground/40'>/</span>
						<span className='text-foreground/60'>{auction.item.name}</span>
					</div>
					<h1 className='text-3xl font-bold text-foreground'>
						{auction.item.name}
					</h1>
					<div className='flex items-center space-x-4 mt-2'>
						<span
							className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
								isActive
									? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
									: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
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
							<span className='text-sm text-foreground/60'>
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
						<button className='px-4 py-2 bg-gray-950 text-foreground rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2'>
							<Eye size={16} />
							<span>View Public</span>
						</button>
					</Link>
					<button
						onClick={() => setShowEditModal(true)}
						className='px-4 py-2 bg-main text-white rounded-lg hover:bg-main/90 transition-colors flex items-center space-x-2'>
						<Edit3 size={16} />
						<span>Edit Info</span>
					</button>
					{isActive && (
						<button
							onClick={() => setShowExtendModal(true)}
							className='px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2'>
							<Clock size={16} />
							<span>Extend Time</span>
						</button>
					)}
				</div>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
				<div className='bg-background border border-foreground/10 rounded-lg p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-foreground/60'>Starting Bid</p>
							<p className='text-2xl font-bold text-foreground flex items-center'>
								<DollarSign size={20} className='mr-1' />
								{auction.startingBid}
							</p>
						</div>
						<TrendingUp className='text-gray-500' size={24} />
					</div>
				</div>
				<div className='bg-background border border-foreground/10 rounded-lg p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-foreground/60'>Current Bid</p>
							<p className='text-2xl font-bold text-green-600 flex items-center'>
								<DollarSign size={20} className='mr-1' />
								{auction.currentBid || auction.startingBid}
							</p>
						</div>
						<DollarSign className='text-green-600' size={24} />
					</div>
				</div>
				<div className='bg-background border border-foreground/10 rounded-lg p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-foreground/60'>Total Bids</p>
							<p className='text-2xl font-bold text-main'>
								{auction.bids?.length || 0}
							</p>
						</div>
						<Users className='text-main' size={24} />
					</div>
				</div>
				<div className='bg-background border border-foreground/10 rounded-lg p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-foreground/60'>Time Remaining</p>
							<p className='text-2xl font-bold text-foreground'>
								{isActive
									? daysLeft > 0
										? `${daysLeft}d`
										: `${hoursLeft}h`
									: "Ended"}
							</p>
						</div>
						<Clock
							className={isActive ? "text-orange-500" : "text-gray-500"}
							size={24}
						/>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* Item Details */}
				<div className='lg:col-span-2 space-y-6'>
					{/* Item Images */}
					<div className='bg-background border border-foreground/10 rounded-lg p-6'>
						<h3 className='text-lg font-semibold text-foreground mb-4'>
							Item Images
						</h3>
						<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
							{auction.item.imageUrl?.length > 0 ? (
								auction.item.imageUrl.map((url, index) => (
									<img
										key={index}
										src={url}
										alt={`${auction.item.name} ${index + 1}`}
										className='w-full h-32 object-cover rounded-lg border border-foreground/10'
										onError={(e) => {
											(e.target as HTMLImageElement).src =
												"https://via.placeholder.com/200?text=No+Image";
										}}
									/>
								))
							) : (
								<div className='col-span-full flex items-center justify-center h-32 bg-foreground/5 rounded-lg'>
									<Package size={32} className='text-foreground/40' />
									<span className='ml-2 text-foreground/60'>
										No images available
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Item Description */}
					<div className='bg-background border border-foreground/10 rounded-lg p-6'>
						<h3 className='text-lg font-semibold text-foreground mb-4'>
							Description
						</h3>
						<p className='text-foreground/80 leading-relaxed'>
							{auction.item.description || "No description available."}
						</p>
					</div>

					{/* Auction Details */}
					<div className='bg-background border border-foreground/10 rounded-lg p-6'>
						<h3 className='text-lg font-semibold text-foreground mb-4'>
							Auction Details
						</h3>
						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<span className='text-foreground/60'>Created:</span>
								<span className='text-foreground flex items-center'>
									<Calendar size={14} className='mr-2' />
									{new Date(auction.createdAt).toLocaleDateString()}
								</span>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-foreground/60'>Ends:</span>
								<span className='text-foreground flex items-center'>
									<Clock size={14} className='mr-2' />
									{new Date(auction.endTime).toLocaleString()}
								</span>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-foreground/60'>Auction ID:</span>
								<span className='text-foreground font-mono text-sm'>
									{auction.id}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Bids Section */}
				<div className='space-y-6'>
					<div className='bg-background border border-foreground/10 rounded-lg p-6'>
						<h3 className='text-lg font-semibold text-foreground mb-4'>
							Recent Bids
						</h3>
						{auction.bids && auction.bids.length > 0 ? (
							<div className='space-y-3 max-h-96 overflow-y-auto'>
								{auction.bids
									.sort(
										(a, b) =>
											new Date(b.createdAt).getTime() -
											new Date(a.createdAt).getTime()
									)
									.map((bid) => (
										<div
											key={bid.id}
											className='flex items-center justify-between p-3 bg-foreground/5 rounded-lg'>
											<div>
												<p className='font-medium text-foreground'>
													{bid.bidder.username}
												</p>
												<p className='text-sm text-foreground/60'>
													{new Date(bid.createdAt).toLocaleString()}
												</p>
											</div>
											<div className='text-right'>
												<p className='font-bold text-main flex items-center'>
													<DollarSign size={14} className='mr-1' />
													{bid.amount}
												</p>
											</div>
										</div>
									))}
							</div>
						) : (
							<div className='text-center py-8'>
								<Users size={32} className='mx-auto text-foreground/20 mb-2' />
								<p className='text-foreground/60'>No bids yet</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Extend Time Modal */}
			{showExtendModal && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
					<div className='bg-background rounded-lg p-6 max-w-md w-full mx-4'>
						<h3 className='text-lg font-semibold text-foreground mb-4'>
							Extend Auction Time
						</h3>
						<p className='text-foreground/60 mb-6'>
							Choose how many hours to extend the auction:
						</p>
						<div className='space-y-3'>
							{[1, 6, 12, 24, 48].map((hours) => (
								<button
									key={hours}
									onClick={() => handleExtendTime(hours)}
									className='w-full p-3 text-left border border-foreground/10 rounded-lg hover:bg-foreground/5 transition-colors'>
									<span className='font-medium'>
										+{hours} hour{hours > 1 ? "s" : ""}
									</span>
									<span className='text-foreground/60 ml-2'>
										(Until{" "}
										{new Date(
											new Date(auction.endTime).getTime() +
												hours * 60 * 60 * 1000
										).toLocaleString()}
										)
									</span>
								</button>
							))}
						</div>
						<div className='flex space-x-3 mt-6'>
							<button
								onClick={() => setShowExtendModal(false)}
								className='flex-1 px-4 py-2 border border-foreground/20 text-foreground rounded-lg hover:bg-foreground/5 transition-colors'>
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
