import { ArrowRight, Zap } from 'lucide-react';
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { FaqBlock, FeaturesBlock, HeroBlock, PricingBlock } from './components/blocks';
import { CookieConsent } from './components/cookie-consent';
import { PageLoader } from './components/Loading';
import LocaleSwitcher from './components/LocaleSwitcher';
import ProtectedRoute from './components/ProtectedRoute';
import Reveal from './components/Reveal';
import WaitlistForm from './components/WaitlistForm';
import { useI18n } from './i18n';
import { analytics, getExperimentVariant, HERO_COPY_EXPERIMENT } from './lib/analytics';
import { RouteMeta } from './lib/seo';

// Lazy loaded page routes
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ApplicationsPage = lazy(() => import('./pages/applications/ApplicationsPage'));
const CohortReportPage = lazy(() => import('./pages/organizations/CohortReportPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PressKitPage = lazy(() => import('./pages/PressKitPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TailorPage = lazy(() => import('./pages/TailorPage'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const DataHandlingPage = lazy(() => import('./pages/DataHandlingPage'));
const AdminConsolePage = lazy(() => import('./pages/admin/AdminConsolePage'));

// Lazy loaded below-the-fold marketing components for Core Web Vitals optimization (T-57, FR-PERF-01)
const CustomerLogos = lazy(() =>
  import('./components/marketing/customer-logos').then((m) => ({ default: m.CustomerLogos }))
);
const IntegrationLogos = lazy(() =>
  import('./components/marketing/integration-logos').then((m) => ({ default: m.IntegrationLogos }))
);
const SampleOutputs = lazy(() =>
  import('./components/marketing/sample-outputs').then((m) => ({ default: m.SampleOutputs }))
);
const ProductDemo = lazy(() =>
  import('./components/marketing/product-demo').then((m) => ({ default: m.ProductDemo }))
);
const VideoPlayer = lazy(() =>
  import('./components/marketing/video-player').then((m) => ({ default: m.VideoPlayer }))
);
const BeforeAfterComparison = lazy(() =>
  import('./components/marketing/comparison').then((m) => ({ default: m.BeforeAfterComparison }))
);
const ComparisonTable = lazy(() =>
  import('./components/marketing/comparison-table').then((m) => ({ default: m.ComparisonTable }))
);
const SocialProofCarousel = lazy(() =>
  import('./components/marketing/social-proof-carousel').then((m) => ({
    default: m.SocialProofCarousel,
  }))
);
const PressSection = lazy(() =>
  import('./components/marketing/press-section').then((m) => ({ default: m.PressSection }))
);
const CommunityLinks = lazy(() =>
  import('./components/marketing/community-links').then((m) => ({ default: m.CommunityLinks }))
);
const B2BSection = lazy(() =>
  import('./components/marketing/b2b').then((m) => ({ default: m.B2BSection }))
);

/* ------------------------------------------------------------------ */
/* Layout Fallback for Lazy Sections (CLS < 0.1)                      */
/* ------------------------------------------------------------------ */

function SectionFallback({ minHeight = '200px' }: { minHeight?: string }) {
  return (
    <div
      style={{ minHeight }}
      className="cwv-contained-section flex items-center justify-center p-8"
      aria-busy="true"
    >
      <div className="w-full max-w-2xl h-24 cwv-skeleton" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Landing page                                                        */
/* ------------------------------------------------------------------ */

function LandingPage() {
  const { t } = useI18n();
  const heroVariant = getExperimentVariant(HERO_COPY_EXPERIMENT);

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
      <nav className="cwv-critical-nav fixed top-0 left-0 right-0 z-50 bg-ink/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            aria-label="NextJob home"
          >
            <span
              className="w-7 h-7 rounded-lg bg-moss-deep text-moss-dark flex items-center justify-center font-bold text-sm"
              aria-hidden="true"
            >
              N
            </span>
            <span className="font-semibold text-sm tracking-tight">{t('common.appName')}</span>
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="#how-it-works"
              className="hidden sm:block text-sm text-fog hover:text-paper transition-colors"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="hidden sm:block text-sm text-fog hover:text-paper transition-colors"
            >
              Pricing
            </a>
            <a
              href="#for-institutions"
              className="hidden md:block text-sm text-fog hover:text-paper transition-colors"
            >
              For Institutions
            </a>
            <Link
              to="/login"
              onClick={() => analytics.trackCtaClick('nav_signin', '/login')}
              className="hidden sm:block text-sm text-fog hover:text-paper transition-colors"
            >
              Sign in
            </Link>
            <LocaleSwitcher />
            <Link
              to="/signup"
              onClick={() => analytics.trackCtaClick('nav_get_started', '/signup')}
              className="text-sm font-medium px-3.5 py-2 rounded-lg bg-moss-deep hover:bg-moss text-moss-dark transition-colors cwv-fast-interaction"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Block (T-03f) */}
      <HeroBlock
        heroVariant={heroVariant}
        t={t}
        onCtaClick={(label, dest) => analytics.trackCtaClick(label, dest)}
      />

      {/* Customer / Employer Logos section (T-88, FR-TRUST-01) */}
      <div className="border-t border-white/5 cwv-offscreen-section">
        <Reveal>
          <Suspense fallback={<SectionFallback minHeight="120px" />}>
            <CustomerLogos />
          </Suspense>
        </Reveal>
      </div>

      {/* Supported ATS Integration Logos (T-92, FR-TRUST-05) */}
      <div className="border-t border-white/5 cwv-offscreen-section">
        <Reveal>
          <Suspense fallback={<SectionFallback minHeight="350px" />}>
            <IntegrationLogos />
          </Suspense>
        </Reveal>
      </div>

      {/* Sample Outputs Gallery section (T-91, FR-TRUST-04) */}
      <div className="border-t border-white/5 cwv-offscreen-section">
        <Reveal>
          <Suspense fallback={<SectionFallback minHeight="400px" />}>
            <SampleOutputs />
          </Suspense>
        </Reveal>
      </div>

      {/* Features Block (T-03f) */}
      <FeaturesBlock />

      {/* Interactive Product Demo (T-69, FR-CRO-01) */}
      <div className="border-t border-white/5 cwv-offscreen-section">
        <Reveal>
          <Suspense fallback={<SectionFallback minHeight="500px" />}>
            <ProductDemo />
          </Suspense>
        </Reveal>
      </div>

      {/* Product Video Walkthrough (T-81, FR-VIS-05) */}
      <section className="py-24 px-6 border-t border-white/5 cwv-offscreen-section">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-moss/10 text-moss border border-moss/20 mb-4">
                Product Walkthrough
              </span>
              <h2 className="font-display text-4xl mb-4">Watch NextJob in action</h2>
              <p className="text-fog max-w-xl mx-auto text-base">
                See how NextJob checks eligibility upfront, proves claims from your career history,
                and generates immutable submission receipts.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Suspense fallback={<SectionFallback minHeight="450px" />}>
              <VideoPlayer
                title="NextJob Product Walkthrough & Evidence Engine"
                src="/videos/nextjob-walkthrough.mp4"
                poster="/images/video-poster.jpg"
              />
            </Suspense>
          </Reveal>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-24 px-6 border-t border-white/5 scroll-mt-20 cwv-offscreen-section"
      >
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="font-display text-4xl mb-14 text-center">How it works</h2>
          </Reveal>
          <ol className="space-y-10">
            {[
              {
                n: 1,
                t: 'Build your profile',
                d: 'Import your resume; we extract and verify your experience, skills, and achievements with full provenance.',
              },
              {
                n: 2,
                t: 'Discover eligible jobs',
                d: 'We surface opportunities where you actually qualify — authorization, location, and requirements checked first.',
              },
              {
                n: 3,
                t: 'Apply smarter',
                d: 'AI drafts applications strictly from your verified profile. You approve, we submit, you get a receipt.',
              },
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

      {/* Before & After Process Comparison (T-70, FR-CRO-02) */}
      <div className="border-t border-white/5 cwv-offscreen-section">
        <Reveal>
          <Suspense fallback={<SectionFallback minHeight="400px" />}>
            <BeforeAfterComparison />
          </Suspense>
        </Reveal>
      </div>

      {/* Comparison Table (T-75, FR-CRO-10) */}
      <section className="py-24 px-6 border-t border-white/5 cwv-offscreen-section">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl mb-4">Why NextJob is different</h2>
              <p className="text-fog max-w-xl mx-auto text-base">
                Generic tools hallucinate claims and spray unverified applications. NextJob is built
                on proof, eligibility verification, and cryptographic submission receipts.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <Suspense fallback={<SectionFallback minHeight="400px" />}>
              <ComparisonTable />
            </Suspense>
          </Reveal>
        </div>
      </section>

      {/* Pricing Block (T-03f) */}
      <PricingBlock onCtaClick={(label, dest) => analytics.trackCtaClick(label, dest)} />

      {/* Social Proof Rotation (T-74, FR-CRO-07) */}
      <div className="border-t border-white/5 cwv-offscreen-section">
        <Reveal>
          <Suspense fallback={<SectionFallback minHeight="300px" />}>
            <SocialProofCarousel />
          </Suspense>
        </Reveal>
      </div>

      {/* NextJob for Institutions & Bootcamps (T-53, FR-MKT-08) */}
      <div className="border-t border-white/5 cwv-offscreen-section">
        <Reveal>
          <Suspense fallback={<SectionFallback minHeight="500px" />}>
            <B2BSection />
          </Suspense>
        </Reveal>
      </div>

      {/* FAQ Block (T-03f) */}
      <FaqBlock />

      {/* Press & Media Recognition (T-93, FR-TRUST-06) */}
      <div className="cwv-offscreen-section">
        <Reveal>
          <Suspense fallback={<SectionFallback minHeight="300px" />}>
            <PressSection />
          </Suspense>
        </Reveal>
      </div>

      {/* Community Links (T-103, FR-GROW-04) */}
      <div className="cwv-offscreen-section">
        <Reveal>
          <Suspense fallback={<SectionFallback minHeight="250px" />}>
            <CommunityLinks />
          </Suspense>
        </Reveal>
      </div>

      {/* Final CTA */}
      <section className="py-28 px-6 border-t border-white/5 relative overflow-hidden cwv-offscreen-section">
        <div
          aria-hidden="true"
          className="absolute bottom-[-40%] left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-moss/[0.06] blur-[120px]"
        />
        <Reveal>
          <div className="max-w-3xl mx-auto text-center relative">
            <h2 className="font-display text-5xl mb-4">
              Your next role is already listed somewhere.
            </h2>
            <p className="text-fog mb-10 max-w-xl mx-auto">
              Create a free account and NextJob will find it, check you qualify, and have the
              application ready before you finish coffee.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                onClick={() => analytics.trackCtaClick('bottom_signup', '/signup')}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-moss-deep hover:bg-moss text-moss-dark font-semibold rounded-lg transition-colors cwv-fast-interaction"
              >
                Start free
                <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
              <Link
                to="/login"
                onClick={() => analytics.trackCtaClick('bottom_signin', '/login')}
                className="px-7 py-3.5 text-sm text-fog hover:text-paper transition-colors"
              >
                Already have an account? Sign in
              </Link>
            </div>

            {/* Waitlist kept for pre-launch visitors */}
            <div id="waitlist" className="mt-16 scroll-mt-24 border-t border-white/5 pt-10">
              <p className="text-sm text-fog mb-4">
                Prefer early access without an account yet? Join the beta waitlist:
              </p>
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
            <Link
              to="/login"
              onClick={() => analytics.trackCtaClick('footer_signin', '/login')}
              className="hover:text-paper transition-colors"
            >
              Sign in
            </Link>
            <Link to="/press-kit" className="hover:text-paper transition-colors">
              Press Kit
            </Link>
            <Link to="/privacy" className="hover:text-paper transition-colors">
              Privacy
            </Link>
            <Link to="/data-handling" className="hover:text-paper transition-colors">
              Data Handling
            </Link>
            <a href="#for-institutions" className="hover:text-paper transition-colors">
              Institutions
            </a>
            <Link to="/terms" className="hover:text-paper transition-colors">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

function AnalyticsRouteTracker(): null {
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView(location.pathname);
    return () => {
      analytics.recordTimeOnPage(location.pathname);
    };
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteMeta />
      <AnalyticsRouteTracker />
      <Suspense fallback={<PageLoader />}>
        <CookieConsent />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/press-kit" element={<PressKitPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/data-handling" element={<DataHandlingPage />} />
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
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <ApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tailor"
            element={
              <ProtectedRoute>
                <TailorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizations/:id/reports"
            element={
              <ProtectedRoute>
                <CohortReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminConsolePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
