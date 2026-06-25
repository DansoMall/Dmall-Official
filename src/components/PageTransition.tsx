'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: 'power2.out',
        // Clear transform after animation so fixed children use the viewport,
        // not this div, as their containing block.
        onComplete: () => gsap.set(el, { clearProps: 'transform' }),
      }
    );
  }, [pathname]);

  return (
    <div ref={ref} className="min-h-screen">
      {children}
    </div>
  );
}
