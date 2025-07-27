"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const Header: React.FC = () => {
	const { isAuthenticated, user, token, logout } = useAuth();
	console.log("Header state:", { isAuthenticated, user, token });
	if (isAuthenticated) {
		return (
			<>
				<style jsx>{`
					.vertical-line {
						width: 1px;
						height: 16px;
						background-color: #d1d5db; /* gray-300 */
						margin-left: 16px;
					}

					.dark .vertical-line {
						background-color: #6b7280; /* gray-500 for dark mode */
					}
				`}</style>
				<header className='flex items-center justify-between border-gray-200 bg-gray-100 dark:bg-gray-900 px-8 pt-2'>
					<div className='flex items-center'>
						<span className='text-blue-600 font-bold text-xl'></span>
					</div>

					<nav className='flex items-center'>
						<Link
							href='/contact-us'
							className='text-xs text-gray-800 dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200'>
							Contact Us
						</Link>

						<div className='vertical-line'></div>
						<Link
							href='/'
							className='text-xs text-gray-800 dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ml-4'>
							Home
						</Link>
						<div className='vertical-line'></div>

						<Link
							href='/profile'
							className='text-xs text-gray-800 dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ml-4'>
							My Profile
						</Link>
						<div className='vertical-line'></div>

						<button
							onClick={logout}
							className='text-xs text-gray-800 dark:text-gray-200 font-semibold hover:text-blue-600 hover:cursor-pointer dark:hover:text-blue-400 transition-colors duration-200 ml-4'>
							Logout
						</button>
					</nav>
				</header>
			</>
		);
	} else
		return (
			<>
				<style jsx>{`
					.vertical-line {
						width: 1px;
						height: 16px;
						background-color: #d1d5db; /* gray-300 */
						margin-left: 16px;
					}

					.dark .vertical-line {
						background-color: #6b7280; /* gray-500 for dark mode */
					}
				`}</style>

				<header className='flex items-center justify-between border-gray-200 bg-gray-100 dark:bg-gray-900 px-8 pt-2'>
					<div className='flex items-center'>
						<span className='text-blue-600 font-bold text-xl'></span>
					</div>

					<nav className='flex items-center'>
						<Link
							href='/contact-us'
							className='text-xs text-gray-800 dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200'>
							Contact Us
						</Link>
						<div className='vertical-line'></div>
						<Link
							href='/'
							className='text-xs text-gray-800 dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ml-4'>
							Home
						</Link>
						<div className='vertical-line'></div>

						<Link
							href='/register'
							className='text-xs text-gray-800 dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ml-4'>
							Register
						</Link>
						<div className='vertical-line'></div>

						<Link
							href='/login'
							className='text-xs text-gray-800 dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ml-4'>
							Login
						</Link>
					</nav>
				</header>
			</>
		);
};

export default Header;
