'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    title: 'Discover Exclusive Deals',
    subtitle: 'Bid now and win big on rare finds.',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Limited-Time Auctions',
    subtitle: 'Snag the best items before time runs out.',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Trusted Sellers Only',
    subtitle: 'Buy with confidence from top-rated sellers.',
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'New Listings Daily',
    subtitle: 'Check back for the latest treasures.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
  });

  const timeout = useRef<NodeJS.Timeout | null>(null);

  const clearNextTimeout = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
  };

  useEffect(() => {
    if (!slider) return;

    const next = () => {
      slider.current?.next();
    };

    const startAutoScroll = () => {
      clearNextTimeout();
      timeout.current = setTimeout(next, 5000);
    };

    slider.current?.on('created', startAutoScroll);
    slider.current?.on('dragStarted', clearNextTimeout);
    slider.current?.on('animationEnded', startAutoScroll);
    slider.current?.on('updated', startAutoScroll);
  }, [slider]);

  return (
    <div className="relative mb-8 group">
      <div ref={sliderRef} className="keen-slider rounded-xl overflow-hidden shadow-sm border border-[#1e293b]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="keen-slider__slide relative h-[250px] sm:h-[300px] md:h-[400px] text-white"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority={index === 0}
              className="object-cover object-center"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent flex flex-col justify-end p-8 sm:p-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight text-white drop-shadow-md">{slide.title}</h2>
              <p className="text-base md:text-xl text-brand-200 max-w-2xl drop-shadow-sm">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          slider.current?.prev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#0f172a]/80 hover:bg-brand-600 border border-[#1e293b] text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 shadow-lg backdrop-blur-sm focus:outline-none focus:opacity-100 focus:ring-2 focus:ring-brand-500"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          slider.current?.next();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#0f172a]/80 hover:bg-brand-600 border border-[#1e293b] text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 shadow-lg backdrop-blur-sm focus:outline-none focus:opacity-100 focus:ring-2 focus:ring-brand-500"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Page Indicator Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              slider.current?.moveToIdx(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-[#020617] ${
              currentSlide === index ? 'bg-brand-500 w-8' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
