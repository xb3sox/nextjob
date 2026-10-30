export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  isPopular?: boolean;
}

export interface PricingBlockProps {
  title?: string;
  subtitle?: string;
  plans: PricingPlan[];
  note?: string;
  className?: string;
}

export function PricingBlock({
  title = 'Simple, Transparent Pricing',
  subtitle = 'No hidden fees, no credit traps, no automated spam.',
  plans,
  note = 'All plans include multi-tenant data isolation and complete privacy controls.',
  className = '',
}: PricingBlockProps) {
  return (
    <section className={`py-20 px-6 border-t border-white/5 ${className}`.trim()}>
      <div className="max-w-5xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-14">
            {title && <h2 className="font-display text-4xl text-paper mb-3">{title}</h2>}
            {subtitle && <p className="text-fog max-w-xl mx-auto">{subtitle}</p>}
          </div>
        )}

        <div
          className={`grid gap-8 ${plans.length === 2 ? 'md:grid-cols-2 max-w-3xl' : 'md:grid-cols-3 max-w-5xl'} mx-auto items-stretch`}
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`mkt-card flex flex-col justify-between relative ${
                plan.isPopular
                  ? 'border-moss/50 bg-moss/[0.04] shadow-[0_0_30px_rgba(74,222,128,0.1)]'
                  : 'bg-charcoal/40'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="mkt-badge bg-moss text-charcoal font-semibold border-none px-3 py-0.5">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-2xl text-paper">{plan.name}</h3>
                  {plan.badge && !plan.isPopular && <span className="mkt-badge">{plan.badge}</span>}
                </div>

                <p className="text-sm text-fog mb-6">{plan.description}</p>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-paper">{plan.price}</span>
                  {plan.period && <span className="text-sm text-fog">{plan.period}</span>}
                </div>

                <ul className="space-y-3 mb-8 text-sm text-paper/90">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span className="text-moss mt-0.5 font-bold" aria-hidden="true">
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <a
                  href={plan.ctaHref ?? '#'}
                  onClick={plan.onCtaClick}
                  className={`w-full inline-flex items-center justify-center px-4 py-3 font-semibold rounded-lg transition-colors ${
                    plan.isPopular ? 'mkt-btn-primary' : 'mkt-btn-outline'
                  }`}
                >
                  {plan.ctaLabel}
                </a>
              </div>
            </div>
          ))}
        </div>

        {note && <p className="text-center text-xs text-fog/70 mt-10">{note}</p>}
      </div>
    </section>
  );
}

export default PricingBlock;
