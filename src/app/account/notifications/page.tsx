'use client';

import { useState } from 'react';
import { Bell, Package, Tag, Megaphone, ShieldCheck } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';

const SETTINGS = [
  { id: 'orders',    icon: <Package size={18} className="text-primary" />,     label: 'Order Updates',         sub: 'Shipping, delivery & status changes' },
  { id: 'deals',     icon: <Tag size={18} className="text-warning" />,          label: 'Deals & Promotions',    sub: 'Flash sales, discounts and offers' },
  { id: 'news',      icon: <Megaphone size={18} className="text-success" />,    label: 'D Mall News',           sub: 'New features and announcements' },
  { id: 'security',  icon: <ShieldCheck size={18} className="text-danger" />,   label: 'Security Alerts',       sub: 'Login attempts and account activity' },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${on ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function NotificationsPage() {
  const [push, setPush] = useState({ orders: true, deals: true, news: false, security: true });
  const [email, setEmail] = useState({ orders: true, deals: false, news: false, security: true });

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <AppHeader title="Notifications" showBack showCart />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 flex flex-col gap-4">
        {/* Push */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">Push Notifications</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {SETTINGS.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-text-primary">{s.label}</p>
                  <p className="text-[12px] text-gray-400">{s.sub}</p>
                </div>
                <Toggle on={push[s.id as keyof typeof push]} onChange={() => setPush((p) => ({ ...p, [s.id]: !p[s.id as keyof typeof push] }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Email */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">Email Notifications</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {SETTINGS.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-text-primary">{s.label}</p>
                  <p className="text-[12px] text-gray-400">{s.sub}</p>
                </div>
                <Toggle on={email[s.id as keyof typeof email]} onChange={() => setEmail((e) => ({ ...e, [s.id]: !e[s.id as keyof typeof email] }))} />
              </div>
            ))}
          </div>
        </div>

        <button className="w-full h-12 bg-primary text-white rounded-full font-bold text-[15px] hover:bg-primary-dark transition-colors shadow-md">
          Save Preferences
        </button>
      </main>

      <Footer />
    </div>
  );
}
