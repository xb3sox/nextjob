import { ArrowRight, Check, Lock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '../Reveal';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface HeroBlockProps {
  heroVariant?: string;
  t?: (key: string) => string;
  onCtaClick?: (label: string, destination: string) => void;
}

export function HeroBlock({ heroVariant, t, onCtaClick }: HeroBlockProps) {
  const betaText = t ? t('landing.betaBadge') : 'Now in private beta';
  const badgeText =
    !betaText || betaText === 'landing.betaBadge' ? 'Now in private beta' : betaText;

  return (
    <main id="main-content" className="cwv-critical-hero relative pt-36 pb-24 px-6 overflow-hidden">
      {/* Ambient background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(233,237,234,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(233,237,234,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-moss/[0.07] blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto">
        <Reveal>
          <Badge
            variant="outline"
            className="mb-8 px-3 py-1 border-moss/25 bg-moss/5 text-xs font-medium text-moss rounded-full gap-2"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse motion-reduce:animate-none"
              aria-hidden="true"
            />
            {badgeText}
          </Badge>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="font-display text-6xl md:text-7xl leading-[1.04] mb-6">
            {heroVariant === 'variant_direct' ? (
              <>
                Land your dream role. <em className="not-italic text-moss">Zero fluff.</em> Verified
                proof.
              </>
            ) : (
              <>
                Find better jobs. <em className="not-italic text-moss">Apply smarter.</em> Get
                interviewed.
              </>
            )}
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="text-xl text-fog leading-relaxed mb-10 max-w-2xl">
            NextJob finds opportunities that genuinely fit, prepares truthful tailored applications,
            and handles repetitive work while you stay in control. Every application eligible. Every
            submission tracked. Every outcome learned from.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Button
              asChild
              className="px-6 py-3.5 h-auto bg-moss-deep hover:bg-moss text-moss-dark font-semibold shadow-[0_0_40px_-12px_rgba(52,211,153,0.5)] cwv-fast-interaction"
            >
              <Link to="/signup" onClick={() => onCtaClick?.('hero_signup', '/signup')}>
                Start free — create your account
                <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="px-6 py-3.5 h-auto border-white/15 hover:border-white/30 text-paper font-medium cwv-fast-interaction"
            >
              <a href="#waitlist">Join the waitlist instead</a>
            </Button>
          </div>
          <p className="mb-14 text-xs text-fog/70">
            Free while in beta · No credit card · Your data stays yours
          </p>
        </Reveal>

        {/* Product preview */}
        <Reveal delay={300}>
          <figure aria-label="Illustrative preview of a NextJob match card">
            <Card className="rounded-xl border-white/10 bg-panel/80 shadow-2xl shadow-black/40 overflow-hidden text-paper">
              <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5" aria-hidden="true">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <span className="text-xs text-fog ltr:ml-2 rtl:mr-2">
                  Senior Software Engineer at Stripe
                </span>
                <Badge
                  variant="outline"
                  className="ltr:ml-auto rtl:mr-auto bg-moss/10 border-moss/25 text-[11px] font-medium text-moss tnum"
                >
                  94% match
                </Badge>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-moss/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-moss" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-fog mb-1">Why you're a fit</div>
                    <p className="text-sm text-paper leading-relaxed">
                      5+ years building distributed systems at scale. Led migration from monolith to
                      microservices, reducing deployment time by 70%. Strong background in React,
                      Node.js, and TypeScript.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-moss/90">
                      <Check className="w-3 h-3" aria-hidden="true" />
                      <span>Verified from your profile</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-fog">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-moss" aria-hidden="true" />
                      Eligibility verified
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-moss" aria-hidden="true" />
                      Receipt on submit
                    </span>
                  </div>
                  <Link
                    to="/signup"
                    className="text-xs font-medium text-moss hover:text-paper transition-colors"
                  >
                    Start an application →
                  </Link>
                </div>
              </div>
            </Card>
            <figcaption className="mt-3 text-center text-xs text-fog/70">
              Illustrative preview — every real claim traces to your verified profile.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </main>
  );
}
