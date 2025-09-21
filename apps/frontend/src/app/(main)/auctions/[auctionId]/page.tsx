"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, DollarSign, MessageCircle, User, Star, TrendingUp, ShoppingBag, Calendar } from "lucide-react";
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
  minimumBid?: number;
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

  const { 
    placeBid, 
    getAuctionById, 
    getInitialBidAmount, 
    currentAuction,
    auctionLoading,
    subscribeToAuctionEvents,
    unsubscribeFromAuctionEvents
  } = useAuctions();
  
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
        
        // Use the enhanced hook method
        const auctionData = await getAuctionById(id);
        setAuction(auctionData);
        
        // Set initial bid amount using the new helper
        const initialBid = getInitialBidAmount(auctionData);
        setBidAmount(initialBid);
        
        // Subscribe to real-time events (prepared for WebSocket)
        subscribeToAuctionEvents(id);
        
      } catch (err: any) {
        console.error("Failed to fetch auction:", err);
        setError(err.message || "Failed to fetch auction");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuction();
    
    // Cleanup: unsubscribe from events when component unmounts or ID changes
    return () => {
      if (id) {
        unsubscribeFromAuctionEvents(id);
      }
    };
  }, [id, getAuctionById, getInitialBidAmount, subscribeToAuctionEvents, unsubscribeFromAuctionEvents]);

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
    
    // Use the minimum bid from the auction data
    const minimumRequired = auction.minimumBid || (auction.currentBid + 10);
    if (bidAmount < minimumRequired) {
      setError(`Your bid must be at least ₱${minimumRequired.toLocaleString()}`);
      return;
    }

    setError("");
    setIsPlacingBid(true);

    try {
      const result = await placeBid(id, bidAmount);
      
      // The hook will automatically update the current auction
      // Refresh local state with updated data
      const updatedAuction = await getAuctionById(id);
      setAuction(updatedAuction);
      
      // Reset form with new minimum bid
      setShowBidInput(false);
      const newInitialBid = getInitialBidAmount(updatedAuction);
      setBidAmount(newInitialBid);
      
      alert(`✅ Bid placed successfully: ₱${bidAmount.toLocaleString()}`);
    } catch (err: any) {
      setError(err.message || "Failed to place bid");
    } finally {
      setIsPlacingBid(false);
    }
  };

  if (loading || auctionLoading) return <p className="p-6">Loading auction...</p>;
  if (!auction) return <p className="p-6">Auction not found.</p>;
  
  const minAllowedBid = auction.minimumBid || Math.max(auction.startingBid, auction.currentBid + 1);

  const highestBid = auction.bids.length
    ? auction.bids.reduce(
        (max, b) => (b.amount > max.amount ? b : max),
        auction.bids[0]
      )
    : null;

  // Mock seller data
  const mockSeller = {
    id: "seller-123",
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    successRate: 98.5,
    rating: 4.9,
    totalTransactions: 127,
    joinedDate: "2022-03-15",
    isVerified: true,
    responseTime: "< 1 hour"
  };

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
            <div className="flex-1 rounded-xl overflow-hidden relative">
              <div
                ref={sliderRef}
                className="keen-slider rounded-xl h-full"
              >
                {auction.item.imageUrl.map((img, i) => (
                  <div key={i} className="keen-slider__slide flex items-center justify-center">
                    <img
                      src={img}
                      alt={`Image ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Controls */}
              <button
                onClick={() => instanceRef.current?.prev()}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => instanceRef.current?.next()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Right: Item Info & Bidding */}
          <div className="space-y-6 flex flex-col">
            {/* Item Title & Status */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {auction.item.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                      {auction.category}
                    </span>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                  auctionStatus === 'active' ? 'bg-green-100 text-green-800 ring-1 ring-green-200' :
                  auctionStatus === 'upcoming' ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200' :
                  'bg-red-100 text-red-800 ring-1 ring-red-200'
                }`}>
                  {auctionStatus === 'active' ? '🟢 Live' :
                   auctionStatus === 'upcoming' ? '🟡 Upcoming' :
                   '🔴 Ended'}
                </div>
              </div>
            </div>

            {/* Current Bidding Status - Compact */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl border border-green-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Bid</div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-green-500" size={18} />
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₱{auction.currentBid.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Bids</div>
                  <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {auction.bids.length}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Clock className="text-red-500" size={16} />
                <span className="font-medium text-red-600 dark:text-red-400">
                  {timeLeft}
                </span>
              </div>
            </div>

            {/* Expanded Bid History - Takes more space */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Bids</h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {auction.bids.length > 0 ? (
                  auction.bids
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 8)
                    .map((bid, index) => (
                      <div
                        key={bid.id}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          index === 0 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                            : 'bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}>
                            {index === 0 ? '👑' : index + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {bid.bidder?.name ?? "Anonymous"}
                              {index === 0 && (
                                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                                  Leading
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
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
                            index === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            ₱{bid.amount.toLocaleString()}
                          </div>
                          {index > 0 && auction.bids[index - 1] && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +₱{(bid.amount - auction.bids[index - 1].amount).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-600 text-4xl mb-2">📢</div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No bids yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Be the first to place a bid!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Place Bid Section - Button only */}
            <button
              onClick={() => setShowBidInput(true)}
              disabled={auctionStatus !== 'active'}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition cursor-pointer ${
                auctionStatus === 'active' 
                  ? 'bg-main text-white hover:bg-main-hover' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {auctionStatus === 'active' ? 'Place a Bid' :
               auctionStatus === 'upcoming' ? 'Auction Not Started' :
               'Auction Ended'}
            </button>
          </div>
        </div>

        {/* Middle Section: Seller Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Left: Seller Info */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={mockSeller.avatar}
                  alt={mockSeller.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                {mockSeller.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {mockSeller.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Member since {new Date(mockSeller.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 bg-main text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-main-hover transition cursor-pointer">
                    <MessageCircle size={16} />
                    Chat Now
                  </button>
                  <button className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer">
                    <User size={16} />
                    View Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Seller Performance */}
            <div className="flex flex-col justify-center">
              <div className="grid grid-cols-4 gap-1">
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="text-green-600 dark:text-green-400" size={14} />
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {mockSeller.successRate}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="text-yellow-600 dark:text-yellow-400" size={14} />
                    <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      {mockSeller.rating}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Rating</div>
                </div>
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <ShoppingBag className="text-blue-600 dark:text-blue-400" size={14} />
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {mockSeller.totalTransactions}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Transactions</div>
                </div>
                <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="text-purple-600 dark:text-purple-400" size={14} />
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {mockSeller.responseTime}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Response</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Auction Details - Vertical Layout */}
        <div className="space-y-6">
          {/* Auction Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Calendar className="text-blue-500" size={20} />
              Auction Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
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
              <div>
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
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Starting Bid</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  ₱{auction.startingBid.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Minimum Increment</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">₱10</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {auction.item.description}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Bid Overlay - Outside main container */}
      {showBidInput && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Place Your Bid</h3>
                <button
                  onClick={() => {
                    setShowBidInput(false);
                    setError("");
                    // Reset to initial bid amount using the helper
                    const initialBid = getInitialBidAmount(auction);
                    setBidAmount(initialBid);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Highest Bid</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ₱{auction.currentBid.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Minimum bid: ₱{(auction.minimumBid || (auction.currentBid + 10)).toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Bid Amount
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</div>
                    <input
                      type="number"
                      value={bidAmount || ""}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="w-full border-2 border-gray-300 dark:border-gray-600 pl-8 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-main focus:border-main font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg"
                      min={minAllowedBid}
                      placeholder={`${minAllowedBid.toLocaleString()}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[10, 100, 500].map((inc) => (
                    <button
                      key={inc}
                      onClick={() => handleIncrement(inc)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                    >
                      +₱{inc}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowBidInput(false);
                      setError("");
                      // Reset to initial bid amount using the helper
                      const initialBid = getInitialBidAmount(auction);
                      setBidAmount(initialBid);
                    }}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBid}
                    disabled={isPlacingBid || bidAmount <= auction.currentBid}
                    className="flex-1 bg-main hover:bg-main-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {isPlacingBid ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Placing...
                      </>
                    ) : (
                      "Submit Bid"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}