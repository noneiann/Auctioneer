"use client";

import React from "react";
import Link from "next/link";

const Header: React.FC = () => {
	return (
		<header className='flex items-center justify-between border-gray-200 bg-gray-100  dark:bg-gray-900 px-8 py-2'>
			<div className='flex items-center space-x-2'>
				<span className='text-blue-600 font-bold text-xl'></span>
			</div>
			<nav className='flex space-x-6'>
				<Link
					href='/'
					className='text-gray-800 dark:text-gray-200 text-main header-item'>
					Home
				</Link>
				<Link
					href='/register'
					className='text-gray-800 dark:text-gray-200 text-main header-item'>
					Register
				</Link>
				<Link
					href='/login'
					className='text-gray-800 dark:text-gray-200 text-main header-item-last'>
					Login
				</Link>
			</nav>
		</header>
	);
};

export default Header;
