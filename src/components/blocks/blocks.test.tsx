import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { FaqBlock, FeaturesBlock, HeroBlock, PricingBlock } from './index';

describe('shadcn blocks (T-03f)', () => {
  describe('HeroBlock', () => {
    it('renders default hero section headline and CTAs', () => {
      render(
        <BrowserRouter>
          <HeroBlock t={(k) => k} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Find better jobs\./i)).toBeInTheDocument();
      expect(screen.getByText(/Start free — create your account/i)).toBeInTheDocument();
      expect(screen.getByText(/Join the waitlist instead/i)).toBeInTheDocument();
      expect(screen.getByText(/Senior Software Engineer at Stripe/i)).toBeInTheDocument();
    });

    it('renders direct hero variant when passed', () => {
      render(
        <BrowserRouter>
          <HeroBlock heroVariant="variant_direct" t={(k) => k} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Land your dream role\./i)).toBeInTheDocument();
    });
  });

  describe('FeaturesBlock', () => {
    it('renders feature section heading and cards', () => {
      render(<FeaturesBlock />);

      expect(screen.getByText(/Honest automation, end to end/i)).toBeInTheDocument();
      expect(screen.getByText(/Evidence-backed/i)).toBeInTheDocument();
      expect(screen.getByText(/Eligibility first/i)).toBeInTheDocument();
      expect(screen.getByText(/Verified receipts/i)).toBeInTheDocument();
    });
  });

  describe('PricingBlock', () => {
    it('renders pricing tiers and CTA buttons', () => {
      const handleCta = vi.fn();
      render(
        <BrowserRouter>
          <PricingBlock onCtaClick={handleCta} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Simple pricing/i)).toBeInTheDocument();
      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText(/Create free account/i)).toBeInTheDocument();
      expect(screen.getByText(/Start Search Pass/i)).toBeInTheDocument();
    });
  });

  describe('FaqBlock', () => {
    it('renders FAQ heading and questions', () => {
      render(<FaqBlock />);

      expect(screen.getByText(/Questions/i)).toBeInTheDocument();
      expect(screen.getByText(/How is this different from other AI tools\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Is my data safe\?/i)).toBeInTheDocument();
      expect(screen.getByText(/What if I'm an international candidate\?/i)).toBeInTheDocument();
    });
  });
});
