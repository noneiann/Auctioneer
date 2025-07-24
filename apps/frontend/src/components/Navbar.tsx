import React from "react";
import Image from "next/image";
import Link from "next/link";
import Search from "./Search";

const Navbar: React.FC = () => {
	return (
		<header className='relative flex items-center justify-between px-8 py-4 dark:bg-gray-900'>
			{/* Left: Logo */}
			<div className='flex items-center flex-shrink-0'>
				<Link href='/'>
					<Image src='/logo.svg' alt='Auctioneer Logo' width={40} height={40} />
				</Link>
			</div>

			{/* Center: Navigation Links */}
			<nav className='absolute left-1/2 transform -translate-x-1/2 flex space-x-6'>
				<Link
					href='/'
					className='text-gray-800 dark:text-gray-200 font-semibold'>
					Featured
				</Link>
				<Link
					href='/auctions'
					className='text-gray-800 dark:text-gray-200 font-semibold'>
					Art
				</Link>
				<Link
					href='/about'
					className='text-gray-800 dark:text-gray-200 font-semibold'>
					Jewelry
				</Link>
				<Link
					href='/contact'
					className='text-gray-800 dark:text-gray-200 font-semibold'>
					Collectibles
				</Link>
				<Link
					href='/help'
					className='text-gray-800 dark:text-gray-200 font-semibold'>
					Apparel
				</Link>
			</nav>

			{/* Right: Search and Icon */}
			<div className='flex items-center space-x-4'>
				<Search />
				<svg
					width={30}
					height={30}
					viewBox='0 0 243 293'
					fill='none'
					className='p-1'
					xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M147 76H30.5C18.902 76 9.5 85.402 9.5 97V263C9.5 274.598 18.902 284 30.5 284H183.5H213C224.598 284 234 274.598 234 263V97C234 85.402 224.598 76 213 76H180M52.5 89.5V30.5C52.5 18.902 61.902 9.5 73.5 9.5H159C170.598 9.5 180 18.902 180 30.5V89.5C180 101.098 170.598 110.5 159 110.5H73.5C61.902 110.5 52.5 101.098 52.5 89.5Z'
						stroke='var(--main)'
						strokeWidth='18'
						strokeLinecap='round'
					/>
				</svg>
			</div>
		</header>
	);
};

export default Navbar;
