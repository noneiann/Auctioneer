"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, DollarSign } from "lucide-react";

// Auction type
type Auction = {
  id: string;
  startTime: string;
  endTime: string;
  startingBid: number;
  category: string;
  currentBid: number;
  item: {
    id: string;
    name: string;
    description: string;
    imageUrl: string[];
    type: string;
  };
  bids: {
    id: string;
    amount: number;
    bidder: { id: string; name: string } | null;
    createdAt: string;
  }[];
};

export default function AuctionInfoPage() {
  const params = useParams();
  const id = Array.isArray(params.auctionId)
    ? params.auctionId[0]
    : params.auctionId;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showBidInput, setShowBidInput] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [error, setError] = useState<string>("");

  // Slider
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    loop: true,
    slideChanged(slider) {
      setSelectedIndex(slider.track.details.rel);
    },
  });

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        if (!id) return;
        const token = getTokenFromStorage();
        if (!token) return;

        const res = await fetch(`http://localhost:4000/auctions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Auction not found");

        const data = await res.json();
        setAuction(data.data);
        setBidAmount(data.data.currentBid);
      } catch (err) {
        console.error("Failed to fetch auction:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  function getTokenFromStorage(): string | null {
    const stored = localStorage.getItem("auth-storage");
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token ?? null;
    } catch (err) {
      console.error("Failed to parse auth-storage", err);
      return null;
    }
  }

  // Countdown timer
  useEffect(() => {
    if (!auction) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft("Auction ended");
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(
        `${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m ${seconds}s`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  // Bid logic
  const handleIncrement = (amount: number) => {
    setBidAmount((prev) => prev + amount);
  };

  const handleBid = () => {
    if (!auction) return null;

    if (bidAmount < minAllowedBid) {
      setError(`Your bid must be at least ₱${minAllowedBid.toLocaleString()}`);
      return;
    }

    setError("");

    // Placeholder logic: update local state only
    setAuction((prev: any) =>
      prev ? { ...prev, currentBid: bidAmount } : prev
    );

    alert(`✅ Bid placed: ₱${bidAmount.toLocaleString()}`);
    setBidAmount(0);
  };

  if (loading) return <p className="p-6">Loading auction...</p>;
  if (!auction) return <p className="p-6">Auction not found.</p>;
  const minAllowedBid = Math.max(auction.startingBid, auction.currentBid);

  const highestBid = auction.bids.length
    ? auction.bids.reduce(
        (max, b) => (b.amount > max.amount ? b : max),
        auction.bids[0]
      )
    : null;

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        {">"}{" "}
        <Link href="/auctions" className="hover:underline">
          Auctions
        </Link>{" "}
        {">"}{" "}
        <span className="text-gray-700 font-medium">{auction.item.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
            {auction.item.imageUrl.map((img, i) => (
              <button
                key={i}
                onClick={() => instanceRef.current?.moveToIdx(i)}
                className={`w-20 h-20 rounded-md overflow-hidden border ${
                  selectedIndex === i
                    ? "border-main"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Main Carousel */}
          <div className="flex-1 rounded-xl overflow-hidden relative">
            <div
              ref={sliderRef}
              className="keen-slider rounded-xl aspect-square"
            >
              {auction.item.imageUrl.map((img, i) => (
                <div key={i} className="keen-slider__slide">
                  <img
                    src={img}
                    alt={`Image ${i}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="absolute bottom-3 w-full flex justify-center gap-2">
              {auction.item.imageUrl.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    selectedIndex === i ? "bg-main" : "bg-gray-300"
                  } transition`}
                ></div>
              ))}
            </div>

            {/* Controls */}
            <button
              onClick={() => instanceRef.current?.prev()}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => instanceRef.current?.next()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Item Info Section */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{auction.item.name}</h1>
          <span className="text-sm text-gray-500 capitalize">
            Category: {auction.category}
          </span>
          <p className="text-base text-gray-700 dark:text-gray-300">
            {auction.item.description}
          </p>

          {/* Current Bid + Timer */}
          <div className="bg-gray-100 dark:bg-[#222] p-4 rounded-md mt-4">
            <div className="text-xl font-semibold">
              <DollarSign className="inline mr-1 text-green-500" />
              Current Bid:
              <span className="text-main font-bold ml-2">
                ₱{auction.currentBid.toLocaleString()}
              </span>
            </div>
            {highestBid && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Bidder: {highestBid.bidder?.name ?? "Anonymous"}
              </div>
            )}
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <Clock className="inline mr-1 text-red-500" />
              Ends in: {timeLeft}
            </div>
          </div>

          {/* Place a Bid */}
          {!showBidInput ? (
            <button
              onClick={() => setShowBidInput(true)}
              className="mt-4 w-full bg-main text-white py-2 px-4 rounded-lg text-sm font-semibold bg-main-hover transition cursor-pointer"
            >
              Place a Bid
            </button>
          ) : (
            <div className="mt-4 p-4 border border-main rounded-lg bg-[var(--background)] space-y-4">
              {/* Bid Input */}
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
                  Enter your bid
                </label>
                <input
                  type="number"
                  value={bidAmount || ""}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--main)] text-sm bg-transparent text-[var(--foreground)]"
                  min={minAllowedBid}
                  placeholder={`Min ₱${minAllowedBid.toLocaleString()}`}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              {/* Quick Increments */}
              <div className="flex gap-2">
                {[10, 100, 1000].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => handleIncrement(inc)}
                    className="px-4 py-1 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] text-sm rounded-md text-[var(--foreground)] cursor-pointer"
                  >
                    +{inc}
                  </button>
                ))}
              </div>

              {/* Submit */}
              <button
                onClick={handleBid}
                className="w-full bg-main text-white py-2 px-4 rounded-lg text-sm font-semibold bg-main-hover transition cursor-pointer"
              >
                Submit Bid
              </button>
            </div>
          )}

          {/* Bid History */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Recent Bids</h2>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {auction.bids.length > 0 ? (
                auction.bids.map((bid) => (
                  <div
                    key={bid.id}
                    className="flex justify-between p-2 border rounded-md bg-gray-50 dark:bg-[#171717]"
                  >
                    <span>{bid.bidder?.name ?? "Anonymous"}</span>
                    <span className="font-bold">
                      ₱{bid.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No bids yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
