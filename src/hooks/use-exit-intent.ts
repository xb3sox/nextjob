import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseExitIntentOptions {
  threshold?: number;
  storageKey?: string;
  delay?: number;
  disabled?: boolean;
  onTrigger?: () => void;
}

export interface UseExitIntentReturn {
  isTriggered: boolean;
  dismiss: () => void;
  reset: () => void;
}

/**
 * useExitIntent (T-72, FR-CRO-04)
 * Detects cursor leaving viewport top on desktop; restricted to once per session.
 */
export function useExitIntent(options: UseExitIntentOptions = {}): UseExitIntentReturn {
  const {
    threshold = 20,
    storageKey = 'nextjob_exit_intent_shown',
    delay = 1000,
    disabled = false,
    onTrigger,
  } = options;

  const [isTriggered, setIsTriggered] = useState(false);
  const isReadyRef = useRef(false);
  const onTriggerRef = useRef(onTrigger);

  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  const dismiss = useCallback(() => {
    setIsTriggered(false);
    try {
      window.sessionStorage?.setItem(storageKey, 'true');
    } catch {}
  }, [storageKey]);

  const reset = useCallback(() => {
    setIsTriggered(false);
    try {
      window.sessionStorage?.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return;

    try {
      if (window.sessionStorage?.getItem(storageKey) === 'true') return;
    } catch {}

    const isTouchOnly =
      window.matchMedia?.('(pointer: coarse)').matches &&
      !window.matchMedia?.('(pointer: fine)').matches;
    if (isTouchOnly) return;

    let timer: NodeJS.Timeout | undefined;
    if (delay <= 0) {
      isReadyRef.current = true;
    } else {
      timer = setTimeout(() => {
        isReadyRef.current = true;
      }, delay);
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (!isReadyRef.current) return;
      if (e.clientY <= threshold) {
        setIsTriggered(true);
        try {
          window.sessionStorage?.setItem(storageKey, 'true');
        } catch {}
        onTriggerRef.current?.();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [disabled, threshold, storageKey, delay]);

  return { isTriggered, dismiss, reset };
}
