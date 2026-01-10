"use client";
import { useState } from "react";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";
import { Gavel, TrendingUp, Users, Wifi, WifiOff } from "lucide-react";

interface LiveBiddingProps {
	auctionId: string;
}

export default function LiveBidding({ auctionId }: LiveBiddingProps) {
	const { auctionState, recentBids, error, isBidding, placeBid, isConnected } =
		useAuctionSocket(auctionId);

	const [bidAmount, setBidAmount] = useState<number>(0);

	const handlePlaceBid = (e: React.FormEvent) => {
		e.preventDefault();
		if (bidAmount > 0) {
			placeBid(bidAmount);
		}
	};

	const currentBid =
		auctionState?.auction?.currentBid ||
		auctionState?.auction?.startingBid ||
		0;
	const minBid = currentBid + 1;

	return (
		<div className='space-y-4'>
			{/* Connection Status */}
			<div className='flex items-center gap-2 text-sm'>
				{isConnected ? (
					<>
						<Wifi className='w-4 h-4 text-green-600' />
						<span className='text-green-600'>Live</span>
					</>
				) : (
					<>
						<WifiOff className='w-4 h-4 text-gray-400' />
						<span className='text-gray-400'>Connecting...</span>
					</>
				)}
				{auctionState && (
					<span className='text-gray-500 ml-2'>
						<Users className='w-4 h-4 inline mr-1' />
						{auctionState.participantCount} watching
					</span>
				)}
			</div>

			{/* Current Bid Display */}
			<div className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-sm text-gray-600 dark:text-gray-400'>
							Current Bid
						</p>
						<p className='text-4xl font-bold text-gray-900 dark:text-white'>
							${currentBid.toFixed(2)}
						</p>
						{recentBids.length > 0 && (
							<p className='text-sm text-gray-500 mt-1'>
								by {recentBids[0].bidder.firstName}{" "}
								{recentBids[0].bidder.lastName}
							</p>
						)}
					</div>
					<TrendingUp className='w-12 h-12 text-blue-600' />
				</div>
			</div>

			{/* Bid Form */}
			{auctionState?.isActive && (
				<form onSubmit={handlePlaceBid} className='space-y-4'>
					<div>
						<label
							htmlFor='bidAmount'
							className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Your Bid (min: ${minBid})
						</label>
						<div className='flex gap-2'>
							<div className='relative flex-1'>
								<span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
									$
								</span>
								<input
									type='number'
									id='bidAmount'
									step='0.01'
									min={minBid}
									value={bidAmount || ""}
									onChange={(e) => setBidAmount(parseFloat(e.target.value))}
									className='w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
									placeholder={minBid.toString()}
									disabled={isBidding || !isConnected}
								/>
							</div>
							<button
								type='submit'
								disabled={isBidding || !isConnected || bidAmount < minBid}
								className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium'>
								<Gavel className='w-4 h-4' />
								{isBidding ? "Placing..." : "Place Bid"}
							</button>
						</div>
						<div className='flex gap-2 mt-2'>
							<button
								type='button'
								onClick={() => setBidAmount(currentBid + 10)}
								className='px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600'>
								+$10
							</button>
							<button
								type='button'
								onClick={() => setBidAmount(currentBid + 50)}
								className='px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600'>
								+$50
							</button>
							<button
								type='button'
								onClick={() => setBidAmount(currentBid + 100)}
								className='px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600'>
								+$100
							</button>
						</div>
					</div>

					{error && (
						<div className='p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm'>
							{error}
						</div>
					)}
				</form>
			)}

			{!auctionState?.isActive && auctionState && (
				<div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center'>
					<p className='text-gray-600 dark:text-gray-400'>
						This auction has ended
					</p>
				</div>
			)}

			{/* Recent Bids */}
			<div className='border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'>
				<div className='bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
					<h3 className='font-medium text-gray-900 dark:text-white'>
						Recent Bids ({recentBids.length})
					</h3>
				</div>
				<div className='divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto'>
					{recentBids.length === 0 ? (
						<div className='p-4 text-center text-gray-500 dark:text-gray-400'>
							No bids yet. Be the first to bid!
						</div>
					) : (
						recentBids.map((bid) => (
							<div
								key={bid.id}
								className='p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50'>
								<div>
									<p className='font-medium text-gray-900 dark:text-white'>
										{bid.bidder.firstName} {bid.bidder.lastName}
									</p>
									<p className='text-xs text-gray-500 dark:text-gray-400'>
										{new Date(bid.createdAt).toLocaleString()}
									</p>
								</div>
								<p className='text-lg font-bold text-blue-600 dark:text-blue-400'>
									${bid.amount.toFixed(2)}
								</p>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
