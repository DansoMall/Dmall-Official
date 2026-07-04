/**
 * Authenticated fetch wrapper.
 * - Injects Authorization header from Zustand store
 * - On 401: attempts token refresh, retries once
 * - On refresh failure: clears auth + redirects to /auth
 */

import { useAuthStore } from '@/store/authStore';

const API = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000';

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setAccessToken, clearAuth } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API}/api/auth/refresh-token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) {
      // Only a 401 means the refresh token is invalid/expired — log out.
      // Other failures (502, network timeout) are transient; keep the session alive.
      if (res.status === 401) {
        clearAuth();
        if (typeof window !== 'undefined') window.location.href = '/auth';
      }
      return null;
    }
    const data = await res.json();
    setAccessToken(data.access);
    return data.access;
  } catch {
    // Network error — don't clear auth, the server may just be temporarily unreachable
    return null;
  }
}

export async function apiClient(
  path: string,
  options: RequestInit & { isFormData?: boolean } = {},
): Promise<Response> {
  const { accessToken } = useAuthStore.getState();
  const { isFormData, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  let res = await fetch(`${API}${path}`, { ...fetchOptions, headers });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await fetch(`${API}${path}`, {
        ...fetchOptions,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      });
    }
  }

  return res;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiClient(path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await apiClient(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const firstVal = Object.values(err)[0];
    const msg = err.detail ?? err.non_field_errors?.[0] ?? (Array.isArray(firstVal) ? firstVal[0] : firstVal) ?? 'Request failed';
    throw new Error(msg as string);
  }
  return res.json();
}

export async function apiPatch<T>(path: string, body: FormData | Record<string, unknown>): Promise<T> {
  const isFormData = body instanceof FormData;
  const res = await apiClient(path, {
    method: 'PATCH',
    body: isFormData ? body : JSON.stringify(body),
    isFormData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const firstPatchVal = Object.values(err)[0];
    const msg = err.detail ?? (Array.isArray(firstPatchVal) ? firstPatchVal[0] : firstPatchVal) ?? 'Update failed';
    throw new Error(msg as string);
  }
  return res.json();
}
