"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CreditCard, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/stores/CartStore";
import { purchaseApi } from "@/lib/PurchaseApi";
import Button from "@/components/ui/Button";

export default function CheckoutPage() {
	const { items, totalAmount, clearCart } = useCartStore();
	const [submitting, setSubmitting] = useState(false);
	const router = useRouter();

	const handleCheckout = async (e: React.FormEvent) => {
		e.preventDefault();
		if (items.length === 0) return;

		setSubmitting(true);
		try {
			// In a real app we'd pass payment token, etc.
			// Here we just loop through the cart items and create a purchase for each
			const promises = items.map((item) =>
				purchaseApi.createPurchase({
					itemId: item.id,
					amount: item.price,
				})
			);

			await Promise.all(promises);

			clearCart();
			router.push("/activity?tab=purchases&success=true");
		} catch (error) {
			console.error("Checkout failed:", error);
			alert("Checkout failed. Please try again.");
			setSubmitting(false);
		}
	};

	if (items.length === 0) {
		return (
			<div className="min-h-screen bg-[#111] flex flex-col items-center justify-center text-center p-6">
				<h2 className="text-2xl font-bold text-white mb-2">Cart is empty</h2>
				<p className="text-[#737373] mb-6">You have no items to checkout.</p>
				<Button onClick={() => router.push("/market")}>Go to Market</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#111] pt-32 pb-24">
			<div className="max-w-5xl mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
				{/* Payment Mock */}
				<div className="lg:col-span-7">
					<div className="flex items-center gap-3 mb-8">
						<div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center">
							<ShieldCheck className="w-5 h-5 text-brand-400" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-white tracking-wide">Secure Checkout</h1>
							<p className="text-sm text-[#737373]">Mock payment environment.</p>
						</div>
					</div>

					<form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
						<div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl p-6">
							<h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
								<CreditCard className="w-4 h-4" /> Payment Details
							</h2>
							<div className="space-y-4">
								<div>
									<label className="block text-xs font-medium text-[#737373] mb-1.5">Name on Card</label>
									<input required type="text" defaultValue="John Doe" className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
								</div>
								<div>
									<label className="block text-xs font-medium text-[#737373] mb-1.5">Card Number</label>
									<input required type="text" defaultValue="4242 4242 4242 4242" className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono tracking-wide" />
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-xs font-medium text-[#737373] mb-1.5">Expiry</label>
										<input required type="text" defaultValue="12/26" className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono" />
									</div>
									<div>
										<label className="block text-xs font-medium text-[#737373] mb-1.5">CVC</label>
										<input required type="text" defaultValue="123" className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono" />
									</div>
								</div>
							</div>
						</div>
					</form>
				</div>

				{/* Order Summary */}
				<div className="lg:col-span-5">
					<div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl p-6 sticky top-24">
						<h2 className="text-lg font-bold text-white mb-6">Order Summary</h2>
						<ul className="space-y-4 mb-6">
							{items.map((item) => (
								<li key={item.id} className="flex gap-4 items-center">
									<Image src={item.imageUrl || "/placeholder.png"} alt={item.name} width={48} height={48} className="rounded-lg object-cover w-12 h-12 border border-[#2a2a2a]" />
									<div className="flex-1 min-w-0">
										<p className="text-sm text-white font-medium truncate">{item.name}</p>
										<p className="text-xs text-[#737373]">{item.type === "AUCTION_WIN" ? "Auction Win" : "Direct Buy"}</p>
									</div>
									<p className="text-sm font-mono text-white">${item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
								</li>
							))}
						</ul>
						<div className="border-t border-[#2a2a2a] pt-4 space-y-2 mb-6">
							<div className="flex justify-between text-sm text-[#737373]">
								<span>Subtotal ({items.length} items)</span>
								<span className="font-mono">${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
							</div>
							<div className="flex justify-between text-sm text-[#737373]">
								<span>Processing Fee</span>
								<span className="font-mono">$0.00</span>
							</div>
							<div className="flex justify-between text-lg text-white font-bold mt-4">
								<span>Total</span>
								<span className="font-mono text-brand-400">${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
							</div>
						</div>
						<Button
							type="submit"
							form="checkout-form"
							disabled={submitting}
							className="w-full h-12 text-base shadow-lg shadow-brand-500/20 max-w-none hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold"
						>
							{submitting ? "Processing..." : `Pay $${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
