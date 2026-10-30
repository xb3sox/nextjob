import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnimatedSection } from './animated-section';

describe('AnimatedSection (T-73, FR-CRO-05)', () => {
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

  it('renders section with default slide-up animation and reveals on scroll', () => {
    render(
      <AnimatedSection data-testid="test-section">
        <h2>Section Heading</h2>
      </AnimatedSection>
    );

    const section = screen.getByTestId('test-section');
    expect(section.tagName).toBe('SECTION');
    expect(section).toHaveClass('scroll-reveal-base');
    expect(section.style.opacity).toBe('0');
    expect(section.style.transform).toBe('translate3d(0, 24px, 0)');

    // Trigger IntersectionObserver callback
    act(() => {
      for (const cb of intersectionCallbacks) {
        cb([{ isIntersecting: true }]);
      }
    });

    expect(section).toHaveClass('scroll-reveal-visible');
    expect(section.style.opacity).toBe('1');
    expect(section.style.transform).toBe('none');
  });

  it('supports custom HTML tag via as prop', () => {
    render(
      <AnimatedSection as="div" data-testid="test-div">
        <p>Div Content</p>
      </AnimatedSection>
    );

    const div = screen.getByTestId('test-div');
    expect(div.tagName).toBe('DIV');
  });

  it('handles slide-down, slide-left, slide-right, and scale-up variants', () => {
    const { rerender } = render(
      <AnimatedSection animation="slide-down" distance={30} data-testid="variant-section">
        <p>Content</p>
      </AnimatedSection>
    );
    let section = screen.getByTestId('variant-section');
    expect(section.style.transform).toBe('translate3d(0, -30px, 0)');

    rerender(
      <AnimatedSection animation="slide-left" distance={40} data-testid="variant-section">
        <p>Content</p>
      </AnimatedSection>
    );
    section = screen.getByTestId('variant-section');
    expect(section.style.transform).toBe('translate3d(40px, 0, 0)');

    rerender(
      <AnimatedSection animation="slide-right" distance={50} data-testid="variant-section">
        <p>Content</p>
      </AnimatedSection>
    );
    section = screen.getByTestId('variant-section');
    expect(section.style.transform).toBe('translate3d(-50px, 0, 0)');

    rerender(
      <AnimatedSection animation="scale-up" data-testid="variant-section">
        <p>Content</p>
      </AnimatedSection>
    );
    section = screen.getByTestId('variant-section');
    expect(section.style.transform).toBe('scale3d(0.95, 0.95, 1)');
  });

  it('bypasses animations when prefers-reduced-motion is active', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <AnimatedSection animation="slide-up" distance={50} data-testid="reduced-section">
        <p>Accessible Section</p>
      </AnimatedSection>
    );

    const section = screen.getByTestId('reduced-section');
    expect(section.style.opacity).toBe('1');
    expect(section.style.transform).toBe('none');
    expect(section.style.transitionDuration).toBe('0ms');
  });

  it('applies delay and duration style attributes', () => {
    render(
      <AnimatedSection delay={200} duration={800} data-testid="delayed-section">
        <p>Delayed Content</p>
      </AnimatedSection>
    );

    const section = screen.getByTestId('delayed-section');
    expect(section.style.transitionDelay).toBe('200ms');
    expect(section.style.transitionDuration).toBe('800ms');
  });
});
