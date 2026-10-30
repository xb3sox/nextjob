import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

export interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  popular?: boolean;
  popularBadgeLabel?: string;
  className?: string;
}

export function PricingCard({
  name,
  price,
  period = '/forever',
  description,
  features,
  ctaLabel = 'Get started',
  ctaHref = '/signup',
  onCtaClick,
  popular = false,
  popularBadgeLabel = 'Most popular',
  className = '',
}: PricingCardProps) {
  const cardStyles = popular
    ? 'border-moss/35 bg-moss/[0.05] shadow-[0_0_50px_-15px_rgba(52,211,153,0.3)]'
    : 'mkt-card';

  return (
    <div
      className={`relative h-full flex flex-col p-8 rounded-xl border ${cardStyles} ${className}`.trim()}
    >
      {popular && (
        <span className="absolute top-6 ltr:right-6 rtl:left-6 mkt-badge">{popularBadgeLabel}</span>
      )}
      <h3 className="font-semibold text-lg text-paper mb-2">{name}</h3>
      {description && <p className="text-xs text-fog mb-4">{description}</p>}
      <div className="text-3xl font-semibold text-paper mb-6 tnum">
        {price}
        {period && <span className="text-base text-fog font-normal">{period}</span>}
      </div>

      <ul className="space-y-3 text-sm text-fog mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-moss shrink-0 mt-0.5" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={ctaHref}
        onClick={onCtaClick}
        className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          popular
            ? 'mkt-btn-primary'
            : 'border border-white/15 hover:border-white/30 text-paper hover:bg-white/5'
        }`}
      >
        {ctaLabel}
      </a>
    </div>
  );
}

export interface PricingTier extends PricingCardProps {
  id: string;
}

export interface PricingSectionProps {
  title?: string;
  subtitle?: string;
  tiers: PricingTier[];
  footerNote?: ReactNode;
  className?: string;
}

export function PricingSection({
  title = 'Simple, transparent pricing',
  subtitle = 'Choose the tier that fits your job search needs.',
  tiers,
  footerNote = 'Cancel anytime · Search Pass renews every 30 days unless cancelled',
  className = '',
}: PricingSectionProps) {
  return (
    <section className={`py-20 px-6 border-t border-white/5 ${className}`.trim()}>
      <div className="max-w-4xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-14">
            {title && <h2 className="font-display text-4xl text-paper mb-3">{title}</h2>}
            {subtitle && <p className="text-fog max-w-xl mx-auto">{subtitle}</p>}
          </div>
        )}

        <div className={`grid gap-6 ${tiers.length > 1 ? 'md:grid-cols-2' : 'max-w-md mx-auto'}`}>
          {tiers.map((tier) => (
            <PricingCard key={tier.id || tier.name} {...tier} />
          ))}
        </div>

        {footerNote && <p className="mt-8 text-center text-xs text-fog/70">{footerNote}</p>}
      </div>
    </section>
  );
}

export default PricingCard;
