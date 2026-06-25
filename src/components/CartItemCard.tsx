'use client';

import Image from 'next/image';
import { Trash2, Minus, Plus } from 'lucide-react';
import type { CartItem } from '@/types';
import { formatPrice } from '@/utils/format';

interface Props {
  item: CartItem;
  onRemove: (productId: string) => void;
  onUpdateQty: (productId: string, qty: number) => void;
}

export default function CartItemCard({ item, onRemove, onUpdateQty }: Props) {
  const img = item.product.images[0] ?? '/placeholder.png';

  return (
    <div className="bg-card rounded-2xl shadow p-3 flex gap-3 border border-border">
      <div className="relative w-[90px] h-[90px] rounded-xl overflow-hidden bg-border shrink-0">
        <Image src={img} alt={item.product.name} fill className="object-cover" sizes="90px" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <p className="text-[13px] font-semibold text-text-primary line-clamp-2">{item.product.name}</p>
        {item.variant && (
          <p className="text-[11px] text-text-secondary">{item.variant.type}: {item.variant.value}</p>
        )}
        <div className="flex items-end justify-between mt-2 gap-2 flex-wrap">
          <div>
            <span className="text-[15px] font-bold text-primary">{formatPrice(item.priceSnapshot)}</span>
            {item.product.originalPrice > item.priceSnapshot && (
              <span className="text-[11px] text-text-secondary line-through ml-1">{formatPrice(item.product.originalPrice)}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onRemove(item.productId)} className="flex items-center gap-1 text-[12px] font-semibold text-danger/80 hover:text-danger min-h-[36px] px-1">
              <Trash2 size={14} /> Remove
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateQty(item.productId, item.qty - 1)}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-primary hover:bg-border active:scale-95"
              >
                <Minus size={14} />
              </button>
              <span className="text-[15px] font-semibold w-8 text-center">{item.qty}</span>
              <button
                onClick={() => onUpdateQty(item.productId, item.qty + 1)}
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark active:scale-95"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
