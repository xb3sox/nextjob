import { act, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePrefersReducedMotion, useScrollAnimation } from './use-scroll-animation';

describe('useScrollAnimation & usePrefersReducedMotion (T-73, FR-CRO-05)', () => {
  let intersectionCallbacks: ((entries: Partial<IntersectionObserverEntry>[]) => void)[] = [];

  beforeEach(() => {
    intersectionCallbacks = [];
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
        intersectionCallbacks.push(callback);
      }
    }
    window.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function TestWrapper({ options }: { options?: Parameters<typeof useScrollAnimation>[0] }) {
    const { ref, isVisible, hasTriggered, prefersReducedMotion } =
      useScrollAnimation<HTMLDivElement>(options);
    return (
      <div ref={ref} data-testid="target">
        {isVisible ? 'Visible' : 'Hidden'} - {hasTriggered ? 'Triggered' : 'NotTriggered'} -{' '}
        {prefersReducedMotion ? 'Reduced' : 'Normal'}
      </div>
    );
  }

  it('initializes with isVisible = false when not intersected', () => {
    const { getByTestId } = render(<TestWrapper />);
    const target = getByTestId('target');
    expect(target.textContent).toContain('Hidden - NotTriggered - Normal');
  });

  it('sets isVisible = true when IntersectionObserver detects intersection', () => {
    const { getByTestId } = render(<TestWrapper />);

    act(() => {
      for (const cb of intersectionCallbacks) {
        cb([{ isIntersecting: true }]);
      }
    });

    const target = getByTestId('target');
    expect(target.textContent).toContain('Visible - Triggered - Normal');
  });

  it('respects prefers-reduced-motion and immediately marks visible', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { getByTestId } = render(<TestWrapper />);
    const target = getByTestId('target');
    expect(target.textContent).toContain('Visible - Triggered - Reduced');
  });

  it('falls back to isVisible = true if IntersectionObserver is undefined', () => {
    // @ts-expect-error Mocking missing IntersectionObserver
    delete window.IntersectionObserver;

    const { getByTestId } = render(<TestWrapper />);
    const target = getByTestId('target');
    expect(target.textContent).toContain('Visible - Triggered - Normal');
  });

  it('usePrefersReducedMotion detects media query changes', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') changeHandler = handler;
      }),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(result.current).toBe(true);
  });
});
