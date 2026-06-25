'use client';

import { RotateCcw, PackageOpen, CheckCircle2, XCircle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';
import Link from 'next/link';

const ELIGIBLE = ['Wrong item received', 'Damaged on arrival', 'Item not as described', 'Missing parts or accessories'];
const NOT_ELIGIBLE = ['Used or worn items', 'Items returned after 7 days', 'Digital products', 'Perishable goods'];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <AppHeader title="Returns & Refunds" showBack showCart />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 flex flex-col gap-4">
        {/* Banner */}
        <div className="bg-primary rounded-2xl p-5 flex items-center gap-4">
          <RotateCcw size={28} className="text-accent shrink-0" />
          <div>
            <p className="text-[15px] font-bold text-white">7-Day Return Policy</p>
            <p className="text-[12px] text-white/70 mt-0.5">Return eligible items within 7 days of delivery for a full refund</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[15px] font-bold mb-4">How to Return</p>
          {[
            { step: '1', text: 'Go to My Orders and select the item to return' },
            { step: '2', text: 'Choose your return reason and upload photos if required' },
            { step: '3', text: 'Drop the package at any D Mall station or schedule a pickup' },
            { step: '4', text: 'Refund is processed within 3–5 business days after we receive it' },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3 mb-3 last:mb-0">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-[12px] font-bold flex items-center justify-center shrink-0">{s.step}</span>
              <p className="text-[13px] text-gray-500 leading-relaxed pt-0.5">{s.text}</p>
            </div>
          ))}
        </div>

        {/* Eligible */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={17} className="text-green-500" />
            <p className="text-[14px] font-bold text-text-primary">Eligible for Return</p>
          </div>
          <ul className="flex flex-col gap-2">
            {ELIGIBLE.map((e) => <li key={e} className="text-[13px] text-gray-500 flex items-start gap-2"><span className="text-green-400 shrink-0">✓</span>{e}</li>)}
          </ul>
        </div>

        {/* Not eligible */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={17} className="text-red-400" />
            <p className="text-[14px] font-bold text-text-primary">Not Eligible for Return</p>
          </div>
          <ul className="flex flex-col gap-2">
            {NOT_ELIGIBLE.map((e) => <li key={e} className="text-[13px] text-gray-500 flex items-start gap-2"><span className="text-red-300 shrink-0">✕</span>{e}</li>)}
          </ul>
        </div>

        <Link href="/orders" className="w-full h-12 bg-primary text-white rounded-full font-bold text-[15px] flex items-center justify-center hover:bg-primary-dark transition-colors shadow-md">
          Start a Return
        </Link>
      </main>

      <Footer />
    </div>
  );
}
