"use client";
import React, { useState } from "react";
import {
	Calendar,
	Clock,
	DollarSign,
	Eye,
	Users,
	Package,
	Edit,
	Trash2,
} from "lucide-react";
import useMyAuctions from "@/hooks/useMyAuctions";
import Link from "next/link";
import EditAuctionModal from "@/components/modals/EditAuctionModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import type { Auction } from "@/lib/AuctionApi";
import Image from "next/image";

type UpdateAuctionData = {
	itemName?: string;
	description?: string;
	startingBid?: number;
	category?: string;
	imageUrl?: string | string[];
};

export default function SellerAuctionsPage() {
	const {
		data: auctions,
		loading,
		error,
		updateAuction,
		deleteAuction,
	} = useMyAuctions();
	const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
	const [deletingAuction, setDeletingAuction] = useState<Auction | null>(null);
	const [actionLoading, setActionLoading] = useState(false);

	const handleEdit = async (id: string, data: UpdateAuctionData) => {
		setActionLoading(true);
		try {
			await updateAuction(id, data);
			setEditingAuction(null);
		} catch (error) {
			console.error("Failed to update auction:", error);
		} finally {
			setActionLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!deletingAuction) return;

		setActionLoading(true);
		try {
			const success = await deleteAuction(deletingAuction.id);
			if (success) {
				setDeletingAuction(null);
			}
		} catch (error) {
			console.error("Failed to delete auction:", error);
		} finally {
			setActionLoading(false);
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4'></div>
					<p className='text-brand-300'>Loading auctions...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<Package size={48} className='mx-auto text-red-500 mb-4' />
					<h3 className='text-lg font-medium text-white mb-2'>
						Error Loading Auctions
					</h3>
					<p className='text-red-500 mb-4'>{error}</p>
					<button
						onClick={() => window.location.reload()}
						className='px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-500 transition-colors'>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<>
			<EditAuctionModal
				auction={editingAuction}
				isOpen={!!editingAuction}
				onClose={() => setEditingAuction(null)}
				onSave={handleEdit}
			/>

			<DeleteConfirmModal
				isOpen={!!deletingAuction}
				onClose={() => setDeletingAuction(null)}
				onConfirm={handleDelete}
				itemName={deletingAuction?.item?.name || "this item"}
				loading={actionLoading}
			/>

			<div className='max-w-7xl mx-auto p-6'>
				{/* Header */}
				<div className='flex items-center justify-between mb-8'>
					<div>
						<h1 className='text-3xl font-bold text-white'>My Auctions</h1>
						<p className='text-brand-300 mt-1'>
							Manage and track your auction listings
						</p>
					</div>
					<Link href='/seller/auctions/create'>
						<button className='px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors flex items-center space-x-2 shadow-sm'>
							<Package size={16} />
							<span>Create Auction</span>
						</button>
					</Link>
				</div>

				{/* Stats Cards */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
					<div className='bg-[#0f172a]/50 border border-[#1e293b] rounded-lg p-4 shadow-sm'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-brand-300'>Total Auctions</p>
								<p className='text-2xl font-bold text-white'>
									{auctions.length}
								</p>
							</div>
							<div className='p-2 bg-[#1e293b]/50 rounded-lg'>
								<Package className='text-brand-400' size={24} />
							</div>
						</div>
					</div>
					<div className='bg-[#0f172a]/50 border border-[#1e293b] rounded-lg p-4 shadow-sm'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-brand-300'>Active</p>
								<p className='text-2xl font-bold text-emerald-400'>
									{
										auctions.filter(
											(auction) => new Date(auction.endTime) > new Date()
										).length
									}
								</p>
							</div>
							<div className='p-2 bg-emerald-900/20 rounded-lg'>
								<Clock className='text-emerald-500' size={24} />
							</div>
						</div>
					</div>
					<div className='bg-[#0f172a]/50 border border-[#1e293b] rounded-lg p-4 shadow-sm'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-brand-300'>Ended</p>
								<p className='text-2xl font-bold text-neutral-400'>
									{
										auctions.filter(
											(auction) => new Date(auction.endTime) <= new Date()
										).length
									}
								</p>
							</div>
							<div className='p-2 bg-[#1e293b]/50 rounded-lg'>
								<Calendar className='text-neutral-500' size={24} />
							</div>
						</div>
					</div>
					<div className='bg-[#0f172a]/50 border border-[#1e293b] rounded-lg p-4 shadow-sm'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-brand-300'>Total Bids</p>
								<p className='text-2xl font-bold text-brand-500'>
									{auctions.reduce(
										(total, auction) => total + (auction.bids?.length || 0),
										0
									)}
								</p>
							</div>
							<div className='p-2 bg-brand-900/20 rounded-lg'>
								<Users className='text-brand-500' size={24} />
							</div>
						</div>
					</div>
				</div>

				{/* Auctions List */}
				{auctions.length === 0 ? (
					<div className='text-center py-12 bg-[#0f172a]/50 border border-[#1e293b] rounded-lg'>
						<Package size={64} className='mx-auto text-[#1e293b] mb-4' />
						<h3 className='text-xl font-medium text-white mb-2'>
							No Auctions Yet
						</h3>
						<p className='text-brand-300 mb-6'>
							Start by creating your first auction
						</p>
						<Link href='/seller/auctions/create'>
							<button className='px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors shadow-sm'>
								Create Your First Auction
							</button>
						</Link>
					</div>
				) : (
					<div className='bg-[#0f172a]/50 border border-[#1e293b] rounded-lg overflow-hidden shadow-sm'>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-[#1e293b]/50 border-b border-[#1e293b]'>
									<tr>
										<th className='px-6 py-4 text-left text-sm font-medium text-brand-300 uppercase tracking-wider'>
											Item
										</th>
										<th className='px-6 py-4 text-left text-sm font-medium text-brand-300 uppercase tracking-wider'>
											Starting Bid
										</th>
										<th className='px-6 py-4 text-left text-sm font-medium text-brand-300 uppercase tracking-wider'>
											Current Bid
										</th>
										<th className='px-6 py-4 text-left text-sm font-medium text-brand-300 uppercase tracking-wider'>
											Bids
										</th>
										<th className='px-6 py-4 text-left text-sm font-medium text-brand-300 uppercase tracking-wider'>
											Status
										</th>
										<th className='px-6 py-4 text-left text-sm font-medium text-brand-300 uppercase tracking-wider'>
											End Time
										</th>
										<th className='px-6 py-4 text-left text-sm font-medium text-brand-300 uppercase tracking-wider'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-[#1e293b]'>
									{auctions.map((auction) => {
										const isActive = new Date(auction.endTime) > new Date();
										const hasImage =
											auction.item?.imageUrl &&
											auction.item.imageUrl.length > 0;

										return (
											<tr
												key={auction.id}
												className='hover:bg-[#1e293b]/30 transition-colors cursor-pointer group'>
												<td className='px-6 py-4'>
													<Link
														href={`/seller/auctions/${auction.id}`}
														className='block'>
														<div className='flex items-center space-x-3'>
															{hasImage ? (
																<Image
																	src={auction.item.imageUrl[0]}
																	alt={auction.item?.name || "Item"}
																	width={48}
																	height={48}
																	className='object-cover rounded-lg border border-[#1e293b]'
																/>
															) : (
																<div className='w-12 h-12 bg-[#1e293b]/50 rounded-lg flex items-center justify-center border border-[#1e293b]'>
																	<Package
																		size={20}
																		className='text-brand-400/50'
																	/>
																</div>
															)}
															<div>
																<p className='font-medium text-white group-hover:text-brand-400 transition-colors'>
																	{auction.item?.name || "Unnamed Item"}
																</p>
																<p className='text-sm text-brand-400 truncate max-w-xs'>
																	{auction.item?.description ||
																		"No description"}
																</p>
															</div>
														</div>
													</Link>
												</td>
												<td className='px-6 py-4'>
													<div className='flex items-center text-white'>
														<DollarSign size={16} className='mr-1 text-brand-400' />
														<span className='font-medium font-mono'>
															{auction.startingBid}
														</span>
													</div>
												</td>
												<td className='px-6 py-4'>
													<div className='flex items-center text-white'>
														<DollarSign size={16} className='mr-1 text-emerald-500' />
														<span className='font-medium font-mono text-emerald-400'>
															{auction.currentBid || auction.startingBid}
														</span>
													</div>
												</td>
												<td className='px-6 py-4'>
													<div className='flex items-center text-white text-sm font-medium'>
														<Users
															size={16}
															className='mr-2 text-brand-400'
														/>
														<span>
															{auction.bids?.length || 0}
														</span>
													</div>
												</td>
												<td className='px-6 py-4'>
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
															isActive
																? "bg-emerald-900/30 text-emerald-400 border border-emerald-900/50"
																: "bg-[#1e293b]/50 text-neutral-400 border border-[#1e293b]"
														}`}>
														{isActive ? "Active" : "Ended"}
													</span>
												</td>
												<td className='px-6 py-4'>
													<div className='flex items-center text-sm font-medium text-brand-300'>
														<Calendar size={14} className='mr-2 text-brand-500' />
														<span>
															{new Date(auction.endTime).toLocaleDateString()}
														</span>
													</div>
												</td>
												<td className='px-6 py-4'>
													<div className='flex items-center space-x-2'>
														<Link href={`/seller/auctions/${auction.id}`}>
															<button
																className='p-2 bg-[#1e293b]/50 border border-[#1e293b] text-brand-300 rounded-lg hover:text-white hover:bg-brand-600 hover:border-brand-500 transition-all shadow-sm'
																title='View Details'>
																<Eye size={16} />
															</button>
														</Link>
														<button
															className='p-2 bg-[#1e293b]/50 border border-[#1e293b] text-brand-300 rounded-lg hover:text-white hover:bg-brand-600 hover:border-brand-500 transition-all shadow-sm'
															onClick={(e) => {
																e.preventDefault();
																setEditingAuction(auction);
															}}
															title='Edit Auction'>
															<Edit size={16} />
														</button>
														<button
															className='p-2 bg-[#1e293b]/50 border border-[#1e293b] text-brand-300 rounded-lg hover:text-white hover:bg-red-600 hover:border-red-500 transition-all shadow-sm'
															onClick={(e) => {
																e.preventDefault();
																setDeletingAuction(auction);
															}}
															title='Delete Auction'>
															<Trash2 size={16} />
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
