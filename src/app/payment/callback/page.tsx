'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Package } from 'lucide-react';
import { verifyPayment } from '@/utils/paystackApi';
import { useAuthStore } from '@/store/authStore';

function CallbackContent() {
  const params  = useSearchParams();
  const router  = useRouter();
  const { accessToken } = useAuthStore();

  const reference = params.get('reference') ?? params.get('trxref') ?? '';

  // Lazy initializers run during render (including SSR, where persist has no
  // storage to read and must stay false), so on the client hydration state
  // and the no-reference case are reflected immediately instead of via a
  // synchronous setState in an effect.
  const [hydrated, setHydrated]   = useState(
    () => typeof window !== 'undefined' && useAuthStore.persist.hasHydrated(),
  );
  const [status, setStatus]       = useState<'verifying' | 'success' | 'failed'>(() => reference ? 'verifying' : 'failed');
  const [orderId, setOrderId]     = useState<number | null>(null);
  const [orderNum, setOrderNum]   = useState('');

  // Wait for Zustand to restore the token from localStorage before calling the API.
  // Without this, accessToken is null on first render and the verify request gets a 401.
  useEffect(() => {
    if (hydrated) return;
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !reference) return;

    verifyPayment(reference, accessToken ?? '')
      .then((res) => {
        if (res.status === 'success') {
          setStatus('success');
          if (res.order_id)     setOrderId(res.order_id);
          if (res.order_number) setOrderNum(res.order_number);
        } else {
          setStatus('failed');
        }
      })
      .catch(() => setStatus('failed'));
  }, [hydrated, reference, accessToken]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-6">

      {/* Verifying */}
      {status === 'verifying' && (
        <>
          <Loader2 size={52} className="animate-spin text-primary" />
          <div>
            <p className="text-[20px] font-bold text-text-primary">Verifying payment…</p>
            <p className="text-[14px] text-text-secondary mt-1">Please wait while we confirm your payment</p>
          </div>
        </>
      )}

      {/* Success */}
      {status === 'success' && (
        <div className="w-full max-w-sm bg-card rounded-3xl shadow-xl border border-border p-8 flex flex-col items-center gap-5">
          <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle size={52} className="text-success" />
          </div>

          <div>
            <p className="text-[22px] font-extrabold text-text-primary">Order Placed!</p>
            <p className="text-[14px] text-text-secondary mt-1">
              Your payment was successful and your order is now being processed.
            </p>
            {orderNum && (
              <p className="text-[13px] font-bold text-primary mt-2">Order #{orderNum}</p>
            )}
          </div>

          <button
            onClick={() => orderId ? router.replace(`/orders/${orderId}`) : router.replace('/orders')}
            className="w-full h-[52px] rounded-2xl bg-primary text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Package size={18} />
            Track Your Order
          </button>

          <button
            onClick={() => router.replace('/')}
            className="w-full h-[48px] rounded-2xl border-2 border-primary text-primary font-bold text-[14px] hover:bg-primary-light transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      )}

      {/* Failed */}
      {status === 'failed' && (
        <>
          <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle size={52} className="text-danger" />
          </div>
          <div>
            <p className="text-[22px] font-bold text-text-primary">Payment Failed</p>
            <p className="text-[14px] text-text-secondary mt-1">
              Your payment could not be completed. No money was deducted.
            </p>
          </div>
          <button
            onClick={() => router.replace('/checkout')}
            className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
