import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

// Lazy imports to avoid circular deps — resolved at call time
function getCartStore() { return import('@/store/cartStore').then((m) => m.useCartStore.getState()); }
function getNotifStore() { return import('@/store/notificationStore').then((m) => m.useNotificationStore.getState()); }

const API = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000';

function mapUser(u: Record<string, unknown>): User {
  return {
    id:            String(u.id),
    name:          u.name as string,
    email:         u.email as string,
    phone:         (u.phone as string) ?? '',
    role:          (u.role as User['role']) ?? 'customer',
    avatar:        (u.avatar_url as string) ?? undefined,
    walletBalance: parseFloat((u.wallet_balance as string) ?? '0'),
    isVerified:    (u.is_verified as boolean) ?? false,
  };
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  login:          (email: string, password: string) => Promise<void>;
  register:       (name: string, email: string, phone: string, password: string, confirmPassword: string) => Promise<void>;
  logout:         () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  setAccessToken: (token: string) => void;
  updateUser:     (patch: Partial<User>) => void;
  clearAuth:      () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,

      setAccessToken: (token) => set({ accessToken: token }),

      updateUser: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),

      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),

      login: async (email, password) => {
        const res = await fetch(`${API}/api/auth/login/`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.detail ?? err.non_field_errors?.[0] ?? 'Invalid email or password',
          );
        }
        const data = await res.json();

        // Notifications are user-scoped; cart may be a guest cart that should merge after auth.
        getNotifStore().then((notif) => notif.clear());

        // Optimistically set tokens + auth state first
        set({ isAuthenticated: true, accessToken: data.access, refreshToken: data.refresh });

        // Use user data from login response if available, otherwise fetch /me
        if (data.user) {
          set({ user: mapUser(data.user) });
        } else {
          try {
            const meRes = await fetch(`${API}/api/auth/me/`, {
              headers: { Authorization: `Bearer ${data.access}` },
            });
            if (meRes.ok) {
              const me = await meRes.json();
              set({ user: mapUser(me) });
            }
          } catch { /* user stays null — non-fatal */ }
        }

        // Fetch notifications for the newly logged-in user
        getNotifStore().then((notif) => notif.fetch());
      },

      register: async (name, email, phone, password, confirmPassword) => {
        const res = await fetch(`${API}/api/auth/register/`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            name,
            email,
            phone,
            password,
            confirm_password: confirmPassword,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          // Surface the first validation error from any field
          const firstErr =
            err.email?.[0] ??
            err.phone?.[0] ??
            err.password?.[0] ??
            err.confirm_password?.[0] ??
            err.name?.[0] ??
            err.detail ??
            'Registration failed';
          throw new Error(firstErr);
        }
        const data = await res.json();
        set({
          isAuthenticated: true,
          accessToken:     data.access,
          refreshToken:    data.refresh,
          user:            mapUser(data.user),
        });
      },

      logout: async () => {
        const { refreshToken } = get();
        // Blacklist the refresh token on Django
        if (refreshToken) {
          await fetch(`${API}/api/auth/logout/`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ refresh: refreshToken }),
          }).catch(() => null);
        }
        // Clear user-scoped data
        getCartStore().then((cart) => cart.clearCart());
        getNotifStore().then((notif) => notif.clear());
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      refreshSession: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const res = await fetch(`${API}/api/auth/refresh-token/`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ refresh: refreshToken }),
          });
          if (!res.ok) throw new Error();
          const data = await res.json();
          set({ accessToken: data.access });
          return true;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          return false;
        }
      },
    }),
    { name: 'dmall-auth' },
  ),
);
