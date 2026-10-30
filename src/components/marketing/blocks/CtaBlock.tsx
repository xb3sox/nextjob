export interface CtaBlockAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface CtaBlockProps {
  title?: string;
  subtitle?: string;
  primaryAction?: CtaBlockAction;
  secondaryAction?: CtaBlockAction;
  note?: string;
  badge?: string;
  className?: string;
}

export function CtaBlock({
  title = 'Ready to stop blasting hallucinated resumes?',
  subtitle = 'Join candidates landing real interviews with verified, evidence-grounded applications.',
  primaryAction = { label: 'Start free — create account', href: '/signup' },
  secondaryAction = { label: 'Explore documentation', href: '/docs' },
  note = 'No credit card required · Free while in beta · Instant profile setup',
  badge = 'Take control of your career',
  className = '',
}: CtaBlockProps) {
  return (
    <section className={`py-20 px-6 border-t border-white/5 ${className}`.trim()}>
      <div className="max-w-4xl mx-auto mkt-card bg-gradient-to-b from-moss/10 to-charcoal/80 border border-moss/30 p-10 md:p-14 text-center rounded-2xl relative overflow-hidden">
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-moss/15 blur-3xl -z-10"
        />

        {badge && (
          <div className="mb-6 inline-flex">
            <span className="mkt-badge bg-moss/20 text-moss border-moss/30 px-3 py-1 text-xs font-semibold">
              {badge}
            </span>
          </div>
        )}

        <h2 className="font-display text-3xl md:text-5xl text-paper mb-4 max-w-2xl mx-auto leading-tight">
          {title}
        </h2>

        <p className="text-fog text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          {primaryAction && (
            <a
              href={primaryAction.href ?? '#'}
              onClick={primaryAction.onClick}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 mkt-btn-primary font-semibold text-base rounded-lg transition-colors"
            >
              {primaryAction.label}
            </a>
          )}

          {secondaryAction && (
            <a
              href={secondaryAction.href ?? '#'}
              onClick={secondaryAction.onClick}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 mkt-btn-outline font-medium text-base rounded-lg transition-colors"
            >
              {secondaryAction.label}
            </a>
          )}
        </div>

        {note && <p className="text-xs text-fog/70">{note}</p>}
      </div>
    </section>
  );
}

export default CtaBlock;
