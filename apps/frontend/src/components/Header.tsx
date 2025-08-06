"use client";
import React from "react";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Header: React.FC = () => {
	const { isAuthenticated, user, logout } = useAuth();

	const VerticalLine = () => <div className='vertical-line'></div>;

	const SharedNav = () => (
		<>
			<Link
				href='/contact-us'
				className='text-xs text-gray-800 dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 focus:outline-none '>
				Contact Us
			</Link>
			<VerticalLine />
			<Link
				href='/'
				className='text-xs text-gray-800 dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ml-4 focus:outline-none'>
				Home
			</Link>
		</>
	);

	return (
		<>
			<style jsx>{`
				.vertical-line {
					width: 1px;
					height: 16px;
					background-color: #d1d5db;
					margin-left: 16px;
				}
				.dark .vertical-line {
					background-color: #6b7280;
				}
			`}</style>

			<header className='flex items-center justify-between border-gray-200 bg-gray-100 dark:bg-gray-900 px-8 pt-2'>
				<div className='flex items-center'>
					<span className='text-blue-600 font-bold text-xl'>Auctioneer</span>
				</div>

				<nav className='flex items-center relative'>
					<SharedNav />

					{isAuthenticated ? (
						<>
							<VerticalLine />
							<Menu as='div' className='relative ml-4'>
								<Menu.Button className='flex items-center text-xs text-gray-800 dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 focus:outline-none  '>
									Welcome, {user?.firstName}
									<ChevronDown className='ml-1 h-4 w-4' />
								</Menu.Button>
								<Menu.Items className='absolute right-0 mt-2 w-44 origin-top-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg focus:outline-none z-50'>
									<div className='py-1'>
										<Menu.Item>
											{({ active }) => (
												<Link
													href='/profile'
													className={`block px-4 py-2 text-sm focus:outline-none ${
														active
															? "bg-gray-100 dark:bg-gray-700"
															: "text-gray-700 dark:text-gray-200"
													}`}>
													Profile
												</Link>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<Link
													href='/settings'
													className={`block px-4 py-2 text-sm focus:outline-none ${
														active
															? "bg-gray-100 dark:bg-gray-700"
															: "text-gray-700 dark:text-gray-200"
													}`}>
													Settings
												</Link>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<button
													onClick={logout}
													className={`w-full text-left px-4 py-2 text-sm focus:outline-none ${
														active
															? "bg-gray-100 dark:bg-gray-700"
															: "text-red-600 dark:text-red-400"
													}`}>
													Logout
												</button>
											)}
										</Menu.Item>
									</div>
								</Menu.Items>
							</Menu>
						</>
					) : (
						<>
							<VerticalLine />
							<Link
								href='/register'
								className='text-xs text-gray-800 dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ml-4'>
								Register
							</Link>
							<VerticalLine />
							<Link
								href='/login'
								className='text-xs text-gray-800 dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ml-4'>
								Login
							</Link>
						</>
					)}
				</nav>
			</header>
		</>
	);
};

export default Header;
