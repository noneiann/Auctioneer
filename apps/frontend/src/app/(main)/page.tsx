"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
	return (
		<div className='font-sans min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100'>
			{/* Hero Section */}
			<section className='relative h-[60vh] w-full overflow-hidden flex items-center justify-center'>
				<Image
					src='/hero-bg.jpg'
					alt='Auction Hero'
					fill
					className='object-cover opacity-100'
					priority
				/>
				<div className='absolute inset-0 bg-gray-100 opacity-75 dark:bg-black dark:bg-opacity-50' />
				<div className='relative z-10 text-center px-4'>
					<h1
						className='text-4xl md:text-6xl font-bold animate-fade-in'
						style={{ color: "var(--main)" }}>
						Bid on Exclusive Items Today
					</h1>
					<p className='mt-4 text-lg md:text-xl text-gray-700 dark:text-gray-300 animate-fade-in-delay'>
						Discover limited deals and rare finds at Auctioneer.
					</p>
					<Link
						href='/auctions'
						className='inline-block mt-6 px-6 py-3 rounded-full text-lg text-white transition animate-fade-in-delay-2'
						style={{ backgroundColor: "var(--main)" }}>
						View Auctions
					</Link>
				</div>
			</section>

			{/* Auction Items Section */}
			<section className='max-w-6xl mx-auto py-16 px-4'>
				<h2
					className='text-3xl font-semibold mb-10 text-center'
					style={{ color: "var(--main)" }}>
					Featured Auctions
				</h2>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
					{["watch", "painting", "car"].map((item) => (
						<div
							key={item}
							className='bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700'>
							<div className='relative h-64 w-full'>
								<Image
									src={`https://images.unsplash.com/photo-1694656937152-b2377c0b5de7?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
									alt={item}
									fill
									className='object-cover rounded-t-lg'
								/>
								<div className='absolute inset-0 rounded-t-lg' />
							</div>
							<div className='p-4'>
								<h3
									className='text-xl font-bold capitalize'
									style={{ color: "var(--main)" }}>
									{item}
								</h3>
								<p className='text-gray-600 dark:text-gray-300 mt-2'>
									Bid for premium {item}s from trusted sellers.
								</p>
								<Link
									href='/auctions'
									className='inline-block mt-4 px-4 py-2 text-white rounded transition'
									style={{ backgroundColor: "var(--main)" }}>
									Place Bid
								</Link>
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
