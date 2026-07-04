'use client';

import { ShieldCheck, Truck, Users, Star } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';

const STATS = [
  { value: '2M+',  label: 'Products' },
  { value: '50K+', label: 'Vendors' },
  { value: '1M+',  label: 'Customers' },
  { value: '4.8',  label: 'App Rating' },
];

const VALUES = [
  { icon: <ShieldCheck size={22} className="text-primary" />, title: 'Trusted',    desc: 'Every vendor is verified before listing on D Mall.' },
  { icon: <Truck size={22} className="text-primary" />,       title: 'Fast',       desc: 'Same-day delivery in Accra, 2–5 days nationwide.' },
  { icon: <Users size={22} className="text-primary" />,       title: 'Community',  desc: 'Built by Ghanaians for Ghanaians, supporting local trade.' },
  { icon: <Star size={22} className="text-primary" />,        title: 'Quality',    desc: 'Strict quality controls and buyer protection on every order.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <AppHeader title="About D Mall" showBack showCart />

      <main className="flex-1 max-w-2xl mx-auto w-full">
        {/* Hero */}
        <div
          className="px-6 py-12 text-center"
          style={{ background: 'linear-gradient(135deg, #003152 0%, #0a5a8e 100%)' }}
        >
          <img src="/dmall-logo-cropped.png" alt="DMall" className="h-28 w-auto mx-auto mb-2 drop-shadow-lg" />
          <p className="text-[14px] text-white/70">Ghana&apos;s Favourite Online Marketplace</p>
        </div>

        <div className="px-4 py-6 flex flex-col gap-5">
          {/* Mission */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-[16px] font-bold text-text-primary mb-2">Our Mission</p>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              D Mall connects buyers and sellers across Ghana, making commerce simple, fast and trustworthy.
              We believe every Ghanaian deserves access to quality products at fair prices — whether you&apos;re in Accra,
              Kumasi, Tamale or anywhere in between.
            </p>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col items-center py-4 sm:py-5 gap-0.5">
                  <span className="text-[18px] sm:text-[20px] font-extrabold text-primary">{s.value}</span>
                  <span className="text-[11px] text-gray-400 font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-3">Our Values</p>
            <div className="grid grid-cols-2 gap-3">
              {VALUES.map((v) => (
                <div key={v.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">{v.icon}</div>
                  <p className="text-[14px] font-bold text-text-primary mb-1">{v.title}</p>
                  <p className="text-[12px] text-gray-400 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Licenses'].map((item) => (
              <button key={item} className="w-full text-left px-5 py-4 text-[14px] font-medium text-text-primary hover:bg-gray-50 transition-colors">
                {item}
              </button>
            ))}
          </div>

          <p className="text-center text-[11px] text-gray-300 pb-2">D Mall v1.0.0 · © 2026 Danso Mall Ltd, Accra Ghana</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
