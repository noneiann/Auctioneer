'use client';

import React from 'react';
import ItemCard from '@/components/ItemCard';
import CategorySidebar from '@/components/CategorySidebar';
import Carousel from '@/components/HeroCarousel';
import Breadcrumb from '@/components/Breadcrumb';

export default function AuctionsPage() {
  return (
    <div className="px-6 py-4 animate-fade-in">
      {/* Carousel and Breadcrumb */}
      <Carousel />
      <Breadcrumb />

      <div className="flex gap-6">
        {/* Sidebar */}
        <CategorySidebar />

        {/* Main Items Section */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">All Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            <ItemCard
              id='1'
              image="https://i.ebayimg.com/images/g/0oAAAeSwrgZohCVw/s-l1600.webp"
              itemName="Shoes"
              price={20.0}
              endDate="2025-08-01T12:00:00Z"
            />
            <ItemCard
              id='2'
              image="https://i.ebayimg.com/images/g/0oAAAeSwrgZohCVw/s-l1600.webp"
              itemName="Vintage Watch"
              price={45.99}
              endDate="2025-08-01T12:00:00Z"
            />
            <ItemCard
              id='3'
              image="https://i.ebayimg.com/images/g/0oAAAeSwrgZohCVw/s-l1600.webp"
              itemName="Smartphone"
              price={150.0}
              endDate="2025-08-01T12:00:00Z"
            />
            <ItemCard
              id='4'
              image="https://i.ebayimg.com/images/g/0oAAAeSwrgZohCVw/s-l1600.webp"
              itemName="Smartphone"
              price={150.0}
              endDate="2025-08-01T12:00:00Z"
            />
            <ItemCard
              id='5'
              image="https://i.ebayimg.com/images/g/0oAAAeSwrgZohCVw/s-l1600.webp"
              itemName="Smartphone"
              price={150.0}
              endDate="2025-08-01T12:00:00Z"
            />
            {/* Add more ItemCards here */}
          </div>
        </div>
      </div>
    </div>
  );
}
