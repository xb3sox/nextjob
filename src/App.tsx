import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ArrowRight, Check, Zap } from 'lucide-react';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';

function LandingPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('success');
      setEmail('');
      // TODO: Replace with actual API call
      console.log('Email submitted:', email);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      {/* Minimal Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">NextJob</span>
          </div>
          <a 
            href="#signup" 
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Get started →
          </a>
        </div>
      </nav>

      {/* Hero - Ultra Minimal */}
      <main id="main-content" className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Value Proposition - Complete Sentence */}
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
            Find better jobs. Apply smarter. Get interviewed.
          </h1>
          
          {/* Specific Subhead */}
          <p className="text-xl text-white/60 leading-relaxed mb-12 max-w-2xl">
            NextJob finds opportunities that genuinely fit, prepares truthful tailored applications, 
            and handles repetitive work while you stay in control. Every application eligible. 
            Every submission tracked. Every outcome learned from.
          </p>

          {/* Single CTA */}
          <form onSubmit={handleSubmit} id="signup" className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') {
                  setStatus('idle');
                  setErrorMessage('');
                }
              }}
              placeholder="you@company.com"
              disabled={status === 'loading' || status === 'success'}
              className={`flex-1 px-4 py-3 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none transition-colors ${
                status === 'error' 
                  ? 'border-red-500/50 focus:border-red-500/50' 
                  : 'border-white/10 focus:border-emerald-500/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Email address"
              aria-invalid={status === 'error'}
              aria-describedby={status === 'error' ? 'email-error' : undefined}
            />
            <button 
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Joining...
                </>
              ) : status === 'success' ? (
                <>
                  <Check className="w-4 h-4" />
                  Joined!
                </>
              ) : (
                <>
                  Start free
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <div id="email-error" role="alert" className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          {/* Success Message */}
          {status === 'success' && (
            <div role="status" className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400">
              ✓ Thanks! We'll be in touch soon.
            </div>
          )}

          {/* Product Preview - Show, Don't Tell */}
          <div className="relative rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <span className="text-xs text-white/40 ml-2">Senior Software Engineer at Stripe</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white/40 mb-1">Why you're a fit</div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    5+ years building distributed systems at scale. Led migration from monolith to microservices, 
                    reducing deployment time by 70%. Strong background in React, Node.js, and TypeScript.
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400/80">
                    <Check className="w-3 h-3" />
                    <span>Verified from your profile</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span>Eligibility: ✓ Verified</span>
                  <span>Excellent match</span>
                </div>
                <button 
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  aria-label="Submit application preview"
                  onClick={() => alert('This is a preview. Sign up to access the full application.')}
                >
                  Submit application →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Proof Section - Minimal */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm text-white/40 mb-12">
            Trusted by professionals from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
            {['Google', 'Stripe', 'Vercel', 'Linear', 'Figma'].map((company) => (
              <span key={company} className="text-lg font-medium text-white/60">
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
              <p className="text-sm text-white/60 leading-relaxed">
                Every claim traces to verified proof. No hallucinated experience.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Eligibility first</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                We check work authorization, location, and requirements before you apply.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Verified receipts</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Proof of what was submitted. Hash-verified and immutable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Minimal */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold mb-12 text-center">How it works</h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-sm text-white/40">
                1
              </div>
              <div>
                <h3 className="font-medium mb-1">Build your profile</h3>
                <p className="text-sm text-white/60">
                  We extract and verify your experience, skills, and achievements.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-sm text-white/40">
                2
              </div>
              <div>
                <h3 className="font-medium mb-1">Discover eligible jobs</h3>
                <p className="text-sm text-white/60">
                  We find opportunities where you actually qualify. No wasted time.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-sm text-white/40">
                3
              </div>
              <div>
                <h3 className="font-medium mb-1">Apply smarter</h3>
                <p className="text-sm text-white/60">
                  AI generates applications from your verified profile. Every claim backed by proof.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Simple */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold mb-12 text-center">Simple pricing</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-xl border border-white/10 bg-white/[0.02]">
              <h3 className="font-medium mb-2">Free</h3>
              <div className="text-3xl font-semibold mb-4">$0</div>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Build profile
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Discover jobs
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Understand fit
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Track applications
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Limited application assistance
                </li>
              </ul>
            </div>
            <div className="p-8 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <h3 className="font-medium mb-2">Search</h3>
              <div className="text-3xl font-semibold mb-4">$39<span className="text-lg text-white/40">/30 days</span></div>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Full matching
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Tailored applications
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Application assistance
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Application receipts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Interview preparation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Minimal */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold mb-12 text-center">Questions</h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-medium mb-2">How is this different from other AI tools?</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                We only generate content from your verified profile. No hallucinated claims. 
                We check eligibility before you apply. Every submission includes an application receipt.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Is my data safe?</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Yes. We use encryption at rest and in transit. We never sell your data. 
                You can export or delete everything at any time. GDPR compliant.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">What if I'm an international candidate?</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                We check work authorization, sponsorship requirements, and location restrictions 
                before showing you opportunities. No wasted applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Zap className="w-4 h-4" />
            <span>© 2026 NextJob</span>
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          </div>
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
