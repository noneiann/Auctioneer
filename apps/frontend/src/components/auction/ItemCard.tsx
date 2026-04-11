"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import Badge from "../ui/Badge";

type ItemCardProps = {
	id: string;
	image: string;
	itemName: string;
	price: number | string;
	endDate: string;
	category?: string;
	bidCount?: number;
	variant?: "grid" | "compact";
};

const ItemCard: React.FC<ItemCardProps> = ({
	id,
	image,
	itemName,
	price,
	endDate,
	category,
	bidCount,
	variant = "grid",
}) => {
	const router = useRouter();
	const [timeLeft, setTimeLeft] = useState<string>("");
	const [urgency, setUrgency] = useState<"normal" | "warning" | "urgent" | "ended">("normal");

	useEffect(() => {
		const updateTimer = () => {
			const now = new Date().getTime();
			const end = new Date(endDate).getTime();
			const diff = end - now;

			if (diff <= 0) {
				setTimeLeft("Ended");
				setUrgency("ended");
				return;
			}

			const seconds = Math.floor((diff / 1000) % 60);
			const minutes = Math.floor((diff / (1000 * 60)) % 60);
			const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
			const days    = Math.floor(diff / (1000 * 60 * 60 * 24));

			if (diff < 1000 * 60 * 60)       setUrgency("urgent");
			else if (diff < 1000 * 60 * 60 * 6) setUrgency("warning");
			else                                  setUrgency("normal");

			if (days > 0)        setTimeLeft(`${days}d ${hours}h`);
			else if (hours > 0)  setTimeLeft(`${hours}h ${minutes}m`);
			else                 setTimeLeft(`${minutes}m ${seconds}s`);
		};

		updateTimer();
		const timer = setInterval(updateTimer, 1000);
		return () => clearInterval(timer);
	}, [endDate]);

	const urgencyColor =
		urgency === "urgent"  ? "text-red-400"
		: urgency === "warning" ? "text-amber-400"
		: urgency === "ended"   ? "text-[#4a4a4a]"
		: "text-[#4a4a4a]";

	return (
		<div
			className={`group flex flex-col cursor-pointer ${
				variant === "compact" ? "min-w-[220px] w-[220px]" : "w-full"
			}`}
			onClick={() => router.push(`/auctions/${id}`)}
		>
			{/* Image */}
			<div className="relative overflow-hidden bg-[#181818] rounded-lg">
				<div className={`relative ${variant === "compact" ? "aspect-square" : "aspect-[4/5]"}`}>
					<Image
						src={image}
						alt={itemName}
						fill
						sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
						className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
					/>
					{/* Subtle gradient at bottom */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
				</div>

				{/* Status badge */}
				<div className="absolute top-2.5 left-2.5">
					{urgency === "ended"  && <Badge variant="ended">Ended</Badge>}
					{urgency === "urgent" && <Badge variant="ending">Ending Soon</Badge>}
					{(urgency === "normal" || urgency === "warning") && <Badge variant="live">Live</Badge>}
				</div>

				{/* Bid count */}
				{bidCount !== undefined && bidCount > 0 && (
					<div className="absolute top-2.5 right-2.5">
						<span className="bg-black/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-1 rounded-md">
							{bidCount} {bidCount === 1 ? "bid" : "bids"}
						</span>
					</div>
				)}
			</div>

			{/* Info */}
			<div className="flex flex-col gap-1 pt-3 px-0.5">
				{category && (
					<span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4a4a4a]">
						{category}
					</span>
				)}
				<h3 className="text-[13px] font-semibold text-[#e0e0e0] leading-snug line-clamp-2 group-hover:text-white transition-colors">
					{itemName}
				</h3>
				<div className="flex items-center justify-between mt-0.5">
					<span className="text-sm font-bold text-white">${price}</span>
					<div className={`flex items-center gap-1 text-[11px] font-medium ${urgencyColor}`}>
						<Clock className="w-3 h-3" />
						<span>{timeLeft}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ItemCard;
