import { useCallback, useEffect, useState } from 'react';

export interface UseStickyCtaOptions {
  /**
   * Vertical scroll offset in pixels required before sticky CTA becomes visible.
   * Default is 500.
   */
  threshold?: number;
  /**
   * Session storage key for persisting dismiss state.
   * Default is 'nextjob_sticky_cta_dismissed'.
   */
  storageKey?: string;
  /**
   * Whether the sticky CTA is disabled.
   * Default is false.
   */
  disabled?: boolean;
}

export interface UseStickyCtaReturn {
  isVisible: boolean;
  isDismissed: boolean;
  dismiss: () => void;
  reset: () => void;
}

/**
 * useStickyCta (T-76, FR-CRO-09)
 * Detects scroll position past hero threshold and manages session-scoped dismiss state.
 */
export function useStickyCta(options: UseStickyCtaOptions = {}): UseStickyCtaReturn {
  const {
    threshold = 500,
    storageKey = 'nextjob_sticky_cta_dismissed',
    disabled = false,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage?.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    setIsVisible(false);
    try {
      window.sessionStorage?.setItem(storageKey, 'true');
    } catch {}
  }, [storageKey]);

  const reset = useCallback(() => {
    setIsDismissed(false);
    try {
      window.sessionStorage?.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (disabled || isDismissed || typeof window === 'undefined') {
      setIsVisible(false);
      return;
    }

    let ticking = false;
    const checkScroll = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(currentScroll > threshold);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(checkScroll);
      }
    };

    // Initial check in case page is loaded already scrolled
    checkScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, isDismissed, disabled]);

  return { isVisible: isVisible && !isDismissed, isDismissed, dismiss, reset };
}
