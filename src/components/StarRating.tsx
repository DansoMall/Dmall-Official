'use client';

import { Star, StarHalf } from 'lucide-react';

interface Props {
  rating: number;
  maxStars?: number;
  reviewCount?: number;
  size?: number;
  showCount?: boolean;
}

export default function StarRating({ rating, maxStars = 5, reviewCount, size = 14, showCount = false }: Props) {
  const safeRating = Math.min(Math.max(Number.isFinite(rating) ? rating : 0, 0), maxStars);
  const stars = Array.from({ length: maxStars }, (_, i) => {
    const val = safeRating - i;
    if (val >= 1) return 'full';
    if (val >= 0.5) return 'half';
    return 'empty';
  });

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((type, i) => (
        <span key={i}>
          {type === 'full' && <Star size={size} className="text-primary fill-primary" />}
          {type === 'half' && <StarHalf size={size} className="text-primary fill-primary" />}
          {type === 'empty' && <Star size={size} className="text-text-secondary" />}
        </span>
      ))}
      {showCount && reviewCount !== undefined && (
        <span className="text-text-secondary ml-1" style={{ fontSize: size - 2 }}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
