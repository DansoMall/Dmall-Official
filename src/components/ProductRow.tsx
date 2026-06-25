'use client';

import { Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface Props {
  products: Product[];
  loading?: boolean;
  variant?: 'grid' | 'flash';
}

export default function ProductRow({ products, loading, variant = 'grid' }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 overflow-x-auto scrollbar-hide px-3 sm:px-4 pb-2">
      {products.map((p) => (
        <div key={p.id} className="shrink-0 w-[145px] sm:w-[160px]">
          <ProductCard product={p} variant={variant === 'flash' ? 'flash' : 'grid'} />
        </div>
      ))}
    </div>
  );
}
