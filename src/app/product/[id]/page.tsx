'use client';

import { useState, use, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CheckCircle, Heart, Minus, Plus, Star, Loader2, MapPin, Store, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import AppHeader from '@/components/AppHeader';
import StarRating from '@/components/StarRating';
import VendorBadge from '@/components/VendorBadge';
import PrimaryButton from '@/components/PrimaryButton';
import OutlineButton from '@/components/OutlineButton';
import Footer from '@/components/Footer';
import { useProductDetail } from '@/hooks/useProducts';
import { useCartStore, type ApiCart } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import type { ApiProduct } from '@/utils/api';
import { formatPrice } from '@/utils/format';
import { apiClient, apiGet, apiPost } from '@/utils/apiClient';

interface ApiReview {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

type ReviewResponse = ApiReview[] | { results?: ApiReview[] };

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { product, loading, refresh } = useProductDetail(id);
  const addItem = useCartStore((s) => s.addItem);
  const syncCartFromBackend = useCartStore((s) => s.syncFromBackend);
  const { isAuthenticated } = useAuthStore();

  const pageRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState(false);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');
  const [cartNoticeOpen, setCartNoticeOpen] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (!product || !pageRef.current) return;
    const cols = pageRef.current.querySelectorAll('.grid > *');
    gsap.fromTo(cols,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15 }
    );
  }, [product]);

  useEffect(() => {
    if (!product?.id) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setReviewsLoading(true);
      apiGet<ReviewResponse>(`/api/reviews/products/${product.id}/`)
        .then((data) => {
          if (cancelled) return;
          setReviews(Array.isArray(data) ? data : data.results ?? []);
        })
        .catch(() => {
          if (!cancelled) setReviews([]);
        })
        .finally(() => {
          if (!cancelled) setReviewsLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [product?.id]);

  useEffect(() => {
    if (!isAuthenticated || !product?.id) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      apiGet<ApiProduct[]>('/api/wishlist/')
        .then((items) => {
          if (!cancelled) setWishlisted(items.some((item) => String(item.id) === product.id));
        })
        .catch(() => {
          if (!cancelled) setWishlisted(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isAuthenticated, product?.id]);

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      router.push(`/auth?tab=login&next=${encodeURIComponent(`/product/${id}`)}`);
      return;
    }
    if (selectedRating < 1) {
      setReviewError('Please choose a star rating.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      const created = await apiPost<ApiReview>(`/api/reviews/products/${product?.id}/`, {
        rating: selectedRating,
        comment: reviewComment.trim(),
      });
      setReviews((current) => [created, ...current.filter((review) => review.id !== created.id)]);
      setSelectedRating(0);
      setReviewComment('');
      setReviewSuccess('Thanks for rating this product.');
      refresh();
    } catch (e: unknown) {
      setReviewError(e instanceof Error ? e.message : 'Could not submit your rating.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const selectedVariant = () => {
    const [type, value] = Object.entries(selectedVariants)[0] ?? [];
    return type && value ? { type, value } : undefined;
  };

  const handleAddToCart = async (goToCart = false) => {
    if (!product) return;
    const variant = selectedVariant();
    setCartLoading(true);
    setCartError('');
    try {
      if (isAuthenticated) {
        const cart = await apiPost<ApiCart>('/api/cart/add/', {
          product_id: parseInt(product.id, 10),
          quantity: qty,
          variant: variant ?? {},
        });
        syncCartFromBackend(cart);
      } else {
        addItem(product, qty, variant);
      }
      if (goToCart) {
        router.push('/cart');
      } else {
        setCartNoticeOpen(true);
      }
    } catch (e: unknown) {
      setCartError(e instanceof Error ? e.message : 'Could not add this item to your cart.');
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      router.push(`/auth?tab=login&next=${encodeURIComponent(`/product/${product.id}`)}`);
      return;
    }
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await apiClient(`/api/wishlist/remove/${product.id}/`, { method: 'DELETE' });
        setWishlisted(false);
      } else {
        await apiClient(`/api/wishlist/add/${product.id}/`, { method: 'POST' });
        setWishlisted(true);
      }
    } finally {
      setWishlistLoading(false);
    }
  };

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

      {cartNoticeOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <CheckCircle size={24} className="text-success" />
                </div>
                <div>
                  <p className="text-[17px] font-extrabold text-text-primary">Added to cart</p>
                  <p className="text-[13px] text-text-secondary mt-0.5">
                    {qty} x {product.name} has been added to your cart.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCartNoticeOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 hover:bg-gray-200"
                aria-label="Close cart alert"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[13px] text-text-secondary mt-4">
              You can proceed to order now, or continue shopping and add more products.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={() => setCartNoticeOpen(false)}
                className="h-11 rounded-2xl border-2 border-primary text-primary text-[13px] font-bold hover:bg-primary-light transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => router.push('/cart')}
                className="h-11 rounded-2xl bg-primary text-white text-[13px] font-bold hover:bg-primary-dark transition-colors"
              >
                Proceed to Order
              </button>
            </div>
          </div>
        </div>
      )}

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
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center disabled:opacity-60"
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
              <span className="text-[14px] text-text-secondary">{product.rating.toFixed(1)} ({product.reviewCount} review{product.reviewCount === 1 ? '' : 's'})</span>
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
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className="w-11 h-11 rounded-xl border-2 border-primary flex items-center justify-center shrink-0 disabled:opacity-60"
              >
                <Heart size={20} className={wishlisted ? 'fill-danger text-danger' : 'text-primary'} />
              </button>
              <OutlineButton
                label="Add to Cart"
                size="md"
                className="flex-1"
                loading={cartLoading}
                disabled={cartLoading}
                onClick={() => { void handleAddToCart(); }}
              />
              <PrimaryButton
                label={cartLoading ? 'Adding...' : 'Buy Now'}
                loading={cartLoading}
                size="md"
                className="flex-1"
                onClick={() => { void handleAddToCart(true); }}
              />
            </div>
            {cartError && <p className="text-[13px] text-danger">{cartError}</p>}
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
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-64 shrink-0">
              <h2 className="text-[17px] font-bold mb-4">Ratings & Reviews</h2>
              <div className="flex lg:flex-col items-center lg:items-start gap-4">
                <span className="text-[48px] font-bold text-text-primary leading-none">{product.rating.toFixed(1)}</span>
                <div>
                  <StarRating rating={product.rating} size={20} />
                  <span className="text-[13px] text-text-secondary mt-1 block">{product.reviewCount} review{product.reviewCount === 1 ? '' : 's'}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-5">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-[15px] font-bold text-text-primary mb-3">Rate this product</p>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      className="p-1 active:scale-95 transition-transform"
                      aria-label={`Rate ${star} star${star === 1 ? '' : 's'}`}
                    >
                      <Star
                        size={28}
                        className={star <= selectedRating ? 'text-warning fill-warning' : 'text-text-secondary/35'}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share a quick note about this product..."
                  className="w-full min-h-24 rounded-xl border border-border bg-white p-3 text-[14px] outline-none focus:border-primary resize-none"
                />
                {reviewError && <p className="text-[13px] text-danger mt-2">{reviewError}</p>}
                {reviewSuccess && <p className="text-[13px] text-success mt-2">{reviewSuccess}</p>}
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewSubmitting}
                  className="mt-3 rounded-full bg-primary text-white text-[14px] font-bold px-5 py-2.5 hover:bg-primary-dark disabled:opacity-60 transition-colors"
                >
                  {reviewSubmitting ? 'Submitting...' : isAuthenticated ? 'Submit Rating' : 'Login to Rate'}
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {reviewsLoading ? (
                  <div className="flex items-center gap-2 text-[13px] text-text-secondary">
                    <Loader2 size={16} className="animate-spin" /> Loading reviews...
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-[13px] text-text-secondary">No reviews yet. Be the first to rate this product.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-border bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[14px] font-bold text-text-primary">{review.user_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rating} size={14} />
                            {review.is_verified_purchase && (
                              <span className="text-[11px] font-semibold text-success bg-green-50 px-2 py-0.5 rounded-full">Verified purchase</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-text-secondary shrink-0">
                          {new Date(review.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {review.comment && <p className="text-[13px] text-text-secondary mt-3 leading-relaxed">{review.comment}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
