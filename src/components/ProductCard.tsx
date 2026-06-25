import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import PriceDisplay from './PriceDisplay';
import StarRating from './StarRating';
import VendorBadge from './VendorBadge';

interface Props {
  product: Product;
  variant?: 'grid' | 'list' | 'flash';
}

export default function ProductCard({ product, variant = 'grid' }: Props) {
  const imageSrc = product.images[0] ?? '/placeholder.png';

  if (variant === 'list') {
    return (
      <Link
        href={`/product/${product.id}`}
        className="flex bg-card rounded-xl shadow-sm border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-2 gap-3"
      >
        <div className="relative w-[110px] h-[110px] rounded-lg overflow-hidden bg-border shrink-0">
          <Image src={imageSrc} alt={product.name} fill className="object-cover" sizes="110px" />
          {product.discountPercent > 0 && (
            <span className="absolute top-1 left-1 bg-primary text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
              -{product.discountPercent}%
            </span>
          )}
        </div>
        <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-text-primary line-clamp-2">{product.name}</p>
          <PriceDisplay salePrice={product.salePrice} originalPrice={product.originalPrice} discountPercent={product.discountPercent} size="sm" showBadge={false} />
          <StarRating rating={product.rating} reviewCount={product.reviewCount} size={12} showCount />
          {product.isOfficialStore && <VendorBadge />}
        </div>
      </Link>
    );
  }

  if (variant === 'flash') {
    return (
      <Link
        href={`/product/${product.id}`}
        className="w-[150px] shrink-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
      >
        <div className="relative w-full h-[130px] bg-border">
          <Image src={imageSrc} alt={product.name} fill className="object-cover" sizes="150px" />
          {product.discountPercent > 0 && (
            <span className="absolute top-1 left-1 bg-primary text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
              -{product.discountPercent}%
            </span>
          )}
        </div>
        <div className="p-2">
          <p className="text-[12px] font-medium text-text-primary line-clamp-2 leading-4">{product.name}</p>
          <div className="mt-1">
            <PriceDisplay salePrice={product.salePrice} originalPrice={product.originalPrice} discountPercent={product.discountPercent} size="sm" showBadge={false} />
          </div>
        </div>
      </Link>
    );
  }

  // grid (default)
  return (
    <Link
      href={`/product/${product.id}`}
      className="bg-card rounded-xl shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 transition-all duration-200 overflow-hidden flex flex-col group"
    >
      <div className="relative w-full aspect-square bg-border overflow-hidden">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {product.discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
            -{product.discountPercent}%
          </span>
        )}
      </div>
      <div className="p-2 flex flex-col gap-1">
        <p className="text-[13px] font-medium text-text-primary line-clamp-2 leading-[18px]">{product.name}</p>
        <PriceDisplay salePrice={product.salePrice} originalPrice={product.originalPrice} discountPercent={product.discountPercent} size="sm" showBadge={false} />
      </div>
    </Link>
  );
}
