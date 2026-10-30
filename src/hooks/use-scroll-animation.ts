import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to detect user's prefers-reduced-motion media query setting.
 */
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

export interface UseScrollAnimationOptions {
  /**
   * Intersection observer threshold (0 to 1). Default is 0.15.
   */
  threshold?: number;
  /**
   * Intersection observer rootMargin. Default is '0px 0px -50px 0px'.
   */
  rootMargin?: string;
  /**
   * Whether animation should only trigger once. Default is true.
   */
  triggerOnce?: boolean;
  /**
   * Transition delay in milliseconds. Default is 0.
   */
  delay?: number;
  /**
   * Transition duration in milliseconds. Default is 500.
   */
  duration?: number;
}

export interface ScrollAnimationState<T extends HTMLElement = HTMLElement> {
  ref: React.RefObject<T>;
  isVisible: boolean;
  hasTriggered: boolean;
  prefersReducedMotion: boolean;
}

/**
 * Custom hook for triggering scroll-based reveal animations using Intersection Observer
 * while respecting prefers-reduced-motion preferences.
 */
export function useScrollAnimation<T extends HTMLElement = HTMLElement>(
  options: UseScrollAnimationOptions = {}
): ScrollAnimationState<T> {
  const { threshold = 0.15, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      setHasTriggered(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasTriggered(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, prefersReducedMotion]);

  return {
    ref,
    isVisible: isVisible || prefersReducedMotion,
    hasTriggered,
    prefersReducedMotion,
  };
}
