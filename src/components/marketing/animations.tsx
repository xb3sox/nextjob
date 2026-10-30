import type React from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/* Reduced Motion Helper                                              */
/* ------------------------------------------------------------------ */

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  return prefersReduced;
}

/* ------------------------------------------------------------------ */
/* ScrollReveal Component                                             */
/* ------------------------------------------------------------------ */

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'fade';

export interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  delay?: number;
  threshold?: number;
  className?: string;
  as?: React.ElementType;
}

export function ScrollReveal({
  children,
  direction = 'up',
  distance = 20,
  duration = 600,
  delay = 0,
  threshold = 0.1,
  className = '',
  as: Component = 'div',
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, prefersReduced]);

  const getInitialTransform = () => {
    if (prefersReduced) return 'none';
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      default:
        return 'none';
    }
  };

  return (
    <Component
      ref={ref}
      className={`scroll-gpu scroll-reveal-base ${isVisible ? 'scroll-reveal-visible' : ''} ${className}`}
      style={{
        opacity: isVisible || prefersReduced ? 1 : 0,
        transform: isVisible || prefersReduced ? 'none' : getInitialTransform(),
        transitionDuration: prefersReduced ? '0ms' : `${duration}ms`,
        transitionDelay: prefersReduced ? '0ms' : `${delay}ms`,
      }}
    >
      {children}
    </Component>
  );
}

/* ------------------------------------------------------------------ */
/* Stagger Group & Item                                               */
/* ------------------------------------------------------------------ */

interface StaggerContextValue {
  staggerMs: number;
  baseDelay: number;
}

const StaggerContext = createContext<StaggerContextValue>({
  staggerMs: 80,
  baseDelay: 0,
});

export interface StaggerGroupProps {
  children: React.ReactNode;
  staggerMs?: number;
  baseDelay?: number;
  className?: string;
  as?: React.ElementType;
}

export function StaggerGroup({
  children,
  staggerMs = 80,
  baseDelay = 0,
  className = '',
  as: Component = 'div',
}: StaggerGroupProps) {
  return (
    <StaggerContext.Provider value={{ staggerMs, baseDelay }}>
      <Component className={className}>{children}</Component>
    </StaggerContext.Provider>
  );
}

export interface StaggerItemProps {
  children: React.ReactNode;
  index: number;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  className?: string;
}

export function StaggerItem({
  children,
  index,
  direction = 'up',
  distance = 20,
  duration = 500,
  className = '',
}: StaggerItemProps) {
  const { staggerMs, baseDelay } = useContext(StaggerContext);
  const computedDelay = baseDelay + index * staggerMs;

  return (
    <ScrollReveal
      direction={direction}
      distance={distance}
      duration={duration}
      delay={computedDelay}
      className={className}
    >
      {children}
    </ScrollReveal>
  );
}

/* ------------------------------------------------------------------ */
/* Parallax Component                                                 */
/* ------------------------------------------------------------------ */

export interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.08, className = '' }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced || typeof window === 'undefined') return;

    let rafId: number;

    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Only calculate when element is near or within viewport
      if (rect.top <= viewportHeight && rect.bottom >= 0) {
        const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
        const translation = Math.round(-centerOffset * speed);
        setOffsetY(translation);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, [speed, prefersReduced]);

  return (
    <div
      ref={ref}
      className={`scroll-parallax ${className}`}
      style={{
        transform: prefersReduced ? 'none' : `translate3d(0, ${offsetY}px, 0)`,
      }}
    >
      {children}
    </div>
  );
}
