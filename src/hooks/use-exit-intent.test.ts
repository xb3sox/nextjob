import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useExitIntent } from './use-exit-intent';

describe('useExitIntent (T-72, FR-CRO-04)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    window.sessionStorage.clear();
  });

  it('triggers on mouseleave when clientY <= threshold and records in sessionStorage', () => {
    const onTrigger = vi.fn();
    const { result } = renderHook(() => useExitIntent({ threshold: 25, delay: 100, onTrigger }));

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.isTriggered).toBe(false);

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 15 }));
    });
    expect(result.current.isTriggered).toBe(true);
    expect(onTrigger).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem('nextjob_exit_intent_shown')).toBe('true');
  });

  it('does not trigger if cursor leaves outside top threshold or if already shown', () => {
    const onTrigger = vi.fn();
    const { result } = renderHook(() => useExitIntent({ threshold: 25, delay: 0, onTrigger }));

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 80 }));
    });
    expect(result.current.isTriggered).toBe(false);

    window.sessionStorage.setItem('nextjob_exit_intent_shown', 'true');
    const { result: r2 } = renderHook(() => useExitIntent({ delay: 0 }));
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 5 }));
    });
    expect(r2.current.isTriggered).toBe(false);
  });

  it('dismiss resets isTriggered; touch-only devices are ignored', () => {
    const { result } = renderHook(() => useExitIntent({ delay: 0 }));
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 5 }));
    });
    expect(result.current.isTriggered).toBe(true);

    act(() => result.current.dismiss());
    expect(result.current.isTriggered).toBe(false);

    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: q.includes('(pointer: coarse)'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const { result: touchResult } = renderHook(() => useExitIntent({ delay: 0 }));
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 5 }));
    });
    expect(touchResult.current.isTriggered).toBe(false);
  });
});
