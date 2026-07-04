'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Store, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuthStore } from '@/store/authStore';
import { useCartStore, type ApiCart } from '@/store/cartStore';
import { apiClient, apiGet } from '@/utils/apiClient';

type Tab = 'login' | 'register' | 'vendor';

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuthStore();
  const { items, syncFromBackend } = useCartStore();
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [tab, setTab]       = useState<Tab>('login');
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw]       = useState('');

  // Register fields
  const [regName, setRegName]   = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPw, setRegPw]       = useState('');
  const [regPw2, setRegPw2]     = useState('');
  const [nextPath, setNextPath] = useState('/');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedTab = params.get('tab');
    const requestedNext = params.get('next');
    const timer = window.setTimeout(() => {
      if (requestedNext?.startsWith('/') && !requestedNext.startsWith('//')) {
        setNextPath(requestedNext);
      }
      if (requestedTab === 'login' || requestedTab === 'register' || requestedTab === 'vendor') {
        setTab(requestedTab);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const syncGuestCart = async () => {
    if (items.length === 0) {
      const cart = await apiGet<ApiCart>('/api/cart/').catch(() => null);
      if (cart) syncFromBackend(cart);
      return;
    }

    let latestCart: ApiCart | null = null;
    for (const item of items) {
      const res = await apiClient('/api/cart/add/', {
        method: 'POST',
        body: JSON.stringify({
          product_id: parseInt(item.productId, 10),
          quantity: item.qty,
          variant: item.variant ? { type: item.variant.type, value: item.variant.value } : {},
        }),
      });
      if (res.ok) latestCart = await res.json();
    }
    if (latestCart) syncFromBackend(latestCart);
  };

  const finishAuthFlow = async () => {
    await syncGuestCart();
    router.replace(nextPath);
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPw) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    try {
      await login(loginEmail, loginPw);
      await finishAuthFlow();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPhone || !regPw) { setError('Please fill all fields.'); return; }
    if (regPw !== regPw2) { setError('Passwords do not match.'); return; }
    if (!agreed) { setError('Please accept the Terms & Conditions.'); return; }
    setLoading(true); setError('');
    try {
      await register(regName, regEmail, regPhone, regPw, regPw2);
      await finishAuthFlow();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary rounded-b-[28px] pb-12 pt-12 px-6 flex flex-col items-center gap-3">
        <img src="/dmall-logo-cropped.png" alt="DMall" className="h-32 w-auto drop-shadow-lg mb-1" />
        <p className="text-white/80 text-[15px]">Ghana&apos;s Favourite Online Marketplace</p>
      </div>

      <div className="max-w-md mx-auto w-full px-4 -mt-8 pb-12">
        <div className="bg-background rounded-[20px] shadow-lg pt-6 px-5 pb-8">

          {/* Tab switcher */}
          <div className="flex bg-card rounded-full p-1 shadow-sm mb-6">
            {(['login', 'register', 'vendor'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2 rounded-full text-[14px] font-semibold capitalize transition-all ${
                  tab === t ? 'bg-background shadow text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t === 'vendor' ? 'Sell' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <AlertCircle size={15} className="text-danger shrink-0 mt-0.5" />
              <p className="text-[13px] text-danger">{error}</p>
            </div>
          )}

          {/* Login */}
          {tab === 'login' && (
            <div className="flex flex-col gap-4">
              <Field icon={<Mail size={18} />} placeholder="Email address" type="email"
                value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              <Field icon={<Lock size={18} />} placeholder="Password"
                type={showPw ? 'text' : 'password'}
                value={loginPw} onChange={(e) => setLoginPw(e.target.value)}
                right={<button onClick={() => setShowPw((s) => !s)} type="button">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
              />
              <button className="text-right text-[13px] font-semibold text-primary hover:underline">Forgot Password?</button>
              <PrimaryButton label="Login to My Account" fullWidth loading={loading} onClick={handleLogin} />

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[12px] text-text-secondary">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <p className="text-center text-[14px] text-text-secondary">
                No account?{' '}
                <button onClick={() => { setTab('register'); setError(''); }} className="text-primary font-semibold hover:underline">Register</button>
              </p>
            </div>
          )}

          {/* Register */}
          {tab === 'register' && (
            <div className="flex flex-col gap-4">
              <Field icon={<User size={18} />} placeholder="Full Name" value={regName} onChange={(e) => setRegName(e.target.value)} />
              <Field icon={<Mail size={18} />} placeholder="Email address" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
              <Field icon={<Phone size={18} />} placeholder="+233 Phone Number" type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
              <Field icon={<Lock size={18} />} placeholder="Password"
                type={showPw ? 'text' : 'password'}
                value={regPw} onChange={(e) => setRegPw(e.target.value)}
                right={<button onClick={() => setShowPw((s) => !s)} type="button">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
              />
              <Field icon={<Lock size={18} />} placeholder="Confirm Password"
                type={showConfirmPw ? 'text' : 'password'}
                value={regPw2} onChange={(e) => setRegPw2(e.target.value)}
                right={<button onClick={() => setShowConfirmPw((s) => !s)} type="button">{showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
              />

              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => setAgreed((a) => !a)}
                  className={`w-5 h-5 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors ${agreed ? 'bg-primary border-primary' : 'border-border'}`}
                >
                  {agreed && <Check size={12} className="text-white" />}
                </div>
                <span className="text-[13px] text-text-secondary">
                  I agree to the <span className="text-primary font-semibold">Terms & Conditions</span> and <span className="text-primary font-semibold">Privacy Policy</span>
                </span>
              </label>

              <PrimaryButton label="Create Account" fullWidth loading={loading} onClick={handleRegister} />
              <p className="text-center text-[14px] text-text-secondary">
                Already have an account?{' '}
                <button onClick={() => { setTab('login'); setError(''); }} className="text-primary font-semibold hover:underline">Login</button>
              </p>
            </div>
          )}

          {/* Vendor */}
          {tab === 'vendor' && (
            <div className="flex flex-col gap-4">
              <Field icon={<Store size={18} />} placeholder="Business Name" />
              <Field icon={<User size={18} />} placeholder="Owner Full Name" />
              <Field icon={<Mail size={18} />} placeholder="Business Email" type="email" />
              <Field icon={<Phone size={18} />} placeholder="+233 Phone Number" type="tel" />
              <Field icon={<User size={18} />} placeholder="Ghana Card / TIN Number" />
              <div className="bg-primary-light rounded-xl p-3">
                <p className="text-[13px] text-primary font-medium">
                  Your application will be reviewed within 24 hours. You&apos;ll receive an email once approved.
                </p>
              </div>
              <PrimaryButton label="Apply as Vendor" fullWidth />
              <p className="text-center text-[14px] text-text-secondary">
                Already a vendor?{' '}
                <button onClick={() => { setTab('login'); setError(''); }} className="text-primary font-semibold hover:underline">Login</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, right, ...props }: { icon: React.ReactNode; right?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center border-[1.5px] border-border rounded-xl bg-card h-[50px] px-3 gap-2 focus-within:border-primary transition-colors">
      <span className="text-text-secondary shrink-0">{icon}</span>
      <input {...props} className="flex-1 bg-transparent text-[15px] text-text-primary outline-none placeholder:text-text-secondary" />
      {right && <span className="text-text-secondary shrink-0">{right}</span>}
    </div>
  );
}
