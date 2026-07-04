'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Bell, LogIn, UserPlus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import NotificationDrawer from './NotificationDrawer';

interface Props {
  title?: string;
  showSearch?: boolean;
  showBack?: boolean;
  showCart?: boolean;
  backHref?: string;
}

export default function AppHeader({ title, showSearch = false, showBack = false, showCart = true, backHref }: Props) {
  const router = useRouter();
  const totalItems = useCartStore((s) => s.totalItems());
  const { user, isAuthenticated } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const initial = user?.name?.[0]?.toUpperCase() ?? 'U';

  return (
    <>
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />

      <header className="bg-primary sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">

          {/* Left */}
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
              {mounted && unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-danger text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
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
                <Link href="/" aria-label="D Mall home" className="flex items-center justify-center">
                  <img src="/dmall-logo-cropped.png" alt="DMall" className="h-16 sm:h-20 w-auto drop-shadow-md" />
                </Link>
              )}
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-1 -mr-1 shrink-0">
            {/* User avatar — visible when authenticated */}
            {mounted && isAuthenticated && (
              <Link
                href="/account"
                className="flex items-center justify-center w-10 h-10 hover:opacity-80 transition-opacity"
                title={user?.name ?? 'My Account'}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white/40 shadow-md"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent text-primary text-[13px] font-extrabold flex items-center justify-center ring-2 ring-white/30 shadow-md">
                    {initial}
                  </div>
                )}
              </Link>
            )}

            {showCart && (
              <Link href="/cart" className="relative flex items-center justify-center w-10 h-10 hover:opacity-80 shrink-0">
                <img src="/cart-icon.png" alt="Cart" width={28} height={28} />
                {mounted && totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-danger text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Sub-nav (desktop only) */}
        <nav className="hidden md:block bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 py-2 overflow-visible">
            {[
              { label: 'Home',         href: '/',                                        icon: '/home-icon.png' },
              { label: 'Categories',   href: '/categories',                              icon: '/hamburger.png' },
              { label: 'New Arrivals', href: '/search?showAll=true&title=New+Arrivals',  icon: '/arrivals-icon.png' },
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

            {/* Account link — profile chip when logged in, auth drawer for guests */}
            {mounted && isAuthenticated ? (
              <Link
                href="/account"
                className="ml-auto flex items-center gap-2 text-[13px] font-semibold whitespace-nowrap hover:text-primary transition-colors group"
              >
                <>
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary text-white text-[12px] font-extrabold flex items-center justify-center group-hover:bg-primary-dark transition-colors">
                      {initial}
                    </div>
                  )}
                  <span className="text-text-primary group-hover:text-primary">
                    {user?.name?.split(' ')[0] ?? 'Account'} &middot; <span className="font-bold text-primary">Manage Account</span>
                  </span>
                </>
              </Link>
            ) : (
              <div className="relative ml-auto group">
                <Link
                  href={`/auth?tab=login&next=${encodeURIComponent('/account')}`}
                  className="flex items-center gap-2 text-[13px] font-semibold whitespace-nowrap text-text-primary hover:text-primary transition-colors"
                >
                  <img src="/account-icon.png" alt="" width={18} height={18} className="object-contain" />
                  <span>Register / Login</span>
                </Link>

                <div className="absolute right-0 top-full z-[60] pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                  <div className="w-64 rounded-2xl bg-white border border-border shadow-xl p-3">
                    <p className="text-[13px] font-bold text-text-primary">Welcome to D Mall</p>
                    <p className="text-[12px] text-text-secondary mt-0.5 mb-3">Sign in or create an account to track orders, reviews, and checkout faster.</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/auth?tab=login&next=${encodeURIComponent('/account')}`}
                        className="flex items-center justify-center gap-1.5 rounded-full bg-primary text-white text-[12px] font-bold py-2 hover:bg-primary-dark transition-colors"
                      >
                        <LogIn size={14} /> Login
                      </Link>
                      <Link
                        href={`/auth?tab=register&next=${encodeURIComponent('/account')}`}
                        className="flex items-center justify-center gap-1.5 rounded-full bg-accent text-primary text-[12px] font-bold py-2 hover:bg-accent/80 transition-colors"
                      >
                        <UserPlus size={14} /> Register
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
