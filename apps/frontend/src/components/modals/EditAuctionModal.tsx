"use client";
import { X, DollarSign, Calendar, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type UpdateAuctionData = {
	itemName?: string;
	description?: string;
	startingBid?: number;
	category?: string;
	imageUrl?: string | string[];
	endTime?: string;
};

interface EditAuctionModalProps {
	auction: any;
	isOpen: boolean;
	onClose: () => void;
	onSave: (id: string, data: UpdateAuctionData) => Promise<void>;
}

export default function EditAuctionModal({
	auction,
	isOpen,
	onClose,
	onSave,
}: EditAuctionModalProps) {
	const [formData, setFormData] = useState<UpdateAuctionData>({
		itemName: "",
		description: "",
		startingBid: 0,
		category: "",
		imageUrl: "",
		endTime: "",
	});
	const [newImageUrl, setNewImageUrl] = useState("");
	const [imageUrls, setImageUrls] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (auction) {
			const existingImages = auction.item?.imageUrl || [];
			setImageUrls(existingImages);
			setFormData({
				itemName: auction.item?.name || "",
				description: auction.item?.description || "",
				startingBid: auction.startingBid || 0,
				category: auction.category || "",
				imageUrl: existingImages,
				endTime: auction.endTime
					? new Date(auction.endTime).toISOString().slice(0, 16)
					: "",
			});
		}
	}, [auction]);

	const handleAddImage = () => {
		if (newImageUrl.trim()) {
			const updatedUrls = [...imageUrls, newImageUrl.trim()];
			setImageUrls(updatedUrls);
			setFormData({ ...formData, imageUrl: updatedUrls });
			setNewImageUrl("");
		}
	};

	const handleRemoveImage = (index: number) => {
		const updatedUrls = imageUrls.filter((_, i) => i !== index);
		setImageUrls(updatedUrls);
		setFormData({ ...formData, imageUrl: updatedUrls });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await onSave(auction.id, formData);
			onClose();
		} catch (error) {
			console.error("Failed to update auction:", error);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	const isActive = auction?.endTime
		? new Date(auction.endTime) > new Date()
		: false;

	const modalContent = (
		<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]'>
			<div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4'>
				<div className='flex justify-between items-center mb-6'>
					<h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
						Edit Auction Details
					</h2>
					<button
						onClick={onClose}
						className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'>
						<X className='w-5 h-5' />
					</button>
				</div>

				<form onSubmit={handleSubmit} className='space-y-6'>
					{/* Item Name */}
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Item Name
						</label>
						<input
							type='text'
							value={formData.itemName}
							onChange={(e) =>
								setFormData({ ...formData, itemName: e.target.value })
							}
							className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							placeholder='Enter item name'
							required
						/>
					</div>

					{/* Item Description */}
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Item Description
						</label>
						<textarea
							rows={4}
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
							placeholder='Describe your item in detail'
							required
						/>
					</div>

					{/* Starting Bid */}
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Starting Bid
						</label>
						<div className='relative'>
							<DollarSign
								size={16}
								className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
							/>
							<input
								type='number'
								step='0.01'
								min='0'
								value={formData.startingBid}
								onChange={(e) =>
									setFormData({
										...formData,
										startingBid: parseFloat(e.target.value),
									})
								}
								className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='0.00'
								required
							/>
						</div>
						<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
							Note: This can only be changed if there are no bids yet
						</p>
					</div>

					{/* Auction End Time */}
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Auction End Time
						</label>
						<div className='relative'>
							<Calendar
								size={16}
								className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
							/>
							<input
								type='datetime-local'
								value={formData.endTime}
								onChange={(e) =>
									setFormData({ ...formData, endTime: e.target.value })
								}
								className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>
						<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
							You can extend the auction time, but not shorten it
						</p>
					</div>

					{/* Image URLs */}
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Item Images
						</label>
						<div className='space-y-3'>
							{/* Current Images Preview */}
							{imageUrls.length > 0 && (
								<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
									{imageUrls.map((url, index) => (
										<div key={index} className='relative group'>
											<img
												src={url}
												alt={`Item image ${index + 1}`}
												className='w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600'
												onError={(e) => {
													(e.target as HTMLImageElement).src =
														"https://via.placeholder.com/100?text=Error";
												}}
											/>
											<button
												type='button'
												onClick={() => handleRemoveImage(index)}
												className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity'>
												×
											</button>
										</div>
									))}
								</div>
							)}

							{/* Add New Image URL */}
							<div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4'>
								<div className='text-center'>
									<Package
										size={32}
										className='mx-auto text-gray-400 dark:text-gray-500 mb-2'
									/>
									<p className='text-sm text-gray-500 dark:text-gray-400 mb-3'>
										Add image URL
									</p>
									<div className='space-y-2'>
										<input
											type='url'
											value={newImageUrl}
											onChange={(e) => setNewImageUrl(e.target.value)}
											className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
											placeholder='https://example.com/image.jpg'
										/>
										<button
											type='button'
											onClick={handleAddImage}
											className='w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm'>
											Add Image URL
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Current Auction Status Info */}
					<div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
						<h4 className='font-medium text-gray-900 dark:text-white mb-3'>
							Auction Status
						</h4>
						<div className='grid grid-cols-2 gap-4 text-sm'>
							<div>
								<span className='text-gray-500 dark:text-gray-400'>
									Current Bid:
								</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									${auction?.currentBid || auction?.startingBid}
								</p>
							</div>
							<div>
								<span className='text-gray-500 dark:text-gray-400'>
									Total Bids:
								</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{auction?.bids?.length || 0}
								</p>
							</div>
							<div>
								<span className='text-gray-500 dark:text-gray-400'>
									Status:
								</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{isActive ? "Active" : "Ended"}
								</p>
							</div>
							<div>
								<span className='text-gray-500 dark:text-gray-400'>
									Created:
								</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{auction?.createdAt
										? new Date(auction.createdAt).toLocaleDateString()
										: "N/A"}
								</p>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className='flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600'>
						<button
							type='button'
							onClick={onClose}
							className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
							Cancel
						</button>
						<button
							type='submit'
							disabled={loading}
							className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'>
							{loading ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);

	// Use portal to render modal at document body level to avoid overflow issues
	if (typeof document !== "undefined") {
		return createPortal(modalContent, document.body);
	}

	return modalContent;
}
