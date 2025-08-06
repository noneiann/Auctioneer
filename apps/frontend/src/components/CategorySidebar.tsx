import React from 'react';

const categories = ['Shoes', 'Watches', 'Electronics', 'Clothing', 'Collectibles'];

export default function CategorySidebar() {
  return (
    <aside className="w-1/4 pr-4">
      <h3 className="text-lg font-semibold mb-2">Categories</h3>
      <ul className="flex flex-col gap-2">
        {categories.map((category) => (
          <li key={category} className="cursor-pointer hover:text-main transition">
            {category}
          </li>
        ))}
      </ul>
    </aside>
  );
}
