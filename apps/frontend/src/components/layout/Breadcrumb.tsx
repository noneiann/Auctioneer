import React from 'react';

export default function Breadcrumb() {
  return (
    <nav className="text-sm text-neutral-400 mb-6 flex items-center gap-2">
      <span className="hover:text-brand-300 transition-colors cursor-pointer">Home</span>
      <span>/</span>
      <span className="text-brand-500 font-semibold">Auctions</span>
    </nav>
  );
}
