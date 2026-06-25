'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Grid2x2, List, Search, X, SlidersHorizontal } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import ProductCard from '@/components/ProductCard';
import AnimatedGrid from '@/components/AnimatedGrid';
import Footer from '@/components/Footer';
import { useProductSearch, useAllProducts } from '@/hooks/useProducts';
import { Loader2 } from 'lucide-react';

const SORT_OPTIONS = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Best Rating' },
  { key: 'newest', label: 'Newest First' },
];

function SearchContent() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const showAll = params.get('showAll') === 'true';
  const title = params.get('title') ?? 'All Products';

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('relevance');
  const [query, setQuery] = useState(q);
  const [inputVal, setInputVal] = useState(q);

  const { products: searchResults, loading: searchLoading } = useProductSearch(query);
  const { products: allProducts, loading: allLoading } = useAllProducts();

  const baseProducts = showAll ? allProducts : searchResults;
  const loading = showAll ? allLoading : searchLoading;

  const sorted = useMemo(() => {
    const arr = [...baseProducts];
    if (sort === 'price_asc') arr.sort((a, b) => a.salePrice - b.salePrice);
    else if (sort === 'price_desc') arr.sort((a, b) => b.salePrice - a.salePrice);
    else if (sort === 'rating') arr.sort((a, b) => b.rating - a.rating);
    return arr;
  }, [baseProducts, sort]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader showBack showCart />

      <div className="bg-primary px-4 pb-4">
        <form
          onSubmit={(e) => { e.preventDefault(); setQuery(inputVal); }}
          className="flex items-center bg-white rounded-full px-4 h-10 gap-2 shadow"
        >
          <Search size={16} className="text-primary shrink-0" />
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search products, brands..."
            className="flex-1 text-[14px] outline-none text-text-primary placeholder:text-text-secondary"
            autoFocus
          />
          {inputVal && (
            <button type="button" onClick={() => { setInputVal(''); setQuery(''); }}>
              <X size={16} className="text-text-secondary" />
            </button>
          )}
        </form>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <p className="text-[14px] text-text-secondary">
            {loading ? 'Searching…' : `${sorted.length} results${query ? ` for "${query}"` : ` — ${title}`}`}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-[13px] border border-border rounded-lg px-2 py-1.5 bg-card text-text-primary outline-none"
            >
              {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <button onClick={() => setView('grid')} className={`p-1.5 rounded ${view === 'grid' ? 'text-primary' : 'text-text-secondary'}`}>
              <Grid2x2 size={18} />
            </button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded ${view === 'list' ? 'text-primary' : 'text-text-secondary'}`}>
              <List size={18} />
            </button>
            <button className="flex items-center gap-1 border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary hover:bg-border">
              <SlidersHorizontal size={14} /> Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <Search size={48} className="mb-4 opacity-30" />
            <p className="text-[16px] font-semibold">No results found</p>
            <p className="text-[14px] mt-1">Try a different keyword</p>
          </div>
        ) : view === 'grid' ? (
          <AnimatedGrid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {sorted.map((p) => <ProductCard key={p.id} product={p} variant="grid" />)}
          </AnimatedGrid>
        ) : (
          <AnimatedGrid className="flex flex-col gap-3">
            {sorted.map((p) => <ProductCard key={p.id} product={p} variant="list" />)}
          </AnimatedGrid>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
