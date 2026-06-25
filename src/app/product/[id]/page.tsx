'use client';

import { useState, use, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Share2, Heart, ChevronLeft, Minus, Plus, Star, ShoppingCart, Loader2, MapPin, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import AppHeader from '@/components/AppHeader';
import PriceDisplay from '@/components/PriceDisplay';
import StarRating from '@/components/StarRating';
import VendorBadge from '@/components/VendorBadge';
import PrimaryButton from '@/components/PrimaryButton';
import OutlineButton from '@/components/OutlineButton';
import Footer from '@/components/Footer';
import { useProductDetail } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/format';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { product, loading } = useProductDetail(id);
  const addItem = useCartStore((s) => s.addItem);

  const pageRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!product || !pageRef.current) return;
    const cols = pageRef.current.querySelectorAll('.grid > *');
    gsap.fromTo(cols,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15 }
    );
  }, [product]);

  if (loading || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader showBack showCart />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : ['/placeholder.png'];
  const savings = product.originalPrice - product.salePrice;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader showBack showCart />

      <main ref={pageRef} className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Images */}
          <div>
            {/* Main Image */}
            <div className="relative w-full aspect-square bg-card rounded-2xl overflow-hidden shadow-md mb-3">
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <button
                onClick={() => setWishlisted((w) => !w)}
                className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center"
              >
                <Heart size={20} className={wishlisted ? 'fill-danger text-danger' : 'text-text-secondary'} />
              </button>
              {product.discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-danger text-white text-[13px] font-bold px-2 py-1 rounded-lg">
                  -{product.discountPercent}%
                </span>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-primary' : 'border-border'}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col gap-4">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.isOfficialStore && <VendorBadge />}
              {product.condition !== 'new' && (
                <span className="text-[12px] font-semibold text-warning bg-yellow-100 px-2 py-0.5 rounded capitalize">
                  {product.condition}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-[22px] font-bold text-text-primary leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} size={16} />
              <span className="text-[14px] text-text-secondary">{product.rating.toFixed(1)} ({product.reviewCount} reviews) · 500+ sold</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[28px] font-bold text-primary">{formatPrice(product.salePrice)}</span>
              {product.discountPercent > 0 && (
                <>
                  <span className="text-[18px] text-text-secondary line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-danger text-white text-[13px] font-bold px-2 py-1 rounded-lg">-{product.discountPercent}%</span>
                </>
              )}
            </div>
            {savings > 0 && (
              <p className="text-success text-[14px] font-semibold -mt-2">You save {formatPrice(savings)}</p>
            )}

            {/* Variants */}
            {product.variants.map((v) => (
              <div key={v.type}>
                <p className="text-[13px] font-semibold text-text-primary mb-2 capitalize">{v.type}:</p>
                <div className="flex gap-2 flex-wrap">
                  {v.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariants((prev) => ({ ...prev, [v.type]: opt }))}
                      className={`px-3 py-1.5 rounded-lg border text-[13px] font-medium transition-colors ${
                        selectedVariants[v.type] === opt
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-border text-text-primary hover:border-primary'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-semibold text-text-primary">Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 rounded-full border-2 border-border flex items-center justify-center hover:bg-border active:scale-95"
                >
                  <Minus size={14} />
                </button>
                <span className="text-[17px] font-semibold min-w-[28px] text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark active:scale-95"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-[13px] text-text-secondary">{product.stock} in stock</span>
            </div>

            {/* Delivery */}
            <div className="bg-background rounded-xl p-4 flex flex-col gap-3 border border-border">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-primary" />
                <div>
                  <p className="text-[14px] font-semibold">Door Delivery</p>
                  <p className="text-[12px] text-text-secondary">Delivered to your address</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Store size={18} className="text-primary" />
                <div>
                  <p className="text-[14px] font-semibold">Station Pickup</p>
                  <p className="text-[12px] text-text-secondary">Pick up at nearest station — Free for orders above ₵500</p>
                </div>
              </div>
            </div>

            {/* Seller */}
            <div className="bg-background rounded-xl p-4 flex items-center gap-3 border border-border">
              <div className="w-11 h-11 rounded-full bg-primary-light flex items-center justify-center">
                <Store size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-text-primary">{product.sellerName ?? 'D Mall Official'}</p>
                {product.isOfficialStore && <VendorBadge />}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setWishlisted((w) => !w)}
                className="w-11 h-11 rounded-xl border-2 border-primary flex items-center justify-center shrink-0"
              >
                <Heart size={20} className={wishlisted ? 'fill-danger text-danger' : 'text-primary'} />
              </button>
              <OutlineButton
                label="Add to Cart"
                size="md"
                className="flex-1"
                onClick={() => { addItem(product, qty); }}
              />
              <PrimaryButton
                label="Buy Now"
                size="md"
                className="flex-1"
                onClick={() => { addItem(product, qty); router.push('/cart'); }}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-8 bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-[17px] font-bold mb-3">Product Description</h2>
            <p className={`text-[14px] text-text-secondary leading-relaxed ${!expanded ? 'line-clamp-4' : ''}`}>
              {product.description}
            </p>
            <button onClick={() => setExpanded((e) => !e)} className="text-primary text-[14px] font-semibold mt-2">
              {expanded ? 'Show less' : 'Read more'}
            </button>
          </div>
        )}

        {/* Ratings Summary */}
        <div className="mt-6 bg-card rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-[17px] font-bold mb-4">Ratings & Reviews</h2>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[48px] font-bold text-text-primary leading-none">{product.rating.toFixed(1)}</span>
              <StarRating rating={product.rating} size={20} />
              <span className="text-[13px] text-text-secondary mt-1">{product.reviewCount} reviews</span>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[12px] text-text-secondary w-3">{star}</span>
                  <Star size={12} className="text-warning fill-warning shrink-0" />
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning rounded-full"
                      style={{ width: star === Math.round(product.rating) ? '60%' : star > product.rating ? '5%' : '30%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
