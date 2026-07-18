'use client';

import { use, useEffect, useState, Suspense } from 'react';
import { CalendarDays, CheckCircle2, Headphones, Loader2, MapPin, Package, Receipt, RefreshCw, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import OrderTimeline from '@/components/OrderTimeline';
import Footer from '@/components/Footer';
import { formatPrice, formatDate } from '@/utils/format';
import type { OrderStatus, TrackingStep } from '@/types';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { apiClient, apiGet } from '@/utils/apiClient';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  placed:           { label: 'Order Placed',      color: '#003152', bg: '#003152' },
  processing:       { label: 'Processing',         color: '#F39C12', bg: '#F39C1218' },
  shipped:          { label: 'Shipped',            color: '#2980B9', bg: '#2980B918' },
  out_for_delivery: { label: 'Out for Delivery',   color: '#8E44AD', bg: '#8E44AD18' },
  delivered:        { label: 'Delivered',          color: '#27AE60', bg: '#27AE6018' },
  cancelled:        { label: 'Cancelled',          color: '#E74C3C', bg: '#E74C3C18' },
  returned:         { label: 'Returned',           color: '#F39C12', bg: '#F39C1218' },
};

interface ApiOrderItem {
  id: number;
  product: number;
  product_name: string;
  vendor_name: string;
  quantity: number;
  unit_price: string;
  variant: Record<string, string>;
  product_snapshot: { name?: string; image?: string | null; sku?: string };
  line_total: string;
}

interface ApiOrderDetail {
  id: number;
  order_number: string;
  subtotal: string;
  shipping_fee: string;
  discount: string;
  vat_amount: string;
  total_amount: string;
  payment_method: string;
  payment_status: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_street: string;
  delivery_city: string;
  delivery_region: string;
  delivery_method: string;
  status: OrderStatus;
  notes: string;
  items: ApiOrderItem[];
  timeline: TrackingStep[];
  created_at: string;
  updated_at: string;
}

function paymentLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function deliveryLabel(value: string) {
  return value === 'door' ? 'Door Delivery' : value === 'station' ? 'Station Pickup' : paymentLabel(value);
}

function OrderTrackingContent({ id }: { id: string }) {
  const router = useRouter();
  const isAuthenticated = useRequireAuth();
  const [order, setOrder] = useState<ApiOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    setError('');
    try {
      const data = await apiGet<ApiOrderDetail>(`/api/orders/${id}/`);
      setOrder(data);
    } catch (e: unknown) {
      setOrder(null);
      setError(e instanceof Error ? e.message : 'Could not load this order.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    // Resets loading at the start of each fetch (including refetches when
    // id/isAuthenticated change) — the standard data-fetching-effect shape.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    apiGet<ApiOrderDetail>(`/api/orders/${id}/`)
      .then((data)  => { if (!cancelled) setOrder(data); })
      .catch(()     => { if (!cancelled) setOrder(null); })
      .finally(()   => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, isAuthenticated]);

  // Poll every 8 seconds so status updates from the admin appear automatically.
  // This is the reliable real-time path; WebSocket push via Redis is the
  // production enhancement on top of this baseline.
  useEffect(() => {
    if (!isAuthenticated || !order?.id) return;
    const iv = window.setInterval(() => {
      apiGet<ApiOrderDetail>(`/api/orders/${order.id}/`)
        .then(setOrder)
        .catch(() => { /* keep showing current data on transient error */ });
    }, 8000);
    return () => window.clearInterval(iv);
  }, [isAuthenticated, order?.id]);

  const handleRefresh = () => {
    void fetchOrder(true);
  };

  const handleConfirmDelivery = async () => {
    if (!order) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await apiClient(`/api/orders/${order.id}/confirm-delivery/`, { method: 'PUT' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Could not confirm delivery.');
      }
      setOrder(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not confirm delivery.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader title="Track Order" showBack showCart />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader title="Track Order" showBack showCart />
        <main className="flex-1 flex items-center justify-center px-6 text-center">
          <div>
            <p className="text-[18px] font-bold text-text-primary">Order not found</p>
            <p className="text-[13px] text-text-secondary mt-1">We could not load this order from the backend.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const status = order.status;
  const config = STATUS_CONFIG[status];
  const subtotal = parseFloat(order.subtotal);
  const shippingFee = parseFloat(order.shipping_fee);
  const discount = parseFloat(order.discount);
  const vatAmount = parseFloat(order.vat_amount);
  const totalAmount = parseFloat(order.total_amount);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const firstProductId = order.items[0]?.product;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader title="Track Order" showBack showCart />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {/* Status Banner */}
        <div className="rounded-3xl p-5 sm:p-6 mb-5 border border-border shadow-sm" style={{ backgroundColor: config.bg }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center shrink-0 shadow-sm">
                <img src="/track-order-icon.png" alt="Track Order" width={48} height={48} />
              </div>
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wide text-text-secondary">Tracking {order.order_number}</p>
                <h1 className="text-[22px] font-extrabold mt-0.5" style={{ color: config.color }}>{config.label}</h1>
                <p className="text-text-secondary text-[13px] mt-1">
                  Last updated {formatDate(order.updated_at)}
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-primary hover:bg-white disabled:opacity-60"
              aria-label="Refresh order tracking"
            >
              <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { label: 'Items', value: `${itemCount}` },
              { label: 'Delivery', value: deliveryLabel(order.delivery_method) },
              { label: 'Payment', value: order.payment_status.replace(/_/g, ' ') },
            ].map((meta) => (
              <div key={meta.label} className="rounded-2xl bg-white/75 px-3 py-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-text-secondary font-bold">{meta.label}</p>
                <p className="text-[12px] font-bold text-text-primary capitalize truncate">{meta.value}</p>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-[13px] text-danger">{error}</p>
            </div>
          )}
        </div>

        {order.status === 'out_for_delivery' && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-[15px] font-bold text-text-primary">Have you received this order?</p>
              <p className="text-[12px] text-text-secondary mt-0.5">Confirm delivery only after the package is in your hands.</p>
            </div>
            <button
              onClick={handleConfirmDelivery}
              disabled={actionLoading}
              className="h-11 rounded-full bg-success text-white text-[13px] font-bold px-5 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
            >
              {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              Confirm Delivery
            </button>
          </div>
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: <CalendarDays size={18} className="text-primary" />, label: 'Ordered', value: formatDate(order.created_at) },
            { icon: <Receipt size={18} className="text-primary" />, label: 'Total', value: formatPrice(totalAmount) },
            { icon: <img src="/payment-icon.png" alt="Payment" width={22} height={22} />, label: 'Payment', value: paymentLabel(order.payment_method) },
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
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-[16px] font-bold">Order Timeline</h2>
              <p className="text-[12px] text-text-secondary mt-0.5">Live updates from D Mall and delivery partners</p>
            </div>
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {order.timeline.length} update{order.timeline.length === 1 ? '' : 's'}
            </span>
          </div>
          <OrderTimeline currentStatus={status} timeline={order.timeline} />
        </div>

        {/* Order Items */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} className="text-primary" />
            <h2 className="text-[15px] font-bold">Items in this order</h2>
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-text-primary line-clamp-2">
                    {item.product_snapshot.name ?? item.product_name}
                  </p>
                  <p className="text-[12px] text-text-secondary mt-0.5">
                    Sold by {item.vendor_name} · Qty {item.quantity}
                  </p>
                  {item.variant && Object.keys(item.variant).length > 0 && (
                    <p className="text-[11px] text-text-secondary mt-1 capitalize">
                      {Object.entries(item.variant).map(([key, value]) => `${key}: ${value}`).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-bold text-text-primary">{formatPrice(parseFloat(item.line_total))}</p>
                  <p className="text-[11px] text-text-secondary">{formatPrice(parseFloat(item.unit_price))} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-primary" />
            <h2 className="text-[15px] font-bold">Delivery Address</h2>
          </div>
          <p className="text-[14px] text-text-primary font-semibold">{order.delivery_name}</p>
          <p className="text-[13px] text-text-secondary">{order.delivery_phone}</p>
          <p className="text-[13px] text-text-secondary">{order.delivery_street}, {order.delivery_city}</p>
          <p className="text-[13px] text-text-secondary">{order.delivery_region}, Ghana</p>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border mb-6">
          <h2 className="text-[15px] font-bold mb-4">Order Summary</h2>
          <div className="flex justify-between text-[14px] text-text-secondary mb-2">
            <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[14px] text-text-secondary mb-3">
            <span>Shipping</span><span>{formatPrice(shippingFee)}</span>
          </div>
          {vatAmount > 0 && (
            <div className="flex justify-between text-[14px] text-text-secondary mb-3">
              <span>VAT</span><span>{formatPrice(vatAmount)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-[14px] text-success mb-3">
              <span>Discount</span><span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="h-px bg-border mb-3" />
          <div className="flex justify-between">
            <span className="text-[16px] font-bold">Total</span>
            <span className="text-[16px] font-bold text-primary">{formatPrice(totalAmount)}</span>
          </div>
          <p className="text-[12px] text-text-secondary mt-2 capitalize">Payment status: {order.payment_status.replace(/_/g, ' ')}</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`mailto:support@dmall.com?subject=Help with order ${encodeURIComponent(order.order_number)}`}
            className="flex items-center justify-center gap-2 p-4 bg-card rounded-xl border border-border shadow-sm hover:bg-border transition-colors"
          >
            <Headphones size={18} className="text-primary" />
            <span className="text-[14px] font-semibold">Get Help</span>
          </a>
          {status === 'delivered' && firstProductId && (
            <button
              onClick={() => router.push(`/product/${firstProductId}`)}
              className="flex items-center justify-center gap-2 p-4 bg-card rounded-xl border border-border shadow-sm hover:bg-border transition-colors"
            >
              <Star size={18} className="text-primary" />
              <span className="text-[14px] font-semibold">Write Review</span>
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    }>
      <OrderTrackingContent id={id} />
    </Suspense>
  );
}
