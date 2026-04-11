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
					<Wifi className='w-4 h-4 text-live' />
					<span className='text-live'>Live</span>
					</>
				) : (
					<>
						<WifiOff className='w-4 h-4 text-neutral-400' />
						<span className='text-neutral-400'>Connecting...</span>
					</>
				)}
				{auctionState && (
					<span className='text-neutral-500 ml-2'>
						<Users className='w-4 h-4 inline mr-1' />
						{auctionState.participantCount} watching
					</span>
				)}
			</div>

			{/* Current Bid Display */}
			<div className='bg-gradient-to-r from-brand-50 to-brand-100 p-6 rounded-lg border border-brand-200'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-sm text-neutral-600'>
							Current Bid
						</p>
						<p className='text-4xl font-bold text-foreground'>
							${currentBid.toFixed(2)}
						</p>
						{recentBids.length > 0 && (
							<p className='text-sm text-neutral-500 mt-1'>
								by {recentBids[0].bidder?.firstName || "Anonymous"}{" "}
								{recentBids[0].bidder?.lastName || ""}
							</p>
						)}
					</div>
					<TrendingUp className='w-12 h-12 text-brand-500' />
				</div>
			</div>

			{/* Bid Form */}
			{auctionState?.isActive && (
				<form onSubmit={handlePlaceBid} className='space-y-4'>
					<div>
						<label
							htmlFor='bidAmount'
						className='block text-sm font-medium text-neutral-600 mb-2'>
							Your Bid (min: ${minBid})
						</label>
						<div className='flex gap-2'>
							<div className='relative flex-1'>
								<span className='absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500'>
									$
								</span>
								<input
									type='number'
									id='bidAmount'
									step='0.01'
									min={minBid}
									value={bidAmount || ""}
									onChange={(e) => setBidAmount(parseFloat(e.target.value))}
									className='w-full pl-8 pr-3 py-2 border border-border rounded-lg bg-neutral-50 text-foreground focus:ring-2 focus:ring-brand-500'
									placeholder={minBid.toString()}
									disabled={isBidding || !isConnected}
								/>
							</div>
							<button
								type='submit'
								disabled={isBidding || !isConnected || bidAmount < minBid}
								className='px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium'>
								<Gavel className='w-4 h-4' />
								{isBidding ? "Placing..." : "Place Bid"}
							</button>
						</div>
						<div className='flex gap-2 mt-2'>
							<button
								type='button'
								onClick={() => setBidAmount(currentBid + 10)}
								className='px-3 py-1 text-sm bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300'>
								+$10
							</button>
							<button
								type='button'
								onClick={() => setBidAmount(currentBid + 50)}
								className='px-3 py-1 text-sm bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300'>
								+$50
							</button>
							<button
								type='button'
								onClick={() => setBidAmount(currentBid + 100)}
								className='px-3 py-1 text-sm bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300'>
								+$100
							</button>
						</div>
					</div>

					{error && (
						<div className='p-3 bg-danger/10 text-danger rounded-lg text-sm'>
							{error}
						</div>
					)}
				</form>
			)}

			{!auctionState?.isActive && auctionState && (
				<div className='p-4 bg-neutral-100 rounded-lg text-center'>
					<p className='text-neutral-600'>
						This auction has ended
					</p>
				</div>
			)}

			{/* Recent Bids */}
			<div className='border border-border rounded-lg overflow-hidden'>
				<div className='bg-neutral-50 px-4 py-3 border-b border-border'>
					<h3 className='font-medium text-foreground'>
						Recent Bids ({recentBids.length})
					</h3>
				</div>
				<div className='divide-y divide-border max-h-64 overflow-y-auto'>
					{recentBids.length === 0 ? (
						<div className='p-4 text-center text-neutral-500'>
							No bids yet. Be the first to bid!
						</div>
					) : (
						recentBids.map((bid) => (
							<div
								key={bid.id}
								className='p-3 flex items-center justify-between hover:bg-neutral-50'>
								<div>
									<p className='font-medium text-foreground'>
										{bid.bidder?.firstName || "Anonymous"} {bid.bidder?.lastName || ""}
									</p>
									<p className='text-xs text-neutral-500'>
										{new Date(bid.createdAt).toLocaleString()}
									</p>
								</div>
								<p className='text-lg font-bold text-brand-500'>
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
