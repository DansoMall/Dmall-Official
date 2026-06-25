'use client';

import { useState, useEffect } from 'react';
import { Check, MapPin, Receipt } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import PrimaryButton from '@/components/PrimaryButton';
import Footer from '@/components/Footer';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/format';
import { useRouter } from 'next/navigation';
import type { PaymentMethod } from '@/types';

const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Volta',
  'Northern', 'Upper East', 'Upper West', 'Brong-Ahafo', 'Oti', 'Bono East',
  'Ahafo', 'North East', 'Savannah', 'Western North',
];

const PAYMENT_OPTIONS = [
  { key: 'mtn_momo', label: 'MTN Mobile Money', color: '#FFCC00' },
  { key: 'vodafone_cash', label: 'Vodafone Cash', color: '#E60000' },
  { key: 'airteltigo_money', label: 'AirtelTigo Money', color: '#0066CC' },
  { key: 'card', label: 'Card / Bank Transfer', color: '#1A1A1A' },
  { key: 'danso_pay', label: 'Danso Pay Wallet', color: '#003152' },
  { key: 'cash_on_delivery', label: 'Cash on Delivery', color: '#27AE60' },
];

const STEPS = ['Address', 'Payment', 'Confirm'];
const SHIPPING_FEE = 25;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const sub = subtotal();
  const total = sub + SHIPPING_FEE;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) router.replace('/cart');
  }, [items.length, router]);

  const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', region: '' });
  const [delivery, setDelivery] = useState<'door' | 'station'>('door');
  const [payment, setPayment] = useState<PaymentMethod | null>(null);

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  const placeOrder = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    clearCart();
    const orderNum = `DM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    router.push(`/orders/${orderNum}`);
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader title="Checkout" showBack showCart={false} />

      {/* Stepper */}
      <div className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition-all ${
                i < step ? 'bg-success border-success text-white' : i === step ? 'bg-primary border-primary text-white' : 'border-border text-text-secondary'
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-[13px] font-medium hidden sm:block ${i === step ? 'text-primary' : 'text-text-secondary'}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`w-8 md:w-16 h-0.5 mx-2 ${i < step ? 'bg-success' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Step 1: Address */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            {/* Delivery method */}
            <div className="grid grid-cols-2 gap-3">
              {(['door', 'station'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setDelivery(m)}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${delivery === m ? 'border-primary bg-primary-light' : 'border-border hover:border-primary'}`}
                >
                  {delivery === m && <Check size={14} className="absolute top-2 right-2 text-primary" />}
                  <MapPin size={22} className={delivery === m ? 'text-primary' : 'text-text-secondary'} />
                  <span className="text-[14px] font-semibold capitalize">{m === 'door' ? 'Door Delivery' : 'Station Pickup'}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4">
              {[
                { key: 'name', label: 'Full Name', placeholder: 'Ama Owusu' },
                { key: 'phone', label: 'Phone Number', placeholder: '+233 24 123 4567' },
                { key: 'street', label: 'Street Address', placeholder: '15 Independence Ave' },
                { key: 'city', label: 'City / Town', placeholder: 'Accra' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-[13px] font-semibold text-text-primary mb-1.5 block">{label}</label>
                  <input
                    value={address[key as keyof typeof address]}
                    onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full h-[50px] px-4 border-[1.5px] border-border rounded-xl bg-card text-[15px] text-text-primary outline-none focus:border-primary transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="text-[13px] font-semibold text-text-primary mb-1.5 block">Region</label>
                <select
                  value={address.region}
                  onChange={(e) => setAddress((a) => ({ ...a, region: e.target.value }))}
                  className="w-full h-[50px] px-4 border-[1.5px] border-border rounded-xl bg-card text-[15px] text-text-primary outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select region</option>
                  {GHANA_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <PrimaryButton label="Continue to Payment" fullWidth onClick={next} />
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPayment(opt.key as PaymentMethod)}
                className={`flex items-center gap-4 p-4 rounded-xl border-[1.5px] shadow-sm transition-all ${payment === opt.key ? 'border-primary bg-card' : 'border-border bg-card hover:border-primary'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0`}>
                  {payment === opt.key && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                <span className="text-[15px] font-semibold text-text-primary">{opt.label}</span>
              </button>
            ))}

            <div className="flex gap-3 mt-2">
              <button onClick={prev} className="flex-1 h-[52px] border-2 border-primary rounded-2xl text-primary font-bold hover:bg-primary-light transition-colors">
                Back
              </button>
              <PrimaryButton label="Review Order" className="flex-1" onClick={next} disabled={!payment} />
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            {/* Delivery card */}
            <div className="bg-card rounded-xl border border-border p-4 flex items-start gap-3 shadow-sm">
              <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[14px] font-bold mb-1">Delivery Address</p>
                <p className="text-[13px] text-text-secondary">{address.name}</p>
                <p className="text-[13px] text-text-secondary">{address.phone}</p>
                <p className="text-[13px] text-text-secondary">{address.street}, {address.city}</p>
                <p className="text-[13px] text-text-secondary">{address.region}, Ghana</p>
              </div>
            </div>

            {/* Payment card */}
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 shadow-sm">
              <img src="/payment-icon.png" alt="Payment" width={28} height={28} className="shrink-0" />
              <div>
                <p className="text-[14px] font-bold">Payment Method</p>
                <p className="text-[13px] text-text-secondary capitalize">{payment?.replace(/_/g, ' ')}</p>
              </div>
            </div>

            {/* Order total card */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Receipt size={18} className="text-primary" />
                <p className="text-[14px] font-bold">Order Total</p>
              </div>
              <div className="flex justify-between text-[14px] text-text-secondary mb-1">
                <span>Subtotal</span><span>{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-[14px] text-text-secondary mb-2">
                <span>Shipping</span><span>{formatPrice(SHIPPING_FEE)}</span>
              </div>
              <div className="h-px bg-border mb-2" />
              <div className="flex justify-between">
                <span className="text-[16px] font-bold">Total</span>
                <span className="text-[16px] font-bold text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={prev} className="flex-1 h-[52px] border-2 border-primary rounded-2xl text-primary font-bold hover:bg-primary-light transition-colors">
                Back
              </button>
              <PrimaryButton label={loading ? 'Placing Order…' : 'Place Order'} loading={loading} className="flex-1" onClick={placeOrder} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
