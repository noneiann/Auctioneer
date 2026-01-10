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
	const [editingAuction, setEditingAuction] = useState<any>(null);
	const [deletingAuction, setDeletingAuction] = useState<any>(null);
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
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-main mx-auto mb-4'></div>
					<p className='text-foreground/60'>Loading auctions...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<Package size={48} className='mx-auto text-red-500 mb-4' />
					<h3 className='text-lg font-medium text-foreground mb-2'>
						Error Loading Auctions
					</h3>
					<p className='text-red-500 mb-4'>{error}</p>
					<button
						onClick={() => window.location.reload()}
						className='px-4 py-2 bg-main text-white rounded-md hover:bg-main/90 transition-colors'>
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
						<h1 className='text-3xl font-bold text-foreground'>My Auctions</h1>
						<p className='text-foreground/60 mt-1'>
							Manage and track your auction listings
						</p>
					</div>
					<Link href='/seller/auctions/create'>
						<button className='px-4 py-2 bg-main text-white rounded-lg hover:bg-main/90 transition-colors flex items-center space-x-2'>
							<Package size={16} />
							<span>Create Auction</span>
						</button>
					</Link>
				</div>

				{/* Stats Cards */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
					<div className='bg-background border border-foreground/10 rounded-lg p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-foreground/60'>Total Auctions</p>
								<p className='text-2xl font-bold text-foreground'>
									{auctions.length}
								</p>
							</div>
							<Package className='text-main' size={24} />
						</div>
					</div>
					<div className='bg-background border border-foreground/10 rounded-lg p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-foreground/60'>Active</p>
								<p className='text-2xl font-bold text-green-600'>
									{
										auctions.filter(
											(auction) => new Date(auction.endTime) > new Date()
										).length
									}
								</p>
							</div>
							<Clock className='text-green-600' size={24} />
						</div>
					</div>
					<div className='bg-background border border-foreground/10 rounded-lg p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-foreground/60'>Ended</p>
								<p className='text-2xl font-bold text-gray-600'>
									{
										auctions.filter(
											(auction) => new Date(auction.endTime) <= new Date()
										).length
									}
								</p>
							</div>
							<Calendar className='text-gray-600' size={24} />
						</div>
					</div>
					<div className='bg-background border border-foreground/10 rounded-lg p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-foreground/60'>Total Bids</p>
								<p className='text-2xl font-bold text-main'>
									{auctions.reduce(
										(total, auction) => total + (auction.bids?.length || 0),
										0
									)}
								</p>
							</div>
							<Users className='text-main' size={24} />
						</div>
					</div>
				</div>

				{/* Auctions List */}
				{auctions.length === 0 ? (
					<div className='text-center py-12 bg-background border border-foreground/10 rounded-lg'>
						<Package size={64} className='mx-auto text-foreground/20 mb-4' />
						<h3 className='text-xl font-medium text-foreground mb-2'>
							No Auctions Yet
						</h3>
						<p className='text-foreground/60 mb-6'>
							Start by creating your first auction
						</p>
						<Link href='/seller/auctions/create'>
							<button className='px-6 py-3 bg-main text-white rounded-lg hover:bg-main/90 transition-colors'>
								Create Your First Auction
							</button>
						</Link>
					</div>
				) : (
					<div className='bg-background border border-foreground/10 rounded-lg overflow-hidden'>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-foreground/5 border-b border-foreground/10'>
									<tr>
										<th className='px-6 py-4 text-left text-sm font-medium text-foreground/70'>
											Item
										</th>
										<th className='px-6 py-4 text-left text-sm font-medium text-foreground/70'>
											Starting Bid
										</th>
										<th className='px-6 py-4 text-left text-sm font-medium text-foreground/70'>
											Current Bid
										</th>
										<th className='px-6 py-4 text-left text-sm font-medium text-foreground/70'>
											Bids
										</th>
										<th className='px-6 py-4 text-left text-sm font-medium text-foreground/70'>
											Status
										</th>
										<th className='px-6 py-4 text-left text-sm font-medium text-foreground/70'>
											End Time
										</th>
										<th className='px-6 py-4 text-left text-sm font-medium text-foreground/70'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-foreground/10'>
									{auctions.map((auction) => {
										const isActive = new Date(auction.endTime) > new Date();
										const hasImage =
											auction.item?.imageUrl &&
											auction.item.imageUrl.length > 0;

										return (
											<tr
												key={auction.id}
												className='hover:bg-foreground/5 transition-colors cursor-pointer'
												onClick={() =>
													(window.location.href = `/seller/auctions/${auction.id}`)
												}>
												<td className='px-6 py-4'>
													<Link
														href={`/seller/auctions/${auction.id}`}
														className='block'>
														<div className='flex items-center space-x-3'>
															{hasImage ? (
																<img
																	src={auction.item.imageUrl[0]}
																	alt={auction.item?.name || "Item"}
																	className='w-12 h-12 object-cover rounded-lg border border-foreground/10'
																	onError={(e) => {
																		(e.target as HTMLImageElement).src =
																			"https://via.placeholder.com/48?text=No+Image";
																	}}
																/>
															) : (
																<div className='w-12 h-12 bg-foreground/10 rounded-lg flex items-center justify-center'>
																	<Package
																		size={20}
																		className='text-foreground/40'
																	/>
																</div>
															)}
															<div>
																<p className='font-medium text-foreground'>
																	{auction.item?.name || "Unnamed Item"}
																</p>
																<p className='text-sm text-foreground/60 truncate max-w-xs'>
																	{auction.item?.description ||
																		"No description"}
																</p>
															</div>
														</div>
													</Link>
												</td>
												<td className='px-6 py-4'>
													<div className='flex items-center text-foreground'>
														<DollarSign size={16} className='mr-1' />
														<span className='font-medium'>
															{auction.startingBid}
														</span>
													</div>
												</td>
												<td className='px-6 py-4'>
													<div className='flex items-center text-foreground'>
														<DollarSign size={16} className='mr-1' />
														<span className='font-medium'>
															{auction.currentBid || auction.startingBid}
														</span>
													</div>
												</td>
												<td className='px-6 py-4'>
													<div className='flex items-center'>
														<Users
															size={16}
															className='mr-2 text-foreground/60'
														/>
														<span className='text-foreground'>
															{auction.bids?.length || 0}
														</span>
													</div>
												</td>
												<td className='px-6 py-4'>
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															isActive
																? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
																: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
														}`}>
														{isActive ? "Active" : "Ended"}
													</span>
												</td>
												<td className='px-6 py-4'>
													<div className='flex items-center text-sm text-foreground/60'>
														<Calendar size={14} className='mr-2' />
														<span>
															{new Date(auction.endTime).toLocaleDateString()}
														</span>
													</div>
												</td>
												<td className='px-6 py-4'>
													<div className='flex items-center space-x-2'>
														<Link href={`/seller/auctions/${auction.id}`}>
															<button
																className='p-2 text-foreground/60 hover:text-main transition-colors'
																onClick={(e) => e.stopPropagation()}
																title='View Details'>
																<Eye size={16} />
															</button>
														</Link>
														<button
															className='p-2 text-foreground/60 hover:text-blue-600 transition-colors'
															onClick={(e) => {
																e.stopPropagation();
																setEditingAuction(auction);
															}}
															title='Edit Auction'>
															<Edit size={16} />
														</button>
														<button
															className='p-2 text-foreground/60 hover:text-red-600 transition-colors'
															onClick={(e) => {
																e.stopPropagation();
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
