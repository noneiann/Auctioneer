// components/AuctionImageViewer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

type Props = {
  images: string[];
};

export default function AuctionImageViewer({ images }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged: (s) => setCurrentSlide(s.track.details.rel),
    loop: true,
    renderMode: 'performance',
  });

  // Auto-scroll every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 5000);
    return () => clearInterval(interval);
  }, [instanceRef]);

  return (
    <div className="flex gap-4 w-full">
      {/* Vertical Thumbnail Carousel */}
      <div className="flex flex-col gap-2">
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            className={`w-16 h-16 object-cover rounded-md border-2 ${
              currentSlide === idx ? 'border-blue-500' : 'border-transparent'
            } cursor-pointer`}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
          />
        ))}
      </div>

      {/* Main Image Carousel */}
      <div className="flex-1 flex flex-col items-center">
        <div ref={sliderRef} className="keen-slider rounded-lg overflow-hidden w-full aspect-square">
          {images.map((src, idx) => (
            <div key={idx} className="keen-slider__slide flex justify-center items-center">
              <img src={src} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-4">
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full ${
                currentSlide === idx ? 'bg-blue-500' : 'bg-gray-400'
              }`}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
            />
          ))}
        </div>

        {/* Place a Bid Button */}
        <button className="w-full mt-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          Place a Bid
        </button>
      </div>
    </div>
  );
}
