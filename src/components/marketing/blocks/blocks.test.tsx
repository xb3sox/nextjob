import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShieldCheck } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import {
  CtaBlock,
  FaqBlock,
  FeatureBlock,
  HeroBlock,
  PricingBlock,
  TestimonialBlock,
} from './index';

describe('HeroBlock', () => {
  it('renders default HeroBlock with heading and CTAs', () => {
    render(<HeroBlock />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/find better jobs/i);
    expect(screen.getByRole('link', { name: /start free/i })).toHaveAttribute('href', '/signup');
    expect(screen.getByText('Now in private beta')).toBeInTheDocument();
  });

  it('renders minimal and split variants', () => {
    const { rerender } = render(<HeroBlock variant="minimal" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/proof/i);

    rerender(
      <HeroBlock variant="split" preview={<div data-testid="split-preview">Preview Content</div>} />
    );
    expect(screen.getByTestId('split-preview')).toBeInTheDocument();
  });

  it('supports custom click handlers on primary and secondary CTAs', async () => {
    const onPrimaryClick = vi.fn();
    const onSecondaryClick = vi.fn();
    const user = userEvent.setup();

    render(
      <HeroBlock
        primaryCta={{ label: 'Primary Action', onClick: onPrimaryClick }}
        secondaryCta={{ label: 'Secondary Action', onClick: onSecondaryClick }}
      />
    );

    await user.click(screen.getByRole('link', { name: /primary action/i }));
    expect(onPrimaryClick).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('link', { name: /secondary action/i }));
    expect(onSecondaryClick).toHaveBeenCalledTimes(1);
  });
});

describe('FeatureBlock', () => {
  it('renders feature cards grid with title, icons, and badges', () => {
    const features = [
      {
        icon: <ShieldCheck data-testid="shield-icon" />,
        title: 'Evidence Provenance',
        description: 'Traceable claims only.',
        badge: 'Grounded',
      },
      {
        title: 'Eligibility Engine',
        description: 'Screening rules check.',
      },
    ];

    render(<FeatureBlock title="Platform Capabilities" features={features} columns={2} />);

    expect(screen.getByRole('heading', { name: /platform capabilities/i })).toBeInTheDocument();
    expect(screen.getByText('Evidence Provenance')).toBeInTheDocument();
    expect(screen.getByText('Traceable claims only.')).toBeInTheDocument();
    expect(screen.getByText('Grounded')).toBeInTheDocument();
    expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
  });
});

describe('TestimonialBlock', () => {
  it('renders testimonials with author info and verified claims', () => {
    const testimonials = [
      {
        quote: 'NextJob revolutionized my application process.',
        author: 'Sarah Chen',
        role: 'Staff Engineer',
        company: 'Apex Labs',
        verifiedClaim: '10+ YOE Rust',
      },
    ];

    render(<TestimonialBlock testimonials={testimonials} />);

    expect(
      screen.getByText(/"nextjob revolutionized my application process."/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Apex Labs')).toBeInTheDocument();
    expect(screen.getByText(/verified: 10\+ yoe rust/i)).toBeInTheDocument();
  });
});

describe('PricingBlock', () => {
  it('renders multi-tier plans with popular badge and feature list', () => {
    const plans = [
      {
        id: 'free',
        name: 'Free Tier',
        price: '$0',
        description: 'Basic access',
        features: ['3 tailored apps'],
        ctaLabel: 'Start Free',
      },
      {
        id: 'pro',
        name: 'Search Pass',
        price: '$39',
        period: '/30 days',
        description: 'Full pass',
        features: ['Unlimited apps'],
        ctaLabel: 'Get Pass',
        isPopular: true,
      },
    ];

    render(<PricingBlock title="Choose Your Plan" plans={plans} />);

    expect(screen.getByRole('heading', { name: /choose your plan/i })).toBeInTheDocument();
    expect(screen.getByText('Free Tier')).toBeInTheDocument();
    expect(screen.getByText('Search Pass')).toBeInTheDocument();
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
    expect(screen.getAllByText('✓')).toHaveLength(2);
  });
});

describe('FaqBlock', () => {
  it('renders interactive FAQ accordion and toggles answers', async () => {
    const items = [
      {
        question: 'How does evidence provenance work?',
        answer: 'It connects every resume claim to primary evidence.',
      },
      {
        question: 'Is my data private?',
        answer: 'Yes, multi-tenant row level security is enforced.',
      },
    ];

    const user = userEvent.setup();
    render(<FaqBlock items={items} />);

    expect(screen.getByText('How does evidence provenance work?')).toBeInTheDocument();
    expect(
      screen.getByText('It connects every resume claim to primary evidence.')
    ).toBeInTheDocument();

    // Second item starts closed
    expect(
      screen.queryByText('Yes, multi-tenant row level security is enforced.')
    ).not.toBeInTheDocument();

    // Click second item
    await user.click(screen.getByRole('button', { name: /is my data private\?/i }));
    expect(
      screen.getByText('Yes, multi-tenant row level security is enforced.')
    ).toBeInTheDocument();
  });
});

describe('CtaBlock', () => {
  it('renders CTA banner block with primary and secondary buttons', () => {
    render(
      <CtaBlock
        title="Ready for verified applications?"
        subtitle="Start applying with confidence today."
        primaryAction={{ label: 'Create Free Account', href: '/signup' }}
        secondaryAction={{ label: 'View Documentation', href: '/docs' }}
      />
    );

    expect(
      screen.getByRole('heading', { name: /ready for verified applications\?/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create free account/i })).toHaveAttribute(
      'href',
      '/signup'
    );
    expect(screen.getByRole('link', { name: /view documentation/i })).toHaveAttribute(
      'href',
      '/docs'
    );
  });
});
