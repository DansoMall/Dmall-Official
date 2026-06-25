'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Stagger-reveal a list of elements when they enter viewport
export function useStaggerReveal<T extends HTMLElement>(options?: {
  y?: number;
  stagger?: number;
  delay?: number;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = Array.from(el.children) as HTMLElement[];
    gsap.fromTo(
      children,
      { opacity: 0, y: options?.y ?? 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: options?.stagger ?? 0.08,
        delay: options?.delay ?? 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );

    return () => { ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, [options?.y, options?.stagger, options?.delay]);

  return ref;
}

// Single element fade-slide reveal
export function useReveal<T extends HTMLElement>(options?: {
  y?: number;
  x?: number;
  delay?: number;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: options?.y ?? 30, x: options?.x ?? 0 },
      {
        opacity: 1,
        y: 0,
        x: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: options?.delay ?? 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, [options?.y, options?.x, options?.delay]);

  return ref;
}
