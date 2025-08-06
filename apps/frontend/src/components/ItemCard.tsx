'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type ItemCardProps = {
  id: string;
  image: string;
  itemName: string;
  price: number | string;
  endDate: string; // ISO date string like "2025-08-01T12:00:00Z"
};

const ItemCard: React.FC<ItemCardProps> = ({ id, image, itemName, price, endDate }) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Auction ended');
        return;
      }

      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      setTimeLeft(
        `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`
      );
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const handleClick = () => {
    router.push(`/auctions/${id}`);
  };

  return (
    <div
      className='flex flex-col gap-1 cursor-pointer'
      onClick={handleClick}
    >
      {/* Item Image */}
      <div className='w-50 rounded-md'>
        <img
          src={image}
          alt={itemName}
          className='rounded-md aspect-square object-cover'
        />
      </div>

      {/* Item Details */}
      <div className='flex flex-col gap-1'>
        <div>
          <span>{itemName}</span>
        </div>
        <div>
          <span>
            <strong>${price}</strong>
          </span>
        </div>
        {/* Countdown Timer */}
        <div className='text-sm text-gray-500'>
          <span>Duration: </span>{timeLeft}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
