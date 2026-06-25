'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';

const TABS = [
  { label: 'Home',       href: '/',           icon: '/home-icon.png' },
  { label: 'Categories', href: '/categories', icon: '/hamburger.png' },
  { label: 'Cart',       href: '/cart',       icon: '/cart-icon.png',    badge: true },
  { label: 'Account',   href: '/account',    icon: '/account-icon.png' },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Hide on auth page — it has its own full-screen layout
  if (pathname === '/auth') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-border safe-area-inset-bottom shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center">
        {TABS.map((tab) => {
          const isActive = tab.href === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <div className="relative">
                <img
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className={`object-contain transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}
                  style={{ filter: isActive ? 'none' : 'grayscale(0.6) opacity(0.6)' }}
                />
                {tab.badge && mounted && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-danger text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-primary' : 'text-text-secondary/60'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
