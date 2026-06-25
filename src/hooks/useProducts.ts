'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, toProduct, toProductDetail } from '@/utils/api';
import type { Product } from '@/types';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((res) => { if (!cancelled) setData(res); })
      .catch((e) => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refresh };
}

export function useBestSellers() {
  const state = useFetch(() =>
    api.products.bestSellers().then((r) => r.results.map(toProduct))
  );
  return { products: state.data ?? [], ...state };
}

export function useNewArrivals() {
  const state = useFetch(() =>
    api.products.list('ordering=-created_at&page_size=12').then((r) => r.results.map(toProduct))
  );
  return { products: state.data ?? [], ...state };
}

export function useRecommendedProducts() {
  const state = useFetch(() =>
    api.products.recommended().then((r) => r.results.map(toProduct))
  );
  return { products: state.data ?? [], ...state };
}

export function useAllProducts(params = '') {
  const queryString = params ? `${params}&page_size=100` : 'page_size=100';
  const state = useFetch(
    () => api.products.list(queryString).then((r) => ({ products: r.results.map(toProduct), total: r.count })),
    [queryString]
  );
  return {
    products: state.data?.products ?? [],
    total: state.data?.total ?? 0,
    ...state,
  };
}

export function useProductSearch(query: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) { setProducts([]); return; }
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      api.products.search(query)
        .then((r) => { if (!cancelled) setProducts(r.results.map(toProduct)); })
        .catch((e) => { if (!cancelled) setError(String(e)); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 280);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  return { products, loading, error };
}

export function useProductDetail(id: string) {
  const state = useFetch(() => api.products.detail(id).then(toProductDetail), [id]);
  return { product: state.data, ...state };
}

export function useCategoryProducts(slug: string) {
  const state = useFetch(
    () => api.products.byCategory(slug).then((r) => r.results.map(toProduct)),
    [slug]
  );
  return { products: state.data ?? [], ...state };
}
