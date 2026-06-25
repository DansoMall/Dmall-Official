'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X, Package, Tag, Truck, Bell } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    icon: <Truck size={18} className="text-primary" />,
    title: 'Order DM-A3X8 Delivered',
    body: 'Your order has been delivered successfully.',
    time: '2h ago',
    unread: false,
  },
  {
    id: 2,
    icon: <Tag size={18} className="text-warning" />,
    title: 'Flash Deal — 40% off Electronics',
    body: 'Limited-time offer on phones & laptops.',
    time: '5h ago',
    unread: true,
  },
  {
    id: 3,
    icon: <Package size={18} className="text-success" />,
    title: 'Order DM-B7K2 Shipped',
    body: 'Your order is on its way to you.',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 4,
    icon: <Bell size={18} className="text-accent" />,
    title: 'Welcome to D Mall!',
    body: 'Discover thousands of products from verified vendors.',
    time: '3 days ago',
    unread: false,
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ open, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef   = useRef<HTMLDivElement>(null);

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

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <>
      {/* Backdrop — inline style so GSAP can toggle display freely */}
      <div
        ref={backdropRef}
        style={{ display: 'none' }}
        className="fixed inset-0 bg-black/40 z-[60]"
        onClick={onClose}
      />

      {/* Drawer */}
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
          {NOTIFICATIONS.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-background transition-colors ${n.unread ? 'bg-primary-light/30' : ''}`}
            >
              <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center shrink-0 mt-0.5">
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold text-text-primary leading-snug">{n.title}</p>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                </div>
                <p className="text-[12px] text-text-secondary mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-[11px] text-text-secondary/60 mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border shrink-0">
          <button className="w-full text-[13px] font-semibold text-primary hover:text-primary-dark transition-colors">
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
}
