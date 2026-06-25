'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Store, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuthStore } from '@/store/authStore';

type Tab = 'login' | 'register' | 'vendor';

export default function AuthPage() {
  const router = useRouter();
  const mockLogin = useAuthStore((s) => s.mockLogin);
  const [tab, setTab] = useState<Tab>('login');
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    mockLogin('customer');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header card */}
      <div className="bg-primary rounded-b-[28px] pb-12 pt-12 px-6 flex flex-col items-center gap-3">
        <div className="bg-white rounded-3xl px-6 py-3 mb-1">
          <img src="/dmall-logo.png" alt="DMall" className="h-16 w-auto" />
        </div>
        <p className="text-white/80 text-[15px]">Ghana&apos;s Favourite Online Marketplace</p>
      </div>

      {/* Body */}
      <div className="max-w-md mx-auto w-full px-4 -mt-8 pb-12">
        <div className="bg-background rounded-[20px] shadow-lg pt-6 px-5 pb-8">
          {/* Tab switcher */}
          <div className="flex bg-card rounded-full p-1 shadow-sm mb-6">
            {(['login', 'register', 'vendor'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-full text-[14px] font-semibold capitalize transition-all ${tab === t ? 'bg-background shadow text-primary' : 'text-text-secondary hover:text-text-primary'}`}
              >
                {t === 'vendor' ? 'Sell' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Login */}
          {tab === 'login' && (
            <div className="flex flex-col gap-4">
              <Field icon={<Mail size={18} />} placeholder="Email address" type="email" />
              <Field icon={<Lock size={18} />} placeholder="Password" type={showPw ? 'text' : 'password'}
                right={<button onClick={() => setShowPw((s) => !s)}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
              <button className="text-right text-[13px] font-semibold text-primary hover:underline">Forgot Password?</button>
              <PrimaryButton label="Login to My Account" fullWidth loading={loading} onClick={handleLogin} />
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[13px] text-text-secondary">OR CONTINUE WITH</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="h-[50px] border-[1.5px] border-border rounded-xl bg-card flex items-center justify-center gap-2 text-[14px] font-semibold hover:bg-border">
                  <span className="text-[#4285F4] font-bold">G</span> Google
                </button>
                <button className="h-[50px] border-[1.5px] border-border rounded-xl bg-card flex items-center justify-center gap-2 text-[14px] font-semibold hover:bg-border">
                  🍎 Apple
                </button>
              </div>
              <p className="text-center text-[14px] text-text-secondary mt-2">
                No account?{' '}
                <button onClick={() => setTab('register')} className="text-primary font-semibold hover:underline">Register</button>
              </p>
            </div>
          )}

          {/* Register */}
          {tab === 'register' && (
            <div className="flex flex-col gap-4">
              <Field icon={<User size={18} />} placeholder="Full Name" />
              <Field icon={<Mail size={18} />} placeholder="Email address" type="email" />
              <Field icon={<Phone size={18} />} placeholder="+233 Phone Number" type="tel" />
              <Field icon={<Lock size={18} />} placeholder="Password" type={showPw ? 'text' : 'password'}
                right={<button onClick={() => setShowPw((s) => !s)}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
              <Field icon={<Lock size={18} />} placeholder="Confirm Password" type="password" />
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
              <PrimaryButton label="Create Account" fullWidth disabled={!agreed} />
              <p className="text-center text-[14px] text-text-secondary">
                Already have an account?{' '}
                <button onClick={() => setTab('login')} className="text-primary font-semibold hover:underline">Login</button>
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
                <p className="text-[13px] text-primary font-medium">Your application will be reviewed within 24 hours. You&apos;ll receive an email once approved.</p>
              </div>
              <PrimaryButton label="Apply as Vendor" fullWidth />
              <p className="text-center text-[14px] text-text-secondary">
                Already a vendor?{' '}
                <button onClick={() => setTab('login')} className="text-primary font-semibold hover:underline">Login</button>
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
