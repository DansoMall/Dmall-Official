'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';

export default function WishlistPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <AppHeader title="My Wishlist" showBack showCart />
      <main className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <Heart size={36} className="text-red-300" />
        </div>
        <p className="text-[18px] font-bold text-text-primary">Your wishlist is empty</p>
        <p className="text-[13px] text-gray-400">Save items you love and find them here anytime</p>
        <Link
          href="/"
          className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-dark transition-colors shadow-md"
        >
          Browse Products
        </Link>
      </main>
      <Footer />
    </div>
  );
}
