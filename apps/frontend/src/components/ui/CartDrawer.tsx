"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X, Trash2, ShoppingCart, Gavel, Package } from "lucide-react";
import { useCartStore } from "@/stores/CartStore";
import Button from "@/components/ui/Button";

export default function CartDrawer() {
	const { items, isOpen, setIsOpen, removeItem, totalAmount, clearCart } = useCartStore();
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch by waiting until mounted
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-[100]">
			<DialogBackdrop
				transition
				className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out data-[closed]:opacity-0"
			/>
			<div className="fixed inset-0 overflow-hidden">
				<div className="absolute inset-0 overflow-hidden">
					<div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
						<DialogPanel
							transition
							className="pointer-events-auto w-screen max-w-md transform transition duration-300 ease-in-out data-[closed]:translate-x-full sm:duration-400 font-sans"
						>
							<div className="flex h-full flex-col bg-[#111] border-l border-[#1f1f1f] shadow-2xl">
								{/* Header */}
								<div className="flex items-center justify-between px-6 py-5 border-b border-[#1f1f1f]">
									<div className="flex items-center gap-3">
										<ShoppingCart className="w-5 h-5 text-white" />
										<h2 className="text-lg font-bold text-white tracking-wide">
											Your Cart
										</h2>
									</div>
									<button
										type="button"
										onClick={() => setIsOpen(false)}
										className="p-2 -mr-2 text-[#737373] hover:text-white transition-colors rounded-full hover:bg-[#1a1a1a]"
									>
										<X className="w-5 h-5" />
									</button>
								</div>

								{/* Cart Items */}
								<div className="flex-1 overflow-y-auto p-6 scrollbar-none">
									{items.length === 0 ? (
										<div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-[#737373]">
											<div className="w-16 h-16 rounded-2xl bg-[#181818] border border-[#2a2a2a] flex items-center justify-center">
												<ShoppingCart className="w-8 h-8 opacity-50" />
											</div>
											<div>
												<p className="text-white font-medium mb-1">Your cart is empty</p>
												<p className="text-sm max-w-[250px]">
													Browse the market or win an auction to add items checkout.
												</p>
											</div>
											<Button variant="secondary" onClick={() => setIsOpen(false)}>
												Continue Shopping
											</Button>
										</div>
									) : (
										<ul className="space-y-4">
											{items.map((item) => (
												<li
													key={item.id}
													className="flex gap-4 p-3 rounded-xl border border-[#1f1f1f] bg-[#181818] relative group"
												>
													<div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#222] shrink-0 border border-[#2a2a2a]">
														<Image
															src={item.imageUrl || "/placeholder.png"}
															alt={item.name}
															fill
															className="object-cover"
														/>
													</div>
													<div className="flex flex-col flex-1 justify-center min-w-0">
														<div className="flex items-center gap-1.5 mb-1">
															{item.type === "AUCTION_WIN" ? (
																<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-brand-500/10 text-brand-400 border border-brand-500/20">
																	<Gavel className="w-2.5 h-2.5" /> Auction Win
																</span>
															) : (
																<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
																	<Package className="w-2.5 h-2.5" /> Direct Buy
																</span>
															)}
														</div>
														<h3 className="text-sm font-semibold text-white truncate pr-6">
															{item.name}
														</h3>
														<p className="text-brand-300 font-mono font-bold text-sm mt-1">
															${item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
														</p>
													</div>
													<button
														onClick={() => removeItem(item.id)}
														className="absolute top-2 right-2 p-1.5 text-[#737373] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
														title="Remove item"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</li>
											))}
										</ul>
									)}
								</div>

								{/* Footer */}
								{items.length > 0 && (
									<div className="p-6 border-t border-[#1f1f1f] bg-[#141414]">
										<div className="flex justify-between items-end mb-6 text-white">
											<div>
												<p className="text-[#737373] text-sm mb-1">Subtotal</p>
												<p className="text-xs text-[#4a4a4a]">Taxes calculated at checkout</p>
											</div>
											<p className="text-2xl font-bold font-mono">
												${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
											</p>
										</div>
										<div className="flex flex-col gap-3">
											<Link href="/checkout" onClick={() => setIsOpen(false)}>
												<Button variant="primary" className="w-full bg-white text-black hover:bg-neutral-200 h-12 text-base font-bold">
													Proceed to Checkout
												</Button>
											</Link>
											<button
												onClick={clearCart}
												className="text-xs text-[#737373] hover:text-white transition-colors"
											>
												Empty Cart
											</button>
										</div>
									</div>
								)}
							</div>
						</DialogPanel>
					</div>
				</div>
			</div>
		</Dialog>
	);
}
