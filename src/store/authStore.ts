import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  updateUser: (patch: Partial<User>) => void;
  clearAuth: () => void;
  mockLogin: (role?: 'customer' | 'vendor' | 'admin') => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setUser: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),

      updateUser: (patch) =>
        set((state) => ({ user: state.user ? { ...state.user, ...patch } : state.user })),

      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),

      mockLogin: (role = 'customer') =>
        set({
          isAuthenticated: true,
          accessToken: 'mock-token',
          user: {
            id: 'mock-001',
            name: 'Ama Owusu',
            email: 'ama@dansomall.com',
            phone: '+233244123456',
            role,
            walletBalance: 124.5,
            isVerified: true,
          },
        }),
    }),
    { name: 'dmall-auth' }
  )
);
