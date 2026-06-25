'use client';

import { useState } from 'react';
import { MapPin, Plus, Home, Briefcase, Trash2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';

const DEFAULT_ADDRESSES = [
  { id: '1', label: 'Home', icon: 'home', name: 'Ama Owusu', phone: '+233244123456', street: '14 Tema Motorway', city: 'Accra', region: 'Greater Accra', isDefault: true },
  { id: '2', label: 'Office', icon: 'office', name: 'Ama Owusu', phone: '+233244123456', street: 'Ring Road Central', city: 'Accra', region: 'Greater Accra', isDefault: false },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(DEFAULT_ADDRESSES);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <AppHeader title="Saved Addresses" showBack showCart />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 flex flex-col gap-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  {addr.icon === 'home' ? <Home size={18} className="text-primary" /> : <Briefcase size={18} className="text-primary" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[14px] font-bold text-text-primary">{addr.label}</p>
                    {addr.isDefault && (
                      <span className="text-[11px] font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-text-primary">{addr.name}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{addr.street}, {addr.city}</p>
                  <p className="text-[12px] text-gray-400">{addr.region} · {addr.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setAddresses((a) => a.filter((x) => x.id !== addr.id))}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors shrink-0"
              >
                <Trash2 size={15} className="text-red-400" />
              </button>
            </div>
            {!addr.isDefault && (
              <button
                onClick={() => setAddresses((a) => a.map((x) => ({ ...x, isDefault: x.id === addr.id })))}
                className="mt-3 text-[12px] font-semibold text-primary hover:underline"
              >
                Set as default
              </button>
            )}
          </div>
        ))}

        <button className="flex items-center justify-center gap-2 bg-white rounded-2xl border-2 border-dashed border-gray-200 px-5 py-4 hover:border-primary hover:bg-blue-50 transition-all text-[14px] font-semibold text-gray-400 hover:text-primary">
          <Plus size={18} /> Add New Address
        </button>
      </main>

      <Footer />
    </div>
  );
}
