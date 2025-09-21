"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, DollarSign } from "lucide-react";
import useAuctions from "@/hooks/useAuctions";
import { auctionApi } from "@/lib/AuctionApi";

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

  const { placeBid } = useAuctions();
  
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showBidInput, setShowBidInput] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);

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
        
        const response = await auctionApi.getAuctionById(id);
        setAuction(response.data);
        setBidAmount(response.data.currentBid + 10); // Set default bid to current + 10
      } catch (err: any) {
        console.error("Failed to fetch auction:", err);
        setError(err.message || "Failed to fetch auction");
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

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

  // Determine auction status
  const getAuctionStatus = () => {
    if (!auction) return "loading";
    const now = new Date();
    const startTime = new Date(auction.startTime);
    const endTime = new Date(auction.endTime);
    
    if (now < startTime) return "upcoming";
    if (now > endTime) return "ended";
    return "active";
  };

  const auctionStatus = getAuctionStatus();

  // Bid logic
  const handleIncrement = (amount: number) => {
    setBidAmount((prev) => prev + amount);
  };

  const handleBid = async () => {
    if (!auction || !id) return;

    // Check if auction has ended
    if (new Date() > new Date(auction.endTime)) {
      setError("This auction has ended");
      return;
    }

    // Check if auction has started
    if (new Date() < new Date(auction.startTime)) {
      setError("This auction has not started yet");
      return;
    }
    
    if (bidAmount <= auction.currentBid) {
      setError(`Your bid must be higher than the current bid of ₱${auction.currentBid.toLocaleString()}`);
      return;
    }

    setError("");
    setIsPlacingBid(true);

    try {
      const result = await placeBid(id, bidAmount);
      
      // Refresh auction data after successful bid
      const response = await auctionApi.getAuctionById(id);
      setAuction(response.data);
      
      // Reset form
      setShowBidInput(false);
      setBidAmount(response.data.currentBid + 10);
      
      alert(`✅ Bid placed successfully: ₱${bidAmount.toLocaleString()}`);
    } catch (err: any) {
      setError(err.message || "Failed to place bid");
    } finally {
      setIsPlacingBid(false);
    }
  };

  if (loading) return <p className="p-6">Loading auction...</p>;
  if (!auction) return <p className="p-6">Auction not found.</p>;
  
  const minAllowedBid = Math.max(auction.startingBid, auction.currentBid + 1);

  const highestBid = auction.bids.length
    ? auction.bids.reduce(
        (max, b) => (b.amount > max.amount ? b : max),
        auction.bids[0]
      )
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 animate-fade-in">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm">
          <Link href="/" className="hover:text-main transition-colors font-medium">
            🏠 Home
          </Link>
          <span className="mx-2">•</span>
          <Link href="/auctions" className="hover:text-main transition-colors font-medium">
            🔨 Auctions
          </Link>
          <span className="mx-2">•</span>
          <span className="text-gray-700 dark:text-gray-300 font-semibold truncate">
            {auction.item.name}
          </span>
        </nav>

        {/* Top Section: Carousel Left, Item Info & Bidding Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Image Carousel */}
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
            <div className="flex-1 rounded-xl overflow-hidden relative max-w-2xl mx-auto">
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
        </div>

        {/* Item Info Section - Full Width Below Images */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {auction.item.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  {auction.category}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Item ID: {auction.item.id.slice(0, 8)}...
                </span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
              auctionStatus === 'active' ? 'bg-green-100 text-green-800 ring-1 ring-green-200' :
              auctionStatus === 'upcoming' ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200' :
              'bg-red-100 text-red-800 ring-1 ring-red-200'
            }`}>
              {auctionStatus === 'active' ? '🟢 Live Auction' :
               auctionStatus === 'upcoming' ? '🟡 Upcoming' :
               '🔴 Auction Ended'}
            </div>
          </div>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            {auction.item.description}
          </p>

          {/* Auction Details Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-blue-100 dark:border-gray-700 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Auction Details</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">Start Time</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(auction.startTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">End Time</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(auction.endTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-blue-200 dark:border-gray-600 pt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Remaining</div>
              <div className="flex items-center gap-2">
                <Clock className="text-red-500" size={18} />
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>
            </div>

            {/* Right Column - Bidding & Current Status */}
            <div className="space-y-6">
              {/* Current Bid + Timer */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-green-100 dark:border-gray-700 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Current Bidding Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Highest Bid</div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-green-500" size={20} />
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₱{auction.currentBid.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Bids</div>
                  <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {auction.bids.length}
                  </div>
                </div>
              </div>

              {highestBid && (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-gray-600">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Leading Bidder</div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {highestBid.bidder?.name ?? "Anonymous"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Placed on {new Date(highestBid.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-green-200 dark:border-gray-600 pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Starting Bid:</span>
                    <span className="font-medium ml-2 text-gray-800 dark:text-gray-200">
                      ₱{auction.startingBid.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Minimum Increment:</span>
                    <span className="font-medium ml-2 text-gray-800 dark:text-gray-200">
                      ₱10
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Next Minimum Bid:</span>
                  <span className="font-bold ml-2 text-main">
                    ₱{(auction.currentBid + 10).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Place a Bid */}
          {!showBidInput ? (
            <button
              onClick={() => setShowBidInput(true)}
              disabled={auctionStatus !== 'active'}
              className={`mt-4 w-full py-2 px-4 rounded-lg text-sm font-semibold transition cursor-pointer ${
                auctionStatus === 'active' 
                  ? 'bg-main text-white hover:bg-main-hover' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {auctionStatus === 'active' ? 'Place a Bid' :
               auctionStatus === 'upcoming' ? 'Auction Not Started' :
               'Auction Ended'}
            </button>
          ) : (
            <div className="mt-6 p-6 border-2 border-dashed border-main/20 rounded-xl bg-main/5 space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Place Your Bid</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Minimum bid: ₱{(auction.currentBid + 10).toLocaleString()}
                </p>
              </div>

              {/* Bid Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter your bid amount
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</div>
                  <input
                    type="number"
                    value={bidAmount || ""}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 pl-8 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-main focus:border-main text-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    min={minAllowedBid}
                    placeholder={`${minAllowedBid.toLocaleString()}`}
                  />
                </div>
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}
              </div>

              {/* Quick Increments */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick increments:</div>
                <div className="flex gap-2">
                  {[10, 100, 500, 1000].map((inc) => (
                    <button
                      key={inc}
                      onClick={() => handleIncrement(inc)}
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                    >
                      +₱{inc.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowBidInput(false);
                    setError("");
                    setBidAmount(auction.currentBid + 10);
                  }}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBid}
                  disabled={isPlacingBid || bidAmount <= auction.currentBid}
                  className="flex-2 bg-main hover:bg-main-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center min-w-[140px]"
                >
                  {isPlacingBid ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Placing...
                    </>
                  ) : (
                    <>
                      Submit Bid
                      <span className="ml-2 text-sm opacity-90">
                        ₱{bidAmount.toLocaleString()}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Bid History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Bid History</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {auction.bids.length} {auction.bids.length === 1 ? 'bid' : 'bids'} placed
              </div>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {auction.bids.length > 0 ? (
                auction.bids
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        index === 0 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                          {index === 0 ? '👑' : index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {bid.bidder?.name ?? "Anonymous"}
                            {index === 0 && (
                              <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                                Leading
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(bid.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          index === 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          ₱{bid.amount.toLocaleString()}
                        </div>
                        {index > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +₱{(bid.amount - auction.bids[index - 1]?.amount || 0).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-600 text-4xl mb-2">📢</div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No bids yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Be the first to place a bid!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
