'use client';

import { use } from 'react';
import { CalendarDays, Receipt, MapPin, Headphones, Star, XCircle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import OrderTimeline from '@/components/OrderTimeline';
import Footer from '@/components/Footer';
import { formatPrice, formatDate } from '@/utils/format';
import type { OrderStatus } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  placed:           { label: 'Order Placed',      color: '#003152', bg: '#003152' },
  processing:       { label: 'Processing',         color: '#F39C12', bg: '#F39C1218' },
  shipped:          { label: 'Shipped',            color: '#2980B9', bg: '#2980B918' },
  out_for_delivery: { label: 'Out for Delivery',   color: '#8E44AD', bg: '#8E44AD18' },
  delivered:        { label: 'Delivered',          color: '#27AE60', bg: '#27AE6018' },
  cancelled:        { label: 'Cancelled',          color: '#E74C3C', bg: '#E74C3C18' },
};

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Mock order data (in production, this would be fetched from API)
  const status = 'processing' as OrderStatus;
  const config = STATUS_CONFIG[status];
  const today = new Date().toISOString();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader title="Track Order" showBack showCart />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {/* Status Banner */}
        <div className="rounded-2xl p-6 flex items-center gap-4 mb-6" style={{ backgroundColor: config.bg }}>
          <div className="w-14 h-14 flex items-center justify-center shrink-0">
            <img src="/track-order-icon.png" alt="Track Order" width={56} height={56} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold" style={{ color: config.color }}>{config.label}</h1>
            <p className="text-text-secondary text-[14px]">Order #{id}</p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: <CalendarDays size={18} className="text-primary" />, label: 'Ordered', value: formatDate(today) },
            { icon: <Receipt size={18} className="text-primary" />, label: 'Total', value: formatPrice(245) },
            { icon: <img src="/payment-icon.png" alt="Payment" width={22} height={22} />, label: 'Payment', value: 'MTN MoMo' },
          ].map((info) => (
            <div key={info.label} className="bg-card rounded-xl p-3 shadow-sm border border-border flex flex-col items-center gap-1 text-center">
              {info.icon}
              <span className="text-[11px] text-text-secondary">{info.label}</span>
              <span className="text-[11px] font-semibold text-text-primary">{info.value}</span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
          <h2 className="text-[16px] font-bold mb-5">Order Timeline</h2>
          <OrderTimeline currentStatus={status} />
        </div>

        {/* Delivery Address */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-primary" />
            <h2 className="text-[15px] font-bold">Delivery Address</h2>
          </div>
          <p className="text-[14px] text-text-primary font-semibold">Ama Owusu</p>
          <p className="text-[13px] text-text-secondary">+233 24 412 3456</p>
          <p className="text-[13px] text-text-secondary">15 Independence Ave, Accra</p>
          <p className="text-[13px] text-text-secondary">Greater Accra, Ghana</p>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border mb-6">
          <h2 className="text-[15px] font-bold mb-4">Order Summary</h2>
          <div className="flex justify-between text-[14px] text-text-secondary mb-2">
            <span>Subtotal</span><span>{formatPrice(220)}</span>
          </div>
          <div className="flex justify-between text-[14px] text-text-secondary mb-3">
            <span>Shipping</span><span>{formatPrice(25)}</span>
          </div>
          <div className="h-px bg-border mb-3" />
          <div className="flex justify-between">
            <span className="text-[16px] font-bold">Total</span>
            <span className="text-[16px] font-bold text-primary">{formatPrice(245)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 p-4 bg-card rounded-xl border border-border shadow-sm hover:bg-border transition-colors">
            <Headphones size={18} className="text-primary" />
            <span className="text-[14px] font-semibold">Get Help</span>
          </button>
          {status === 'delivered' && (
            <button className="flex items-center justify-center gap-2 p-4 bg-card rounded-xl border border-border shadow-sm hover:bg-border transition-colors">
              <Star size={18} className="text-primary" />
              <span className="text-[14px] font-semibold">Write Review</span>
            </button>
          )}
          {(status === 'placed' || status === 'processing') && (
            <button className="flex items-center justify-center gap-2 p-4 bg-card rounded-xl border border-danger shadow-sm hover:bg-red-50 transition-colors">
              <XCircle size={18} className="text-danger" />
              <span className="text-[14px] font-semibold text-danger">Cancel Order</span>
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
