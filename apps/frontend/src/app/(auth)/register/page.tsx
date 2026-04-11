"use client";
import Image from "next/image";
import React, { useState } from "react";
import AuthApi from "@/lib/AuthApi";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { setAuth } = useAuth();
	const router = useRouter();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		if (formData.password !== formData.confirmPassword) {
			const msg = "Passwords do not match";
			setError(msg);
			toast.error(msg);
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
				setAuth(response.data.user, response.data.token);
				router.replace("/");
			} else {
				const msg = response.data ?? "Registration failed";
				setError(msg);
				toast.error(msg);
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Registration failed";
			setError(msg);
			toast.error(msg);
		}
		setIsLoading(false);
	};

	const inputClass =
		"w-full px-4 py-3 rounded-lg border border-[#2a2a2a] bg-[#181818] text-white placeholder-[#3a3a3a] focus:border-[#404040] focus:outline-none transition-colors text-sm hover:border-[#333]";

	return (
		<div className="min-h-screen bg-[#111] flex">
			{/* ── Left: Form panel ── */}
			<div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-16 max-w-xl w-full">
				{/* Wordmark */}
				<Link href="/" className="flex items-center gap-2.5 mb-12 group w-fit">
					<Image
						src="/logo-white.svg"
						alt="Auctioneer"
						width={28}
						height={28}
						className="h-7 w-7 dark:block hidden"
					/>
					<Image
						src="/logo-dark.svg"
						alt="Auctioneer"
						width={28}
						height={28}
						className="h-7 w-7 block dark:hidden"
					/>
					<span className="font-bold text-[13px] tracking-[0.1em] uppercase text-white">
						Auctioneer
					</span>
				</Link>

				{/* Heading */}
				<div className="mb-8">
					<h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
						Create an account.
					</h1>
					<p className="mt-2 text-[#737373] text-sm">
						Join thousands of buyers and sellers on Auctioneer.
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Name row */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<label className="text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a]">
								First Name
							</label>
							<input
								type="text"
								name="firstName"
								value={formData.firstName}
								onChange={handleChange}
								placeholder="John"
								required
								autoComplete="given-name"
								className={inputClass}
							/>
						</div>
						<div className="space-y-1">
							<label className="text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a]">
								Last Name
							</label>
							<input
								type="text"
								name="lastName"
								value={formData.lastName}
								onChange={handleChange}
								placeholder="Doe"
								required
								autoComplete="family-name"
								className={inputClass}
							/>
						</div>
					</div>

					<div className="space-y-1">
						<label className="text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a]">
							Username
						</label>
						<input
							type="text"
							name="username"
							value={formData.username}
							onChange={handleChange}
							placeholder="johndoe"
							required
							autoComplete="username"
							className={inputClass}
						/>
					</div>

					<div className="space-y-1">
						<label className="text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a]">
							Email
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="you@example.com"
							required
							autoComplete="email"
							className={inputClass}
						/>
					</div>

					<div className="space-y-1">
						<label className="text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a]">
							Password
						</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="••••••••"
								required
								autoComplete="new-password"
								className={`${inputClass} pr-11`}
							/>
							<button
								type="button"
								onClick={() => setShowPassword((v) => !v)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#737373] transition-colors"
							>
								{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
							</button>
						</div>
					</div>

					<div className="space-y-1">
						<label className="text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a]">
							Confirm Password
						</label>
						<div className="relative">
							<input
								type={showConfirm ? "text" : "password"}
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleChange}
								placeholder="••••••••"
								required
								autoComplete="new-password"
								className={`${inputClass} pr-11`}
							/>
							<button
								type="button"
								onClick={() => setShowConfirm((v) => !v)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#737373] transition-colors"
							>
								{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
							</button>
						</div>
					</div>

					{error && (
						<div className="text-[13px] text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-4 py-3">
							{error}
						</div>
					)}

					<button
						type="submit"
						disabled={isLoading}
						className="w-full py-3 px-4 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-2"
					>
						{isLoading ? "Creating account…" : "Create Account"}
					</button>
				</form>

				<p className="mt-8 text-sm text-[#4a4a4a]">
					Already have an account?{" "}
					<Link
						href="/login"
						className="text-[#a0a0a0] hover:text-white transition-colors font-medium"
					>
						Sign in
					</Link>
				</p>
			</div>

			{/* ── Right: Decorative panel (hidden on mobile) ── */}
			<div className="hidden lg:flex flex-1 relative bg-[#0d0d0d] border-l border-[#1f1f1f] items-center justify-center overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a2f52_0%,_transparent_70%)] opacity-60 pointer-events-none" />
				<div className="relative z-10 text-center px-12">
					<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-500 mb-4">
						The Complete Marketplace
					</p>
					<h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
						Bid. Buy.<br />Barter.
					</h2>
					<p className="mt-4 text-[#737373] text-sm max-w-xs mx-auto leading-relaxed">
						Discover rare finds, limited editions, and exclusive items from verified sellers.
					</p>
					<div className="mt-10 flex items-center justify-center gap-6">
						{[
							{ value: "10K+", label: "Items Listed" },
							{ value: "500+", label: "Sellers" },
							{ value: "99%",  label: "Satisfaction" },
						].map((s) => (
							<div key={s.label} className="text-center">
								<p className="text-xl font-bold text-white">{s.value}</p>
								<p className="text-[10px] uppercase tracking-wider text-[#4a4a4a] mt-0.5">{s.label}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
