'use client';

import { useRef, useState } from 'react';
import { ShieldCheck, Upload, CheckCircle2, Clock } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';

const STEPS = [
  { id: 1, label: 'Ghana Card / National ID', sub: 'Upload front and back of your ID', status: 'pending' },
  { id: 2, label: 'Selfie Verification',       sub: 'Take a selfie holding your ID',    status: 'pending' },
  { id: 3, label: 'Phone Verification',         sub: 'Confirm your phone number via OTP', status: 'done' },
];

export default function VerificationPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<Record<number, string>>({});
  const [success, setSuccess] = useState('');

  const openUpload = (stepId: number) => {
    setActiveStep(stepId);
    fileRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeStep === null) return;
    setSubmitted((s) => ({ ...s, [activeStep]: file.name }));
    setSuccess('Verification document received. Our team will review it shortly.');
    e.target.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <AppHeader title="Identity Verification" showBack showCart />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 flex flex-col gap-4">
        <input ref={fileRef} type="file" accept="image/*,.pdf" className="sr-only" onChange={handleFile} />

        {/* Status banner */}
        <div className={`${success ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'} border rounded-2xl p-5 flex items-start gap-4`}>
          {success ? <CheckCircle2 size={22} className="text-green-500 shrink-0 mt-0.5" /> : <Clock size={22} className="text-yellow-500 shrink-0 mt-0.5" />}
          <div>
            <p className={`text-[14px] font-bold ${success ? 'text-green-700' : 'text-yellow-700'}`}>
              {success ? 'Document Submitted' : 'Verification Pending'}
            </p>
            <p className={`text-[12px] mt-0.5 ${success ? 'text-green-600' : 'text-yellow-600'}`}>
              {success || 'Complete all steps below to unlock higher purchase limits and seller privileges.'}
            </p>
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
            {(step.status === 'pending' || submitted[step.id]) && (
              <>
                {submitted[step.id] && (
                  <p className="mt-3 text-[12px] font-semibold text-success bg-green-50 rounded-xl px-3 py-2">
                    Uploaded: {submitted[step.id]}
                  </p>
                )}
                <button
                  onClick={() => openUpload(step.id)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white h-11 rounded-xl font-semibold text-[14px] hover:bg-primary-dark transition-colors"
                >
                  <Upload size={15} /> {submitted[step.id] ? 'Replace Document' : 'Upload Documents'}
                </button>
              </>
            )}
          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
}
