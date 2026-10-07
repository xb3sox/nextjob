import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Shield, Target, Zap, CheckCircle2, AlertTriangle, ChevronRight,
  Layers, Code2, Palette, FileText, Users, Workflow, Database,
  Lock, Globe, TrendingUp, Eye, ArrowRight, Menu, X, BookOpen,
  Server, Brain, Scale, Clock, BarChart3, GitBranch, ShieldCheck,
  Sparkles, Award, Star, Calculator, Play, Download, Mail,
  Linkedin, Twitter, Github, ChevronDown, ArrowUpRight,
  Building2, GraduationCap, Briefcase, Plane, Calculator as CalcIcon,
  Clock as ClockIcon, DollarSign, TrendingDown, Check, X as XIcon
} from 'lucide-react';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/60' : 'bg-transparent'
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
                <Zap size={18} className="text-slate-900" />
              </div>
              <span className="text-lg font-bold text-white">NextJob</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-300 hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">Pricing</a>
              <a href="#b2b" className="text-sm text-slate-300 hover:text-white transition-colors">For Organizations</a>
              <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
                Get Started Free
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm text-slate-300 hover:text-white">Features</a>
              <a href="#how-it-works" className="block text-sm text-slate-300 hover:text-white">How It Works</a>
              <a href="#pricing" className="block text-sm text-slate-300 hover:text-white">Pricing</a>
              <a href="#b2b" className="block text-sm text-slate-300 hover:text-white">For Organizations</a>
              <button className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white">
                Get Started Free
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 mb-6">
              <Sparkles size={14} className="text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">AI Career Agent • Apply with Proof</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Stop guessing.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Start proving.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
              The AI career agent that converts your verified experience into eligible, 
              high-quality applications — with proof for every claim.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="group flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-base font-medium text-white hover:bg-emerald-600 transition-all hover:scale-105">
                Start Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-6 py-3 text-base font-medium text-slate-300 hover:bg-slate-800 transition-all">
                <Play size={18} className="text-emerald-400" />
                Watch Demo
              </button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual - Interactive Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl shadow-emerald-500/5">
              <div className="rounded-xl bg-slate-950 p-6 sm:p-8">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Left: Application Form */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="ml-2 text-xs text-slate-500">Job Application — Senior Software Engineer</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-400">Why are you a good fit?</label>
                        <div className="mt-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                          <p className="text-sm text-slate-300">
                            With 5+ years building scalable systems at [Company], I led migration of monolith to microservices, reducing deployment time by 70%...
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <ShieldCheck size={12} className="text-emerald-400" />
                            <span className="text-xs text-emerald-400">Verified from your Career Graph</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400">Work Authorization</label>
                        <div className="mt-1 rounded-lg border border-slate-700 bg-slate-900 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">US Citizen — No sponsorship required</span>
                            <CheckCircle2 size={16} className="text-emerald-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Eligibility & Match Score */}
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">Eligibility Check</span>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                          ELIGIBLE
                        </span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Check size={12} className="text-emerald-400" />
                          <span>Location: Remote (US) ✓</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Check size={12} className="text-emerald-400" />
                          <span>Work Authorization: US Citizen ✓</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Check size={12} className="text-emerald-400" />
                          <span>Experience: 5+ years ✓</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Check size={12} className="text-emerald-400" />
                          <span>Skills: React, Node.js, TypeScript ✓</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">Match Score</span>
                        <span className="text-2xl font-bold text-emerald-400">92%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '92%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        Strong fit based on your verified experience and skills
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-slate-800 bg-slate-900/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500 mb-8">
            Trusted by professionals from leading companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'].map((company) => (
              <div key={company} className="text-xl font-bold text-slate-400 hover:text-slate-300 transition-colors">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Job search is broken.
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              You're wasting time on applications that go nowhere.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <AlertTriangle className="text-amber-400" size={24} />,
                title: 'AI Hallucination',
                description: 'Tools invent experience you don\'t have, putting your reputation at risk.',
              },
              {
                icon: <Clock className="text-amber-400" size={24} />,
                title: 'Wasted Time',
                description: 'Hours spent on applications for jobs you\'re not even eligible for.',
              },
              {
                icon: <X className="text-amber-400" size={24} />,
                title: 'Duplicate Submissions',
                description: 'Auto-apply tools submit the same application multiple times.',
              },
              {
                icon: <Eye className="text-amber-400" size={24} />,
                title: 'No Transparency',
                description: 'You have no idea what was actually submitted on your behalf.',
              },
              {
                icon: <Lock className="text-amber-400" size={24} />,
                title: 'Privacy Concerns',
                description: 'Your data is sold to recruiters without your consent.',
              },
              {
                icon: <TrendingDown className="text-amber-400" size={24} />,
                title: 'No Learning',
                description: 'Applications don\'t improve based on what actually works.',
              },
            ].map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 hover:border-slate-700 transition-colors"
              >
                <div className="mb-4">{problem.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{problem.title}</h3>
                <p className="text-sm text-slate-400">{problem.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="py-20 sm:py-32 bg-gradient-to-b from-slate-950 to-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Apply with proof, not promises.
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Every claim backed by verified evidence. Every application eligible. Every submission tracked.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                icon: <ShieldCheck className="text-emerald-400" size={32} />,
                title: 'Evidence-Backed Career Graph',
                description: 'Your entire career history verified and organized. Every skill, experience, and achievement traces back to proof.',
                features: ['CV import with verification', 'Evidence provenance tracking', 'Version-controlled claims'],
              },
              {
                icon: <Scale className="text-emerald-400" size={32} />,
                title: 'Eligibility Before Application',
                description: 'Never waste time on jobs you can\'t get. We check eligibility before you even see the opportunity.',
                features: ['Work authorization check', 'Location verification', 'Skills gap analysis'],
              },
              {
                icon: <Brain className="text-emerald-400" size={32} />,
                title: 'No Fabricated Claims',
                description: 'AI constrained to your verified evidence. We never invent experience you don\'t have.',
                features: ['Evidence-constrained generation', 'Zero hallucination guarantee', 'Audit trail for every claim'],
              },
              {
                icon: <Lock className="text-emerald-400" size={32} />,
                title: 'Risk-Based Automation',
                description: 'You control every consequential decision. Sensitive fields always require your approval.',
                features: ['Manual/Copilot/Autopilot modes', 'Field-level overrides', 'Approval workflow'],
              },
              {
                icon: <FileText className="text-emerald-400" size={32} />,
                title: 'Verified Submission Receipts',
                description: 'Proof of exactly what was submitted. Hash-verified, timestamped, and immutable.',
                features: ['Submission verification', 'Field-level receipts', 'Duplicate prevention'],
              },
              {
                icon: <Globe className="text-emerald-400" size={32} />,
                title: 'Global Capability Transparency',
                description: 'Clear labels for what works where. No misleading "global support" claims.',
                features: ['Per-job capability labels', 'ATS compatibility matrix', 'Regional support clarity'],
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-8 hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              From verified career history to interview in 4 simple steps.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                icon: <Database className="text-emerald-400" size={28} />,
                title: 'Build Your Career Graph',
                description: 'Import your CV and verify every claim. We extract skills, experience, and achievements with full provenance.',
              },
              {
                step: '02',
                icon: <Target className="text-emerald-400" size={28} />,
                title: 'Discover Eligible Jobs',
                description: 'We find opportunities where you\'re actually eligible. No more wasting time on jobs you can\'t get.',
              },
              {
                step: '03',
                icon: <Code2 className="text-emerald-400" size={28} />,
                title: 'Tailor Applications',
                description: 'AI generates resume variants and cover letters from your verified evidence. Every claim backed by proof.',
              },
              {
                step: '04',
                icon: <Zap className="text-emerald-400" size={28} />,
                title: 'Apply with Confidence',
                description: 'Submit applications with verified receipts. Track outcomes and learn what works.',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="absolute -top-4 -left-4 text-6xl font-bold text-slate-800/50">
                  {step.step}
                </div>
                <div className="relative rounded-xl border border-slate-800 bg-slate-900/40 p-6 h-full">
                  <div className="mb-4">{step.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Calculate your ROI
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              See how much time and money you'll save with NextJob.
            </p>
          </motion.div>

          <ROICalculator />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Start free. Upgrade when you're ready.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                description: 'Perfect for getting started',
                features: [
                  'Career Graph (limited)',
                  'Job discovery',
                  'Eligibility checks',
                  'Application tracker',
                  '5 applications/month',
                ],
                cta: 'Get Started',
                popular: false,
              },
              {
                name: 'Search Pass',
                price: '$39',
                period: '/month',
                description: 'For active job seekers',
                features: [
                  'Everything in Free',
                  'Unlimited applications',
                  'Full matching & tailoring',
                  'Assisted applications',
                  'Verified receipts',
                  'Priority support',
                ],
                cta: 'Start Free Trial',
                popular: true,
              },
              {
                name: 'Agent Pass',
                price: 'Coming Soon',
                period: '',
                description: 'For power users',
                features: [
                  'Everything in Search Pass',
                  'Safe Autopilot mode',
                  'Advanced automation',
                  'Outcome optimization',
                  'API access',
                  'Custom integrations',
                ],
                cta: 'Join Waitlist',
                popular: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-8 ${
                  plan.popular
                    ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-slate-900/40'
                    : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={16} className="text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    plan.popular
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* B2B Section */}
      <section id="b2b" className="py-20 sm:py-32 bg-gradient-to-b from-slate-950 to-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 mb-6">
                <Building2 size={14} className="text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400">For Organizations</span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
                Empower your cohort with verified career tools
              </h2>
              <p className="text-lg text-slate-400 mb-8">
                Give your participants access to NextJob with aggregate reporting that respects privacy. 
                Perfect for bootcamps, universities, and workforce development programs.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Sponsored access for participants',
                  'Aggregate outcome reporting',
                  'Cohort management dashboard',
                  'Privacy-first design (no individual data exposure)',
                  'Custom onboarding and support',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 size={20} className="text-cyan-400 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="group flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-base font-medium text-white hover:bg-cyan-600 transition-all">
                Schedule Demo
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Cohort Performance</span>
                    <span className="text-xs text-slate-500">Last 30 days</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-slate-800/50 p-4">
                      <p className="text-xs text-slate-400 mb-1">Participants</p>
                      <p className="text-2xl font-bold text-white">247</p>
                      <p className="text-xs text-emerald-400 mt-1">+12% vs last month</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 p-4">
                      <p className="text-xs text-slate-400 mb-1">Interview Rate</p>
                      <p className="text-2xl font-bold text-white">34%</p>
                      <p className="text-xs text-emerald-400 mt-1">+8% vs last month</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 p-4">
                      <p className="text-xs text-slate-400 mb-1">Applications</p>
                      <p className="text-2xl font-bold text-white">1,847</p>
                      <p className="text-xs text-emerald-400 mt-1">+23% vs last month</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 p-4">
                      <p className="text-xs text-slate-400 mb-1">Verified Submissions</p>
                      <p className="text-2xl font-bold text-white">98%</p>
                      <p className="text-xs text-emerald-400 mt-1">Receipt generation rate</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                    <p className="text-xs text-cyan-400 mb-2">Privacy Protected</p>
                    <p className="text-sm text-slate-300">
                      All reporting is aggregate-only. Individual participant data is never exposed to administrators.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Loved by job seekers
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              See what our users are saying.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: 'NextJob helped me land 3 interviews in my first week. The eligibility checks saved me from applying to jobs I wasn\'t qualified for.',
                author: 'Sarah Chen',
                role: 'Software Engineer',
                company: 'Previously at Startup',
              },
              {
                quote: 'As an international candidate, I was wasting so much time on jobs I couldn\'t get. NextJob\'s work authorization checks are a game-changer.',
                author: 'Raj Patel',
                role: 'Data Scientist',
                company: 'Visa Holder',
              },
              {
                quote: 'The verified receipts give me peace of mind. I know exactly what was submitted on my behalf, and I can prove my claims.',
                author: 'Maria Garcia',
                role: 'Product Manager',
                company: 'Career Changer',
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-medium text-white">{testimonial.author}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                  <p className="text-xs text-slate-500">{testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Frequently asked questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: 'How is NextJob different from other AI job tools?',
                answer: 'NextJob is the only AI career agent that constrains generation to verified evidence. We never fabricate experience, we check eligibility before you apply, and we provide verified receipts for every submission.',
              },
              {
                question: 'Is my data safe?',
                answer: 'Absolutely. We use encryption at rest and in transit, tenant isolation, and never sell your data. You can export or delete your data at any time. We\'re GDPR compliant and privacy-first by design.',
              },
              {
                question: 'What if I\'m an international candidate?',
                answer: 'NextJob is built for global candidates. We check work authorization, sponsorship requirements, and location restrictions before showing you opportunities, so you never waste time on jobs you can\'t get.',
              },
              {
                question: 'Can I control what the AI does?',
                answer: 'Yes. You choose between Manual, Copilot, and Autopilot modes. Sensitive fields always require your approval. You can override automation at the field level.',
              },
              {
                question: 'How do verified receipts work?',
                answer: 'Every submission generates a cryptographic receipt showing exactly what was submitted, when, and to which ATS. Receipts are hash-verified and immutable, giving you proof of application.',
              },
              {
                question: 'What ATS systems do you support?',
                answer: 'We support major ATS platforms including Greenhouse, Lever, Workday, and iCIMS through our browser extension. More integrations are coming soon.',
              },
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Ready to apply with proof?
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Join thousands of job seekers who've transformed their job search with NextJob.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="group flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-medium text-white hover:bg-emerald-600 transition-all hover:scale-105">
                Start Free Trial
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-8 py-4 text-lg font-medium text-slate-300 hover:bg-slate-800 transition-all">
                Talk to Sales
              </button>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
                  <Zap size={18} className="text-slate-900" />
                </div>
                <span className="text-lg font-bold text-white">NextJob</span>
              </div>
              <p className="text-sm text-slate-400">
                Apply with proof. The trustworthy AI career agent.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#b2b" className="hover:text-white transition-colors">For Organizations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2026 NextJob. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ROI Calculator Component
function ROICalculator() {
  const [applicationsPerMonth, setApplicationsPerMonth] = useState(50);
  const [hoursPerApplication, setHoursPerApplication] = useState(2);
  const [currentInterviewRate, setCurrentInterviewRate] = useState(5);

  const timeSaved = applicationsPerMonth * hoursPerApplication * 0.7; // 70% time savings
  const improvedInterviewRate = currentInterviewRate * 2.5; // 2.5x improvement
  const additionalInterviews = (applicationsPerMonth * improvedInterviewRate / 100) - (applicationsPerMonth * currentInterviewRate / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 max-w-4xl mx-auto"
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Applications per month
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={applicationsPerMonth}
              onChange={(e) => setApplicationsPerMonth(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>10</span>
              <span className="text-emerald-400 font-medium">{applicationsPerMonth}</span>
              <span>200</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Hours per application
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={hoursPerApplication}
              onChange={(e) => setHoursPerApplication(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0.5h</span>
              <span className="text-emerald-400 font-medium">{hoursPerApplication}h</span>
              <span>5h</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Current interview rate (%)
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={currentInterviewRate}
              onChange={(e) => setCurrentInterviewRate(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1%</span>
              <span className="text-emerald-400 font-medium">{currentInterviewRate}%</span>
              <span>20%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <ClockIcon className="text-emerald-400" size={24} />
              <span className="text-sm font-medium text-emerald-400">Time Saved</span>
            </div>
            <p className="text-3xl font-bold text-white">{timeSaved.toFixed(0)} hours/month</p>
            <p className="text-sm text-slate-400 mt-1">
              That's {(timeSaved / 40).toFixed(1)} full work weeks per year
            </p>
          </div>

          <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-cyan-400" size={24} />
              <span className="text-sm font-medium text-cyan-400">Interview Rate</span>
            </div>
            <p className="text-3xl font-bold text-white">{improvedInterviewRate.toFixed(0)}%</p>
            <p className="text-sm text-slate-400 mt-1">
              +{additionalInterviews.toFixed(0)} more interviews per month
            </p>
          </div>

          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-amber-400" size={24} />
              <span className="text-sm font-medium text-amber-400">Value Created</span>
            </div>
            <p className="text-3xl font-bold text-white">${(timeSaved * 50).toLocaleString()}/month</p>
            <p className="text-sm text-slate-400 mt-1">
              Based on $50/hour opportunity cost
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-900/60 transition-colors"
      >
        <span className="font-medium text-white">{question}</span>
        <ChevronDown
          size={20}
          className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-6 pb-4"
        >
          <p className="text-slate-400">{answer}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
