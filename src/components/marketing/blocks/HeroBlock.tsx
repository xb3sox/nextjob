import type { ReactNode } from 'react';

export type HeroBlockVariant = 'default' | 'direct' | 'minimal' | 'split';

export interface HeroBlockCta {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export interface HeroBlockProps {
  variant?: HeroBlockVariant;
  badge?: string;
  headline?: ReactNode;
  subhead?: string;
  primaryCta?: HeroBlockCta;
  secondaryCta?: HeroBlockCta;
  note?: string;
  preview?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

export function HeroBlock({
  variant = 'default',
  badge = 'Now in private beta',
  headline,
  subhead,
  primaryCta = { label: 'Start free', href: '/signup' },
  secondaryCta = { label: 'Join waitlist', href: '#waitlist' },
  note = 'Free while in beta · No credit card required',
  preview,
  align = 'center',
  className = '',
}: HeroBlockProps) {
  const defaultHeadlines: Record<HeroBlockVariant, ReactNode> = {
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
    split: (
      <>
        Verified career automation <em className="not-italic text-moss">grounded in facts.</em>
      </>
    ),
  };

  const defaultSubheads: Record<HeroBlockVariant, string> = {
    default:
      'NextJob surfaces opportunities that fit, prepares truthful applications, and handles tedious paperwork while you stay in control.',
    direct:
      'Every application eligible. Every submission backed by your verified profile. Every receipt immutable.',
    minimal: 'Verified experience, automatic eligibility checks, and evidence-backed applications.',
    split:
      'Submit 100% evidence-constrained resume variants and cover letters backed by cryptographic receipts.',
  };

  const renderHeadline = headline ?? defaultHeadlines[variant];
  const renderSubhead = subhead ?? defaultSubheads[variant];

  const isLeft = align === 'left' || variant === 'split';

  return (
    <section className={`relative pt-32 pb-20 px-6 overflow-hidden ${className}`.trim()}>
      {/* Background ambient lighting */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(233,237,234,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(233,237,234,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-moss/[0.07] blur-[120px]" />
      </div>

      <div
        className={`max-w-5xl mx-auto ${isLeft ? 'grid md:grid-cols-2 gap-12 items-center' : 'text-center'}`}
      >
        <div className={isLeft ? 'text-left' : 'max-w-3xl mx-auto text-center'}>
          {badge && (
            <p className="mkt-badge mb-8 inline-flex items-center gap-2">
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

          <p className="text-lg md:text-xl text-fog leading-relaxed mb-10">{renderSubhead}</p>

          <div
            className={`flex flex-col sm:flex-row items-center gap-3 mb-4 ${isLeft ? 'justify-start' : 'justify-center'}`}
          >
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

          {note && <p className="text-xs text-fog/70 mb-8">{note}</p>}
        </div>

        {preview && <div className={isLeft ? 'w-full' : 'mt-8 max-w-4xl mx-auto'}>{preview}</div>}
      </div>
    </section>
  );
}

export default HeroBlock;
