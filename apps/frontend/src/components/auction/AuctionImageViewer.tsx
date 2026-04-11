// components/AuctionImageViewer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Image from 'next/image';

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

  // Auto-scroll removed since this is a product viewer where manual control provides better UX.

  return (
    <div className="flex gap-4 w-full">
      {/* Vertical Thumbnail Carousel */}
      <div className="flex flex-col gap-3 pr-2">
        {images.map((src, idx) => (
          <button
            key={idx}
            type="button"
            className={`w-20 h-20 rounded-md border-2 ${
              currentSlide === idx ? 'border-brand-500' : 'border-transparent'
            } overflow-hidden cursor-pointer`}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
          >
            <span className="relative block w-full h-full">
              <Image
                src={src}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </span>
          </button>
        ))}
      </div>

      {/* Main Image Carousel */}
      <div className="flex-1 flex flex-col items-center">
        <div ref={sliderRef} className="keen-slider rounded-lg overflow-hidden w-full aspect-square">
          {images.map((src, idx) => (
            <div key={idx} className="keen-slider__slide flex justify-center items-center group cursor-crosshair">
              <div className="relative w-full h-full overflow-hidden rounded-lg">
                <Image
                  src={src}
                  alt={`Image ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-4">
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full ${
                currentSlide === idx ? 'bg-brand-500' : 'bg-neutral-400'
              }`}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
