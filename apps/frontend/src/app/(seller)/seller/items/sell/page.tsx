"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Plus, ImageIcon, PackagePlus, ChevronLeft, DollarSign } from "lucide-react";
import api from "@/lib/api";

const CATEGORIES = [
	"Shoes", "Watches", "Electronics", "Clothing",
	"Collectibles", "Art", "Books", "Sports Equipment",
];

const inputClass =
	"w-full px-4 py-3 rounded-lg border border-[#2a2a2a] bg-[#181818] text-white placeholder-[#3a3a3a] focus:border-[#404040] focus:outline-none transition-colors text-sm hover:border-[#333]";

const labelClass =
	"block text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a] mb-1.5";

export default function SellItemPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [imageInput, setImageInput] = useState("");
	const [images, setImages] = useState<string[]>([]);
	const [dragOver, setDragOver] = useState(false);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		category: "",
		price: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const addImage = (url?: string) => {
		const val = (url ?? imageInput).trim();
		if (val && !images.includes(val) && images.length < 8) {
			setImages([...images, val]);
			setImageInput("");
		}
	};

	const removeImage = (i: number) => {
		const next = [...images];
		next.splice(i, 1);
		setImages(next);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (images.length === 0) { setError("Add at least one image"); return; }
		setLoading(true);
		setError("");
		try {
			const resp = await api.post("/items", {
				...formData,
				type: "DIRECT",
				price: parseFloat(formData.price),
				imageUrl: images,
			});
			if (resp && resp.success) {
				router.push("/seller/items");
			} else {
				throw new Error(resp?.data || "Failed to create listing");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create listing");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<Link href="/seller" className="inline-flex items-center gap-1.5 text-[12px] text-[#4a4a4a] hover:text-white transition-colors mb-4">
					<ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
				</Link>
				<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">Seller</p>
				<h1 className="text-2xl font-bold text-white mt-0.5 flex items-center gap-2">
					<PackagePlus className="w-5 h-5 text-emerald-400" />
					List for Direct Sale
				</h1>
				<p className="text-[#737373] text-sm mt-1">Buyers can purchase immediately at your asking price.</p>
			</div>

			{error && (
				<div className="mb-6 text-[13px] text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-4 py-3">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-5">
				{/* Item Details */}
				<section className="bg-[#181818] border border-[#1f1f1f] rounded-xl p-6 space-y-5">
					<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">Item Details</p>

					<div>
						<label className={labelClass}>Title</label>
						<input type="text" name="name" value={formData.name} onChange={handleChange}
							required placeholder="What are you selling?"
							className={inputClass} />
					</div>

					<div>
						<label className={labelClass}>Description</label>
						<textarea name="description" value={formData.description} onChange={handleChange}
							required rows={4} placeholder="Describe condition, age, accessories..."
							className={`${inputClass} resize-none`} />
					</div>

					<div>
						<label className={labelClass}>Category</label>
						<select name="category" value={formData.category} onChange={handleChange} required
							className={`${inputClass} appearance-none cursor-pointer`}>
							<option value="" className="bg-[#181818]">Select category</option>
							{CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#181818]">{c}</option>)}
						</select>
					</div>
				</section>

				{/* Images */}
				<section className="bg-[#181818] border border-[#1f1f1f] rounded-xl p-6 space-y-4">
					<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">Images</p>

					{images.length === 0 ? (
						<div
							onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
							onDragLeave={() => setDragOver(false)}
							onDrop={(e) => { e.preventDefault(); setDragOver(false); addImage(e.dataTransfer.getData("text/plain")); }}
							onClick={() => imageInputRef.current?.focus()}
							className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-10 cursor-pointer transition-colors ${
								dragOver ? "border-emerald-500 bg-emerald-500/5" : "border-[#2a2a2a] hover:border-[#3a3a3a]"
							}`}
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
							{images.map((url, i) => (
								<div key={i} className="group relative aspect-square rounded-lg overflow-hidden bg-[#222] border border-[#2a2a2a]">
									<Image src={url} alt={`img-${i}`} fill sizes="120px" className="object-cover" />
									{i === 0 && (
										<div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
											COVER
										</div>
									)}
									<button type="button" onClick={() => removeImage(i)}
										className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
										<X className="w-3 h-3 text-white" />
									</button>
								</div>
							))}
							{images.length < 8 && (
								<button type="button" onClick={() => imageInputRef.current?.focus()}
									className="aspect-square rounded-lg border-2 border-dashed border-[#2a2a2a] hover:border-[#3a3a3a] flex items-center justify-center text-[#4a4a4a] hover:text-[#737373] transition-colors">
									<Plus className="w-5 h-5" />
								</button>
							)}
						</div>
					)}

					<div className="flex gap-2">
						<input ref={imageInputRef} type="url" value={imageInput}
							onChange={(e) => setImageInput(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
							placeholder="Paste image URL and press Enter"
							className={`${inputClass} flex-1`} />
						<button type="button" onClick={() => addImage()}
							className="px-4 py-2 rounded-lg bg-[#222] border border-[#2a2a2a] text-[#a0a0a0] hover:text-white hover:border-[#3a3a3a] text-sm font-medium transition-colors whitespace-nowrap">
							Add
						</button>
					</div>
					<p className="text-[11px] text-[#4a4a4a]">First image is used as the cover. Max 8 images.</p>
				</section>

				{/* Pricing */}
				<section className="bg-[#181818] border border-[#1f1f1f] rounded-xl p-6 space-y-5">
					<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a4a4a]">Pricing</p>

					<div>
						<label className={labelClass}>Asking Price</label>
						<div className="relative">
							<DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a4a4a]" />
							<input type="number" name="price" value={formData.price} onChange={handleChange}
								required min="0.01" step="0.01" placeholder="0.00"
								className={`${inputClass} pl-9 text-lg font-mono`} />
						</div>
						<p className="text-[11px] text-[#4a4a4a] mt-2">Buyers can purchase at this exact price immediately.</p>
					</div>
				</section>

				<button type="submit" disabled={loading}
					className="w-full py-3.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
					{loading ? "Publishing…" : "Publish Listing"}
				</button>
			</form>
		</div>
	);
}
