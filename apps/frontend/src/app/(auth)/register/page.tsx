"use client";
import Logo from "@/components/Logo";
import React, { useState } from "react";
import AuthApi from "@/lib/AuthApi";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Register() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [isLoading, setIsLoading] = useState(false);

	const { setAuth } = useAuth();
	const router = useRouter();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		if (formData.password !== formData.confirmPassword) {
			alert("Passwords do not match");
			setIsLoading(false);
			return;
		}

		try {
			const response = await AuthApi.register({
				firstName: formData.firstName,
				lastName: formData.lastName,
				username: formData.username,
				email: formData.email,
				password: formData.password,
			});
			if (response.success) {
				setAuth(response.data.user, response.data.token); // Store in Zustand
				router.replace("/"); // Redirect to home
			} else {
				alert("Registration failed: " + response.data);
			}
		} catch (err: any) {
			alert("Registration error: " + err.message);
		}
		setIsLoading(false);
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4'>
			<div className='w-full max-w-sm space-y-8'>
				{/* Logo */}
				<div className='flex justify-center'>
					<Logo width={40} height={35} />
					<h1 className='text-2xl font-medium text-main text-gray-900 dark:text-gray-100'>
						Auctioneer
					</h1>
				</div>

				{/* Header */}
				<div className='text-center'>
					<h1 className='text-2xl font-light text-gray-900 dark:text-gray-100'>
						Create account
					</h1>
					<p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
						Join us today
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className='space-y-6'>
					<div className='grid grid-cols-2 gap-4'>
						<input
							type='text'
							name='firstName'
							value={formData.firstName}
							onChange={handleChange}
							placeholder='First name'
							required
							className='px-0 py-3 border-0 border-b border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors'
						/>
						<input
							type='text'
							name='lastName'
							value={formData.lastName}
							onChange={handleChange}
							placeholder='Last name'
							required
							className='px-0 py-3 border-0 border-b border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors'
						/>
					</div>

					<div className=''>
						<input
							type='text'
							name='username'
							value={formData.username}
							onChange={handleChange}
							placeholder='Username'
							required
							className='w-full px-0 py-3 border-0 border-b border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors'
						/>
					</div>

					<div>
						<input
							type='email'
							name='email'
							value={formData.email}
							onChange={handleChange}
							placeholder='Email address'
							required
							className='w-full px-0 py-3 border-0 border-b border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors'
						/>
					</div>

					<div>
						<input
							type='password'
							name='password'
							value={formData.password}
							onChange={handleChange}
							placeholder='Password'
							required
							className='w-full px-0 py-3 border-0 border-b border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors'
						/>
					</div>

					<div>
						<input
							type='password'
							name='confirmPassword'
							value={formData.confirmPassword}
							onChange={handleChange}
							placeholder='Confirm password'
							required
							className='w-full px-0 py-3 border-0 border-b border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors'
						/>
					</div>

					<button
						type='submit'
						disabled={isLoading}
						className='w-full py-3 px-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-none hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
						{isLoading ? "Creating account..." : "Create account"}
					</button>
				</form>

				{/* Footer */}
				<div className='text-center'>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						Already have an account?{" "}
						<a
							href='/login'
							className='font-medium text-blue-600 dark:text-blue-400 hover:underline'>
							Sign in
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
