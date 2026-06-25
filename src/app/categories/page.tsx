'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import CategorySidebar from '@/components/CategorySidebar';
import ProductCard from '@/components/ProductCard';
import AnimatedGrid from '@/components/AnimatedGrid';
import { useAllProducts } from '@/hooks/useProducts';

const ICON_MAP: Record<string, string> = {
  'fashion':        '/fashion-icon.png',
  'footwear':       '/phones-icon.png',
  'electronics':    '/electronics-icon.png',
  'phones-tablets': '/phones-icon.png',
  'computing':      '/electronics-icon.png',
  'gaming':         '/gaming-icon.png',
  'appliances':     '/appliances-icon.png',
  'health-beauty':  '/health-icon.png',
  'home-living':    '/home-icon.png',
  'sporting-goods': '/sports-icon.png',
  'baby-kids':      '/baby-icon.png',
  'automobile':     '/auto-icon.png',
};

const CATEGORIES = [
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Footwear', slug: 'footwear' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Phones', slug: 'phones-tablets' },
  { name: 'Computing', slug: 'computing' },
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Appliances', slug: 'appliances' },
  { name: 'Health', slug: 'health-beauty' },
  { name: 'Home', slug: 'home-living' },
  { name: 'Sports', slug: 'sporting-goods' },
  { name: 'Baby', slug: 'baby-kids' },
  { name: 'Auto', slug: 'automobile' },
];

function CategoriesContent() {
  const params = useSearchParams();
  const initCat = params.get('cat') ?? 'fashion';
  const [activeSlug, setActiveSlug] = useState(initCat);
  const [activeSubSlug, setActiveSubSlug] = useState<string | null>(null);

  const { products: allProducts, loading } = useAllProducts();

  const categoryProducts = useMemo(
    () => allProducts.filter((p) => p.category === activeSlug || p.subcategory === activeSlug),
    [allProducts, activeSlug]
  );

  const subSlugs = useMemo(
    () => [...new Set(categoryProducts.map((p) => p.subcategory).filter(Boolean))],
    [categoryProducts]
  );

  const displayed = activeSubSlug
    ? categoryProducts.filter((p) => p.subcategory === activeSubSlug)
    : categoryProducts;

  const activeCat = CATEGORIES.find((c) => c.slug === activeSlug);

  return (
    // Full-viewport column — header is sticky outside, so we fill the rest
    <div className="h-screen flex flex-col overflow-hidden">
      <AppHeader title="Categories" showCart showBack />

      {/* Body row — fills remaining height, never overflows itself */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — fixed height, scrolls independently */}
        <div className="h-full overflow-y-auto scrollbar-hide shrink-0">
          <CategorySidebar
            categories={CATEGORIES}
            activeSlug={activeSlug}
            onSelect={(slug) => { setActiveSlug(slug); setActiveSubSlug(null); }}
          />
        </div>

        {/* Right panel — sticky top chrome + scrollable products */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Hero — never scrolls */}
          <div
            className="shrink-0 h-[80px] flex items-center gap-3 px-4"
            style={{ background: 'linear-gradient(135deg, #003152 0%, #0a5a8e 100%)' }}
          >
            {ICON_MAP[activeSlug] && (
              <img src={ICON_MAP[activeSlug]} alt="" width={40} height={40} className="object-contain drop-shadow-md" />
            )}
            <h1 className="text-[22px] font-bold text-accent">
              {activeCat?.name ?? activeSlug}
            </h1>
          </div>

          {/* Sub-category chips — never scrolls */}
          {subSlugs.length > 1 && (
            <div className="shrink-0 flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide border-b border-border bg-card">
              <button
                onClick={() => setActiveSubSlug(null)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                  !activeSubSlug ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:bg-border'
                }`}
              >
                All
              </button>
              {subSlugs.map((slug) => (
                <button
                  key={slug}
                  onClick={() => setActiveSubSlug(slug === activeSubSlug ? null : slug)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium border capitalize transition-colors ${
                    activeSubSlug === slug ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:bg-border'
                  }`}
                >
                  {slug.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          )}

          {/* Product grid — ONLY this scrolls */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
                <p className="text-[16px] font-semibold">No products yet</p>
                <p className="text-[14px] mt-1">Check back soon</p>
              </div>
            ) : (
              <>
                <p className="text-[13px] text-text-secondary mb-3">{displayed.length} products</p>
                <AnimatedGrid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-6">
                  {displayed.map((p) => <ProductCard key={p.id} product={p} variant="grid" />)}
                </AnimatedGrid>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>}>
      <CategoriesContent />
    </Suspense>
  );
}
