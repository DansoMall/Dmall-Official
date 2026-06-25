'use client';

import Link from 'next/link';
import { Package, Truck, ChevronRight, ShoppingBag } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';
import { formatPrice } from '@/utils/format';

const STATUS_COLORS: Record<string, string> = {
  delivered: '#27AE60', processing: '#F39C12', placed: '#003152',
  shipped: '#8B5CF6', cancelled: '#E74C3C',
};
const STATUS_BG: Record<string, string> = {
  delivered: '#EDFAF4', processing: '#FEF9EC', placed: '#EBF2F8',
  shipped: '#F5F3FF', cancelled: '#FDECEA',
};

const ORDERS = [
  { id: 'DM-A3X8', date: '24 Jun 2026', items: 2, status: 'delivered',  total: 245, desc: 'Fashion & Accessories' },
  { id: 'DM-B7K2', date: '20 Jun 2026', items: 1, status: 'processing', total: 125, desc: 'Electronics' },
  { id: 'DM-C9P5', date: '15 Jun 2026', items: 3, status: 'delivered',  total: 380, desc: 'Mixed Items' },
  { id: 'DM-D2M1', date: '10 Jun 2026', items: 1, status: 'shipped',    total: 560, desc: 'Phones & Tablets' },
  { id: 'DM-E8Q3', date: '02 Jun 2026', items: 2, status: 'cancelled',  total: 190, desc: 'Home & Living' },
];

export default function OrdersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <AppHeader title="My Orders" showBack showCart />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 flex flex-col gap-3">
        {ORDERS.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4 text-center">
            <ShoppingBag size={56} className="text-gray-200" />
            <p className="text-[17px] font-bold text-text-primary">No orders yet</p>
            <p className="text-[13px] text-gray-400">Your orders will appear here</p>
            <Link href="/" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-dark transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          ORDERS.map((order) => (
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
                    <p className="text-[14px] font-bold text-text-primary">{order.id}</p>
                    <span
                      className="text-[11px] font-semibold capitalize px-2.5 py-0.5 rounded-full shrink-0"
                      style={{ color: STATUS_COLORS[order.status], background: STATUS_BG[order.status] }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-400 mt-0.5">{order.desc} · {order.items} item{order.items > 1 ? 's' : ''}</p>
                  <p className="text-[12px] text-gray-300 mt-0.5">{order.date}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
                <span className="text-[13px] text-gray-400">Order total</span>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-extrabold text-primary">{formatPrice(order.total)}</span>
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
