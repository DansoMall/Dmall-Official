'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Package, Truck, ChevronRight, ShoppingBag, Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';
import { formatPrice } from '@/utils/format';
import { apiGet } from '@/utils/apiClient';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const STATUS_COLORS: Record<string, string> = {
  delivered:       '#27AE60',
  processing:      '#F39C12',
  placed:          '#003152',
  shipped:         '#8B5CF6',
  out_for_delivery:'#F39C12',
  cancelled:       '#E74C3C',
};
const STATUS_BG: Record<string, string> = {
  delivered:       '#EDFAF4',
  processing:      '#FEF9EC',
  placed:          '#EBF2F8',
  shipped:         '#F5F3FF',
  out_for_delivery:'#FEF9EC',
  cancelled:       '#FDECEA',
};

interface ApiOrder {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: string;
  item_count: number;
  created_at: string;
  first_item?: { name: string; image: string | null };
}

function OrdersContent() {
  const isAuth = useRequireAuth();
  const [orders,  setOrders]  = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuth) return;
    let cancelled = false;
    // Resets loading at the start of each fetch — the standard
    // data-fetching-effect shape.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    apiGet<{ results: ApiOrder[] }>('/api/orders/')
      .then((data) => { if (!cancelled) setOrders(data.results ?? []); })
      .catch(() => { if (!cancelled) setOrders([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuth]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });

  if (!isAuth) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <AppHeader title="My Orders" showBack showCart />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4 text-center">
            <ShoppingBag size={56} className="text-gray-200" />
            <p className="text-[17px] font-bold text-text-primary">No orders yet</p>
            <p className="text-[13px] text-gray-400">Your orders will appear here once you shop</p>
            <Link href="/" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-dark transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="flex items-center gap-4 px-5 py-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: STATUS_BG[order.status] ?? '#F4F6F9' }}
                >
                  <Truck size={20} style={{ color: STATUS_COLORS[order.status] ?? '#1A1A1A' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-bold text-text-primary">{order.order_number}</p>
                    <span
                      className="text-[11px] font-semibold capitalize px-2.5 py-0.5 rounded-full shrink-0"
                      style={{ color: STATUS_COLORS[order.status], background: STATUS_BG[order.status] }}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {order.first_item && (
                    <p className="text-[12px] text-gray-400 mt-0.5 truncate">{order.first_item.name}</p>
                  )}
                  <p className="text-[12px] text-gray-300 mt-0.5">
                    {formatDate(order.created_at)} · {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
                <span className="text-[13px] text-gray-400">Order total</span>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-extrabold text-primary">{formatPrice(parseFloat(order.total_amount))}</span>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </div>
            </Link>
          ))
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
