'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import NotificationDrawer from './NotificationDrawer';

interface Props {
  title?: string;
  showSearch?: boolean;
  showBack?: boolean;
  showCart?: boolean;
  backHref?: string;
}

const UNREAD_COUNT = 2;

export default function AppHeader({ title, showSearch = false, showBack = false, showCart = true, backHref }: Props) {
  const router = useRouter();
  const totalItems = useCartStore((s) => s.totalItems());
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />

      <header className="bg-primary sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          {/* Left — min 44px tap target */}
          {showBack ? (
            <button
              onClick={() => backHref ? router.push(backHref) : router.back()}
              className="flex items-center justify-center w-10 h-10 -ml-1 hover:opacity-80 shrink-0"
            >
              <img src="/back-arrow.png" alt="Back" width={20} height={20} className="brightness-0 invert" />
            </button>
          ) : (
            <button
              onClick={() => setNotifOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 -ml-1 text-accent hover:opacity-80 shrink-0"
            >
              <Bell size={22} />
              {UNREAD_COUNT > 0 && (
                <span className="absolute top-1 right-1 bg-danger text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {UNREAD_COUNT}
                </span>
              )}
            </button>
          )}

          {/* Center */}
          {showSearch ? (
            <form onSubmit={handleSearch} className="flex-1 flex items-center bg-accent rounded-full px-3 h-10 gap-2">
              <Search size={16} className="text-primary shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="bg-transparent flex-1 text-primary text-[14px] outline-none placeholder:text-primary/70 min-w-0"
              />
            </form>
          ) : (
            <div className="flex-1 flex items-center justify-center min-w-0">
              {title ? (
                <h1 className="text-white font-bold text-[16px] sm:text-[17px] truncate max-w-[200px]">{title}</h1>
              ) : (
                <Link href="/">
                  <div className="bg-white rounded-2xl px-3 py-1.5">
                    <img src="/dmall-logo.png" alt="DMall" className="h-8 w-auto" />
                  </div>
                </Link>
              )}
            </div>
          )}

          {/* Right — min 44px tap target */}
          {showCart && (
            <Link href="/cart" className="relative flex items-center justify-center w-10 h-10 -mr-1 hover:opacity-80 shrink-0">
              <img src="/cart-icon.png" alt="Cart" width={28} height={28} />
              {mounted && totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-danger text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Sub-nav (desktop only) */}
        <nav className="hidden md:block bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 flex gap-6 py-2 overflow-x-auto scrollbar-hide">
            {[
              { label: 'Home',         href: '/', icon: '/home-icon.png' },
              { label: 'Categories',   href: '/categories', icon: '/hamburger.png' },
              { label: 'New Arrivals', href: '/search?showAll=true&title=New+Arrivals', icon: '/arrivals-icon.png' },
              { label: 'Account',      href: '/account', icon: '/account-icon.png' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-1.5 text-text-primary text-[13px] font-medium whitespace-nowrap hover:text-primary transition-colors"
              >
                <img src={item.icon} alt="" width={18} height={18} className="object-contain" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
    </>
  );
}
