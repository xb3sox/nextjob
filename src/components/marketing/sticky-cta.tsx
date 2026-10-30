import { ArrowRight, Sparkles, X } from 'lucide-react';
import { type UseStickyCtaOptions, useStickyCta } from '../../hooks/use-sticky-cta';

export interface StickyCtaProps extends UseStickyCtaOptions {
  /**
   * Title or primary value proposition text.
   */
  title?: string;
  /**
   * Supporting tagline or metric callout.
   */
  subtitle?: string;
  /**
   * Primary call to action button text.
   */
  ctaText?: string;
  /**
   * Target URL for primary button.
   */
  ctaHref?: string;
  /**
   * Optional click handler for CTA button.
   */
  onCtaClick?: () => void;
  /**
   * Optional manual override to force visibility (useful in test/story environments).
   */
  forceVisible?: boolean;
}

/**
 * StickyCta Component (T-76, FR-CRO-09)
 * Persistent, dismissible bottom bar that appears after scrolling past hero section.
 */
export function StickyCta({
  threshold = 500,
  storageKey = 'nextjob_sticky_cta_dismissed',
  disabled = false,
  title = 'Land your dream engineering role',
  subtitle = 'Verified career claims · 3.2x callback lift',
  ctaText = 'Start Free',
  ctaHref = '/signup',
  onCtaClick,
  forceVisible = false,
}: StickyCtaProps) {
  const { isVisible, dismiss } = useStickyCta({
    threshold,
    storageKey,
    disabled: disabled && !forceVisible,
  });

  const shouldRender = forceVisible || isVisible;
  if (!shouldRender) return null;

  return (
    <aside
      aria-label="Quick registration bar"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-neutral-950/90 backdrop-blur-md px-4 py-3 sm:py-3.5 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Value Prop */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 truncate">
            <p className="text-xs sm:text-sm font-semibold text-white truncate">{title}</p>
            <p className="text-[11px] sm:text-xs text-neutral-400 truncate">{subtitle}</p>
          </div>
        </div>

        {/* CTA & Dismiss Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href={ctaHref}
            onClick={onCtaClick}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-neutral-950 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss sticky call to action"
            className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
