import { Search } from "lucide-react";
import React from "react";

type AccentColor = "blue" | "emerald" | "purple";

interface PageHeroProps {
	label: string;
	title: string;
	description?: string;
	accentColor?: AccentColor;
	searchable?: boolean;
	searchPlaceholder?: string;
	onSearch?: (value: string) => void;
	stats?: { label: string; value: string }[];
	actions?: React.ReactNode;
}

const accentMap: Record<AccentColor, { tag: string; bar: string; glow: string }> = {
	blue:    { tag: "text-brand-500",   bar: "bg-brand-500",   glow: "shadow-brand-500/20" },
	emerald: { tag: "text-emerald-400", bar: "bg-emerald-500", glow: "shadow-emerald-500/20" },
	purple:  { tag: "text-purple-400",  bar: "bg-purple-500",  glow: "shadow-purple-500/20" },
};

export default function PageHero({
	label,
	title,
	description,
	accentColor = "blue",
	searchable,
	searchPlaceholder = "Search...",
	onSearch,
	stats,
	actions,
}: PageHeroProps) {
	const accent = accentMap[accentColor];

	return (
		<div className="w-full border-b border-[#1f1f1f] bg-[#111]">
			<div className="max-w-7xl mx-auto px-6 md:px-16 pt-14 pb-10">
				{/* Eyebrow */}
				<p className={`text-xs font-semibold uppercase tracking-[0.18em] ${accent.tag} mb-3`}>
					{label}
				</p>

				{/* Title */}
				<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight">
					{title}
				</h1>

				{/* Accent Bar */}
				<div className={`mt-4 h-[3px] w-16 rounded-full ${accent.bar} shadow-lg ${accent.glow}`} />

				{/* Description */}
				{description && (
					<p className="mt-5 text-[#a0a0a0] text-base md:text-lg max-w-2xl leading-relaxed">
						{description}
					</p>
				)}

				{/* Stats Row */}
				{stats && stats.length > 0 && (
					<div className="mt-8 flex gap-8 flex-wrap">
						{stats.map((s) => (
							<div key={s.label}>
								<p className="text-2xl font-bold text-white">{s.value}</p>
								<p className="text-xs text-[#737373] uppercase tracking-wider mt-0.5">{s.label}</p>
							</div>
						))}
					</div>
				)}

				{/* Actions */}
				{actions && <div className="mt-8">{actions}</div>}

				{/* Search */}
				{searchable && (
					<div className="mt-8 relative max-w-xl">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
						<input
							type="text"
							placeholder={searchPlaceholder}
							onChange={(e) => onSearch?.(e.target.value)}
							className="w-full bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] focus:border-brand-500 rounded-lg pl-11 pr-4 py-3 text-white text-sm placeholder-[#4a4a4a] outline-none transition-colors"
						/>
					</div>
				)}
			</div>
		</div>
	);
}
