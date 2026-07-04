import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import type { ApiProduct } from '@/utils/api';
import { toProduct } from '@/utils/api';

export interface ApiCart {
  id: number;
  items: Array<{
    id: number;
    product: ApiProduct;
    quantity: number;
    variant: { type?: string; value?: string } | Record<string, string> | null;
    price_snapshot: string;
  }>;
  subtotal: string;
  item_count: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, qty?: number, variant?: { type: string; value: string }, cartItemId?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  syncFromBackend: (cart: ApiCart) => void;
  totalItems: () => number;
  subtotal: () => number;
}

function normalizeVariant(variant: ApiCart['items'][number]['variant']): { type: string; value: string } | undefined {
  if (!variant || !variant.type || !variant.value) return undefined;
  return { type: variant.type, value: variant.value };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1, variant, cartItemId) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, qty: i.qty + qty, cartItemId: cartItemId ?? i.cartItemId } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                cartItemId,
                productId: product.id,
                product,
                qty,
                variant,
                priceSnapshot: product.salePrice,
              },
            ],
          };
        });
      },

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      updateQty: (productId, qty) => {
        if (qty <= 0) { get().removeItem(productId); return; }
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),

      syncFromBackend: (cart) =>
        set({
          items: cart.items.map((item) => ({
            cartItemId: item.id,
            productId: String(item.product.id),
            product: toProduct(item.product),
            qty: item.quantity,
            variant: normalizeVariant(item.variant),
            priceSnapshot: parseFloat(item.price_snapshot),
          })),
        }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.priceSnapshot * i.qty, 0),
    }),
    { name: 'dmall-cart' }
  )
);
