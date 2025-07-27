// Login.tsx
"use client";
import Logo from "@/components/Logo";
import React, { useState, useEffect } from "react";
import AuthApi from "@/lib/AuthApi";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { token, setAuth, isAuthenticated } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isAuthenticated) {
			router.replace("/"); // Redirect to home if already authenticated
		}
	}, [isAuthenticated, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const response = await AuthApi.login(email, password);
			if (response.success) {
				setAuth(response.data.user, response.data.token);
				router.replace("/"); // Redirect to home after successful login

				console.log("Login success:", response.data);
			} else {
				// Handle login failure
				alert("Login failed: " + response.data);
			}
		} catch (err: any) {
			alert("Login error: " + err.message);
		}
		setIsLoading(false);
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4'>
			<div className='w-full max-w-sm space-y-8'>
				{/* Logo */}
				<div className='flex justify-center gap-2'>
					<Logo width={40} height={35} />
					<h1 className='text-2xl font-medium text-main text-gray-900 dark:text-gray-100'>
						Auctioneer
					</h1>
				</div>

				{/* Header */}
				<div className='text-center'>
					<h1 className='text-2xl font-light text-gray-900 dark:text-gray-100'>
						Welcome back
					</h1>
					<p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
						Sign in to your account
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<input
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='Email address'
							required
							className='w-full px-0 py-3 border-0 border-b border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors'
						/>
					</div>

					<div>
						<input
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder='Password'
							required
							className='w-full px-0 py-3 border-0 border-b border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors'
						/>
					</div>

					<button
						type='submit'
						disabled={isLoading}
						className='w-full py-3 px-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-none hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
						{isLoading ? "Signing in..." : "Sign in"}
					</button>
				</form>

				{/* Footer */}
				<div className='text-center'>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						Don't have an account?{" "}
						<a
							href='/register'
							className='font-medium text-blue-600 dark:text-blue-400 hover:underline'>
							Sign up
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
