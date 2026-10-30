import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArrowRight, Zap } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import {
  CtaButton,
  EmployerTrustLogos,
  FeatureCard,
  FeatureSection,
  HeroSection,
  PricingCard,
  PricingSection,
  TestimonialCard,
  TestimonialSection,
  TrustBadge,
  TrustBadges,
} from './index';

describe('CtaButton', () => {
  it('renders a button with primary variant by default', () => {
    render(<CtaButton>Click Me</CtaButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('mkt-btn-primary');
  });

  it('renders an anchor tag when href is provided', () => {
    render(<CtaButton href="/signup">Sign Up</CtaButton>);
    const link = screen.getByRole('link', { name: /sign up/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/signup');
  });

  it('supports button click handler', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<CtaButton onClick={handleClick}>Submit</CtaButton>);

    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders icon on left or right', () => {
    render(
      <CtaButton icon={<ArrowRight data-testid="arrow" />} iconPosition="right">
        Next
      </CtaButton>
    );
    expect(screen.getByTestId('arrow')).toBeInTheDocument();
  });

  it('applies variant and size classes correctly', () => {
    render(
      <CtaButton variant="outline" size="lg">
        Outline Large
      </CtaButton>
    );
    const button = screen.getByRole('button', { name: /outline large/i });
    expect(button.className).toContain('mkt-btn-outline');
    expect(button.className).toContain('px-6');
  });
});

describe('TrustBadges & EmployerTrustLogos', () => {
  it('renders individual TrustBadge correctly', () => {
    render(<TrustBadge title="SOC 2 Type II" subtitle="Certified" />);
    expect(screen.getByText('SOC 2 Type II')).toBeInTheDocument();
    expect(screen.getByText('(Certified)')).toBeInTheDocument();
  });

  it('renders default TrustBadges grid', () => {
    render(<TrustBadges />);
    expect(screen.getByText('SOC 2 Compliant')).toBeInTheDocument();
    expect(screen.getByText('GDPR Compliant')).toBeInTheDocument();
    expect(screen.getByText('Zero Hallucinations')).toBeInTheDocument();
  });

  it('renders EmployerTrustLogos with company list', () => {
    render(<EmployerTrustLogos companies={['Stripe', 'Vercel']} />);
    expect(screen.getByText(/built for candidates targeting teams at/i)).toBeInTheDocument();
    expect(screen.getByText('Stripe')).toBeInTheDocument();
    expect(screen.getByText('Vercel')).toBeInTheDocument();
  });
});

describe('HeroSection', () => {
  it('renders default hero section variant with headline and CTAs', () => {
    render(<HeroSection />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/find better jobs/i);
    expect(screen.getByRole('link', { name: /start free/i })).toHaveAttribute('href', '/signup');
    expect(screen.getByText('Now in private beta')).toBeInTheDocument();
  });

  it('renders direct hero section variant', () => {
    render(<HeroSection variant="direct" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/land your dream role/i);
  });

  it('renders custom headline and preview', () => {
    render(
      <HeroSection
        headline="Custom Marketing Headline"
        subhead="Custom subhead text"
        preview={<div data-testid="custom-preview">Preview Box</div>}
      />
    );
    expect(screen.getByText('Custom Marketing Headline')).toBeInTheDocument();
    expect(screen.getByText('Custom subhead text')).toBeInTheDocument();
    expect(screen.getByTestId('custom-preview')).toBeInTheDocument();
  });
});

describe('FeatureSection & FeatureCard', () => {
  it('renders FeatureCard with title and description', () => {
    render(
      <FeatureCard
        icon={<Zap data-testid="feature-icon" />}
        title="Fast Submission"
        description="Submits applications in seconds."
        badge="New"
      />
    );
    expect(screen.getByText('Fast Submission')).toBeInTheDocument();
    expect(screen.getByText('Submits applications in seconds.')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByTestId('feature-icon')).toBeInTheDocument();
  });

  it('renders FeatureSection with grid of feature items', () => {
    const features = [
      { title: 'Feature 1', description: 'Desc 1' },
      { title: 'Feature 2', description: 'Desc 2' },
    ];
    render(
      <FeatureSection title="Our Features" subtitle="Why choose NextJob" features={features} />
    );

    expect(screen.getByRole('heading', { name: /our features/i })).toBeInTheDocument();
    expect(screen.getByText('Why choose NextJob')).toBeInTheDocument();
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
  });
});

describe('PricingCard & PricingSection', () => {
  it('renders PricingCard with tier features and popular badge', () => {
    render(
      <PricingCard
        name="Search Pass"
        price="$39"
        period="/30 days"
        description="Full access pass"
        features={['Tailored applications', 'Submission receipts']}
        popular={true}
        ctaLabel="Get Search Pass"
      />
    );

    expect(screen.getByText('Search Pass')).toBeInTheDocument();
    expect(screen.getByText('$39')).toBeInTheDocument();
    expect(screen.getByText('/30 days')).toBeInTheDocument();
    expect(screen.getByText('Most popular')).toBeInTheDocument();
    expect(screen.getByText('Tailored applications')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /get search pass/i })).toBeInTheDocument();
  });

  it('renders PricingSection with multiple tiers', () => {
    const tiers = [
      { id: 'free', name: 'Free Tier', price: '$0', features: ['Basic features'] },
      { id: 'pro', name: 'Pro Tier', price: '$29', features: ['Pro features'], popular: true },
    ];
    render(<PricingSection title="Pricing Tiers" tiers={tiers} />);

    expect(screen.getByRole('heading', { name: /pricing tiers/i })).toBeInTheDocument();
    expect(screen.getByText('Free Tier')).toBeInTheDocument();
    expect(screen.getByText('Pro Tier')).toBeInTheDocument();
  });
});

describe('TestimonialCard & TestimonialSection', () => {
  it('renders TestimonialCard with author initials and quote', () => {
    render(
      <TestimonialCard
        quote="NextJob doubled my callback rate."
        author="Sarah Connor"
        authorRole="Software Lead"
        company="Cyberdyne"
      />
    );

    expect(screen.getByText(/"nextjob doubled my callback rate."/i)).toBeInTheDocument();
    expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    expect(screen.getByText('Software Lead at Cyberdyne')).toBeInTheDocument();
    expect(screen.getByText('SC')).toBeInTheDocument();
  });

  it('renders TestimonialSection with testimonial list', () => {
    const testimonials = [
      { quote: 'Quote 1', author: 'Author 1', authorRole: 'Dev' },
      { quote: 'Quote 2', author: 'Author 2', authorRole: 'Designer' },
    ];

    render(<TestimonialSection title="Customer Reviews" testimonials={testimonials} />);

    expect(screen.getByRole('heading', { name: /customer reviews/i })).toBeInTheDocument();
    expect(screen.getByText('Author 1')).toBeInTheDocument();
    expect(screen.getByText('Author 2')).toBeInTheDocument();
  });
});
