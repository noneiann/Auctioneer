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
					className='text-xs text-neutral-700 font-semibold hover:text-brand-500 transition-colors duration-200 focus:outline-none '>
				Contact Us
			</Link>
			<VerticalLine />
			<Link
				href='/'
				className='text-xs text-neutral-700 font-semibold hover:text-brand-500 transition-colors duration-200 ml-4 focus:outline-none'>
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
					background-color: #404040;
					margin-left: 16px;
				}
			`}</style>

			<header className='flex items-center justify-between border-border bg-surface px-8 pt-2'>
				<div className='flex items-center'>
					<span className='text-brand-500 font-bold text-xl'>Auctioneer</span>
				</div>

				<nav className='flex items-center relative'>
					<SharedNav />

					{isAuthenticated ? (
						<>
							<VerticalLine />
							<Menu as='div' className='relative ml-4'>
								<Menu.Button className='flex items-center text-xs text-neutral-700 font-semibold hover:text-brand-500 transition-colors duration-200 focus:outline-none  '>
									Welcome, {user?.firstName}
									<ChevronDown className='ml-1 h-4 w-4' />
								</Menu.Button>
								<Menu.Items className='absolute right-0 mt-2 w-44 origin-top-right bg-surface-raised border border-border rounded-md shadow-lg focus:outline-none z-50'>
									<div className='py-1'>
										<Menu.Item>
											{({ active }) => (
												<Link
													href='/profile'
													className={`block px-4 py-2 text-sm focus:outline-none ${
														active
														? "bg-neutral-200"
														: "text-neutral-700"
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
														? "bg-neutral-200"
														: "text-neutral-700"
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
														? "bg-neutral-200"
														: "text-danger"
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
								className='text-xs text-neutral-700 font-semibold hover:text-brand-500 transition-colors duration-200 ml-4'>
								Register
							</Link>
							<VerticalLine />
							<Link
								href='/login'
								className='text-xs text-neutral-700 font-semibold hover:text-brand-500 transition-colors duration-200 ml-4'>
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
