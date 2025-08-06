'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Link from 'next/link';

const autoSlideDelay = 4000;

type AuctionItem = {
  id: string;
  itemName: string;
  description: string;
  images: string[];
  currentBid: number;
  endDate: string;
  category: string;
};

const mockAuction: AuctionItem = {
  id: 'abc123',
  itemName: 'Air Jordan 1 Low',
  description:
    'A premium, iconic sneaker featuring a black, white, and orange colorway. Lightweight and durable for everyday wear.',
  images: [
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/3f0a3ad8-dee0-4549-87d8-ee993bb11a99/AIR+JORDAN+1+LOW.png',
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/6c965abe-1f03-4fd8-8c6d-e47fe314bd05/AIR+JORDAN+1+LOW.png',
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/07780859-2650-4a8d-bac3-49c47f669a5b/AIR+JORDAN+1+LOW.png',
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/b308e079-84eb-4f88-9896-8e4bb9282b42/AIR+JORDAN+1+LOW.png',
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/94598164-029f-409c-946a-c058dc936cac/AIR+JORDAN+1+LOW.png',
  ],
  currentBid: 6395,
  endDate: '2025-08-01T10:00:00Z',
  category: "Men's Shoes",
};

export default function AuctionInfo() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    loop: true,
    slideChanged(slider) {
      setSelectedIndex(slider.track.details.rel);
    },
  });

  // Auto scroll
  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, autoSlideDelay);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(mockAuction.endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Auction ended');
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">Home</Link> {'>'} <Link href="/auctions" className="hover:underline">Auctions</Link> {'>'} <span className="text-gray-700 font-medium">{mockAuction.itemName}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="flex gap-4">
          {/* Vertical Thumbnails */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
            {mockAuction.images.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  instanceRef.current?.moveToIdx(i);
                }}
                className={`w-20 h-20 rounded-md overflow-hidden border ${selectedIndex === i ? 'border-main' : 'border-transparent hover:border-gray-300'}`}
              >
                <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Preview with Keen Slider */}
          <div className="flex-1 rounded-xl overflow-hidden relative">
            <div ref={sliderRef} className="keen-slider rounded-xl aspect-square">
              {mockAuction.images.map((img, i) => (
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
              {mockAuction.images.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${selectedIndex === i ? 'bg-main' : 'bg-gray-300'} transition`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Item Info Section */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{mockAuction.itemName}</h1>
          <span className="text-sm text-gray-500 capitalize">Category: {mockAuction.category}</span>
          <p className="text-base text-gray-700 dark:text-gray-300">{mockAuction.description}</p>

          <div className="bg-gray-100 dark:bg-[#222] p-4 rounded-md mt-4">
            <div className="text-xl font-semibold">
              Current Bid: <span className="text-main font-bold">₱{mockAuction.currentBid.toLocaleString()}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Ends in: {timeLeft}</div>
          </div>

          {/* Place a Bid */}
          <button className="mt-4 w-full bg-main text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-main-hover transition">
            Place a Bid
          </button>
        </div>
      </div>
    </div>
  );
}
