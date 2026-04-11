"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
	Calendar,
	DollarSign,
	FileText,
	Tag,
	X,
	Plus,
	ImageIcon,
	Gavel,
	ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ItemType } from "@auctioneer/types";
import useMyAuctions from "@/hooks/useMyAuctions";

const CATEGORIES = [
	"Shoes", "Watches", "Electronics", "Clothing",
	"Collectibles", "Art", "Books", "Sports Equipment",
];

const inputClass =
	"w-full px-4 py-3 rounded-lg border border-[#2a2a2a] bg-[#181818] text-white placeholder-[#3a3a3a] focus:border-[#404040] focus:outline-none transition-colors text-sm hover:border-[#333]";

const labelClass =
	"block text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a] mb-1.5";

interface FormData {
	title: string;
	description: string;
	imageUrl: string[];
	type: ItemType;
	price: string;
	category: string;
	startingBid: string;
	startTime: string;
	endTime: string;
}

export default function CreateAuctionForm() {
	const { createAuction } = useMyAuctions();
	const router = useRouter();
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [imageInput, setImageInput] = useState("");
	const [imageDragOver, setImageDragOver] = useState(false);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const [form, setForm] = useState<FormData>({
		title: "",
		description: "",
		imageUrl: [],
		type: "AUCTION" as ItemType,
		price: "",
		startingBid: "",
		startTime: "",
		endTime: "",
		category: "",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => setForm({ ...form, [e.target.name]: e.target.value });

	const addImageUrl = (url?: string) => {
		const val = (url ?? imageInput).trim();
		if (val && !form.imageUrl.includes(val)) {
			setForm({ ...form, imageUrl: [...form.imageUrl, val] });
			setImageInput("");
		}
	};

	const removeImage = (index: number) => {
		const next = [...form.imageUrl];
		next.splice(index, 1);
		setForm({ ...form, imageUrl: next });
	};

	// Quick duration presets → populate endTime from startTime
	const applyDuration = (hours: number) => {
		const base = form.startTime ? new Date(form.startTime) : new Date();
		base.setHours(base.getHours() + hours);
		// Format to datetime-local value (YYYY-MM-DDTHH:MM)
		const pad = (n: number) => String(n).padStart(2, "0");
		const val = `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}T${pad(base.getHours())}:${pad(base.getMinutes())}`;
		setForm({ ...form, endTime: val });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		if (!user) { setError("You must be logged in to create an auction"); setIsLoading(false); return; }
		if (form.imageUrl.length === 0) { setError("Add at least one image"); setIsLoading(false); return; }

		const startDate = new Date(form.startTime);
		const endDate = new Date(form.endTime);
		if (endDate <= startDate) { setError("End time must be after start time"); setIsLoading(false); return; }

		try {
			await createAuction({
				title: form.title,
				description: form.description,
				imageUrl: form.imageUrl,
				type: form.type,
				category: form.category,
				price: parseFloat(form.price) || 0,
				startingBid: parseFloat(form.startingBid),
				startTime: startDate.toISOString(),
				endTime: endDate.toISOString(),
			});
			router.push("/auctions");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create auction");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto">
			{/* Page header */}
			<div className="mb-8">
				<Link
					href="/seller"
					className="inline-flex items-center gap-1.5 text-[12px] text-[#4a4a4a] hover:text-white transition-colors mb-4"
				>
					<ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
				</Link>
				<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">Seller</p>
				<h1 className="text-2xl font-bold text-white mt-0.5 flex items-center gap-2">
					<Gavel className="w-5 h-5 text-brand-400" />
					Create Auction
				</h1>
				<p className="text-[#737373] text-sm mt-1">
					List your item in a live competitive auction.
				</p>
			</div>

			{error && (
				<div className="mb-6 text-[13px] text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-4 py-3">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* ── Item Details ── */}
				<section className="bg-[#181818] border border-[#1f1f1f] rounded-xl p-6 space-y-5">
					<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">Item Details</p>

					<div>
						<label className={labelClass}>Title</label>
						<input
							type="text" name="title" value={form.title}
							onChange={handleChange} required
							placeholder="e.g. Vintage Canon AE-1 Camera"
							className={inputClass}
						/>
					</div>

					<div>
						<label className={labelClass}>Description</label>
						<textarea
							name="description" value={form.description}
							onChange={handleChange} required rows={4}
							placeholder="Describe condition, age, included accessories..."
							className={`${inputClass} resize-none`}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className={labelClass}>Category</label>
							<select
								name="category" value={form.category}
								onChange={handleChange} required
								className={`${inputClass} appearance-none cursor-pointer`}
							>
								<option value="" className="bg-[#181818]">Select category</option>
								{CATEGORIES.map((c) => (
									<option key={c} value={c} className="bg-[#181818]">{c}</option>
								))}
							</select>
						</div>
						<div>
							<label className={labelClass}>Estimated Value</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4a4a] text-sm">$</span>
								<input
									type="number" name="price" value={form.price}
									onChange={handleChange} placeholder="0.00"
									min="0" step="0.01"
									className={`${inputClass} pl-8`}
								/>
							</div>
						</div>
					</div>
				</section>

				{/* ── Images ── */}
				<section className="bg-[#181818] border border-[#1f1f1f] rounded-xl p-6 space-y-4">
					<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">Images</p>

					{/* Drop zone / preview grid */}
					{form.imageUrl.length === 0 ? (
						<div
							onDragOver={(e) => { e.preventDefault(); setImageDragOver(true); }}
							onDragLeave={() => setImageDragOver(false)}
							onDrop={(e) => {
								e.preventDefault();
								setImageDragOver(false);
								const url = e.dataTransfer.getData("text/plain");
								if (url) addImageUrl(url);
							}}
							className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-10 transition-colors cursor-pointer ${
								imageDragOver ? "border-brand-500 bg-brand-500/5" : "border-[#2a2a2a] hover:border-[#3a3a3a]"
							}`}
							onClick={() => imageInputRef.current?.focus()}
						>
							<div className="w-12 h-12 rounded-xl bg-[#222] flex items-center justify-center">
								<ImageIcon className="w-5 h-5 text-[#4a4a4a]" />
							</div>
							<div className="text-center">
								<p className="text-sm font-medium text-[#737373]">Paste or drag an image URL here</p>
								<p className="text-[11px] text-[#4a4a4a] mt-0.5">Supports any public image link</p>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
							{form.imageUrl.map((url, i) => (
								<div key={i} className="group relative aspect-square rounded-lg overflow-hidden bg-[#222] border border-[#2a2a2a]">
									<Image src={url} alt={`image-${i}`} fill sizes="120px" className="object-cover" />
									{/* Primary badge */}
									{i === 0 && (
										<div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
											COVER
										</div>
									)}
									<button
										type="button"
										onClick={() => removeImage(i)}
										className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
									>
										<X className="w-3 h-3 text-white" />
									</button>
								</div>
							))}
							{/* Add more slot */}
							<button
								type="button"
								onClick={() => imageInputRef.current?.focus()}
								className="aspect-square rounded-lg border-2 border-dashed border-[#2a2a2a] hover:border-[#3a3a3a] flex items-center justify-center text-[#4a4a4a] hover:text-[#737373] transition-colors"
							>
								<Plus className="w-5 h-5" />
							</button>
						</div>
					)}

					{/* URL input */}
					<div className="flex gap-2">
						<input
							ref={imageInputRef}
							type="url"
							value={imageInput}
							onChange={(e) => setImageInput(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
							placeholder="Paste image URL and press Enter or click Add"
							className={`${inputClass} flex-1`}
						/>
						<button
							type="button"
							onClick={() => addImageUrl()}
							className="px-4 py-2 rounded-lg bg-[#222] border border-[#2a2a2a] text-[#a0a0a0] hover:text-white hover:border-[#3a3a3a] text-sm font-medium transition-colors whitespace-nowrap"
						>
							Add
						</button>
					</div>
					<p className="text-[11px] text-[#4a4a4a]">First image is used as the cover. Add up to 8 images.</p>
				</section>

				{/* ── Auction Settings ── */}
				<section className="bg-[#181818] border border-[#1f1f1f] rounded-xl p-6 space-y-5">
					<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">Auction Settings</p>

					<div>
						<label className={labelClass}>Starting Bid</label>
						<div className="relative">
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4a4a] text-sm">$</span>
							<input
								type="number" name="startingBid" value={form.startingBid}
								onChange={handleChange} required min="0.01" step="0.01"
								placeholder="0.00"
								className={`${inputClass} pl-8 text-lg font-mono`}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className={labelClass}>Start Date & Time</label>
							<input
								type="datetime-local" name="startTime" value={form.startTime}
								onChange={handleChange} required
								className={`${inputClass} [color-scheme:dark]`}
							/>
						</div>
						<div>
							<label className={labelClass}>End Date & Time</label>
							<input
								type="datetime-local" name="endTime" value={form.endTime}
								onChange={handleChange} required
								className={`${inputClass} [color-scheme:dark]`}
							/>
						</div>
					</div>

					{/* Duration quick-set */}
					<div>
						<p className={`${labelClass} mb-2`}>Quick Duration (from start time)</p>
						<div className="flex gap-2 flex-wrap">
							{[
								{ label: "1h",  hours: 1 },
								{ label: "6h",  hours: 6 },
								{ label: "12h", hours: 12 },
								{ label: "1 day", hours: 24 },
								{ label: "3 days", hours: 72 },
								{ label: "7 days", hours: 168 },
							].map((d) => (
								<button
									key={d.label}
									type="button"
									onClick={() => applyDuration(d.hours)}
									className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-[12px] text-[#737373] hover:text-white hover:border-[#3a3a3a] transition-colors"
								>
									{d.label}
								</button>
							))}
						</div>
					</div>
				</section>

				{/* Submit */}
				<button
					type="submit"
					disabled={isLoading || !user}
					className="w-full py-3.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
				>
					{isLoading ? "Creating Auction…" : "Publish Auction"}
				</button>
			</form>
		</div>
	);
}
