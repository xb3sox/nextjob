import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Check, ChevronDown, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';
import WaitlistForm from './components/WaitlistForm';

function LandingPage() {
  return (
    <div className="min-h-screen bg-ink text-paper">
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to main content
      </a>

      {/* Minimal Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-ink/80 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label="NextJob home">
            <Zap className="w-5 h-5 text-moss" aria-hidden="true" />
            <span className="font-semibold text-sm">NextJob</span>
          </a>
          <div className="flex items-center gap-6">
            <a
              href="#how-it-works"
              className="hidden sm:block text-sm text-fog hover:text-paper transition-colors"
            >
              How it works
            </a>
            <a
              href="#signup"
              className="text-sm text-fog hover:text-paper transition-colors"
            >
              Get started →
            </a>
          </div>
        </div>
      </nav>

      {/* Hero - Ultra Minimal */}
      <main id="main-content" className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Value Proposition - Complete Sentence */}
          <h1 className="font-display text-6xl md:text-7xl leading-[1.05] mb-6">
            Find better jobs. Apply smarter. Get interviewed.
          </h1>
          
          {/* Specific Subhead */}
          <p className="text-xl text-fog leading-relaxed mb-12 max-w-2xl">
            NextJob finds opportunities that genuinely fit, prepares truthful tailored applications, 
            and handles repetitive work while you stay in control. Every application eligible. 
            Every submission tracked. Every outcome learned from.
          </p>

          {/* Single CTA — extracted, self-contained waitlist form */}
          <WaitlistForm />

          <p className="mb-10 text-xs text-fog/70">
            Free while in beta · No credit card · Your data stays yours
          </p>

          <a
            href="#how-it-works"
            className="inline-flex items-center gap-1.5 mb-14 text-xs text-fog hover:text-moss transition-colors"
          >
            See how it works
            <ChevronDown className="w-3.5 h-3.5 animate-bounce motion-reduce:animate-none" aria-hidden="true" />
          </a>

          {/* Product Preview - Show, Don't Tell */}
          <figure aria-label="Illustrative preview of a NextJob match card">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5" aria-hidden="true">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <span className="text-xs text-fog ml-2">Senior Software Engineer at Stripe</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-moss/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-moss" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-fog mb-1">Why you're a fit</div>
                    <p className="text-sm text-paper leading-relaxed">
                      5+ years building distributed systems at scale. Led migration from monolith to microservices, 
                      reducing deployment time by 70%. Strong background in React, Node.js, and TypeScript.
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
                    <span>Excellent match</span>
                  </div>
                  <a
                    href="#signup"
                    className="text-xs text-moss hover:text-paper transition-colors"
                  >
                    Submit application →
                  </a>
                </div>
              </div>
            </div>
            <figcaption className="mt-3 text-center text-xs text-fog/70">
              Illustrative preview — every real claim traces to your verified profile.
            </figcaption>
          </figure>
        </div>
      </main>

      {/* Proof Section - Honest positioning: target employers, not fabricated customer logos */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm text-fog mb-12">
            Built for people targeting teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
            {['Google', 'Stripe', 'Vercel', 'Linear', 'Figma'].map((company) => (
              <span key={company} className="text-lg font-medium text-fog">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Ultra Simple */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Evidence-backed</h3>
              <p className="text-sm text-fog leading-relaxed">
                Every claim traces to verified proof. No hallucinated experience.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Eligibility first</h3>
              <p className="text-sm text-fog leading-relaxed">
                We check work authorization, location, and requirements before you apply.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Verified receipts</h3>
              <p className="text-sm text-fog leading-relaxed">
                Proof of what was submitted. Hash-verified and immutable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Minimal */}
      <section id="how-it-works" className="py-20 px-6 border-t border-white/5 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl mb-12 text-center">How it works</h2>
          <ol className="space-y-8">
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-sm text-fog tnum">
                1
              </div>
              <div>
                <h3 className="font-medium mb-1">Build your profile</h3>
                <p className="text-sm text-fog">
                  We extract and verify your experience, skills, and achievements.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-sm text-fog tnum">
                2
              </div>
              <div>
                <h3 className="font-medium mb-1">Discover eligible jobs</h3>
                <p className="text-sm text-fog">
                  We find opportunities where you actually qualify. No wasted time.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-sm text-fog tnum">
                3
              </div>
              <div>
                <h3 className="font-medium mb-1">Apply smarter</h3>
                <p className="text-sm text-fog">
                  AI generates applications from your verified profile. Every claim backed by proof.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Pricing - Simple */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 id="pricing" className="font-display text-4xl mb-12 text-center scroll-mt-28">Simple pricing</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-xl border border-white/10 bg-white/[0.02]">
              <h3 className="font-medium mb-2">Free</h3>
              <div className="text-3xl font-semibold mb-4 tnum">$0</div>
              <ul className="space-y-2 text-sm text-fog">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
                  Build profile
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
                  Discover jobs
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
                  Understand fit
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
                  Track applications
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
                  Limited application assistance
                </li>
              </ul>
            </div>
            <div className="relative p-8 rounded-xl border border-moss/30 bg-moss/5">
              <span className="absolute top-6 right-6 rounded-full border border-moss/30 bg-moss/10 px-2.5 py-0.5 text-xs font-medium text-moss">
                Most popular
              </span>
              <h3 className="font-medium mb-2">Search</h3>
              <div className="text-3xl font-semibold mb-4 tnum">$39<span className="text-lg text-fog font-normal">/30 days</span></div>
              <ul className="space-y-2 text-sm text-fog">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
                  Everything in Free, plus:
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
                  Full matching
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
                  Tailored applications
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
                  Application receipts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
                  Interview preparation
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-fog/70">
            Cancel anytime · Search Pass renews every 30 days unless cancelled
          </p>
        </div>
      </section>

      {/* FAQ - Minimal */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 id="faq" className="font-display text-4xl mb-12 text-center scroll-mt-28">Questions</h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-medium mb-2">How is this different from other AI tools?</h3>
              <p className="text-sm text-fog leading-relaxed">
                We only generate content from your verified profile. No hallucinated claims. 
                We check eligibility before you apply. Every submission includes an application receipt.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Is my data safe?</h3>
              <p className="text-sm text-fog leading-relaxed">
                Yes. We use encryption at rest and in transit. We never sell your data. 
                You can export or delete everything at any time. GDPR compliant.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">What if I'm an international candidate?</h3>
              <p className="text-sm text-fog leading-relaxed">
                We check work authorization, sponsorship requirements, and location restrictions 
                before showing you opportunities. No wasted applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Close the loop for readers who scrolled past the form */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl mb-4">
            Your next role is already listed somewhere.
          </h2>
          <p className="text-fog mb-10">
            Join the waitlist and NextJob will find it, check you qualify, and have the application ready before you finish coffee.
          </p>
          <a
            href="#signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-moss-deep hover:bg-moss text-moss-dark font-medium rounded-lg transition-colors"
          >
            Start free
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-fog">
            <Zap className="w-4 h-4" aria-hidden="true" />
            <span>© 2026 NextJob</span>
          </div>
          <nav aria-label="Footer" className="flex gap-6 text-sm text-fog">
            <Link to="/privacy" className="hover:text-paper transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-paper transition-colors">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
