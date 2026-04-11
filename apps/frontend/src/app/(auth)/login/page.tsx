// Login.tsx
"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import AuthApi from "@/lib/AuthApi";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { setAuth, isAuthenticated } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isAuthenticated) router.replace("/");
	}, [isAuthenticated, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		try {
			const response = await AuthApi.login(email, password);
			if (response.success) {
				setAuth(response.data.user, response.data.token);
				router.replace("/");
			} else {
				const msg = response.data ?? "Login failed";
				setError(msg);
				toast.error(msg);
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Login failed";
			setError(msg);
			toast.error(msg);
		}
		setIsLoading(false);
	};

	return (
		<div className="min-h-screen bg-[#111] flex">
			{/* ── Left: Form panel ── */}
			<div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-16 max-w-xl w-full">
				{/* Wordmark */}
				<Link href="/" className="flex items-center gap-2.5 mb-16 group w-fit">
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
				<div className="mb-10">
					<h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
						Welcome back.
					</h1>
					<p className="mt-2 text-[#737373] text-sm">
						Sign in to continue to your account.
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-1">
						<label className="text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a]">
							Email
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							required
							autoComplete="email"
							className="w-full px-4 py-3 rounded-lg border border-[#2a2a2a] bg-[#181818] text-white placeholder-[#3a3a3a] focus:border-[#404040] focus:outline-none transition-colors text-sm hover:border-[#333]"
						/>
					</div>

					<div className="space-y-1">
						<label className="text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a]">
							Password
						</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
								autoComplete="current-password"
								className="w-full px-4 py-3 pr-11 rounded-lg border border-[#2a2a2a] bg-[#181818] text-white placeholder-[#3a3a3a] focus:border-[#404040] focus:outline-none transition-colors text-sm hover:border-[#333]"
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
						{isLoading ? "Signing in…" : "Sign In"}
					</button>
				</form>

				{/* Footer */}
				<p className="mt-8 text-sm text-[#4a4a4a]">
					Don&apos;t have an account?{" "}
					<Link
						href="/register"
						className="text-[#a0a0a0] hover:text-white transition-colors font-medium"
					>
						Create one
					</Link>
				</p>
			</div>

			{/* ── Right: Decorative panel (hidden on mobile) ── */}
			<div className="hidden lg:flex flex-1 relative bg-[#0d0d0d] border-l border-[#1f1f1f] items-center justify-center overflow-hidden">
				{/* Radial glow */}
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

					{/* Stat pills */}
					<div className="mt-10 flex items-center justify-center gap-6">
						{[
							{ value: "10K+", label: "Items Listed" },
							{ value: "500+", label: "Sellers" },
							{ value: "99%", label: "Satisfaction" },
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
