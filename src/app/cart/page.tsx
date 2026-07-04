'use client';

import Link from 'next/link';
import { ShoppingCart, Info } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import CartItemCard from '@/components/CartItemCard';
import PrimaryButton from '@/components/PrimaryButton';
import Footer from '@/components/Footer';
import { useCartStore, type ApiCart } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/utils/apiClient';
import { formatPrice } from '@/utils/format';
import { useRouter } from 'next/navigation';

const SHIPPING_FEE = 25;

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQty, clearCart, syncFromBackend, subtotal } = useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sub = subtotal();
  const total = sub + SHIPPING_FEE;

  const syncCartResponse = async (res: Response) => {
    if (!res.ok) return;
    const data = await res.json().catch(() => null);
    if (data?.items) syncFromBackend(data as ApiCart);
  };

  const handleRemove = async (productId: string) => {
    const item = items.find((cartItem) => cartItem.productId === productId);
    removeItem(productId);
    if (!isAuthenticated || !item?.cartItemId) return;
    const res = await apiClient(`/api/cart/remove/${item.cartItemId}/`, { method: 'DELETE' });
    await syncCartResponse(res);
  };

  const handleUpdateQty = async (productId: string, qty: number) => {
    const item = items.find((cartItem) => cartItem.productId === productId);
    if (qty <= 0) {
      await handleRemove(productId);
      return;
    }
    updateQty(productId, qty);
    if (!isAuthenticated || !item?.cartItemId) return;
    const res = await apiClient(`/api/cart/update/${item.cartItemId}/`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: qty }),
    });
    await syncCartResponse(res);
  };

  const handleClearCart = async () => {
    clearCart();
    if (!isAuthenticated) return;
    await apiClient('/api/cart/clear/', { method: 'DELETE' });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F2F4F7]">
        <AppHeader title="My Cart" showBack showCart={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="w-[110px] h-[110px] rounded-full bg-accent/30 flex items-center justify-center">
            <ShoppingCart size={56} className="text-primary" />
          </div>
          <h2 className="text-[22px] font-bold text-text-primary">Your cart is empty</h2>
          <p className="text-text-secondary text-[15px]">Add items to get started</p>
          <Link href="/" className="mt-4 bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary-dark transition-colors">
            Start Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F4F7]">
      <AppHeader title="My Cart" showBack showCart={false} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-text-secondary">{items.length} items in your cart</p>
              <button onClick={handleClearCart} className="text-[14px] font-semibold text-danger hover:opacity-80">Clear All</button>
            </div>
            {items.map((item) => (
              <CartItemCard key={item.productId} item={item} onRemove={handleRemove} onUpdateQty={handleUpdateQty} />
            ))}
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-4">
            {/* Order Summary */}
            <div className="bg-card rounded-2xl shadow p-5 border border-border">
              <h3 className="text-[16px] font-bold mb-4">Order Summary</h3>
              <div className="flex justify-between text-[14px] text-text-secondary mb-2">
                <span>Subtotal</span>
                <span className="font-medium text-text-primary">{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-[14px] text-text-secondary mb-3">
                <span>Shipping</span>
                <span className="font-medium text-text-primary">{formatPrice(SHIPPING_FEE)}</span>
              </div>
              <div className="h-px bg-border mb-3" />
              <div className="flex justify-between">
                <span className="text-[17px] font-bold text-text-primary">Total</span>
                <span className="text-[17px] font-bold text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Notice */}
            <div className="flex items-start gap-2 bg-accent/30 rounded-xl p-3">
              <Info size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="text-[12px] text-text-secondary">Free station pickup for orders above ₵500</p>
            </div>

            {/* Checkout */}
            <div className="bg-card rounded-2xl shadow p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] text-text-secondary font-medium">Total</span>
                <span className="text-[18px] font-bold text-primary">{formatPrice(total)}</span>
              </div>
              <PrimaryButton label="Checkout" fullWidth onClick={() => router.push('/checkout')} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
