'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Briefcase, Home, Loader2, Plus, Trash2, X } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';
import { apiClient, apiGet, apiPatch, apiPost } from '@/utils/apiClient';

const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Volta',
  'Northern', 'Upper East', 'Upper West', 'Oti', 'Bono East',
  'Ahafo', 'North East', 'Savannah', 'Western North',
];

interface ApiAddress {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  street: string;
  city: string;
  region: string;
  is_default: boolean;
}

type AddressResponse = ApiAddress[] | { results?: ApiAddress[] };

const emptyForm = {
  label: 'Home',
  recipient_name: '',
  phone: '',
  street: '',
  city: '',
  region: '',
  is_default: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet<AddressResponse>('/api/auth/addresses/');
      setAddresses(Array.isArray(data) ? data : data.results ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load addresses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchAddresses(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchAddresses]);

  const handleCreate = async () => {
    if (!form.recipient_name || !form.phone || !form.street || !form.city || !form.region) {
      setError('Please fill all address fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const created = await apiPost<ApiAddress>('/api/auth/addresses/', form);
      setAddresses((current) => {
        const next = form.is_default ? current.map((a) => ({ ...a, is_default: false })) : current;
        return [created, ...next];
      });
      setForm(emptyForm);
      setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDefault = async (id: number) => {
    try {
      const updated = await apiPatch<ApiAddress>(`/api/auth/addresses/${id}/`, { is_default: true });
      setAddresses((current) => current.map((addr) => ({ ...addr, is_default: addr.id === updated.id })));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not update default address.');
    }
  };

  const handleDelete = async (id: number) => {
    const previous = addresses;
    setAddresses((current) => current.filter((addr) => addr.id !== id));
    const res = await apiClient(`/api/auth/addresses/${id}/`, { method: 'DELETE' });
    if (!res.ok) {
      setAddresses(previous);
      setError('Could not delete address.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <AppHeader title="Saved Addresses" showBack showCart />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <AlertCircle size={15} className="text-danger" />
            <p className="text-[13px] text-danger">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <p className="text-[15px] font-bold text-text-primary">No saved addresses</p>
            <p className="text-[13px] text-gray-400 mt-1">Add a delivery address to make checkout faster.</p>
          </div>
        ) : addresses.map((addr) => (
          <div key={addr.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  {addr.label.toLowerCase().includes('office') || addr.label.toLowerCase().includes('work')
                    ? <Briefcase size={18} className="text-primary" />
                    : <Home size={18} className="text-primary" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[14px] font-bold text-text-primary">{addr.label}</p>
                    {addr.is_default && (
                      <span className="text-[11px] font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-text-primary">{addr.recipient_name}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{addr.street}, {addr.city}</p>
                  <p className="text-[12px] text-gray-400">{addr.region} · {addr.phone}</p>
                </div>
              </div>
              <button
                onClick={() => { void handleDelete(addr.id); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors shrink-0"
                aria-label="Delete address"
              >
                <Trash2 size={15} className="text-red-400" />
              </button>
            </div>
            {!addr.is_default && (
              <button
                onClick={() => { void handleDefault(addr.id); }}
                className="mt-3 text-[12px] font-semibold text-primary hover:underline"
              >
                Set as default
              </button>
            )}
          </div>
        ))}

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-bold text-text-primary">Add New Address</p>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={15} />
              </button>
            </div>
            {([
              ['label', 'Label, e.g. Home'],
              ['recipient_name', 'Recipient full name'],
              ['phone', '+233 phone number'],
              ['street', 'Street / landmark'],
              ['city', 'City / town'],
            ] as const).map(([key, placeholder]) => (
              <input
                key={key}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full h-12 px-4 rounded-xl border border-border bg-gray-50 text-[14px] outline-none focus:border-primary"
              />
            ))}
            <select
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              className="w-full h-12 px-4 rounded-xl border border-border bg-gray-50 text-[14px] outline-none focus:border-primary"
            >
              <option value="">Select region</option>
              {GHANA_REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}
            </select>
            <label className="flex items-center gap-2 text-[13px] text-text-primary">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
              />
              Make this my default address
            </label>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="h-12 rounded-full bg-primary text-white text-[14px] font-bold hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        )}

        <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 bg-white rounded-2xl border-2 border-dashed border-gray-200 px-5 py-4 hover:border-primary hover:bg-blue-50 transition-all text-[14px] font-semibold text-gray-400 hover:text-primary">
          <Plus size={18} /> Add New Address
        </button>
      </main>

      <Footer />
    </div>
  );
}
