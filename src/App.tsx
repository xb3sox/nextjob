import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ArrowRight, Check, Zap } from 'lucide-react';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';

function LandingPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
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
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Value Proposition - Complete Sentence */}
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
            Apply to jobs with proof, not promises.
          </h1>
          
          {/* Specific Subhead */}
          <p className="text-xl text-white/60 leading-relaxed mb-12 max-w-2xl">
            NextJob builds a verified career graph from your experience and generates 
            applications that hiring managers actually read. Every claim backed by evidence. 
            Every application eligible. Every submission tracked.
          </p>

          {/* Single CTA */}
          <div id="signup" className="flex flex-col sm:flex-row gap-3 mb-20">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
              aria-label="Email address"
            />
            <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
              Start free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

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
                    <span>Verified from your career graph</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span>Eligibility: ✓ Verified</span>
                  <span>Match: 94%</span>
                </div>
                <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
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
                <h3 className="font-medium mb-1">Import your CV</h3>
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
                <h3 className="font-medium mb-1">Apply with proof</h3>
                <p className="text-sm text-white/60">
                  AI generates applications from your verified evidence. Every claim backed by proof.
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
                  Career graph (limited)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  5 applications/month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Eligibility checks
                </li>
              </ul>
            </div>
            <div className="p-8 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <h3 className="font-medium mb-2">Pro</h3>
              <div className="text-3xl font-semibold mb-4">$39<span className="text-lg text-white/40">/mo</span></div>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Unlimited applications
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Full matching & tailoring
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Verified receipts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Priority support
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
                We only generate content from your verified experience. No hallucinated claims. 
                We check eligibility before you apply. Every submission includes a verified receipt.
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
            <span>© 2024 NextJob</span>
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
