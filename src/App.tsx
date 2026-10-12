import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Check, ChevronDown, ArrowRight, ShieldCheck, Zap, FileSearch, Lock } from 'lucide-react';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';
import WaitlistForm from './components/WaitlistForm';
import Reveal from './components/Reveal';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

/* ------------------------------------------------------------------ */
/* Landing page                                                        */
/* ------------------------------------------------------------------ */

function LandingPage() {
  return (
    <div className="min-h-screen bg-ink text-paper antialiased">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-ink/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label="NextJob home">
            <span className="w-7 h-7 rounded-lg bg-moss-deep text-moss-dark flex items-center justify-center font-bold text-sm" aria-hidden="true">N</span>
            <span className="font-semibold text-sm tracking-tight">NextJob</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hidden sm:block text-sm text-fog hover:text-paper transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hidden sm:block text-sm text-fog hover:text-paper transition-colors">
              Pricing
            </a>
            <Link to="/login" className="hidden sm:block text-sm text-fog hover:text-paper transition-colors">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium px-3.5 py-2 rounded-lg bg-moss-deep hover:bg-moss text-moss-dark transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main id="main-content" className="relative pt-36 pb-24 px-6 overflow-hidden">
        {/* Ambient background: one soft moss glow + faint grid, very low contrast */}
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(233,237,234,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(233,237,234,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-moss/[0.07] blur-[120px]" />
        </div>

        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="inline-flex items-center gap-2 mb-8 px-3 py-1 rounded-full border border-moss/25 bg-moss/5 text-xs font-medium text-moss">
              <span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse motion-reduce:animate-none" aria-hidden="true" />
              Now in private beta
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="font-display text-6xl md:text-7xl leading-[1.04] mb-6">
              Find better jobs.{' '}
              <em className="not-italic text-moss">Apply smarter.</em> Get interviewed.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-xl text-fog leading-relaxed mb-10 max-w-2xl">
              NextJob finds opportunities that genuinely fit, prepares truthful tailored applications,
              and handles repetitive work while you stay in control. Every application eligible.
              Every submission tracked. Every outcome learned from.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-moss-deep hover:bg-moss text-moss-dark font-semibold rounded-lg transition-colors shadow-[0_0_40px_-12px_rgba(52,211,153,0.5)]"
              >
                Start free — create your account
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a
                href="#waitlist"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-white/15 hover:border-white/30 text-paper font-medium rounded-lg transition-colors"
              >
                Join the waitlist instead
              </a>
            </div>
            <p className="mb-14 text-xs text-fog/70">
              Free while in beta · No credit card · Your data stays yours
            </p>
          </Reveal>

          {/* Product preview */}
          <Reveal delay={300}>
            <figure aria-label="Illustrative preview of a NextJob match card">
              <div className="rounded-xl border border-white/10 bg-panel/80 shadow-2xl shadow-black/40 overflow-hidden">
                <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                  </div>
                  <span className="text-xs text-fog ml-2">Senior Software Engineer at Stripe</span>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-moss/10 border border-moss/25 px-2 py-0.5 text-[11px] font-medium text-moss tnum">
                    94% match
                  </span>
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
                      <span className="hidden sm:inline-flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-moss" aria-hidden="true" />
                        Receipt on submit
                      </span>
                    </div>
                    <Link to="/signup" className="text-xs font-medium text-moss hover:text-paper transition-colors">
                      Start an application →
                    </Link>
                  </div>
                </div>
              </div>
              <figcaption className="mt-3 text-center text-xs text-fog/70">
                Illustrative preview — every real claim traces to your verified profile.
              </figcaption>
            </figure>
          </Reveal>

          <div className="mt-14 text-center">
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 text-xs text-fog hover:text-moss transition-colors"
            >
              See how it works
              <ChevronDown className="w-3.5 h-3.5 animate-bounce motion-reduce:animate-none" aria-hidden="true" />
            </a>
          </div>
        </div>
      </main>

      {/* Trust line — honest positioning: target employers, not fabricated logos */}
      <section className="py-16 px-6 border-t border-white/5">
        <Reveal>
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm text-fog mb-8">Built for people targeting teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
              {['Google', 'Stripe', 'Vercel', 'Linear', 'Figma'].map((company) => (
                <span key={company} className="text-lg font-medium text-fog">{company}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="font-display text-4xl mb-4 text-center">Honest automation, end to end</h2>
            <p className="text-fog text-center mb-16 max-w-xl mx-auto">
              Most AI job tools hallucinate. NextJob is built so that can't happen.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <FileSearch className="w-5 h-5" aria-hidden="true" />,
                title: 'Evidence-backed',
                body: 'Every claim traces to verified proof from your profile. No invented experience, ever.',
              },
              {
                icon: <ShieldCheck className="w-5 h-5" aria-hidden="true" />,
                title: 'Eligibility first',
                body: 'We check work authorization, location, and hard requirements before you spend an application.',
              },
              {
                icon: <Lock className="w-5 h-5" aria-hidden="true" />,
                title: 'Verified receipts',
                body: 'Proof of exactly what was submitted. Hash-verified, immutable, exportable.',
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className="h-full rounded-xl border border-white/10 bg-white/[0.02] hover:border-moss/25 hover:bg-moss/[0.03] p-6 transition-colors">
                  <span className="inline-flex w-10 h-10 rounded-lg bg-moss/10 text-moss items-center justify-center mb-4">{f.icon}</span>
                  <h3 className="font-medium mb-2">{f.title}</h3>
                  <p className="text-sm text-fog leading-relaxed">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="font-display text-4xl mb-14 text-center">How it works</h2>
          </Reveal>
          <ol className="space-y-10">
            {[
              { n: 1, t: 'Build your profile', d: 'Import your resume; we extract and verify your experience, skills, and achievements with full provenance.' },
              { n: 2, t: 'Discover eligible jobs', d: 'We surface opportunities where you actually qualify — authorization, location, and requirements checked first.' },
              { n: 3, t: 'Apply smarter', d: 'AI drafts applications strictly from your verified profile. You approve, we submit, you get a receipt.' },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 100}>
                <li className="flex gap-5">
                  <div className="w-9 h-9 rounded-full bg-moss/10 border border-moss/25 flex items-center justify-center shrink-0 text-sm text-moss tnum font-medium">
                    {step.n}
                  </div>
                  <div>
                    <h3 className="font-medium mb-1 text-lg">{step.t}</h3>
                    <p className="text-sm text-fog leading-relaxed">{step.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 id="pricing" className="font-display text-4xl mb-14 text-center scroll-mt-28">Simple pricing</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal>
              <div className="h-full p-8 rounded-xl border border-white/10 bg-white/[0.02]">
                <h3 className="font-medium mb-2">Free</h3>
                <div className="text-3xl font-semibold mb-6 tnum">$0<span className="text-base text-fog font-normal">/forever</span></div>
                <ul className="space-y-2.5 text-sm text-fog">
                  {['Build your verified profile', 'Discover eligible jobs', 'Understand fit & eligibility', 'Track all applications', 'Limited application assistance'].map((li) => (
                    <li key={li} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />{li}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className="mt-8 inline-flex w-full items-center justify-center px-4 py-2.5 rounded-lg border border-white/15 hover:border-white/30 font-medium text-sm transition-colors">
                  Create free account
                </Link>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="relative h-full p-8 rounded-xl border border-moss/35 bg-moss/[0.05] shadow-[0_0_60px_-20px_rgba(52,211,153,0.35)]">
                <span className="absolute top-6 right-6 rounded-full border border-moss/30 bg-moss/10 px-2.5 py-0.5 text-xs font-medium text-moss">
                  Most popular
                </span>
                <h3 className="font-medium mb-2">Search</h3>
                <div className="text-3xl font-semibold mb-6 tnum">$39<span className="text-base text-fog font-normal">/30 days</span></div>
                <ul className="space-y-2.5 text-sm text-fog">
                  {['Everything in Free, plus:', 'Full matching & ranking', 'Tailored evidence-backed applications', 'Submission receipts', 'Interview preparation'].map((li) => (
                    <li key={li} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />{li}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className="mt-8 inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-moss-deep hover:bg-moss text-moss-dark font-semibold text-sm transition-colors">
                  Start Search Pass <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          </div>
          <p className="mt-6 text-center text-xs text-fog/70">
            Cancel anytime · Search Pass renews every 30 days unless cancelled
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 id="faq" className="font-display text-4xl mb-12 text-center scroll-mt-28">Questions</h2>
          </Reveal>
          <div className="space-y-4">
            {[
              { q: 'How is this different from other AI tools?', a: 'We only generate content from your verified profile — no hallucinated claims. We check eligibility before you apply, and every submission includes an immutable receipt.' },
              { q: 'Is my data safe?', a: 'Yes. Encryption at rest and in transit, never sold, exportable or deletable at any time. GDPR compliant.' },
              { q: "What if I'm an international candidate?", a: 'We check work authorization, sponsorship requirements, and location restrictions before showing you opportunities — no wasted applications.' },
            ].map((item, i) => (
              <Reveal key={item.q} delay={i * 80}>
                <details className="group rounded-xl border border-white/10 bg-white/[0.02] open:bg-white/[0.03] transition-colors">
                  <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-4 font-medium [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown className="w-4 h-4 text-fog group-open:rotate-180 transition-transform shrink-0 ml-4" aria-hidden="true" />
                  </summary>
                  <p className="px-6 pb-5 text-sm text-fog leading-relaxed">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 border-t border-white/5 relative overflow-hidden">
        <div aria-hidden="true" className="absolute bottom-[-40%] left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-moss/[0.06] blur-[120px]" />
        <Reveal>
          <div className="max-w-3xl mx-auto text-center relative">
            <h2 className="font-display text-5xl mb-4">Your next role is already listed somewhere.</h2>
            <p className="text-fog mb-10 max-w-xl mx-auto">
              Create a free account and NextJob will find it, check you qualify, and have the
              application ready before you finish coffee.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-moss-deep hover:bg-moss text-moss-dark font-semibold rounded-lg transition-colors"
              >
                Start free
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link to="/login" className="px-7 py-3.5 text-sm text-fog hover:text-paper transition-colors">
                Already have an account? Sign in
              </Link>
            </div>

            {/* Waitlist kept for pre-launch visitors */}
            <div id="waitlist" className="mt-16 scroll-mt-24 border-t border-white/5 pt-10">
              <p className="text-sm text-fog mb-4">Prefer early access without an account yet? Join the beta waitlist:</p>
              <WaitlistForm />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-fog">
            <Zap className="w-4 h-4 text-moss" aria-hidden="true" />
            <span>© 2026 NextJob</span>
          </div>
          <nav aria-label="Footer" className="flex gap-6 text-sm text-fog">
            <Link to="/login" className="hover:text-paper transition-colors">Sign in</Link>
            <Link to="/privacy" className="hover:text-paper transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-paper transition-colors">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
