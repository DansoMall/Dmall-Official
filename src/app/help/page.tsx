'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, MessageCircle, Phone, Mail } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';

const FAQS = [
  { q: 'How do I track my order?',                   a: 'Go to My Orders, select the order and tap Track. You\'ll see live status updates from our courier partners.' },
  { q: 'What payment methods do you accept?',         a: 'We accept MTN MoMo, Vodafone Cash, and AirtelTigo Money only.' },
  { q: 'Can I return a product?',                     a: 'Yes — you can request a return within 7 days of delivery for eligible items. Visit Returns & Refunds in your account.' },
  { q: 'How long does delivery take?',                a: 'Accra deliveries take 1–2 business days. Other regions take 2–5 business days depending on your location.' },
  { q: 'How do I become a vendor?',                   a: 'Tap Become a Vendor on your Account page and complete the registration. Our team reviews applications within 48 hours.' },
  { q: 'Is my payment information secure?',           a: 'Yes. All transactions are encrypted with 256-bit SSL. We never store your MoMo PIN.' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4 text-left gap-3">
        <p className="text-[14px] font-semibold text-text-primary">{q}</p>
        {open ? <ChevronUp size={16} className="text-primary shrink-0" /> : <ChevronDown size={16} className="text-gray-300 shrink-0" />}
      </button>
      {open && <div className="px-5 pb-4 text-[13px] text-gray-500 leading-relaxed border-t border-gray-50">{a}</div>}
    </div>
  );
}

export default function HelpPage() {
  const [q, setQ] = useState('');
  const filtered = FAQS.filter((f) => f.q.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <AppHeader title="Help & Support" showBack showCart />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 flex flex-col gap-5">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white rounded-full px-4 h-12 border border-gray-100 shadow-sm">
          <Search size={16} className="text-gray-300 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for help..."
            className="flex-1 text-[14px] outline-none text-text-primary placeholder:text-gray-300"
          />
        </div>

        {/* FAQs */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-3">Frequently Asked Questions</p>
          <div className="flex flex-col gap-2">
            {filtered.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
            {filtered.length === 0 && <p className="text-center text-[13px] text-gray-300 py-8">No results found</p>}
          </div>
        </div>

        {/* Contact */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-3">Contact Us</p>
          <div className="flex flex-col gap-2">
            {[
              { icon: <MessageCircle size={18} className="text-primary" />, label: 'Live Chat', sub: 'Average response: 2 min', action: 'Start Chat' },
              { icon: <Phone size={18} className="text-success" />,         label: 'Call Us',   sub: '+233 30 290 0000 · Mon–Sat 8am–6pm', action: 'Call Now' },
              { icon: <Mail size={18} className="text-warning" />,          label: 'Email',     sub: 'support@dmall.com.gh', action: 'Send Email' },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">{c.icon}</div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-text-primary">{c.label}</p>
                  <p className="text-[12px] text-gray-400">{c.sub}</p>
                </div>
                <button className="text-[12px] font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors">{c.action}</button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
