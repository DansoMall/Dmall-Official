import { create } from 'zustand';
import { apiClient, apiGet } from '@/utils/apiClient';

export interface ApiNotification {
  id: number;
  notification_type: 'order_update' | 'flash_sale' | 'price_drop' | 'promotion' | 'system';
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

interface NotificationStore {
  notifications: ApiNotification[];
  unreadCount: number;
  loading: boolean;
  fetch: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  clear: () => set({ notifications: [], unreadCount: 0 }),

  fetch: async () => {
    set({ loading: true });
    try {
      const [listRes, countRes] = await Promise.all([
        apiGet<ApiNotification[]>('/api/notifications/'),
        apiGet<{ unread_count: number }>('/api/notifications/unread-count/'),
      ]);
      set({
        notifications: Array.isArray(listRes) ? listRes : [],
        unreadCount: countRes.unread_count ?? 0,
      });
    } catch {
      // silently fail — notification errors shouldn't break the app
    } finally {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    try {
      await apiClient(`/api/notifications/${id}/read/`, { method: 'POST' });
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch { /* ignore */ }
  },

  markAllRead: async () => {
    try {
      await apiClient('/api/notifications/read-all/', { method: 'POST' });
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch { /* ignore */ }
  },
}));
