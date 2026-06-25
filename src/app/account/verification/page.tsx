'use client';

import { ShieldCheck, Upload, CheckCircle2, Clock } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';

const STEPS = [
  { id: 1, label: 'Ghana Card / National ID', sub: 'Upload front and back of your ID', status: 'pending' },
  { id: 2, label: 'Selfie Verification',       sub: 'Take a selfie holding your ID',    status: 'pending' },
  { id: 3, label: 'Phone Verification',         sub: 'Confirm your phone number via OTP', status: 'done' },
];

export default function VerificationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <AppHeader title="Identity Verification" showBack showCart />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 flex flex-col gap-4">
        {/* Status banner */}
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5 flex items-start gap-4">
          <Clock size={22} className="text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] font-bold text-yellow-700">Verification Pending</p>
            <p className="text-[12px] text-yellow-600 mt-0.5">Complete all steps below to unlock higher purchase limits and seller privileges.</p>
          </div>
        </div>

        {/* Steps */}
        {STEPS.map((step) => (
          <div key={step.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step.status === 'done' ? 'bg-green-50' : 'bg-blue-50'}`}>
                {step.status === 'done'
                  ? <CheckCircle2 size={20} className="text-green-500" />
                  : <ShieldCheck size={20} className="text-primary" />}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-text-primary">{step.label}</p>
                <p className="text-[12px] text-gray-400 mt-0.5">{step.sub}</p>
              </div>
            </div>
            {step.status === 'pending' && (
              <button className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white h-11 rounded-xl font-semibold text-[14px] hover:bg-primary-dark transition-colors">
                <Upload size={15} /> Upload Documents
              </button>
            )}
          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
}
