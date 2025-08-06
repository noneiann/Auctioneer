"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Calendar,
	Clock,
	DollarSign,
	FileText,
	Image,
	Tag,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ItemType } from "@auctioneer/types";

interface CreateAuctionFormData {
	// Item fields
	title: string;
	description: string;
	imageUrl: string[];
	type: ItemType;
	price: string;

	// Auction fields
	startingBid: string;
	startTime: string;
	endTime: string;
}

export default function CreateAuctionForm() {
	const router = useRouter();
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	const [form, setForm] = useState<CreateAuctionFormData>({
		title: "",
		description: "",
		imageUrl: [],
		type: "AUCTION" as ItemType,
		price: "",
		startingBid: "",
		startTime: "",
		endTime: "",
	});

	const [imageInput, setImageInput] = useState("");
	const [error, setError] = useState("");

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const addImageUrl = () => {
		if (imageInput && imageInput.trim()) {
			setForm({
				...form,
				imageUrl: [...form.imageUrl, imageInput.trim()],
			});
			setImageInput("");
		}
	};

	const removeImage = (index: number) => {
		const newImages = [...form.imageUrl];
		newImages.splice(index, 1);
		setForm({ ...form, imageUrl: newImages });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		if (!user) {
			setError("You must be logged in to create an auction");
			setIsLoading(false);
			return;
		}

		if (form.imageUrl.length === 0) {
			setError("Please add at least one image");
			setIsLoading(false);
			return;
		}

		const startDate = new Date(form.startTime);
		const endDate = new Date(form.endTime);

		if (endDate <= startDate) {
			setError("End time must be after start time");
			setIsLoading(false);
			return;
		}

		try {
			const token = localStorage.getItem("token");
			if (!token) {
				throw new Error("No authentication token found");
			}

			const response = await fetch("http://localhost:4000/auctions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					// Item data
					title: form.title,
					description: form.description,
					imageUrl: form.imageUrl,
					type: form.type,
					price: parseFloat(form.price) || 0,

					// Auction data
					startingBid: parseFloat(form.startingBid),
					startTime: startDate.toISOString(),
					endTime: endDate.toISOString(),
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.data || "Failed to create auction");
			}

			router.push("/auctions");
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-sm'>
			<h1 className='text-3xl font-light mb-8 text-gray-800 dark:text-gray-100'>
				Create New Auction
			</h1>

			{error && (
				<div className='mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400'>
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Item Information */}
				<div className='border-b border-gray-200 dark:border-gray-700 pb-6'>
					<h2 className='text-lg font-medium mb-4 text-gray-700 dark:text-gray-300'>
						Item Information
					</h2>

					<div className='space-y-4'>
						<div className='space-y-2'>
							<label className='flex items-center text-sm text-gray-600 dark:text-gray-300'>
								<Tag size={16} className='mr-2' />
								Item Name
							</label>
							<input
								type='text'
								name='title'
								value={form.title}
								onChange={handleChange}
								placeholder="E.g., 'Vintage Camera' or 'Gaming Laptop'"
								className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								required
							/>
						</div>

						<div className='space-y-2'>
							<label className='flex items-center text-sm text-gray-600 dark:text-gray-300'>
								<FileText size={16} className='mr-2' />
								Description
							</label>
							<textarea
								name='description'
								value={form.description}
								onChange={handleChange}
								placeholder='Detailed description of the item'
								className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								required
							/>
						</div>

						<div className='space-y-2'>
							<label className='flex items-center text-sm text-gray-600 dark:text-gray-300'>
								<Image size={16} className='mr-2' />
								Images
							</label>
							<div className='flex space-x-2'>
								<input
									type='url'
									value={imageInput}
									onChange={(e) => setImageInput(e.target.value)}
									placeholder='Enter image URL'
									className='flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
								/>
								<button
									type='button'
									onClick={addImageUrl}
									className='px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'>
									Add
								</button>
							</div>

							{form.imageUrl.length > 0 && (
								<div className='mt-3 grid grid-cols-4 gap-2'>
									{form.imageUrl.map((url, index) => (
										<div key={index} className='relative group'>
											<img
												src={url}
												alt={`Item ${index + 1}`}
												className='w-full h-20 object-cover rounded-md border border-gray-200 dark:border-gray-700'
												onError={(e) => {
													(e.target as HTMLImageElement).src =
														"https://via.placeholder.com/80?text=Error";
												}}
											/>
											<button
												type='button'
												onClick={() => removeImage(index)}
												className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity'>
												×
											</button>
										</div>
									))}
								</div>
							)}
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<label className='text-sm text-gray-600 dark:text-gray-300'>
									Type
								</label>
								<select
									name='type'
									value={form.type}
									onChange={handleChange}
									className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
									required>
									<option value='AUCTION'>Auction</option>
									<option value='DIRECT'>Direct Sale</option>
									<option value='BARTER'>Barter</option>
								</select>
							</div>

							<div className='space-y-2'>
								<label className='flex items-center text-sm text-gray-600 dark:text-gray-300'>
									<DollarSign size={16} className='mr-2' />
									Estimated Value
								</label>
								<input
									type='number'
									name='price'
									value={form.price}
									onChange={handleChange}
									placeholder='0.00'
									className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
									min='0'
									step='0.01'
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Auction Settings */}
				<div className='space-y-4'>
					<h2 className='text-lg font-medium text-gray-700 dark:text-gray-300'>
						Auction Settings
					</h2>

					<div className='space-y-2'>
						<label className='flex items-center text-sm text-gray-600 dark:text-gray-300'>
							<DollarSign size={16} className='mr-2' />
							Starting Bid
						</label>
						<input
							type='number'
							name='startingBid'
							value={form.startingBid}
							onChange={handleChange}
							placeholder='Minimum bid amount'
							className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
							required
							min='0'
							step='0.01'
						/>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<label className='flex items-center text-sm text-gray-600 dark:text-gray-300'>
								<Calendar size={16} className='mr-2' />
								Start Time
							</label>
							<input
								type='datetime-local'
								name='startTime'
								value={form.startTime}
								onChange={handleChange}
								className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
								required
							/>
						</div>

						<div className='space-y-2'>
							<label className='flex items-center text-sm text-gray-600 dark:text-gray-300'>
								<Clock size={16} className='mr-2' />
								End Time
							</label>
							<input
								type='datetime-local'
								name='endTime'
								value={form.endTime}
								onChange={handleChange}
								className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
								required
							/>
						</div>
					</div>
				</div>

				<div className='pt-4'>
					<button
						type='submit'
						disabled={isLoading || !user}
						className='w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200 flex items-center justify-center'>
						{isLoading ? "Creating Auction..." : "Create Auction"}
					</button>
				</div>
			</form>
		</div>
	);
}
