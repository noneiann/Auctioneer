import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
	id: string; // The item ID
	name: string;
	imageUrl: string;
	price: number;
	type: "DIRECT" | "AUCTION_WIN";
	auctionId?: string; // Original auction ID if this was won
}

interface CartState {
	items: CartItem[];
	addItem: (item: CartItem) => void;
	removeItem: (id: string) => void;
	clearCart: () => void;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	get totalCount(): number;
	get totalAmount(): number;
}

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			items: [],
			isOpen: false,

			addItem: (item) => {
				const currentItems = get().items;
				// Prevent duplicates based on item ID
				if (!currentItems.some((i) => i.id === item.id)) {
					set({ items: [...currentItems, item], isOpen: true });
				} else {
					set({ isOpen: true }); // Just open if it's already there
				}
			},

			removeItem: (id) => {
				set({ items: get().items.filter((i) => i.id !== id) });
			},

			clearCart: () => {
				set({ items: [] });
			},

			setIsOpen: (isOpen) => {
				set({ isOpen });
			},

			get totalCount() {
				return get().items.length;
			},

			get totalAmount() {
				return get().items.reduce((sum, item) => sum + item.price, 0);
			},
		}),
		{
			name: "auctioneer-cart",
			partialize: (state) => ({ items: state.items }), // Only persist items, not isOpen state
		}
	)
);
