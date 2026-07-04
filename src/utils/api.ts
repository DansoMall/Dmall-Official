import type { Product } from '@/types';

// On the web dev server, use localhost. In production, replace with the real API domain.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000';

// ── Raw API shape (snake_case from Django) ───────────────────────────────────

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  primary_image: string | null;
  original_price: string;
  sale_price: string | null;
  effective_price: string;
  discount_percent: number;
  rating: string | number | null;
  review_count: number | null;
  is_official_store: boolean;
  vendor_name: string;
  category_slug: string;
  subcategory_slug: string;
  stock: number;
  condition: string;
}

export interface ApiProductDetail extends ApiProduct {
  description: string;
  images: Array<{ id: number; image: string; order: number; is_primary: boolean }>;
  variants: Array<{ id: number; variant_type: string; options: string[] }>;
  delivery_options: Array<{ id: number; name: string; fee: string; estimated_days: number }>;
  category: { id: number; name: string; slug: string } | null;
  brand: { id: number; name: string } | null;
  sku: string;
  shipping_weight: number | null;
  created_at: string;
  vendor_info: {
    id: number;
    name: string;
    business_name: string;
    rating: number;
    is_official: boolean;
  };
}

export interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── Transformers ─────────────────────────────────────────────────────────────

function toNumber(value: string | number | null | undefined, fallback = 0): number {
  const num = typeof value === 'number' ? value : parseFloat(value ?? '');
  return Number.isFinite(num) ? num : fallback;
}

export function toProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    vendorId: 'dmall-official',
    name: p.name,
    slug: p.slug,
    description: '',
    images: p.primary_image ? [p.primary_image] : [],
    category: p.category_slug || 'fashion',
    subcategory: p.subcategory_slug || '',
    brand: 'D Mall',
    originalPrice: parseFloat(p.original_price),
    salePrice: parseFloat(p.sale_price ?? p.original_price),
    discountPercent: p.discount_percent,
    stock: p.stock,
    sku: p.slug,
    variants: [],
    condition: p.condition as 'new' | 'used' | 'refurbished',
    rating: toNumber(p.rating),
    reviewCount: p.review_count ?? 0,
    isOfficialStore: p.is_official_store,
    isFeatured: false,
    status: 'published',
    createdAt: new Date().toISOString(),
    sellerName: p.vendor_name,
  };
}

export function toProductDetail(p: ApiProductDetail): Product {
  const allImages = p.images.map((img) => img.image);
  return {
    id: String(p.id),
    vendorId: String(p.vendor_info.id),
    name: p.name,
    slug: p.slug,
    description: p.description,
    images: allImages.length > 0 ? allImages : p.primary_image ? [p.primary_image] : [],
    category: p.category?.slug ?? 'fashion',
    subcategory: '',
    brand: p.brand?.name ?? 'D Mall',
    originalPrice: parseFloat(p.original_price),
    salePrice: parseFloat(p.sale_price ?? p.original_price),
    discountPercent: p.discount_percent,
    stock: p.stock,
    sku: p.sku,
    variants: p.variants.map((v) => ({
      type: v.variant_type as 'color' | 'size' | 'style' | 'storage',
      options: v.options,
    })),
    condition: p.condition as 'new' | 'used' | 'refurbished',
    rating: toNumber(p.rating),
    reviewCount: p.review_count ?? 0,
    isOfficialStore: p.is_official_store,
    isFeatured: false,
    status: 'published',
    createdAt: p.created_at,
    sellerName: p.vendor_info.business_name,
  };
}

// ── Fetch helper ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  products: {
    list: (params = '') =>
      apiFetch<PaginatedResponse<ApiProduct>>(`/api/products/${params ? `?${params}` : ''}`),
    bestSellers: () =>
      apiFetch<PaginatedResponse<ApiProduct>>('/api/products/?ordering=-review_count&page_size=20'),
    recommended: () =>
      apiFetch<PaginatedResponse<ApiProduct>>('/api/products/?ordering=-rating&page_size=8'),
    detail: (id: string) =>
      apiFetch<ApiProductDetail>(`/api/products/${id}/`),
    search: (query: string) =>
      apiFetch<PaginatedResponse<ApiProduct>>(`/api/products/?search=${encodeURIComponent(query)}`),
    byCategory: (slug: string) =>
      apiFetch<PaginatedResponse<ApiProduct>>(`/api/categories/${slug}/products/`),
  },
  categories: {
    list: () =>
      apiFetch<Array<{ id: number; name: string; slug: string; icon: string; subcategories: unknown[] }>>(
        '/api/categories/'
      ),
  },
};
