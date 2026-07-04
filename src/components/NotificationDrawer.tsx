'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X, Package, Tag, Truck, Bell, Loader2, TrendingDown } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import type { ApiNotification } from '@/store/notificationStore';

function notifIcon(type: ApiNotification['notification_type']) {
  switch (type) {
    case 'order_update': return <Truck size={18} className="text-primary" />;
    case 'flash_sale':   return <Tag size={18} className="text-warning" />;
    case 'price_drop':   return <TrendingDown size={18} className="text-success" />;
    case 'promotion':    return <Tag size={18} className="text-accent" />;
    default:             return <Bell size={18} className="text-primary" />;
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)    return 'Just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days === 1)  return 'Yesterday';
  return `${days} days ago`;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ open, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef   = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, loading, fetch, markRead, markAllRead } = useNotificationStore();
  const { isAuthenticated } = useAuthStore();

  // Fetch on open if authenticated
  useEffect(() => {
    if (open && isAuthenticated) fetch();
  }, [open, isAuthenticated, fetch]);

  // GSAP slide animation
  useEffect(() => {
    const backdrop = backdropRef.current;
    const drawer   = drawerRef.current;
    if (!backdrop || !drawer) return;

    if (open) {
      backdrop.style.display = 'block';
      drawer.style.display   = 'flex';
      gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(drawer,   { x: '-100%' }, { x: '0%', duration: 0.35, ease: 'power3.out',
        onComplete: () => gsap.set(drawer, { clearProps: 'transform' }),
      });
    } else {
      gsap.to(backdrop, {
        opacity: 0, duration: 0.2, ease: 'power2.in',
        onComplete: () => { backdrop.style.display = 'none'; },
      });
      gsap.to(drawer, {
        x: '-100%', duration: 0.3, ease: 'power3.in',
        onComplete: () => { drawer.style.display = 'none'; },
      });
    }
  }, [open]);

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  return (
    <>
      <div
        ref={backdropRef}
        style={{ display: 'none' }}
        className="fixed inset-0 bg-black/40 z-[60]"
        onClick={onClose}
      />

      <div
        ref={drawerRef}
        style={{ display: 'none' }}
        className="fixed top-0 left-0 h-full w-[320px] max-w-[85vw] bg-white z-[70] shadow-2xl flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-primary shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-[12px] text-accent/80">{unreadCount} unread</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : !isAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-2">
              <Bell size={36} className="text-gray-200" />
              <p className="text-[14px] font-semibold text-text-primary">Sign in to see notifications</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-2">
              <Bell size={36} className="text-gray-200" />
              <p className="text-[14px] font-semibold text-text-primary">No notifications yet</p>
              <p className="text-[12px] text-gray-400">Order updates and promotions will appear here</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-background transition-colors ${
                  !n.is_read ? 'bg-primary-light/30' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center shrink-0 mt-0.5">
                  {notifIcon(n.notification_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold text-text-primary leading-snug">{n.title}</p>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                  </div>
                  <p className="text-[12px] text-text-secondary mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[11px] text-text-secondary/60 mt-1">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="px-5 py-3 border-t border-border shrink-0">
            <button
              onClick={handleMarkAllRead}
              className="w-full text-[13px] font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
}
