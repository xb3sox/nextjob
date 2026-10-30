import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStickyCta } from './use-sticky-cta';

describe('useStickyCta (T-76, FR-CRO-09)', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    window.requestAnimationFrame = vi.fn().mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it('initializes with isVisible = false when scroll position <= threshold', () => {
    const { result } = renderHook(() => useStickyCta({ threshold: 400 }));
    expect(result.current.isVisible).toBe(false);
    expect(result.current.isDismissed).toBe(false);
  });

  it('updates isVisible = true when scrolling past threshold', () => {
    const { result } = renderHook(() => useStickyCta({ threshold: 400 }));

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 450, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isVisible).toBe(true);

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 200, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('persists dismiss state to sessionStorage and stops displaying', () => {
    const { result } = renderHook(() => useStickyCta({ threshold: 400 }));

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.isVisible).toBe(true);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.isVisible).toBe(false);
    expect(result.current.isDismissed).toBe(true);
    expect(window.sessionStorage.getItem('nextjob_sticky_cta_dismissed')).toBe('true');

    // Does not reappear even if scroll position changes
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 600, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.isVisible).toBe(false);
  });
});
