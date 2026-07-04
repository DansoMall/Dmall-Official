const API = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000';

export interface InitPayResponse {
  reference: string;
  authorization_url: string;
  access_code: string;
}

export interface VerifyPayResponse {
  detail: string;
  status: 'success' | 'failed' | 'abandoned' | string;
  order_id?: number;
  order_number?: string;
}

export async function initializePayment(
  orderId: number,
  channels: string[],
  token: string,
): Promise<InitPayResponse> {
  const res = await fetch(`${API}/api/payments/initialize/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ order_id: orderId, channels }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Failed to initialize payment');
  }
  return res.json();
}

export async function verifyPayment(
  reference: string,
  token: string,
): Promise<VerifyPayResponse> {
  const res = await fetch(`${API}/api/payments/verify/${reference}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Payment verification failed');
  }
  return res.json();
}

export async function createOrder(
  payload: Record<string, unknown>,
  token: string,
): Promise<{ id: number; order_number: string }> {
  const res = await fetch(`${API}/api/orders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Failed to create order');
  }
  return res.json();
}
