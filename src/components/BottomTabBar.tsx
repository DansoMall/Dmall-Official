'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

const TABS = [
  { label: 'Home',       href: '/',           icon: '/home-icon.png' },
  { label: 'Categories', href: '/categories', icon: '/hamburger.png' },
  { label: 'Cart',       href: '/cart',       icon: '/cart-icon.png',     badge: true },
  { label: 'Account',   href: '/account',    icon: '/account-icon.png',  isAccount: true },
];

export default function BottomTabBar() {
  const pathname  = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (pathname === '/auth') return null;

  const initial = user?.name?.[0]?.toUpperCase() ?? 'U';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-border safe-area-inset-bottom shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center">
        {TABS.map((tab) => {
          const isGuestAccount = tab.isAccount && mounted && !isAuthenticated;
          const href = isGuestAccount ? `/auth?tab=login&next=${encodeURIComponent('/account')}` : tab.href;
          const activeHref = href.split('?')[0];
          const isActive = activeHref === '/'
            ? pathname === '/'
            : pathname.startsWith(activeHref);

          const showProfile = tab.isAccount && mounted && isAuthenticated;

          return (
            <Link
              key={tab.href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <div className="relative">
                {showProfile ? (
                  /* User avatar / initial bubble */
                  user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className={`w-7 h-7 rounded-full object-cover transition-all duration-200 ${
                        isActive
                          ? 'ring-2 ring-primary ring-offset-1 scale-110'
                          : 'ring-2 ring-gray-200 scale-100'
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-extrabold transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-white scale-110 ring-2 ring-primary/30'
                          : 'bg-primary/15 text-primary scale-100'
                      }`}
                    >
                      {initial}
                    </div>
                  )
                ) : (
                  <img
                    src={tab.icon}
                    alt={tab.label}
                    width={24}
                    height={24}
                    className={`object-contain transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}
                    style={{ filter: isActive ? 'none' : 'grayscale(0.6) opacity(0.6)' }}
                  />
                )}

                {tab.badge && mounted && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-danger text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-primary' : 'text-text-secondary/60'}`}>
                {tab.isAccount && mounted && isAuthenticated
                  ? (user?.name?.split(' ')[0] ?? 'Account')
                  : isGuestAccount
                    ? 'Login'
                  : tab.label}
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
