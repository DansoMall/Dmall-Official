'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { Product } from '@/types';
import type { ApiProduct } from '@/utils/api';
import { toProduct } from '@/utils/api';
import { apiGet } from '@/utils/apiClient';

export default function WishlistPage() {
  const isAuthenticated = useRequireAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      apiGet<ApiProduct[]>('/api/wishlist/')
        .then((items) => {
          if (!cancelled) setProducts(items.map(toProduct));
        })
        .catch(() => {
          if (!cancelled) setProducts([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <AppHeader title="My Wishlist" showBack showCart />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center px-8 py-24">
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
          </div>
        ) : (
          <>
            <p className="text-[14px] text-text-secondary mb-4">{products.length} saved item{products.length === 1 ? '' : 's'}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
