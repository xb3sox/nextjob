import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StickyCta } from './sticky-cta';

describe('StickyCta Component (T-76, FR-CRO-09)', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it('does not render when not scrolled and forceVisible is false', () => {
    render(<StickyCta forceVisible={false} />);
    expect(screen.queryByRole('complementary', { name: /Quick registration bar/i })).toBeNull();
  });

  it('renders with clear value prop, CTA button, and accessible landmark when forceVisible is true', () => {
    render(
      <StickyCta
        forceVisible={true}
        title="Custom Engineering Role Title"
        subtitle="100% Provenance Guarantee"
        ctaText="Get Started Now"
        ctaHref="/custom-signup"
      />
    );

    const banner = screen.getByRole('complementary', { name: /Quick registration bar/i });
    expect(banner).toBeInTheDocument();
    expect(screen.getByText('Custom Engineering Role Title')).toBeInTheDocument();
    expect(screen.getByText('100% Provenance Guarantee')).toBeInTheDocument();

    const ctaLink = screen.getByRole('link', { name: /Get Started Now/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/custom-signup');
  });

  it('dismisses banner on close button click and sets sessionStorage', () => {
    const { rerender } = render(<StickyCta forceVisible={true} />);

    const dismissBtn = screen.getByRole('button', { name: /Dismiss sticky call to action/i });
    fireEvent.click(dismissBtn);

    rerender(<StickyCta forceVisible={false} />);
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(window.sessionStorage.getItem('nextjob_sticky_cta_dismissed')).toBe('true');
  });

  it('calls onCtaClick when primary button is clicked', () => {
    const onCtaClick = vi.fn();
    render(<StickyCta forceVisible={true} onCtaClick={onCtaClick} />);

    const ctaLink = screen.getByRole('link', { name: /Start Free/i });
    fireEvent.click(ctaLink);
    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });
});
