'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gsap } from 'gsap';
import {
  User, MapPin, ShieldCheck, Heart, ShoppingBag, RotateCcw,
  Bell, Info, LogOut, ChevronRight, Store, Camera,
  X, Check, Package, Truck, Edit3, Upload,
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/format';

const STATUS_COLORS: Record<string, string> = {
  delivered: '#27AE60', processing: '#F39C12', placed: '#003152', cancelled: '#E74C3C',
};
const STATUS_BG: Record<string, string> = {
  delivered: '#EDFAF4', processing: '#FEF9EC', placed: '#EBF2F8', cancelled: '#FDECEA',
};
const MOCK_ORDERS = [
  { id: 'DM-A3X8', date: '24 Jun 2026', items: 2, status: 'delivered', total: 245 },
  { id: 'DM-B7K2', date: '20 Jun 2026', items: 1, status: 'processing', total: 125 },
  { id: 'DM-C9P5', date: '15 Jun 2026', items: 3, status: 'delivered', total: 380 },
];

// ─── Edit Profile Sheet ──────────────────────────────────────────────────────
// Uses CSS transitions (no GSAP display toggling) to avoid timing races.
// Always in the DOM; opacity + translateY control visibility.
function EditProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, updateUser } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm]     = useState({ name: '', email: '', phone: '', location: '' });
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  // Populate from store whenever sheet opens
  useEffect(() => {
    if (open && user) {
      setForm({
        name:     user.name     ?? '',
        email:    user.email    ?? '',
        phone:    user.phone    ?? '',
        location: user.location ?? '',
      });
      setAvatar(user.avatar);
      setSaved(false);
    }
  }, [open, user]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    updateUser({ name: form.name, email: form.email, phone: form.phone, location: form.location, avatar });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1100);
  };

  const initial = (form.name || user?.name)?.[0]?.toUpperCase() ?? 'U';

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />

      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-black/50 transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[201] flex flex-col bg-white rounded-t-3xl shadow-2xl max-w-2xl mx-auto"
        style={{
          maxHeight: '92vh',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
          <h2 className="text-[18px] font-bold text-text-primary">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover shadow-lg ring-4 ring-primary/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-[32px] font-extrabold shadow-lg ring-4 ring-primary/20">
                  {initial}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md border-2 border-white hover:bg-primary-dark transition-colors"
              >
                <Camera size={14} className="text-white" />
              </button>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:opacity-75 transition-opacity"
            >
              <Upload size={13} /> Upload new photo
            </button>
          </div>

          {/* Form fields */}
          {([
            { label: 'Full Name',     key: 'name',     type: 'text',  placeholder: 'Your full name' },
            { label: 'Email Address', key: 'email',    type: 'email', placeholder: 'your@email.com' },
            { label: 'Phone Number',  key: 'phone',    type: 'tel',   placeholder: '+233 XX XXX XXXX' },
            { label: 'Location',      key: 'location', type: 'text',  placeholder: 'e.g. Accra, Greater Accra' },
          ] as const).map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-[13px] font-semibold text-text-primary mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-[14px] text-text-primary placeholder:text-gray-400 outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`w-full h-12 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-primary text-white hover:bg-primary-dark active:scale-95'
            }`}
          >
            {saved    ? <><Check size={18} /> Saved!</> :
             saving   ? <span className="animate-pulse">Saving…</span> :
                        'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth, mockLogin } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const [editOpen, setEditOpen] = useState(false);
  const heroRef  = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
          onComplete: () => heroRef.current && gsap.set(heroRef.current, { clearProps: 'transform' }) }
      );
      if (cardsRef.current) {
        const children = Array.from(cardsRef.current.children);
        gsap.fromTo(children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08, delay: 0.25,
            onComplete: () => children.forEach((el) => gsap.set(el, { clearProps: 'transform' })) }
        );
      }
    });
    return () => ctx.revert();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
        <AppHeader title="My Account" showCart />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
          <img src="/dmall-logo.png" alt="DMall" className="h-24 w-auto" />
          <div>
            <h2 className="text-[22px] font-bold mb-1">Welcome to DMall</h2>
            <p className="text-text-secondary text-[14px]">Login to track orders, manage your wishlist and more</p>
          </div>
          <button
            onClick={() => mockLogin()}
            className="bg-primary text-white font-bold px-10 py-3.5 rounded-full hover:bg-primary-dark transition-all shadow-md text-[15px]"
          >
            Login / Register
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const initial = user?.name?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">

      {/* Sheet is a direct child of the page root — no overflow parent above it */}
      <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} />

      <AppHeader title="My Account" showCart />

      <main className="flex-1 max-w-2xl mx-auto w-full">

        {/* Hero */}
        <div
          ref={heroRef}
          className="relative px-6 pt-8 pb-16 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #003152 0%, #0a5a8e 100%)' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative flex items-center gap-5">
            <div className="relative shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-[72px] h-[72px] rounded-full object-cover ring-4 ring-white/30 shadow-xl"
                />
              ) : (
                <div className="w-[72px] h-[72px] rounded-full bg-accent text-primary text-[26px] font-extrabold flex items-center justify-center shadow-xl ring-4 ring-white/20">
                  {initial}
                </div>
              )}
              <button
                onClick={() => setEditOpen(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
              >
                <Camera size={12} className="text-primary" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[19px] font-bold text-white truncate">{user?.name}</p>
                {user?.isVerified && <ShieldCheck size={16} className="text-accent shrink-0" />}
              </div>
              <p className="text-[13px] text-white/70 truncate">{user?.email}</p>
              <p className="text-[13px] text-white/70">{user?.phone}</p>
              {user?.location && (
                <p className="text-[12px] text-white/50 flex items-center gap-1 mt-0.5">
                  <MapPin size={11} /> {user.location}
                </p>
              )}
            </div>

            <button
              onClick={() => setEditOpen(true)}
              className="shrink-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-[12px] font-semibold px-3 py-1.5 rounded-full transition-all border border-white/20"
            >
              <Edit3 size={12} /> Edit
            </button>
          </div>

          {user?.walletBalance !== undefined && (
            <div className="mt-5 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5">
              <span className="text-[12px] text-white/70">Wallet Balance</span>
              <span className="text-[14px] font-bold text-accent">{formatPrice(user.walletBalance)}</span>
            </div>
          )}
        </div>

        {/* Stats card — z-10 keeps it above hero decorative elements */}
        <div className="px-4 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {[
                { label: 'In Cart',  value: totalItems,         href: '/cart' },
                { label: 'Wishlist', value: 0,                  href: '/wishlist' },
                { label: 'Orders',   value: MOCK_ORDERS.length, href: '/orders' },
              ].map((stat) => (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="flex flex-col items-center py-4 gap-0.5 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-[22px] font-extrabold text-primary">{stat.value}</span>
                  <span className="text-[12px] text-gray-500 font-medium">{stat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div ref={cardsRef} className="px-4 py-5 flex flex-col gap-4">

          {user?.role === 'customer' && (
            <div className="bg-gradient-to-r from-primary to-[#0a5a8e] rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:opacity-95 transition-opacity">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Store size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-white">Become a Vendor</p>
                <p className="text-[12px] text-white/70">Start selling on D Mall today — it's free</p>
              </div>
              <ChevronRight size={20} className="text-white/60" />
            </div>
          )}

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-primary" />
                <p className="text-[15px] font-bold">Recent Orders</p>
              </div>
              <Link href="/orders" className="text-[13px] font-semibold text-primary hover:underline">View all</Link>
            </div>
            {MOCK_ORDERS.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: STATUS_BG[order.status] ?? '#F4F6F9' }}
                >
                  <Truck size={18} style={{ color: STATUS_COLORS[order.status] ?? '#1A1A1A' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold">{order.id}</p>
                  <p className="text-[12px] text-gray-400">{order.date} · {order.items} item{order.items > 1 ? 's' : ''}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[13px] font-bold">{formatPrice(order.total)}</span>
                  <span
                    className="text-[11px] font-semibold capitalize px-2 py-0.5 rounded-full"
                    style={{ color: STATUS_COLORS[order.status], background: STATUS_BG[order.status] }}
                  >
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <MenuSection label="Account">
            <MenuItem icon={<User size={17} />}       label="My Profile"            sub="Personal info & password"  onClick={() => setEditOpen(true)} />
            <MenuItem icon={<MapPin size={17} />}      label="Saved Addresses"       sub="Manage delivery addresses" href="/account/addresses" />
            <MenuItem icon={<ShieldCheck size={17} />} label="Identity Verification" sub="Ghana Card / BVN"          href="/account/verification" />
          </MenuSection>

          <MenuSection label="Shopping">
            <MenuItem icon={<Heart size={17} />}       label="Wishlist"          badge="0" href="/wishlist" />
            <MenuItem icon={<ShoppingBag size={17} />} label="My Orders"                  href="/orders" />
            <MenuItem icon={<RotateCcw size={17} />}   label="Returns & Refunds"           href="/returns" />
          </MenuSection>

          <MenuSection label="Settings & Support">
            <MenuItem icon={<Bell size={17} />} label="Notifications" href="/account/notifications" />
            <MenuItem
              icon={<img src="/support-icon.png" alt="" width={19} height={19} />}
              label="Help & Support"
              href="/help"
            />
            <MenuItem icon={<Info size={17} />} label="About D Mall" href="/about" />
          </MenuSection>

          <button
            onClick={() => { clearAuth(); router.push('/'); }}
            className="w-full flex items-center gap-4 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 hover:bg-red-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <LogOut size={18} className="text-red-500" />
            </div>
            <p className="text-[15px] font-semibold text-red-500 flex-1 text-left">Sign Out</p>
            <ChevronRight size={16} className="text-red-300" />
          </button>

          <p className="text-center text-[11px] text-gray-300 pb-2">D Mall v1.0.0 · Made in Ghana 🇬🇭</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function MenuSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">{label}</p>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        {children}
      </div>
    </div>
  );
}

function MenuItem({ icon, label, sub, badge, href, onClick }: {
  icon: React.ReactNode; label: string; sub?: string; badge?: string; href?: string; onClick?: () => void;
}) {
  const inner = (
    <>
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-text-primary">{label}</p>
        {sub && <p className="text-[12px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {badge !== undefined ? (
        <span className="text-[12px] bg-primary text-white font-bold px-2.5 py-0.5 rounded-full">{badge}</span>
      ) : (
        <ChevronRight size={16} className="text-gray-300 shrink-0" />
      )}
    </>
  );

  const cls = 'w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left';

  if (href) {
    return <Link href={href} className={cls}>{inner}</Link>;
  }
  return <button onClick={onClick} className={cls}>{inner}</button>;
}
