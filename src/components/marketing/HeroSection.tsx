import type { ReactNode } from 'react';

export type HeroVariant = 'default' | 'direct' | 'minimal';

export interface HeroCta {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export interface HeroSectionProps {
  variant?: HeroVariant;
  badge?: string;
  headline?: ReactNode;
  subhead?: string;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  note?: string;
  preview?: ReactNode;
  className?: string;
}

export function HeroSection({
  variant = 'default',
  badge = 'Now in private beta',
  headline,
  subhead,
  primaryCta = { label: 'Start free', href: '/signup' },
  secondaryCta = { label: 'Join waitlist', href: '#waitlist' },
  note = 'Free while in beta · No credit card required',
  preview,
  className = '',
}: HeroSectionProps) {
  const defaultHeadlines: Record<HeroVariant, ReactNode> = {
    default: (
      <>
        Find better jobs. <em className="not-italic text-moss">Apply smarter.</em> Get interviewed.
      </>
    ),
    direct: (
      <>
        Land your dream role. <em className="not-italic text-moss">Zero fluff.</em> Verified proof.
      </>
    ),
    minimal: (
      <>
        Apply to jobs with <em className="not-italic text-moss">proof</em>, not promises.
      </>
    ),
  };

  const defaultSubheads: Record<HeroVariant, string> = {
    default:
      'NextJob surfaces opportunities that fit, prepares truthful applications, and handles tedious paperwork while you stay in control.',
    direct:
      'Every application eligible. Every submission backed by your verified profile. Every receipt immutable.',
    minimal: 'Verified experience, automatic eligibility checks, and evidence-backed applications.',
  };

  const renderHeadline = headline ?? defaultHeadlines[variant];
  const renderSubhead = subhead ?? defaultSubheads[variant];

  return (
    <section className={`relative pt-32 pb-20 px-6 overflow-hidden ${className}`.trim()}>
      {/* Background ambient lighting */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(233,237,234,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(233,237,234,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-moss/[0.07] blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto text-center">
        {badge && (
          <p className="mkt-badge mb-8">
            <span
              className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse motion-reduce:animate-none"
              aria-hidden="true"
            />
            {badge}
          </p>
        )}

        <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mb-6 tracking-tight text-paper">
          {renderHeadline}
        </h1>

        <p className="text-lg md:text-xl text-fog leading-relaxed mb-10 max-w-2xl mx-auto">
          {renderSubhead}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          {primaryCta && (
            <a
              href={primaryCta.href ?? '#'}
              onClick={primaryCta.onClick}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 mkt-btn-primary font-semibold rounded-lg transition-colors"
            >
              {primaryCta.label}
            </a>
          )}
          {secondaryCta && (
            <a
              href={secondaryCta.href ?? '#'}
              onClick={secondaryCta.onClick}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 mkt-btn-outline font-medium rounded-lg transition-colors"
            >
              {secondaryCta.label}
            </a>
          )}
        </div>

        {note && <p className="text-xs text-fog/70 mb-12">{note}</p>}

        {preview && <div className="mt-8">{preview}</div>}
      </div>
    </section>
  );
}

export default HeroSection;
