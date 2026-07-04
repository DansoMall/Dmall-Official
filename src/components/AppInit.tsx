'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useCartStore, type ApiCart } from '@/store/cartStore';
import { apiGet } from '@/utils/apiClient';

// Runs once on app boot — hydrates user-scoped backend state if already logged in
export default function AppInit() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetch = useNotificationStore((s) => s.fetch);
  const syncCart = useCartStore((s) => s.syncFromBackend);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = window.setTimeout(() => {
      fetch();
      apiGet<ApiCart>('/api/cart/')
        .then(syncCart)
        .catch(() => null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, fetch, syncCart]);

  return null;
}
