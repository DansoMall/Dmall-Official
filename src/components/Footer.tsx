import Link from 'next/link';
import { Heart, Store, RotateCcw, Info } from 'lucide-react';

const LINKS: {
  section: string;
  items: { label: string; href: string; icon: React.ReactNode }[];
}[] = [
  {
    section: 'Shop',
    items: [
      { label: 'New Arrivals',    href: '/search?showAll=true&title=New+Arrivals',   icon: <img src="/arrivals-icon.png"  alt="" width={16} height={16} className="object-contain" /> },
      { label: 'Featured Deals',  href: '/search?showAll=true&title=Featured+Deals', icon: <img src="/payment-icon.png"   alt="" width={16} height={16} className="object-contain" /> },
      { label: 'Pre-Order Items', href: '/search?showAll=true&title=Pre-Order+Items',icon: <img src="/preorder-icon.png"  alt="" width={16} height={16} className="object-contain" /> },
      { label: 'All Categories',  href: '/categories',                                icon: <img src="/hamburger.png"      alt="" width={16} height={16} className="object-contain" /> },
    ],
  },
  {
    section: 'Account',
    items: [
      { label: 'My Orders',  href: '/orders',   icon: <img src="/track-order-icon.png" alt="" width={16} height={16} className="object-contain" /> },
      { label: 'My Cart',    href: '/cart',     icon: <img src="/cart-icon.png"         alt="" width={16} height={16} className="object-contain" /> },
      { label: 'Wishlist',   href: '/wishlist', icon: <Heart size={14} className="text-white/70 shrink-0" /> },
      { label: 'My Profile', href: '/account',  icon: <img src="/account-icon.png"      alt="" width={16} height={16} className="object-contain" /> },
    ],
  },
  {
    section: 'Support',
    items: [
      { label: 'Help Center',    href: '/help',    icon: <img src="/support-icon.png" alt="" width={16} height={16} className="object-contain" /> },
      { label: 'Sell on D Mall', href: '/account', icon: <Store size={14} className="text-white/70 shrink-0" /> },
      { label: 'Return Policy',  href: '/returns', icon: <RotateCcw size={14} className="text-white/70 shrink-0" /> },
      { label: 'About D Mall',   href: '/about',   icon: <Info size={14} className="text-white/70 shrink-0" /> },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-12 relative overflow-hidden">

      {/* Faint icon watermark */}
      <img
        src="/favicon.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 m-auto w-[340px] max-w-[70%] pointer-events-none select-none"
        style={{ opacity: 0.05 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-7 md:gap-8">

        {/* Brand */}
        <div>
          <img src="/dmall-logo-cropped.png" alt="DMall" className="h-28 w-auto mb-4 drop-shadow-lg" />
          <p className="text-[13px] text-white/70 leading-relaxed">
            Ghana&apos;s favourite online marketplace. Shop millions of products with fast delivery across Ghana.
          </p>
        </div>

        {/* Link columns */}
        {LINKS.map(({ section, items }) => (
          <div key={section}>
            <h4 className="text-[14px] font-semibold mb-4 text-accent">{section}</h4>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-[13px] text-white/70 hover:text-white transition-colors group"
                  >
                    <span className="w-5 h-5 flex items-center justify-center shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      <div className="relative z-10 border-t border-white/10 py-4 text-center">
        <p className="text-[12px] text-white/40">© 2026 D Mall Ghana Ltd. · All rights reserved</p>
      </div>
    </footer>
  );
}
