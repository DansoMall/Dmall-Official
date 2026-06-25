import { formatPrice } from '@/utils/format';

interface Props {
  salePrice: number;
  originalPrice?: number;
  discountPercent?: number;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

const sizeMap = {
  sm: { sale: 'text-[13px]', orig: 'text-[11px]', badge: 'text-[10px]' },
  md: { sale: 'text-[15px]', orig: 'text-[13px]', badge: 'text-[11px]' },
  lg: { sale: 'text-[20px]', orig: 'text-[15px]', badge: 'text-[11px]' },
};

export default function PriceDisplay({ salePrice, originalPrice, discountPercent, size = 'md', showBadge = true }: Props) {
  const s = sizeMap[size];
  const hasDiscount = discountPercent && discountPercent > 0;

  return (
    <div className="flex items-center flex-wrap gap-1">
      <span className={`${s.sale} font-bold text-primary`}>{formatPrice(salePrice)}</span>
      {hasDiscount && originalPrice && (
        <span className={`${s.orig} text-text-secondary line-through`}>{formatPrice(originalPrice)}</span>
      )}
      {hasDiscount && showBadge && (
        <span className={`${s.badge} font-bold text-white bg-primary rounded px-1 py-0.5`}>
          -{discountPercent}%
        </span>
      )}
    </div>
  );
}
