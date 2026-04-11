"use client";
import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface AuctionsLayoutProps {
	children: React.ReactNode;
}

export default function AuctionsLayout({ children }: AuctionsLayoutProps) {
	const { isAuthenticated } = useAuth();

	return (
		<div className='relative'>
			{children}

			{/* Floating action button - only shown to authenticated users */}
			{isAuthenticated && (
				<div className='fixed bottom-6 right-6 z-50'>
					<Link href='/seller/auctions/create'>
						<button
							className='flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors'
							aria-label='Create new auction'>
							<Plus size={24} />
						</button>
					</Link>
				</div>
			)}
		</div>
	);
}
