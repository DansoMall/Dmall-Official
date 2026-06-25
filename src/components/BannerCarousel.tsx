'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaRoute?: string;
}

interface Props {
  banners: Banner[];
  autoScrollInterval?: number;
}

export default function BannerCarousel({ banners, autoScrollInterval = 4000 }: Props) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (idx: number) => setActive((idx + banners.length) % banners.length);

  useEffect(() => {
    timerRef.current = setInterval(() => go(active + 1), autoScrollInterval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, autoScrollInterval]);

  return (
    <div className="relative w-full h-[200px] md:h-[260px] rounded-xl overflow-hidden bg-border">
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image src={b.image} alt={b.title} fill className="object-cover" priority={i === 0} sizes="(max-width: 1280px) 100vw, 1280px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
            <h3 className="text-[17px] sm:text-[20px] font-bold drop-shadow leading-tight">{b.title}</h3>
            {b.subtitle && <p className="text-[13px] sm:text-[15px] font-medium drop-shadow mt-0.5">{b.subtitle}</p>}
            {b.ctaText && b.ctaRoute && (
              <Link
                href={b.ctaRoute}
                className="inline-block mt-2 bg-black/70 text-white text-[13px] font-bold px-3 py-1.5 rounded"
              >
                {b.ctaText}
              </Link>
            )}
          </div>
        </div>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`rounded-full transition-all duration-300 ${i === active ? 'w-5 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
