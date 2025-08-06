'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

const slides = [
  {
    title: 'Discover Exclusive Deals',
    subtitle: 'Bid now and win big on rare finds.',
    image: 'https://picsum.photos/id/1015/1200/400',
  },
  {
    title: 'Limited-Time Auctions',
    subtitle: 'Snag the best items before time runs out.',
    image: 'https://picsum.photos/id/1016/1200/400',
  },
  {
    title: 'Trusted Sellers Only',
    subtitle: 'Buy with confidence from top-rated sellers.',
    image: 'https://picsum.photos/id/1020/1200/400',
  },
  {
    title: 'New Listings Daily',
    subtitle: 'Check back for the latest treasures.',
    image: 'https://picsum.photos/id/1035/1200/400',
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
    <div className="relative mb-8">
      <div ref={sliderRef} className="keen-slider rounded-md overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="keen-slider__slide relative h-[250px] sm:h-[300px] md:h-[400px] text-white flex items-center justify-center"
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute w-full h-full object-cover object-center"
            />
            <div className="relative z-10 text-center bg-black/40 p-6 rounded-md max-w-lg">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h2>
              <p className="text-sm md:text-lg">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Page Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              currentSlide === index ? 'bg-main' : 'bg-gray-300 dark:bg-gray-600'
            } transition-all duration-300`}
          />
        ))}
      </div>
    </div>
  );
}
