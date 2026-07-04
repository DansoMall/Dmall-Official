'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Check, Home, Loader2, MapPin, Plus, Receipt, AlertCircle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import PrimaryButton from '@/components/PrimaryButton';
import Footer from '@/components/Footer';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/format';
import { initializePayment } from '@/utils/paystackApi';
import { apiClient, apiGet, apiPost } from '@/utils/apiClient';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { PaymentMethod } from '@/types';

const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Volta',
  'Northern', 'Upper East', 'Upper West', 'Brong-Ahafo', 'Oti', 'Bono East',
  'Ahafo', 'North East', 'Savannah', 'Western North',
];

const MOMO_OPTIONS = [
  { key: 'mtn_momo',      label: 'MTN Mobile Money', logo: '/mtn-logo.png',        channel: 'mobile_money' },
  { key: 'vodafone_cash', label: 'Telecel Cash',      logo: '/telecel-logo.png',    channel: 'mobile_money' },
  { key: 'airteltigo',    label: 'AirtelTigo Money',  logo: '/airteltigo-logo.png', channel: 'mobile_money' },
];

const STEPS = ['Address', 'Payment', 'Confirm'];
const SHIPPING_FEE = 25;

interface SavedAddress {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  street: string;
  city: string;
  region: string;
  is_default: boolean;
}

const emptyAddress = { name: '', phone: '', street: '', city: '', region: '' };

export default function CheckoutPage() {
  const router  = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { accessToken } = useAuthStore();
  useRequireAuth();
  const sub   = subtotal();
  const total = sub + SHIPPING_FEE;

  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Saved addresses
  const [savedAddresses, setSavedAddresses]     = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress]         = useState(false);

  // Manual address form (used when no saved addresses or user picks "new")
  const [address, setAddress]   = useState(emptyAddress);
  const [delivery, setDelivery] = useState<'door' | 'station'>('door');
  const [payment, setPayment]   = useState<PaymentMethod | null>(null);

  // Load saved addresses on mount
  useEffect(() => {
    apiGet<SavedAddress[] | { results?: SavedAddress[] }>('/api/auth/addresses/')
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setSavedAddresses(list);
        // Auto-select default address
        const def = list.find((a) => a.is_default) ?? list[0] ?? null;
        if (def) setSelectedAddressId(def.id);
        // If no saved addresses, go straight to manual form
        if (list.length === 0) setUseNewAddress(true);
      })
      .catch(() => setUseNewAddress(true))
      .finally(() => setAddressesLoading(false));
  }, []);

  // Redirect to cart if empty and not mid-order
  useEffect(() => {
    if (items.length === 0 && !loading) router.replace('/cart');
  }, [items.length, loading, router]);

  const next = () => { setError(''); setStep((s) => s + 1); };
  const prev = () => { setError(''); setStep((s) => s - 1); };

  // The address to display on the confirm step
  const confirmedAddress: SavedAddress | null = useNewAddress
    ? null
    : (savedAddresses.find((a) => a.id === selectedAddressId) ?? null);

  const addressStepReady = useNewAddress
    ? !!(address.name && address.phone && address.street && address.city && address.region)
    : !!selectedAddressId;

  const placeOrder = async () => {
    if (!payment) return;
    setLoading(true);
    setError('');

    try {
      const selectedOpt = MOMO_OPTIONS.find((o) => o.key === payment);

      // Sync cart to Django backend
      await apiClient('/api/cart/clear/', { method: 'DELETE' });
      for (const item of items) {
        await apiClient('/api/cart/add/', {
          method: 'POST',
          body: JSON.stringify({
            product_id: parseInt(item.productId),
            quantity:   item.qty,
            variant:    item.variant ? { type: item.variant.type, value: item.variant.value } : {},
          }),
        });
      }

      // Build order payload — use address_id when a saved address is selected
      const orderPayload: Record<string, unknown> = {
        payment_method:  payment,
        delivery_method: delivery,
      };
      if (!useNewAddress && selectedAddressId) {
        orderPayload.address_id = selectedAddressId;
      } else {
        orderPayload.delivery_name   = address.name;
        orderPayload.delivery_phone  = address.phone;
        orderPayload.delivery_street = address.street;
        orderPayload.delivery_city   = address.city;
        orderPayload.delivery_region = address.region;
      }

      const order = await apiPost<{ id: number; order_number: string }>('/api/orders/create/', orderPayload);

      const paystackRes = await initializePayment(
        order.id,
        [selectedOpt?.channel ?? 'mobile_money'],
        accessToken ?? '',
      );

      clearCart();
      window.location.href = paystackRes.authorization_url;

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
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

        {/* ── Step 1: Address ── */}
        {step === 0 && (
          <div className="flex flex-col gap-5">

            {/* Delivery method */}
            <div className="grid grid-cols-2 gap-3">
              {(['door', 'station'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setDelivery(m)}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                    delivery === m ? 'border-primary bg-primary-light' : 'border-border hover:border-primary'
                  }`}
                >
                  {delivery === m && <Check size={14} className="absolute top-2 right-2 text-primary" />}
                  <MapPin size={22} className={delivery === m ? 'text-primary' : 'text-text-secondary'} />
                  <span className="text-[14px] font-semibold">{m === 'door' ? 'Door Delivery' : 'Station Pickup'}</span>
                </button>
              ))}
            </div>

            {/* Saved addresses */}
            {addressesLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 size={22} className="animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Saved address cards */}
                {!useNewAddress && savedAddresses.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <p className="text-[13px] font-bold text-text-primary">Deliver to</p>
                    {savedAddresses.map((addr) => {
                      const isWork = addr.label.toLowerCase().includes('work') || addr.label.toLowerCase().includes('office');
                      const selected = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border-2 transition-all ${
                            selected
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card hover:border-primary/40'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            selected ? 'bg-primary' : 'bg-blue-50'
                          }`}>
                            {isWork
                              ? <Briefcase size={17} className={selected ? 'text-white' : 'text-primary'} />
                              : <Home size={17} className={selected ? 'text-white' : 'text-primary'} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[14px] font-bold text-text-primary">{addr.label}</p>
                              {addr.is_default && (
                                <span className="text-[10px] font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-[13px] text-text-secondary mt-0.5">{addr.recipient_name} · {addr.phone}</p>
                            <p className="text-[12px] text-text-secondary truncate">{addr.street}, {addr.city}, {addr.region}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                            selected ? 'border-primary' : 'border-gray-300'
                          }`}>
                            {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                        </button>
                      );
                    })}

                    {/* Use a new address */}
                    <button
                      onClick={() => { setUseNewAddress(true); setSelectedAddressId(null); }}
                      className="flex items-center gap-2 text-[13px] font-semibold text-primary py-1"
                    >
                      <Plus size={15} /> Use a different address
                    </button>
                  </div>
                )}

                {/* Manual address form */}
                {useNewAddress && (
                  <div className="flex flex-col gap-4">
                    {savedAddresses.length > 0 && (
                      <button
                        onClick={() => {
                          setUseNewAddress(false);
                          setSelectedAddressId(savedAddresses.find((a) => a.is_default)?.id ?? savedAddresses[0]?.id ?? null);
                        }}
                        className="text-[13px] font-semibold text-primary text-left"
                      >
                        ← Back to saved addresses
                      </button>
                    )}
                    {[
                      { key: 'name',   label: 'Full Name',     placeholder: 'Ama Owusu' },
                      { key: 'phone',  label: 'Phone Number',   placeholder: '+233 24 123 4567' },
                      { key: 'street', label: 'Street Address', placeholder: '15 Independence Ave' },
                      { key: 'city',   label: 'City / Town',    placeholder: 'Accra' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-[13px] font-semibold text-text-primary mb-1.5 block">{label}</label>
                        <input
                          value={address[key as keyof typeof address]}
                          onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full h-[50px] px-4 border-[1.5px] border-border rounded-xl bg-card text-[15px] outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-[13px] font-semibold text-text-primary mb-1.5 block">Region</label>
                      <select
                        value={address.region}
                        onChange={(e) => setAddress((a) => ({ ...a, region: e.target.value }))}
                        className="w-full h-[50px] px-4 border-[1.5px] border-border rounded-xl bg-card text-[15px] outline-none focus:border-primary transition-colors"
                      >
                        <option value="">Select region</option>
                        {GHANA_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}

            <PrimaryButton
              label="Continue to Payment"
              fullWidth
              onClick={next}
              disabled={!addressStepReady || addressesLoading}
            />
          </div>
        )}

        {/* ── Step 2: Payment ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2 mb-1">
              <img src="/payment-icon.png" alt="" width={20} height={20} className="shrink-0 mt-0.5" />
              <p className="text-[13px] text-primary font-medium">
                You&apos;ll receive a prompt on your phone to approve the payment after placing your order.
              </p>
            </div>

            {MOMO_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPayment(opt.key as PaymentMethod)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 shadow-sm transition-all active:scale-[0.98] ${
                  payment === opt.key
                    ? 'border-primary bg-primary/5 shadow-primary/10'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                  <img src={opt.logo} alt={opt.label} className="w-10 h-10 object-contain" />
                </div>
                <span className="flex-1 text-[15px] font-semibold text-text-primary text-left">{opt.label}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  payment === opt.key ? 'border-primary' : 'border-gray-300'
                }`}>
                  {payment === opt.key && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
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

        {/* ── Step 3: Confirm ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            {/* Delivery address */}
            <div className="bg-card rounded-xl border border-border p-4 flex items-start gap-3 shadow-sm">
              <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[14px] font-bold mb-1">Delivery Address</p>
                {confirmedAddress ? (
                  <>
                    <p className="text-[13px] font-semibold text-text-primary">{confirmedAddress.label}</p>
                    <p className="text-[13px] text-text-secondary">{confirmedAddress.recipient_name} · {confirmedAddress.phone}</p>
                    <p className="text-[13px] text-text-secondary">{confirmedAddress.street}, {confirmedAddress.city}</p>
                    <p className="text-[13px] text-text-secondary">{confirmedAddress.region}, Ghana</p>
                  </>
                ) : (
                  <>
                    <p className="text-[13px] text-text-secondary">{address.name}</p>
                    <p className="text-[13px] text-text-secondary">{address.phone}</p>
                    <p className="text-[13px] text-text-secondary">{address.street}, {address.city}</p>
                    <p className="text-[13px] text-text-secondary">{address.region}, Ghana</p>
                  </>
                )}
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                <img
                  src={MOMO_OPTIONS.find((o) => o.key === payment)?.logo ?? '/payment-icon.png'}
                  alt="Payment"
                  className="w-9 h-9 object-contain"
                />
              </div>
              <div>
                <p className="text-[14px] font-bold">Payment Method</p>
                <p className="text-[13px] text-text-secondary">
                  {MOMO_OPTIONS.find((o) => o.key === payment)?.label ?? payment?.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* Order total */}
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

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
                <p className="text-[13px] text-danger">{error}</p>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button onClick={prev} className="flex-1 h-[52px] border-2 border-primary rounded-2xl text-primary font-bold hover:bg-primary-light transition-colors">
                Back
              </button>
              <PrimaryButton
                label={loading ? 'Processing…' : 'Pay with MoMo'}
                loading={loading}
                className="flex-1"
                onClick={placeOrder}
              />
            </div>

            <p className="text-center text-[12px] text-text-secondary">
              Secured by <span className="font-semibold text-primary">Paystack</span> · Your payment is encrypted
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
