import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '../Reveal';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface PricingBlockProps {
  onCtaClick?: (label: string, destination: string) => void;
}

export function PricingBlock({ onCtaClick }: PricingBlockProps) {
  return (
    <section className="py-24 px-6 border-t border-white/5 cwv-offscreen-section">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <h2 id="pricing" className="font-display text-4xl mb-14 text-center scroll-mt-28">
            Simple pricing
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-6">
          <Reveal>
            <Card className="h-full border-white/10 bg-white/[0.02] text-paper">
              <CardContent className="p-8">
                <h3 className="font-medium mb-2">Free</h3>
                <div className="text-3xl font-semibold mb-6 tnum">
                  $0<span className="text-base text-fog font-normal">/forever</span>
                </div>
                <ul className="space-y-2.5 text-sm text-fog">
                  {[
                    'Build your verified profile',
                    'Discover eligible jobs',
                    'Understand fit & eligibility',
                    'Track all applications',
                    'Limited application assistance',
                  ].map((li) => (
                    <li key={li} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
                      {li}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="mt-8 w-full border-white/15 hover:border-white/30 font-medium text-sm cwv-fast-interaction"
                >
                  <Link to="/signup" onClick={() => onCtaClick?.('pricing_free', '/signup')}>
                    Create free account
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={120}>
            <Card className="relative h-full border-moss/35 bg-moss/[0.05] shadow-[0_0_60px_-20px_rgba(52,211,153,0.35)] text-paper">
              <CardContent className="p-8">
                <Badge
                  variant="outline"
                  className="absolute top-6 ltr:right-6 rtl:left-6 border-moss/30 bg-moss/10 px-2.5 py-0.5 text-xs font-medium text-moss"
                >
                  Most popular
                </Badge>
                <h3 className="font-medium mb-2">Search</h3>
                <div className="text-3xl font-semibold mb-6 tnum">
                  $39<span className="text-base text-fog font-normal">/30 days</span>
                </div>
                <ul className="space-y-2.5 text-sm text-fog">
                  {[
                    'Everything in Free, plus:',
                    'Full matching & ranking',
                    'Tailored evidence-backed applications',
                    'Submission receipts',
                    'Interview preparation',
                  ].map((li) => (
                    <li key={li} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
                      {li}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="mt-8 w-full bg-moss-deep hover:bg-moss text-moss-dark font-semibold text-sm cwv-fast-interaction"
                >
                  <Link to="/signup" onClick={() => onCtaClick?.('pricing_search_pass', '/signup')}>
                    Start Search Pass{' '}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </Reveal>
        </div>
        <p className="mt-6 text-center text-xs text-fog/70">
          Cancel anytime · Search Pass renews every 30 days unless cancelled
        </p>
      </div>
    </section>
  );
}
