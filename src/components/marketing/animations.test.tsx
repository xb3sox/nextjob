import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Parallax,
  ScrollReveal,
  StaggerGroup,
  StaggerItem,
  usePrefersReducedMotion,
} from './animations';

describe('Scroll Animations (T-78, FR-VIS-02)', () => {
  let intersectionCallbacks: ((entries: Partial<IntersectionObserverEntry>[]) => void)[] = [];

  beforeEach(() => {
    intersectionCallbacks = [];
    // Mock IntersectionObserver
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

    // Mock matchMedia defaulting to no reduced motion
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

  it('renders ScrollReveal and reveals content on intersection', () => {
    render(
      <ScrollReveal direction="up" distance={25} delay={100}>
        <div>Animated Content</div>
      </ScrollReveal>
    );

    const content = screen.getByText('Animated Content');
    expect(content).toBeInTheDocument();
    const container = content.parentElement;
    expect(container).toHaveClass('scroll-reveal-base');

    // Trigger intersection observer callback
    act(() => {
      for (const cb of intersectionCallbacks) {
        cb([{ isIntersecting: true }]);
      }
    });

    expect(container).toHaveClass('scroll-reveal-visible');
    expect(container?.style.opacity).toBe('1');
    expect(container?.style.transform).toBe('none');
  });

  it('respects different reveal directions', () => {
    const { container: leftContainer } = render(
      <ScrollReveal direction="left" distance={30}>
        <div>Left Entry</div>
      </ScrollReveal>
    );
    const leftEl = leftContainer.firstElementChild as HTMLElement;
    expect(leftEl.style.transform).toBe('translate3d(30px, 0, 0)');

    const { container: downContainer } = render(
      <ScrollReveal direction="down" distance={20}>
        <div>Down Entry</div>
      </ScrollReveal>
    );
    const downEl = downContainer.firstElementChild as HTMLElement;
    expect(downEl.style.transform).toBe('translate3d(0, -20px, 0)');
  });

  it('respects prefers-reduced-motion in ScrollReveal', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <ScrollReveal direction="up" distance={40}>
        <div>Static Content</div>
      </ScrollReveal>
    );

    const content = screen.getByText('Static Content').parentElement as HTMLElement;
    expect(content.style.opacity).toBe('1');
    expect(content.style.transform).toBe('none');
    expect(content.style.transitionDuration).toBe('0ms');
  });

  it('calculates staggered delays in StaggerGroup and StaggerItem', () => {
    render(
      <StaggerGroup staggerMs={100} baseDelay={50}>
        <StaggerItem index={0}>
          <div>Item 0</div>
        </StaggerItem>
        <StaggerItem index={1}>
          <div>Item 1</div>
        </StaggerItem>
        <StaggerItem index={2}>
          <div>Item 2</div>
        </StaggerItem>
      </StaggerGroup>
    );

    const item0 = screen.getByText('Item 0').parentElement as HTMLElement;
    const item1 = screen.getByText('Item 1').parentElement as HTMLElement;
    const item2 = screen.getByText('Item 2').parentElement as HTMLElement;

    expect(item0.style.transitionDelay).toBe('50ms');
    expect(item1.style.transitionDelay).toBe('150ms');
    expect(item2.style.transitionDelay).toBe('250ms');
  });

  it('renders Parallax and responds to scroll events', () => {
    const { container } = render(
      <Parallax speed={0.1}>
        <div>Parallax Layer</div>
      </Parallax>
    );

    const parallaxEl = container.firstElementChild as HTMLElement;
    expect(parallaxEl).toHaveClass('scroll-parallax');

    // Simulate scroll event
    fireEvent.scroll(window);
    expect(parallaxEl).toBeInTheDocument();
  });

  it('disables Parallax transformation when prefers-reduced-motion is active', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { container } = render(
      <Parallax speed={0.2}>
        <div>Accessible Static Layer</div>
      </Parallax>
    );

    const parallaxEl = container.firstElementChild as HTMLElement;
    expect(parallaxEl.style.transform).toBe('none');
  });

  it('usePrefersReducedMotion hook detects media query updates', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') changeHandler = handler;
      }),
      removeEventListener: vi.fn(),
    }));

    function TestComponent() {
      const reduced = usePrefersReducedMotion();
      return <div>{reduced ? 'Reduced Motion Active' : 'Normal Motion'}</div>;
    }

    render(<TestComponent />);
    expect(screen.getByText('Normal Motion')).toBeInTheDocument();

    // Trigger media query change event
    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(screen.getByText('Reduced Motion Active')).toBeInTheDocument();
  });
});
