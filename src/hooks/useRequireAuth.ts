'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

function authRedirect(nextPath: string) {
  return `/auth?tab=login&next=${encodeURIComponent(nextPath)}`;
}

export function useRequireAuth(nextOverride?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand persist to restore state from localStorage before deciding
  // whether to redirect. Without this, the store starts with isAuthenticated=false
  // on every page load and fires the redirect before the persisted token is read.
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
      return unsub;
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      const query = searchParams.toString();
      const nextPath = nextOverride ?? `${pathname}${query ? `?${query}` : ''}`;
      router.replace(authRedirect(nextPath));
    }
  }, [hydrated, isAuthenticated, nextOverride, pathname, router, searchParams]);

  return hydrated && isAuthenticated;
}
