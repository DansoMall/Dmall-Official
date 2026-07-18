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
  // Lazy initializer runs during render (including SSR, where persist has no
  // storage to read and must stay false), so on the client it picks up an
  // already-hydrated store immediately instead of via a setState in effect.
  const [hydrated, setHydrated] = useState(
    () => typeof window !== 'undefined' && useAuthStore.persist.hasHydrated(),
  );

  // Wait for Zustand persist to restore state from localStorage before deciding
  // whether to redirect. Without this, the store starts with isAuthenticated=false
  // on every page load and fires the redirect before the persisted token is read.
  useEffect(() => {
    if (hydrated) return;
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [hydrated]);

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
