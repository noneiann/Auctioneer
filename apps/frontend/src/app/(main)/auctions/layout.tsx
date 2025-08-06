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
		<div className='relative min-h-screen'>
			{/* Main content */}
			<main className='container mx-auto px-4 py-8'>{children}</main>

			{/* Floating action button - only shown to authenticated users */}
			{isAuthenticated && (
				<div className='fixed bottom-6 right-6 z-50'>
					<Link href='/auctions/create'>
						<button
							className='flex items-center justify-center w-14 h-14 rounded-full shadow-lg text-white hover:opacity-90 transition-opacity'
							style={{ backgroundColor: "var(--main)" }}
							aria-label='Create new auction'>
							<Plus size={24} />
						</button>
					</Link>
				</div>
			)}
		</div>
	);
}
