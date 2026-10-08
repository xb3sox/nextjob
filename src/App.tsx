import { useState, useEffect, useRef, Component, ReactNode } from 'react';
import {
  Zap, CheckCircle2, AlertTriangle, Code2, FileText, Database,
  Lock, Globe, TrendingUp, Eye, ArrowRight, Menu, X, Brain,
  Scale, Clock, ShieldCheck, Sparkles, Star, Play, Linkedin,
  Twitter, Github, ChevronDown, Building2, DollarSign, Check
} from 'lucide-react';

// Error Boundary Component (React Official Pattern)
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to analytics service in production
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert" className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-8">
          <div className="text-center max-w-md">
            <AlertTriangle size={48} className="mx-auto mb-4 text-amber-400" aria-hidden="true" />
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-6">We're sorry, but something unexpected happened. Please try refreshing the page.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white hover:bg-emerald-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Cookie Consent Banner Component (GDPR Compliant)
function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after 2 seconds to not interrupt initial load
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
    // Initialize analytics here if needed
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="mx-auto max-w-4xl rounded-xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">We value your privacy</h3>
            <p className="text-sm text-slate-400">
              We use cookies to enhance your browsing experience and analyze site traffic. By clicking "Accept", you consent to our use of cookies.{' '}
              <a href="#privacy" className="text-emerald-400 hover:text-emerald-300 underline" aria-label="Learn more about our cookie policy">
                Learn more
              </a>
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              type="button"
              onClick={handleReject}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              aria-label="Reject cookies"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
              aria-label="Accept cookies"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const exitIntentRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          setShowStickyCTA(window.scrollY > 600);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitIntent) setShowExitIntent(true);
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [showExitIntent]);

  useEffect(() => {
    if (mobileMenuOpen && menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      );
      const first = focusableElements[0] as HTMLElement;
      const last = focusableElements[focusableElements.length - 1] as HTMLElement;
      first?.focus();
      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
          // Return focus to menu button
          setTimeout(() => mobileMenuButtonRef.current?.focus(), 0);
        }
      };
      menuRef.current.addEventListener('keydown', handleTab);
      return () => menuRef.current?.removeEventListener('keydown', handleTab);
    }
  }, [mobileMenuOpen]);

  // Persist dark mode to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Focus trap for exit intent popup (WCAG 2.1.2)
  useEffect(() => {
    if (showExitIntent && exitIntentRef.current) {
      const focusableElements = exitIntentRef.current.querySelectorAll(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      );
      const first = focusableElements[0] as HTMLElement;
      const last = focusableElements[focusableElements.length - 1] as HTMLElement;
      first?.focus();
      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
        if (e.key === 'Escape') setShowExitIntent(false);
      };
      exitIntentRef.current.addEventListener('keydown', handleTab);
      return () => exitIntentRef.current?.removeEventListener('keydown', handleTab);
    }
  }, [showExitIntent]);

  const bg = darkMode ? 'bg-slate-950' : 'bg-white';
  const text = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-300' : 'text-slate-600';
  const textSubtle = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-900/40' : 'bg-slate-50';
  const cardBorder = darkMode ? 'border-slate-800' : 'border-slate-200';
  
  // Static hover classes for Tailwind JIT (dynamic classes don't work)
  const hoverText = darkMode ? 'hover:text-white' : 'hover:text-slate-900';
  const hoverBorder = darkMode ? 'hover:border-slate-700' : 'hover:border-slate-300';
  const hoverBg = darkMode ? 'hover:bg-slate-900/60' : 'hover:bg-slate-100';
  const hoverTextSubtle = darkMode ? 'hover:text-slate-300' : 'hover:text-slate-700';

  return (
    <ErrorBoundary>
      <div className={`min-h-screen ${bg} ${text}`}>
        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-white">
          Skip to main content
        </a>

      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? `${darkMode ? 'bg-slate-950/95' : 'bg-white/95'} backdrop-blur-xl border-b ${cardBorder}` 
            : 'bg-transparent'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="#" className="flex items-center gap-3" aria-label="NextJob home">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
                <Zap size={18} className="text-slate-900" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold">NextJob</span>
            </a>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className={`text-sm ${textMuted} ${hoverText} transition-colors`}>Features</a>
              <a href="#how-it-works" className={`text-sm ${textMuted} ${hoverText} transition-colors`}>How It Works</a>
              <a href="#pricing" className={`text-sm ${textMuted} ${hoverText} transition-colors`}>Pricing</a>
              <a href="#b2b" className={`text-sm ${textMuted} ${hoverText} transition-colors`}>For Organizations</a>
              <button 
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`text-sm ${textMuted} transition-colors`}
                aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button type="button" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
                Get Started Free
              </button>
            </div>

            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => {
                const newState = !mobileMenuOpen;
                setMobileMenuOpen(newState);
                if (!newState) {
                  // Return focus to menu button when closing
                  setTimeout(() => mobileMenuButtonRef.current?.focus(), 0);
                }
              }}
              className={`md:hidden rounded-lg p-2 ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div 
            id="mobile-menu"
            ref={menuRef}
            className={`md:hidden border-t ${darkMode ? 'border-slate-800 bg-slate-950/95' : 'border-slate-200 bg-white/95'} backdrop-blur-xl`}
            role="menu"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className={`block text-sm ${textMuted}`} role="menuitem">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className={`block text-sm ${textMuted}`} role="menuitem">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className={`block text-sm ${textMuted}`} role="menuitem">Pricing</a>
              <a href="#b2b" onClick={() => setMobileMenuOpen(false)} className={`block text-sm ${textMuted}`} role="menuitem">For Organizations</a>
              <button 
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`w-full text-left text-sm ${textMuted}`}
                role="menuitem"
              >
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <button type="button" className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white" role="menuitem">
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Sticky CTA */}
      {showStickyCTA && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-8 md:w-auto animate-slide-up" role="complementary" aria-label="Quick action">
          <button type="button" className="w-full md:w-auto rounded-xl bg-emerald-500 px-6 py-3 text-sm font-medium text-white shadow-lg hover:bg-emerald-600 transition-all">
            Start Free Trial
          </button>
        </div>
      )}

      {/* Exit Intent Popup */}
      {showExitIntent && (
        <div ref={exitIntentRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="exit-intent-title">
          <div className={`relative mx-4 max-w-md rounded-2xl ${darkMode ? 'bg-slate-900' : 'bg-white'} p-8 shadow-2xl animate-scale-in`}>
            <button
              type="button"
              onClick={() => setShowExitIntent(false)}
              className={`absolute top-4 right-4 ${textSubtle} ${hoverText}`}
              aria-label="Close popup"
            >
              <X size={20} />
            </button>
            <div className="text-center">
              <Sparkles size={48} className="mx-auto mb-4 text-emerald-400" aria-hidden="true" />
              <h3 id="exit-intent-title" className="text-2xl font-bold mb-2">Wait! Get our free career guide</h3>
              <p className={`mb-6 ${textMuted}`}>
                Download "The Ultimate Job Search Checklist" and boost your interview rate by 3x.
              </p>
              <button type="button" className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white hover:bg-emerald-600 transition-colors">
                Download Free Guide
              </button>
              <button
                type="button"
                onClick={() => setShowExitIntent(false)}
                className={`mt-3 text-sm ${textSubtle}`}
              >
                No thanks, I'll continue
              </button>
            </div>
          </div>
        </div>
      )}

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32 animate-fade-in-up" aria-labelledby="hero-title">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" aria-hidden="true" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 mb-6">
                <Sparkles size={14} className="text-emerald-400" aria-hidden="true" />
                <span className="text-xs font-medium text-emerald-400">AI Career Agent • Apply with Proof</span>
              </div>

              <h1 id="hero-title" className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Stop guessing.
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Start proving.
                </span>
              </h1>

              <p className={`mx-auto mt-6 max-w-2xl text-lg sm:text-xl ${textMuted}`}>
                The AI career agent that converts your verified experience into eligible, 
                high-quality applications — with proof for every claim.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button type="button" className="group flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-base font-medium text-white hover:bg-emerald-600 transition-all hover:scale-105">
                  Start Free Trial
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </button>
                <button type="button" className={`group flex items-center gap-2 rounded-xl border ${darkMode ? 'border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'} px-6 py-3 text-base font-medium transition-all`}>
                  <Play size={18} className="text-emerald-400" aria-hidden="true" />
                  Watch Demo
                </button>
              </div>

              <div className={`mt-12 flex flex-wrap items-center justify-center gap-6 text-sm ${textSubtle}`}>
                {['No credit card required', '14-day free trial', 'Cancel anytime'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="mt-16 relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-2 shadow-2xl shadow-emerald-500/5`}>
                <div className={`rounded-xl ${darkMode ? 'bg-slate-950' : 'bg-white'} p-6 sm:p-8`}>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-3 w-3 rounded-full bg-red-500" aria-hidden="true" />
                        <div className="h-3 w-3 rounded-full bg-amber-500" aria-hidden="true" />
                        <div className="h-3 w-3 rounded-full bg-emerald-500" aria-hidden="true" />
                        <span className={`ml-2 text-xs ${textSubtle}`}>Job Application — Senior Software Engineer</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className={`text-xs ${textSubtle}`}>Why are you a good fit?</label>
                          <div className="mt-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                            <p className={`text-sm ${textMuted}`}>
                              With 5+ years building scalable systems at [Company], I led migration of monolith to microservices, reducing deployment time by 70%...
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <ShieldCheck size={12} className="text-emerald-400" aria-hidden="true" />
                              <span className="text-xs text-emerald-400">Verified from your Career Graph</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className={`text-xs ${textSubtle}`}>Work Authorization</label>
                          <div className={`mt-1 rounded-lg border ${cardBorder} ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} p-3`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${textMuted}`}>US Citizen — No sponsorship required</span>
                              <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">Eligibility Check</span>
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">ELIGIBLE</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          {['Location: Remote (US) ✓', 'Work Authorization: US Citizen ✓', 'Experience: 5+ years ✓', 'Skills: React, Node.js, TypeScript ✓'].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                              <Check size={12} className="text-emerald-400" aria-hidden="true" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={`rounded-xl border ${cardBorder} ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} p-4`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">Match Score</span>
                          <span className="text-2xl font-bold text-emerald-400">92%</span>
                        </div>
                        <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} overflow-hidden`}>
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 animate-progress"
                            role="progressbar"
                            aria-valuenow={92}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Match score: 92%"
                          />
                        </div>
                        <p className={`mt-2 text-xs ${textSubtle}`}>Strong fit based on your verified experience and skills</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className={`border-y ${cardBorder} ${darkMode ? 'bg-slate-900/30' : 'bg-slate-50'} py-12`} aria-label="Trusted by companies">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className={`text-center text-sm ${textSubtle} mb-8`}>Trusted by professionals from leading companies</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale">
              {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'].map((company) => (
                <div key={company} className={`text-xl font-bold ${textSubtle} ${hoverTextSubtle} transition-colors`}>
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20 sm:py-32" aria-labelledby="problem-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="problem-title" className="text-3xl font-bold sm:text-4xl">Job search is broken.</h2>
              <p className={`mt-4 text-lg ${textMuted}`}>You're wasting time on applications that go nowhere.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: <AlertTriangle className="text-amber-400" size={24} />, title: 'AI Hallucination', desc: 'Tools invent experience you don\'t have, putting your reputation at risk.' },
                { icon: <Clock className="text-amber-400" size={24} />, title: 'Wasted Time', desc: 'Hours spent on applications for jobs you\'re not even eligible for.' },
                { icon: <X className="text-amber-400" size={24} />, title: 'Duplicate Submissions', desc: 'Auto-apply tools submit the same application multiple times.' },
                { icon: <Eye className="text-amber-400" size={24} />, title: 'No Transparency', desc: 'You have no idea what was actually submitted on your behalf.' },
                { icon: <Lock className="text-amber-400" size={24} />, title: 'Privacy Concerns', desc: 'Your data is sold to recruiters without your consent.' },
                { icon: <TrendingUp className="text-amber-400 rotate-180" size={24} />, title: 'No Learning', desc: 'Applications don\'t improve based on what actually works.' },
              ].map((problem, i) => (
                <div key={i} className={`rounded-xl border ${cardBorder} ${cardBg} p-6 ${hoverBorder} transition-colors`}>
                  <div className="mb-4" aria-hidden="true">{problem.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                  <p className={`text-sm ${textMuted}`}>{problem.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="features" className={`py-20 sm:py-32 ${darkMode ? 'bg-gradient-to-b from-slate-950 to-slate-900/50' : 'bg-gradient-to-b from-white to-slate-50'}`} aria-labelledby="solution-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="solution-title" className="text-3xl font-bold sm:text-4xl">Apply with proof, not promises.</h2>
              <p className={`mt-4 text-lg ${textMuted}`}>Every claim backed by verified evidence. Every application eligible. Every submission tracked.</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              {[
                { icon: <ShieldCheck className="text-emerald-400" size={32} />, title: 'Evidence-Backed Career Graph', desc: 'Your entire career history verified and organized. Every skill, experience, and achievement traces back to proof.', features: ['CV import with verification', 'Evidence provenance tracking', 'Version-controlled claims'] },
                { icon: <Scale className="text-emerald-400" size={32} />, title: 'Eligibility Before Application', desc: 'Never waste time on jobs you can\'t get. We check eligibility before you even see the opportunity.', features: ['Work authorization check', 'Location verification', 'Skills gap analysis'] },
                { icon: <Brain className="text-emerald-400" size={32} />, title: 'No Fabricated Claims', desc: 'AI constrained to your verified evidence. We never invent experience you don\'t have.', features: ['Evidence-constrained generation', 'Zero hallucination guarantee', 'Audit trail for every claim'] },
                { icon: <Lock className="text-emerald-400" size={32} />, title: 'Risk-Based Automation', desc: 'You control every consequential decision. Sensitive fields always require your approval.', features: ['Manual/Copilot/Autopilot modes', 'Field-level overrides', 'Approval workflow'] },
                { icon: <FileText className="text-emerald-400" size={32} />, title: 'Verified Submission Receipts', desc: 'Proof of exactly what was submitted. Hash-verified, timestamped, and immutable.', features: ['Submission verification', 'Field-level receipts', 'Duplicate prevention'] },
                { icon: <Globe className="text-emerald-400" size={32} />, title: 'Global Capability Transparency', desc: 'Clear labels for what works where. No misleading "global support" claims.', features: ['Per-job capability labels', 'ATS compatibility matrix', 'Regional support clarity'] },
              ].map((feature, i) => (
                <div key={i} className={`group rounded-2xl border ${cardBorder} ${cardBg} p-8 hover:border-emerald-500/30 transition-all`}>
                  <div className="mb-4" aria-hidden="true">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className={`text-sm ${textMuted} mb-4`}>{feature.desc}</p>
                  <ul className="space-y-2">
                    {feature.features.map((feat, j) => (
                      <li key={j} className={`flex items-center gap-2 text-sm ${textMuted}`}>
                        <Check size={14} className="text-emerald-400 shrink-0" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 sm:py-32" aria-labelledby="how-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="how-title" className="text-3xl font-bold sm:text-4xl">How it works</h2>
              <p className={`mt-4 text-lg ${textMuted}`}>From verified career history to interview in 4 simple steps.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { step: '01', icon: <Database className="text-emerald-400" size={28} />, title: 'Build Your Career Graph', desc: 'Import your CV and verify every claim. We extract skills, experience, and achievements with full provenance.' },
                { step: '02', icon: <Zap className="text-emerald-400" size={28} />, title: 'Discover Eligible Jobs', desc: 'We find opportunities where you\'re actually eligible. No more wasting time on jobs you can\'t get.' },
                { step: '03', icon: <Code2 className="text-emerald-400" size={28} />, title: 'Tailor Applications', desc: 'AI generates resume variants and cover letters from your verified evidence. Every claim backed by proof.' },
                { step: '04', icon: <CheckCircle2 className="text-emerald-400" size={28} />, title: 'Apply with Confidence', desc: 'Submit applications with verified receipts. Track outcomes and learn what works.' },
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -top-4 -left-4 text-6xl font-bold ${darkMode ? 'text-slate-800/50' : 'text-slate-200'}`} aria-hidden="true">{step.step}</div>
                  <div className={`relative rounded-xl border ${cardBorder} ${cardBg} p-6 h-full`}>
                    <div className="mb-4" aria-hidden="true">{step.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className={`text-sm ${textMuted}`}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section className={`py-20 sm:py-32 ${darkMode ? 'bg-gradient-to-b from-slate-900/50 to-slate-950' : 'bg-gradient-to-b from-slate-50 to-white'}`} aria-labelledby="roi-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="roi-title" className="text-3xl font-bold sm:text-4xl">Calculate your ROI</h2>
              <p className={`mt-4 text-lg ${textMuted}`}>See how much time and money you'll save with NextJob.</p>
            </div>
            <ROICalculator darkMode={darkMode} textMuted={textMuted} textSubtle={textSubtle} cardBorder={cardBorder} />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 sm:py-32" aria-labelledby="pricing-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="pricing-title" className="text-3xl font-bold sm:text-4xl">Simple, transparent pricing</h2>
              <p className={`mt-4 text-lg ${textMuted}`}>Start free. Upgrade when you're ready.</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
              {[
                { name: 'Free', price: '$0', period: 'forever', desc: 'Perfect for getting started', features: ['Career Graph (limited)', 'Job discovery', 'Eligibility checks', 'Application tracker', '5 applications/month'], cta: 'Get Started', popular: false },
                { name: 'Search Pass', price: '$39', period: '/month', desc: 'For active job seekers', features: ['Everything in Free', 'Unlimited applications', 'Full matching & tailoring', 'Assisted applications', 'Verified receipts', 'Priority support'], cta: 'Start Free Trial', popular: true },
                { name: 'Agent Pass', price: 'Coming Soon', period: '', desc: 'For power users', features: ['Everything in Search Pass', 'Safe Autopilot mode', 'Advanced automation', 'Outcome optimization', 'API access', 'Custom integrations'], cta: 'Join Waitlist', popular: false },
              ].map((plan, i) => (
                <div key={i} className={`relative rounded-2xl border p-8 ${plan.popular ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-slate-900/40' : `${cardBorder} ${cardBg}`}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">Most Popular</span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className={`text-sm ${textMuted} mt-1`}>{plan.desc}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={textMuted}>{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className={`flex items-center gap-2 text-sm ${textMuted}`}>
                        <Check size={16} className="text-emerald-400 shrink-0" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button type="button" className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${plan.popular ? 'bg-emerald-500 text-white hover:bg-emerald-600' : `border ${cardBorder} ${darkMode ? 'bg-slate-900 text-slate-300 hover:bg-slate-800' : 'bg-white text-slate-700 hover:bg-slate-50'}`}`}>
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* B2B Section */}
        <section id="b2b" className={`py-20 sm:py-32 ${darkMode ? 'bg-gradient-to-b from-slate-950 to-slate-900/50' : 'bg-gradient-to-b from-white to-slate-50'}`} aria-labelledby="b2b-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 mb-6">
                  <Building2 size={14} className="text-cyan-400" aria-hidden="true" />
                  <span className="text-xs font-medium text-cyan-400">For Organizations</span>
                </div>
                <h2 id="b2b-title" className="text-3xl font-bold sm:text-4xl mb-6">Empower your cohort with verified career tools</h2>
                <p className={`text-lg ${textMuted} mb-8`}>Give your participants access to NextJob with aggregate reporting that respects privacy. Perfect for bootcamps, universities, and workforce development programs.</p>
                <ul className="space-y-4 mb-8">
                  {['Sponsored access for participants', 'Aggregate outcome reporting', 'Cohort management dashboard', 'Privacy-first design (no individual data exposure)', 'Custom onboarding and support'].map((feature, i) => (
                    <li key={i} className={`flex items-center gap-3 ${textMuted}`}>
                      <CheckCircle2 size={20} className="text-cyan-400 shrink-0" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" className="group flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-base font-medium text-white hover:bg-cyan-600 transition-all">
                  Schedule Demo
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </button>
              </div>
              <div className="relative">
                <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-6`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cohort Performance</span>
                      <span className={`text-xs ${textSubtle}`}>Last 30 days</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Participants', value: '247', change: '+12% vs last month' },
                        { label: 'Interview Rate', value: '34%', change: '+8% vs last month' },
                        { label: 'Applications', value: '1,847', change: '+23% vs last month' },
                        { label: 'Verified Submissions', value: '98%', change: 'Receipt generation rate' },
                      ].map((stat, i) => (
                        <div key={i} className={`rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'} p-4`}>
                          <p className={`text-xs ${textSubtle} mb-1`}>{stat.label}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                      <p className="text-xs text-cyan-400 mb-2">Privacy Protected</p>
                      <p className={`text-sm ${textMuted}`}>All reporting is aggregate-only. Individual participant data is never exposed to administrators.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 sm:py-32" aria-labelledby="testimonials-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="testimonials-title" className="text-3xl font-bold sm:text-4xl">Loved by job seekers</h2>
              <p className={`mt-4 text-lg ${textMuted}`}>See what our users are saying.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { quote: 'NextJob helped me land 3 interviews in my first week. The eligibility checks saved me from applying to jobs I wasn\'t qualified for.', author: 'Sarah Chen', role: 'Software Engineer', company: 'Previously at Startup' },
                { quote: 'As an international candidate, I was wasting so much time on jobs I couldn\'t get. NextJob\'s work authorization checks are a game-changer.', author: 'Raj Patel', role: 'Data Scientist', company: 'Visa Holder' },
                { quote: 'The verified receipts give me peace of mind. I know exactly what was submitted on my behalf, and I can prove my claims.', author: 'Maria Garcia', role: 'Product Manager', company: 'Career Changer' },
              ].map((testimonial, i) => (
                <div key={i} className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
                  <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className={`${textMuted} mb-6 italic`}>"{testimonial.quote}"</blockquote>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className={`text-sm ${textMuted}`}>{testimonial.role}</p>
                    <p className={`text-xs ${textSubtle}`}>{testimonial.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={`py-20 sm:py-32 ${darkMode ? 'bg-gradient-to-b from-slate-900/50 to-slate-950' : 'bg-gradient-to-b from-slate-50 to-white'}`} aria-labelledby="faq-title">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="faq-title" className="text-3xl font-bold sm:text-4xl">Frequently asked questions</h2>
            </div>
            <div className="space-y-4" role="list">
              {[
                { q: 'How is NextJob different from other AI job tools?', a: 'NextJob is the only AI career agent that constrains generation to verified evidence. We never fabricate experience, we check eligibility before you apply, and we provide verified receipts for every submission.' },
                { q: 'Is my data safe?', a: 'Absolutely. We use encryption at rest and in transit, tenant isolation, and never sell your data. You can export or delete your data at any time. We\'re GDPR compliant and privacy-first by design.' },
                { q: 'What if I\'m an international candidate?', a: 'NextJob is built for global candidates. We check work authorization, sponsorship requirements, and location restrictions before showing you opportunities, so you never waste time on jobs you can\'t get.' },
                { q: 'Can I control what the AI does?', a: 'Yes. You choose between Manual, Copilot, and Autopilot modes. Sensitive fields always require your approval. You can override automation at the field level.' },
                { q: 'How do verified receipts work?', a: 'Every submission generates a cryptographic receipt showing exactly what was submitted, when, and to which ATS. Receipts are hash-verified and immutable, giving you proof of application.' },
                { q: 'What ATS systems do you support?', a: 'We support major ATS platforms including Greenhouse, Lever, Workday, and iCIMS through our browser extension. More integrations are coming soon.' },
              ].map((faq, i) => (
                <div key={i} className={`rounded-xl border ${cardBorder} ${cardBg} overflow-hidden`} role="listitem">
                  <button
                    type="button"
                    onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                    className={`w-full px-6 py-4 text-left flex items-center justify-between ${hoverBg} transition-colors`}
                    aria-expanded={openFAQ === i}
                    aria-controls={`faq-answer-${i}`}
                  >
                    <span className="font-medium">{faq.q}</span>
                    <ChevronDown size={20} className={`${textSubtle} transition-transform ${openFAQ === i ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {openFAQ === i && (
                    <div id={`faq-answer-${i}`} className="px-6 pb-4" role="region">
                      <p className={textMuted}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-32" aria-labelledby="cta-title">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-12 text-center">
              <h2 id="cta-title" className="text-3xl font-bold sm:text-4xl mb-4">Ready to apply with proof?</h2>
              <p className={`text-lg ${textMuted} mb-8`}>Join thousands of job seekers who've transformed their job search with NextJob.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button type="button" className="group flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-medium text-white hover:bg-emerald-600 transition-all hover:scale-105">
                  Start Free Trial
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </button>
                <button type="button" className={`flex items-center gap-2 rounded-xl border ${darkMode ? 'border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'} px-8 py-4 text-lg font-medium transition-all`}>
                  Talk to Sales
                </button>
              </div>
              <p className={`mt-6 text-sm ${textSubtle}`}>No credit card required • 14-day free trial • Cancel anytime</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t ${cardBorder} ${darkMode ? 'bg-slate-950' : 'bg-white'} py-12`} role="contentinfo">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
                  <Zap size={18} className="text-slate-900" aria-hidden="true" />
                </div>
                <span className="text-lg font-bold">NextJob</span>
              </div>
              <p className={`text-sm ${textMuted}`}>Apply with proof. The trustworthy AI career agent.</p>
            </div>
            <nav aria-label="Product links">
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className={`space-y-2 text-sm ${textMuted}`}>
                <li><a href="#features" className={`${hoverText} transition-colors`}>Features</a></li>
                <li><a href="#pricing" className={`${hoverText} transition-colors`}>Pricing</a></li>
                <li><a href="#b2b" className={`${hoverText} transition-colors`}>For Organizations</a></li>
                <li><a href="#" className={`${hoverText} transition-colors`}>Changelog</a></li>
              </ul>
            </nav>
            <nav aria-label="Company links">
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className={`space-y-2 text-sm ${textMuted}`}>
                <li><a href="#" className={`${hoverText} transition-colors`}>About</a></li>
                <li><a href="#" className={`${hoverText} transition-colors`}>Blog</a></li>
                <li><a href="#" className={`${hoverText} transition-colors`}>Careers</a></li>
                <li><a href="#" className={`${hoverText} transition-colors`}>Contact</a></li>
              </ul>
            </nav>
            <nav aria-label="Legal links">
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className={`space-y-2 text-sm ${textMuted}`}>
                <li><a href="#" className={`${hoverText} transition-colors`}>Privacy Policy</a></li>
                <li><a href="#" className={`${hoverText} transition-colors`}>Terms of Service</a></li>
                <li><a href="#" className={`${hoverText} transition-colors`}>Cookie Policy</a></li>
                <li><a href="#" className={`${hoverText} transition-colors`}>GDPR</a></li>
              </ul>
            </nav>
          </div>
          <div className={`mt-12 pt-8 border-t ${cardBorder} flex flex-col sm:flex-row items-center justify-between gap-4`}>
            <p className={`text-sm ${textSubtle}`}>© 2026 NextJob. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className={`${textMuted} ${hoverText} transition-colors`} aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className={`${textMuted} ${hoverText} transition-colors`} aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className={`${textMuted} ${hoverText} transition-colors`} aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Cookie Consent Banner (GDPR Compliant) */}
      <CookieConsent />
      </div>
    </ErrorBoundary>
  );
}

// ROI Calculator Component
function ROICalculator({ darkMode, textMuted, textSubtle, cardBorder }: { darkMode: boolean; textMuted: string; textSubtle: string; cardBorder: string }) {
  const TIME_SAVINGS_FACTOR = 0.7;
  const INTERVIEW_RATE_MULTIPLIER = 2.5;
  const HOURLY_RATE = 50;

  const [applicationsPerMonth, setApplicationsPerMonth] = useState(50);
  const [hoursPerApplication, setHoursPerApplication] = useState(2);
  const [currentInterviewRate, setCurrentInterviewRate] = useState(5);

  const timeSaved = applicationsPerMonth * hoursPerApplication * TIME_SAVINGS_FACTOR;
  const improvedInterviewRate = currentInterviewRate * INTERVIEW_RATE_MULTIPLIER;
  const additionalInterviews = Math.round((applicationsPerMonth * improvedInterviewRate / 100) - (applicationsPerMonth * currentInterviewRate / 100));

  return (
    <div className={`rounded-2xl border ${cardBorder} ${darkMode ? 'bg-slate-900/40' : 'bg-slate-50'} p-8 max-w-4xl mx-auto`}>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <label htmlFor="applications-slider" className="block text-sm font-medium mb-2">
              Applications per month: <span className="text-emerald-400">{applicationsPerMonth}</span>
            </label>
            <input
              id="applications-slider"
              type="range"
              min="10"
              max="200"
              value={applicationsPerMonth}
              onChange={(e) => setApplicationsPerMonth(Number(e.target.value))}
              aria-valuemin={10}
              aria-valuemax={200}
              aria-valuenow={applicationsPerMonth}
            />
            <div className={`flex justify-between text-xs ${textSubtle} mt-1`}>
              <span>10</span>
              <span>200</span>
            </div>
          </div>
          <div>
            <label htmlFor="hours-slider" className="block text-sm font-medium mb-2">
              Hours per application: <span className="text-emerald-400">{hoursPerApplication}h</span>
            </label>
            <input
              id="hours-slider"
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={hoursPerApplication}
              onChange={(e) => setHoursPerApplication(Number(e.target.value))}
              aria-valuemin={0.5}
              aria-valuemax={5}
              aria-valuenow={hoursPerApplication}
            />
            <div className={`flex justify-between text-xs ${textSubtle} mt-1`}>
              <span>0.5h</span>
              <span>5h</span>
            </div>
          </div>
          <div>
            <label htmlFor="rate-slider" className="block text-sm font-medium mb-2">
              Current interview rate: <span className="text-emerald-400">{currentInterviewRate}%</span>
            </label>
            <input
              id="rate-slider"
              type="range"
              min="1"
              max="20"
              value={currentInterviewRate}
              onChange={(e) => setCurrentInterviewRate(Number(e.target.value))}
              aria-valuemin={1}
              aria-valuemax={20}
              aria-valuenow={currentInterviewRate}
            />
            <div className={`flex justify-between text-xs ${textSubtle} mt-1`}>
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>
        </div>
        <div className="space-y-4" aria-live="polite" aria-atomic="true">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-emerald-400" size={24} aria-hidden="true" />
              <span className="text-sm font-medium text-emerald-400">Time Saved</span>
            </div>
            <p className="text-3xl font-bold">{timeSaved.toFixed(0)} hours/month</p>
            <p className={`text-sm ${textMuted} mt-1`}>That's {((timeSaved * 12) / 40).toFixed(1)} full work weeks per year</p>
          </div>
          <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-cyan-400" size={24} aria-hidden="true" />
              <span className="text-sm font-medium text-cyan-400">Interview Rate</span>
            </div>
            <p className="text-3xl font-bold">{improvedInterviewRate.toFixed(0)}%</p>
            <p className={`text-sm ${textMuted} mt-1`}>+{additionalInterviews} more interviews per month</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-amber-400" size={24} aria-hidden="true" />
              <span className="text-sm font-medium text-amber-400">Value Created</span>
            </div>
            <p className="text-3xl font-bold">${Math.round(timeSaved * HOURLY_RATE).toLocaleString()}/month</p>
            <p className={`text-sm ${textMuted} mt-1`}>Based on ${HOURLY_RATE}/hour opportunity cost</p>
          </div>
        </div>
      </div>
    </div>
  );
}
