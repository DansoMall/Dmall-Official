'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AppHeader from '@/components/AppHeader';
import BannerCarousel from '@/components/BannerCarousel';
import SectionHeader from '@/components/SectionHeader';
import ProductRow from '@/components/ProductRow';
import Footer from '@/components/Footer';
import ParticleCanvas from '@/components/ParticleCanvas';
import { useBestSellers, useNewArrivals, useRecommendedProducts } from '@/hooks/useProducts';

gsap.registerPlugin(ScrollTrigger);

const BANNERS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
    title: 'Plus Size Glam',
    subtitle: 'Stylish fits for every body',
    ctaText: 'Shop Now',
    ctaRoute: '/categories?cat=fashion',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    title: 'African Prints Collection',
    subtitle: 'Bold patterns, authentic style',
    ctaText: 'Explore',
    ctaRoute: '/categories?cat=fashion',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=1200&q=80',
    title: 'Tech & Gaming',
    subtitle: 'Best prices on electronics',
    ctaText: 'Shop Deals',
    ctaRoute: '/categories?cat=electronics',
  },
];

const QUICK_CATS = [
  { name: 'Phones',      slug: 'phones-tablets', icon: <img src="/phones-icon.png"      alt="Phones"      width={32} height={32} /> },
  { name: 'Electronics', slug: 'electronics',    icon: <img src="/electronics-icon.png" alt="Electronics" width={32} height={32} /> },
  { name: 'Fashion',     slug: 'fashion',         icon: <img src="/fashion-icon.png"     alt="Fashion"     width={32} height={32} /> },
  { name: 'Pre-Order',   slug: 'pre-order',       icon: <img src="/preorder-icon.png"    alt="Pre-Order"   width={32} height={32} /> },
  { name: 'All',         slug: 'all',             icon: <img src="/hamburger.png"        alt="All"         width={24} height={24} /> },
];

export default function HomePage() {
  const { products: bestSellers,  loading: fl } = useBestSellers();
  const { products: newArrivals,  loading: nl } = useNewArrivals();
  const { products: recommended,  loading: rl } = useRecommendedProducts();

  // Refs for GSAP targets
  const bannerRef   = useRef<HTMLDivElement>(null);
  const catsRef     = useRef<HTMLDivElement>(null);
  const sec1Ref     = useRef<HTMLDivElement>(null);
  const sec2Ref     = useRef<HTMLDivElement>(null);
  const sec3Ref     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Banner slides down + fades in on load
      gsap.fromTo(bannerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 }
      );

      // Quick category icons pop in with stagger
      gsap.fromTo(
        catsRef.current ? Array.from(catsRef.current.children) : [],
        { opacity: 0, scale: 0.6, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.08, delay: 0.4 }
      );

      // Product sections slide up as they scroll into view
      [sec1Ref, sec2Ref, sec3Ref].forEach((ref, i) => {
        gsap.fromTo(ref.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            delay: i * 0.05,
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen flex flex-col overflow-hidden">

        {/* ── Fixed top chrome ───────────────────────────────── */}
        <div className="shrink-0">
          {/* Header with particle background */}
          <div className="relative">
            <ParticleCanvas />
            <AppHeader showSearch showCart />
          </div>

          {/* Banner + quick cats — never scroll */}
          <div className="bg-background">
            <div ref={bannerRef} className="max-w-7xl mx-auto px-4 pt-4 pb-2">
              <BannerCarousel banners={BANNERS} />
            </div>

            <div className="h-px bg-border mx-4" />

            <div className="max-w-7xl mx-auto px-4 py-3">
              <div ref={catsRef} className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-hide">
                {QUICK_CATS.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={
                      cat.slug === 'all'       ? '/categories' :
                      cat.slug === 'pre-order' ? '/search?showAll=true&title=Pre-Order+Items' :
                      `/categories?cat=${cat.slug}`
                    }
                    className="flex flex-col items-center gap-1 sm:gap-1.5 shrink-0 group"
                  >
                    <div className="w-[50px] h-[50px] sm:w-[58px] sm:h-[58px] bg-card border border-border rounded-xl shadow-sm flex items-center justify-center hover:bg-primary-light transition-all duration-200 group-hover:scale-110 group-hover:shadow-md">
                      {cat.icon}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-text-secondary group-hover:text-primary transition-colors">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-2 bg-border" />
          </div>
        </div>

        {/* ── Scrollable product sections ─────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-7xl mx-auto">

            <div ref={sec1Ref} className="py-3">
              <SectionHeader title="Best Sellers" href="/search?showAll=true&title=Best+Sellers" />
              <ProductRow products={bestSellers} loading={fl} />
            </div>

            <div className="h-2 bg-border my-2" />

            <div ref={sec2Ref} className="py-3">
              <SectionHeader title="New Arrivals" href="/search?showAll=true&title=New+Arrivals" />
              <ProductRow products={newArrivals} loading={nl} />
            </div>

            <div className="h-2 bg-border my-2" />

            <div ref={sec3Ref} className="py-3">
              <SectionHeader title="You May Also Like" href="/search?showAll=true" />
              <ProductRow products={recommended} loading={rl} />
            </div>

            <Footer />
          </div>
        </div>

    </div>
  );
}
