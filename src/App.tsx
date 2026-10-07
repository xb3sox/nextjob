import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Target, Zap, CheckCircle2, AlertTriangle, ChevronRight,
  Layers, Code2, Palette, FileText, Users, Workflow, Database,
  Lock, Globe, TrendingUp, Eye, ArrowRight, Menu, X, BookOpen,
  Server, Brain, Scale, Clock, BarChart3, GitBranch, ShieldCheck
} from 'lucide-react';

type Section = 'overview' | 'prd' | 'tech' | 'design' | 'goals' | 'architecture';

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <BookOpen size={18} /> },
  { id: 'prd', label: 'Product Requirements', icon: <FileText size={18} /> },
  { id: 'tech', label: 'Technical Design', icon: <Code2 size={18} /> },
  { id: 'design', label: 'Design System', icon: <Palette size={18} /> },
  { id: 'goals', label: 'Goals & Metrics', icon: <Target size={18} /> },
  { id: 'architecture', label: 'Architecture', icon: <Layers size={18} /> },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
              <Zap size={18} className="text-slate-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">NextJob</h1>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Apply with Proof</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Seed MVP
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
              v1.0 Draft
            </span>
          </div>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <AnimatePresence>
          {(mobileNavOpen || true) && (
            <motion.aside
              className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800/60 bg-slate-950/95 backdrop-blur-xl overflow-y-auto transition-transform md:translate-x-0 ${
                mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
              }`}
            >
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setMobileNavOpen(false); }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      activeSection === item.id
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="border-t border-slate-800/60 p-4 mt-4">
                <div className="rounded-lg bg-slate-900/50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Evidence</span>
                    <span className="text-xs font-medium text-amber-400">Unvalidated</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Delivery</span>
                    <span className="text-xs font-medium text-emerald-400">Build-ready</span>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)]">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'overview' && <OverviewSection />}
                {activeSection === 'prd' && <PRDSection />}
                {activeSection === 'tech' && <TechSection />}
                {activeSection === 'design' && <DesignSection />}
                {activeSection === 'goals' && <GoalsSection />}
                {activeSection === 'architecture' && <ArchitectureSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─── Overview Section ─── */
function OverviewSection() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              Trustworthy AI Career Agent
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Apply with <span className="text-emerald-400">proof.</span>
          </h2>
          <p className="max-w-2xl text-lg text-slate-400 leading-relaxed">
            NextJob is an AI career agent that converts verified career evidence into eligible, high-quality applications and measurable interview outcomes—while keeping the user in control of every consequential decision.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <StatusBadge label="Evidence" value="Unvalidated" color="amber" />
            <StatusBadge label="Delivery" value="Build-ready" color="emerald" />
            <StatusBadge label="Stage" value="Seed MVP" color="cyan" />
            <StatusBadge label="Platform" value="Web + Extension" color="violet" />
          </div>
        </div>
      </div>

      {/* Core Differentiators */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-white">Core Differentiation</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: <ShieldCheck size={20} />, title: 'Evidence-backed Career Graph', desc: 'Every claim traces to verified proof' },
            { icon: <Scale size={20} />, title: 'Eligibility Before Application', desc: 'Never apply where ineligible' },
            { icon: <Eye size={20} />, title: 'No Fabricated Claims', desc: 'AI constrained to verified evidence' },
            { icon: <Lock size={20} />, title: 'Risk-based Automation', desc: 'Sensitive answers require explicit approval' },
            { icon: <CheckCircle2 size={20} />, title: 'Verified Submission Receipts', desc: 'Proof of every application submitted' },
            { icon: <Globe size={20} />, title: 'Global Capability Transparency', desc: 'Clear labels for what works where' },
          ].map((item, i) => (
            <div key={i} className="group rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 transition-all hover:border-slate-700 hover:bg-slate-900/60">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <p className="mt-0.5 text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem Statement */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-white">Problem Statement</h3>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'Fragmented job discovery with irrelevant opportunities',
              'Repetitive applications with poor personalization',
              'AI hallucinating experience candidates don\'t have',
              'Work-authorization uncertainty causing wasted effort',
              'Unsafe auto-apply tools causing duplicate submissions',
              'No reliable learning from application outcomes',
              'Institutions lack privacy-safe visibility into outcomes',
              'No explainability for automated decisions',
            ].map((problem, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400/70" />
                <span className="text-sm text-slate-300">{problem}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-white">Target Users</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { persona: 'P1', name: 'Active Professional', need: 'Better opportunities with less repetitive work', color: 'emerald' },
            { persona: 'P2', name: 'International Candidate', need: 'Work-authorization & sponsorship clarity', color: 'cyan' },
            { persona: 'P3', name: 'Graduate', need: 'Translate education/projects into credible applications', color: 'violet' },
            { persona: 'P4', name: 'Career Changer', need: 'Transferable skills mapped without exaggeration', color: 'amber' },
          ].map((user) => (
            <div key={user.persona} className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md bg-${user.color}-500/10 text-xs font-bold text-${user.color}-400`}>
                  {user.persona}
                </span>
                <span className="text-sm font-semibold text-white">{user.name}</span>
              </div>
              <p className="text-xs text-slate-400">{user.need}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product Principles */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-white">Product Principles</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'Truth before automation',
            'Eligibility before ranking',
            'Quality before volume',
            'Evidence before generation',
            'Deterministic rules before AI',
            'Human control proportional to risk',
            'Unknown before guessing',
            'No proof = no verified submission',
            'Privacy by default',
            'Explain consequential decisions',
          ].map((principle, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300">
              <CheckCircle2 size={12} className="text-emerald-400" />
              {principle}
            </span>
          ))}
        </div>
      </section>

      {/* Readiness */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-white">Readiness Assessment</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-amber-400">Evidence</h4>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">Unvalidated</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Material problem, customer, and value assumptions remain unclear. Requires real-world validation experiments before market claims.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-emerald-400">Delivery</h4>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">Build-ready</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              MVP requirements, UX flows, architecture, and acceptance criteria are sufficient to begin implementation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── PRD Section ─── */
function PRDSection() {
  return (
    <div className="space-y-10">
      <PageHeader title="Product Requirements" subtitle="What we're building and why" icon={<FileText size={24} />} />

      {/* Overview */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Overview</h3>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong className="text-white">Problem:</strong> Job seekers face fragmented discovery, irrelevant opportunities, repetitive applications, AI hallucination, work-authorization uncertainty, and no outcome learning.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong className="text-white">Value:</strong> Convert verified career evidence into eligible, high-quality applications with measurable interview outcomes.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong className="text-white">Differentiation:</strong> Evidence-constrained generation, eligibility-before-application, verified submission receipts, and global capability transparency.
          </p>
        </div>
      </section>

      {/* Goals */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Goals</h3>
        <div className="space-y-2">
          {[
            { id: 'G-01', goal: 'Increase qualified interview conversion', metric: 'Verified Qualified Interview Rate' },
            { id: 'G-02', goal: 'Reduce application effort', metric: 'Approval effort/application' },
            { id: 'G-03', goal: 'Prevent unsupported claims', metric: 'Unsupported-claim rate = 0' },
            { id: 'G-04', goal: 'Prevent ineligible applications', metric: 'Eligibility false-positive rate' },
            { id: 'G-05', goal: 'Verify every submission', metric: 'Verified submission rate ≥ 98%' },
            { id: 'G-06', goal: 'Prevent duplicate submissions', metric: 'Duplicate rate ≥ 95% prevention' },
          ].map((g) => (
            <div key={g.id} className="flex items-start gap-3 rounded-lg border border-slate-800/40 bg-slate-900/30 p-3">
              <span className="shrink-0 rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-400">{g.id}</span>
              <div>
                <p className="text-sm text-white">{g.goal}</p>
                <p className="text-xs text-slate-500 mt-0.5">Metric: {g.metric}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MVP Scope */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">MVP Scope</h3>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {[
              'Authentication & CV import',
              'Career Graph with evidence',
              'Eligibility engine',
              'Job ingestion & normalization',
              'Matching & ranking',
              'Tailoring engine',
              'Risk & policy engine',
              'Approval workflow',
              'Browser extension',
              'ATS execution & receipts',
              'Application tracker',
              'Organizations & cohorts',
              'Billing (Stripe)',
              'Analytics & audit',
              'Privacy controls',
              'Notifications',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Non-Goals */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Non-Goals (MVP)</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'Mass-application spam',
            'LinkedIn automation',
            'CAPTCHA bypass',
            'Immigration/legal advice',
            'Recruiter marketplace',
            'Employer ATS',
            'Native mobile app',
            'Autonomous browser agent',
            'Custom foundation model',
            'Interview cheating',
          ].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-300">
              <X size={12} />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Critical Flows */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Critical User Journey</h3>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              'Sign Up', 'Import CV', 'Build Career Graph', 'Verify Claims',
              'Set Preferences', 'Set Eligibility', 'Discover Jobs', 'Eligibility Gate',
              'Rank', 'Review Match', 'Tailor', 'Risk Check', 'Approve',
              'Execute', 'Verify Submission', 'Track', 'Interview', 'Outcome', 'Learn'
            ].map((step, i, arr) => (
              <span key={i} className="flex items-center gap-2">
                <span className="rounded-md bg-slate-800 px-2 py-1 text-slate-300 font-medium">{step}</span>
                {i < arr.length - 1 && <ChevronRight size={12} className="text-slate-600" />}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Key Requirements</h3>
        <div className="space-y-3">
          {[
            { id: 'FR-01', level: 'Must', text: 'Every generated factual statement MUST map to verified evidence in the Career Graph.' },
            { id: 'FR-02', level: 'Must', text: 'Eligibility MUST be evaluated before ranking. Unknown MUST NOT silently become Eligible.' },
            { id: 'FR-03', level: 'Must', text: 'Sensitive fields (demographics, disability, health) MUST require explicit user-only input.' },
            { id: 'FR-04', level: 'Must', text: 'Every verified submission MUST produce a receipt with confirmation evidence.' },
            { id: 'FR-05', level: 'Must', text: 'Duplicate applications MUST be prevented via idempotency and unique constraints.' },
            { id: 'FR-06', level: 'Must', text: 'Every automated action MUST be explainable with reason, source, and evidence.' },
            { id: 'FR-07', level: 'Should', text: 'Application answers SHOULD be stored for reuse with scope, risk level, and expiration.' },
            { id: 'FR-08', level: 'Should', text: 'Organization reporting SHOULD be aggregate-only with minimum cohort thresholds.' },
          ].map((req) => (
            <div key={req.id} className="flex items-start gap-3 rounded-lg border border-slate-800/40 bg-slate-900/30 p-3">
              <span className="shrink-0 rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-400">{req.id}</span>
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                req.level === 'Must' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
              }`}>{req.level}</span>
              <span className="text-sm text-slate-300">{req.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Acceptance Criteria */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Launch Acceptance Criteria</h3>
        <div className="space-y-2">
          {[
            '0 unsupported sensitive claims in evaluation suite',
            '100% sensitive-field approval enforcement',
            '≥95% supported-form field accuracy',
            '≥98% receipt generation for supported connectors',
            '≥95% duplicate prevention',
            'Tenant isolation penetration-tested',
            'Export/delete tested',
            'Backup/restore tested',
            'Disaster recovery tested',
            'WCAG critical journeys tested',
            'Every connector monitored with kill switch',
            'AI regression suite passing',
          ].map((criteria, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-900/30 px-3 py-2">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
              <span className="text-sm text-slate-300">{criteria}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Risks */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Key Risks & Mitigations</h3>
        <div className="space-y-2">
          {[
            { risk: 'AI fabrication', mitigation: 'Evidence-constrained generation' },
            { risk: 'Wrong eligibility', mitigation: 'Rules + provenance + Unknown fallback' },
            { risk: 'ATS changes', mitigation: 'Versioned connectors + synthetic tests' },
            { risk: 'Duplicate applications', mitigation: 'Idempotency + DB uniqueness' },
            { risk: 'Sensitive-data exposure', mitigation: 'Isolated vault + RBAC' },
            { risk: 'Prompt injection', mitigation: 'Untrusted-content isolation' },
            { risk: 'User distrust', mitigation: 'Explainability + receipts' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-800/40 bg-slate-900/30 p-3">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-white">{item.risk}</p>
                <p className="text-xs text-slate-400">→ {item.mitigation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Tech Section ─── */
function TechSection() {
  return (
    <div className="space-y-10">
      <PageHeader title="Technical Design" subtitle="How we build it" icon={<Code2 size={24} />} />

      {/* Architecture */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Architecture</h3>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white">
                <Globe size={14} className="text-cyan-400" />
                Web / Extension / Partner Portal
              </div>
            </div>
            <div className="flex justify-center">
              <div className="h-8 w-px bg-slate-700" />
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300">
                <Shield size={14} className="text-emerald-400" />
                Edge / API / Auth
              </div>
            </div>
            <div className="flex justify-center">
              <div className="h-8 w-px bg-slate-700" />
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Modular Monolith</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {['Identity', 'Career Graph', 'Evidence', 'Jobs', 'Eligibility', 'Matching', 'Tailoring', 'Policy/Risk', 'Approvals', 'Applications', 'Receipts', 'Outcomes', 'Organizations', 'Billing', 'Notifications'].map((mod) => (
                  <span key={mod} className="rounded-md bg-slate-900/60 px-2 py-1.5 text-xs text-slate-300 text-center">{mod}</span>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="h-8 w-px bg-slate-700" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 text-center">
                <Workflow size={16} className="mx-auto mb-1 text-violet-400" />
                <p className="text-xs font-medium text-slate-300">Temporal Workers</p>
                <p className="text-[10px] text-slate-500">Connector execution</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 text-center">
                <Brain size={16} className="mx-auto mb-1 text-amber-400" />
                <p className="text-xs font-medium text-slate-300">AI Gateway</p>
                <p className="text-[10px] text-slate-500">Model routing + evals</p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="h-8 w-px bg-slate-700" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 text-center">
                <Database size={16} className="mx-auto mb-1 text-cyan-400" />
                <p className="text-xs font-medium text-slate-300">PostgreSQL + pgvector</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 text-center">
                <Server size={16} className="mx-auto mb-1 text-emerald-400" />
                <p className="text-xs font-medium text-slate-300">S3 + Valkey</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stack */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Technology Stack</h3>
        <div className="overflow-hidden rounded-xl border border-slate-800/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Layer</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Technology</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[
                { layer: 'Web', tech: 'Next.js + TypeScript', status: 'Provisional' },
                { layer: 'UI', tech: 'shadcn/ui + Radix + Tailwind', status: 'Provisional' },
                { layer: 'Forms', tech: 'React Hook Form + Zod', status: 'Provisional' },
                { layer: 'Extension', tech: 'WXT', status: 'Provisional' },
                { layer: 'Backend', tech: 'Fastify', status: 'Provisional' },
                { layer: 'Database', tech: 'PostgreSQL + pgvector', status: 'Provisional' },
                { layer: 'ORM', tech: 'Drizzle', status: 'Provisional' },
                { layer: 'Workflow', tech: 'Temporal', status: 'Provisional' },
                { layer: 'AI', tech: 'Vercel AI SDK + provider abstraction', status: 'Provisional' },
                { layer: 'AI Observability', tech: 'Langfuse + OpenTelemetry', status: 'Provisional' },
                { layer: 'Cache', tech: 'Valkey', status: 'Provisional' },
                { layer: 'Storage', tech: 'S3', status: 'Provisional' },
                { layer: 'Analytics', tech: 'PostHog', status: 'Provisional' },
                { layer: 'Billing', tech: 'Stripe', status: 'Provisional' },
                { layer: 'Infrastructure', tech: 'AWS + Vercel', status: 'Provisional' },
              ].map((row, i) => (
                <tr key={i} className="bg-slate-900/20">
                  <td className="px-4 py-2 text-slate-300 font-medium">{row.layer}</td>
                  <td className="px-4 py-2 text-slate-400">{row.tech}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* AI Pipeline */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">AI Pipeline</h3>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              'Request', 'Policy Check', 'Retrieve Evidence', 'Model Router',
              'Structured Generation', 'Schema Validation', 'Evidence Validation',
              'Risk Validation', 'Human Approval', 'Execution'
            ].map((step, i, arr) => (
              <span key={i} className="flex items-center gap-2">
                <span className={`rounded-md px-2 py-1 font-medium ${
                  step.includes('Human') ? 'bg-amber-500/10 text-amber-400' :
                  step.includes('Evidence') ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-slate-800 text-slate-300'
                }`}>{step}</span>
                {i < arr.length - 1 && <ArrowRight size={12} className="text-slate-600" />}
              </span>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-slate-800/40 p-3">
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">AI performs:</strong> Extraction, classification, semantic matching, requirement interpretation, evidence-constrained generation, answer drafting, message classification, interview preparation.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              <strong className="text-slate-300">AI does NOT control:</strong> Consent, authorization, sensitive-field policy, eligibility rules, submission truth, duplicate prevention, payments, tenant access, data deletion.
            </p>
          </div>
        </div>
      </section>

      {/* Data Model */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Core Data Model</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { group: 'Identity', items: ['User', 'Identity', 'Organization', 'Cohort', 'Entitlement'] },
            { group: 'Career', items: ['CareerProfile', 'CareerClaim', 'Evidence', 'Preference', 'Policy'] },
            { group: 'Jobs', items: ['Company', 'Job', 'JobSource', 'JobRequirement', 'EligibilityAssessment', 'Match'] },
            { group: 'Applications', items: ['ApplicationPlan', 'ApplicationField', 'Answer', 'Approval', 'SubmissionAttempt', 'Receipt'] },
            { group: 'Outcomes', items: ['Message', 'Outcome', 'Interview'] },
            { group: 'System', items: ['Experiment', 'Notification', 'AuditEvent', 'Connector'] },
          ].map((group) => (
            <div key={group.group} className="rounded-lg border border-slate-800/40 bg-slate-900/30 p-3">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">{group.group}</h4>
              <div className="flex flex-wrap gap-1">
                {group.items.map((item) => (
                  <span key={item} className="rounded bg-slate-800/60 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Security & Privacy</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Lock size={16} className="text-emerald-400" /> Security Controls
            </h4>
            <ul className="space-y-1.5">
              {['TLS everywhere', 'Encryption at rest', 'KMS-managed keys', 'Tenant isolation', 'RBAC + least privilege', 'OAuth scope minimization', 'PII redaction in prompts', 'Prompt-injection defenses', 'Immutable audit events'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="h-1 w-1 rounded-full bg-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Shield size={16} className="text-cyan-400" /> Privacy Rights
            </h4>
            <ul className="space-y-1.5">
              {['View stored data', 'Correct data', 'Export data', 'Delete data', 'Revoke consent', 'Disconnect integrations', 'Disable learning', 'Control retention', 'No private data sales'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="h-1 w-1 rounded-full bg-cyan-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Reliability */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Reliability Targets</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'API Availability', value: '99.9%', icon: <Clock size={16} /> },
            { label: 'Duplicate Submissions', value: '0', icon: <ShieldCheck size={16} /> },
            { label: 'RPO', value: '≤15 min', icon: <Database size={16} /> },
            { label: 'RTO', value: '≤4 hours', icon: <Server size={16} /> },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                {item.icon}
              </div>
              <p className="text-lg font-bold text-white">{item.value}</p>
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Design Section ─── */
function DesignSection() {
  return (
    <div className="space-y-10">
      <PageHeader title="Design System" subtitle="Visual identity and component rules" icon={<Palette size={24} />} />

      {/* Colors */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Color Tokens</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Primary', value: '#10b981', usage: 'Brand actions, success states, CTAs' },
            { name: 'Secondary', value: '#06b6d4', usage: 'Information, links, accents' },
            { name: 'Surface', value: '#0f172a', usage: 'Backgrounds, cards, containers' },
            { name: 'Text Primary', value: '#f8fafc', usage: 'Headings, primary content' },
            { name: 'Text Secondary', value: '#94a3b8', usage: 'Body text, descriptions' },
            { name: 'Warning', value: '#f59e0b', usage: 'Caution states, pending actions' },
            { name: 'Error', value: '#ef4444', usage: 'Errors, destructive actions, risks' },
            { name: 'Border', value: '#1e293b', usage: 'Dividers, card borders' },
            { name: 'Success', value: '#22c55e', usage: 'Verified states, completions' },
          ].map((color) => (
            <div key={color.name} className="rounded-lg border border-slate-800/40 bg-slate-900/30 p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg border border-slate-700" style={{ backgroundColor: color.value }} />
                <div>
                  <p className="text-sm font-medium text-white">{color.name}</p>
                  <p className="text-xs font-mono text-slate-500">{color.value}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-400">{color.usage}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Typography</h3>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-4">
          {[
            { role: 'Display', family: 'Inter', size: '32px', weight: '700', sample: 'Apply with proof.' },
            { role: 'Heading 1', family: 'Inter', size: '24px', weight: '600', sample: 'Career Graph' },
            { role: 'Heading 2', family: 'Inter', size: '20px', weight: '600', sample: 'Eligibility Check' },
            { role: 'Body', family: 'Inter', size: '14px', weight: '400', sample: 'Your application has been verified and submitted.' },
            { role: 'Caption', family: 'Inter', size: '12px', weight: '500', sample: 'Last updated 2 minutes ago' },
            { role: 'Mono', family: 'JetBrains Mono', size: '13px', weight: '400', sample: 'claim_id: 7f3a...b2c1' },
          ].map((typo) => (
            <div key={typo.role} className="flex items-baseline justify-between border-b border-slate-800/40 pb-3 last:border-0 last:pb-0">
              <div>
                <span className="text-xs font-medium text-emerald-400">{typo.role}</span>
                <span className="ml-2 text-[10px] text-slate-500 font-mono">{typo.family} {typo.size}/{typo.weight}</span>
              </div>
              <span className="text-sm text-slate-300" style={{ fontFamily: typo.family === 'JetBrains Mono' ? 'monospace' : 'inherit', fontSize: typo.size, fontWeight: Number(typo.weight) }}>
                {typo.sample}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing & Layout */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Layout & Spacing</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
            <h4 className="text-sm font-semibold text-white mb-3">Spacing Scale</h4>
            <div className="space-y-2">
              {[
                { token: 'xs', value: '4px', desc: 'Tight inline spacing' },
                { token: 'sm', value: '8px', desc: 'Compact elements' },
                { token: 'md', value: '16px', desc: 'Default component padding' },
                { token: 'lg', value: '24px', desc: 'Section spacing' },
                { token: 'xl', value: '32px', desc: 'Page sections' },
                { token: '2xl', value: '48px', desc: 'Major section breaks' },
              ].map((s) => (
                <div key={s.token} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-mono text-emerald-400">{s.token}</span>
                  <div className="h-2 rounded bg-emerald-500/30" style={{ width: `${parseInt(s.value)}px` }} />
                  <span className="text-xs text-slate-400">{s.value} — {s.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
            <h4 className="text-sm font-semibold text-white mb-3">Border Radius</h4>
            <div className="space-y-3">
              {[
                { token: 'sm', value: '6px', desc: 'Badges, small elements' },
                { token: 'md', value: '8px', desc: 'Buttons, inputs' },
                { token: 'lg', value: '12px', desc: 'Cards, modals' },
                { token: 'xl', value: '16px', desc: 'Sections, hero' },
                { token: 'full', value: '9999px', desc: 'Avatars, pills' },
              ].map((r) => (
                <div key={r.token} className="flex items-center gap-3">
                  <div className="h-8 w-8 border-2 border-emerald-400/40 bg-emerald-500/5" style={{ borderRadius: r.value }} />
                  <div>
                    <span className="text-xs font-mono text-emerald-400">{r.token} ({r.value})</span>
                    <p className="text-[10px] text-slate-500">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Components */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Component Patterns</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: 'Job Card', states: ['Default', 'Hover', 'Eligible', 'Ineligible', 'Loading'], desc: 'Displays job match with fit, eligibility, evidence coverage, and action buttons.' },
            { name: 'Approval Dialog', states: ['Default', 'Expanded', 'Approved', 'Rejected'], desc: 'Shows question, proposed answer, evidence source, risk level, and action buttons.' },
            { name: 'Evidence Badge', states: ['Verified', 'Unverified', 'Missing', 'Expired'], desc: 'Indicates evidence status for any career claim.' },
            { name: 'Submission Receipt', states: ['Verified', 'Unverified', 'Pending', 'Failed'], desc: 'Proof of application submission with hash references.' },
            { name: 'Eligibility Gate', states: ['Eligible', 'Unknown', 'Ineligible'], desc: 'Pre-application gate showing eligibility with reason and source.' },
            { name: 'Risk Indicator', states: ['Low', 'Medium', 'High', 'Sensitive', 'Blocked'], desc: 'Color-coded risk level for application fields.' },
          ].map((comp) => (
            <div key={comp.name} className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
              <h4 className="text-sm font-semibold text-white mb-1">{comp.name}</h4>
              <p className="text-xs text-slate-400 mb-3">{comp.desc}</p>
              <div className="flex flex-wrap gap-1">
                {comp.states.map((state) => (
                  <span key={state} className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{state}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Do's and Don'ts */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Design Rules</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <h4 className="text-sm font-semibold text-emerald-400 mb-3">Do's</h4>
            <ul className="space-y-2">
              {[
                'Show evidence provenance for every claim',
                'Use color only as reinforcement, never sole indicator',
                'Make every consequential action explainable',
                'Keep approval dialogs focused on one decision',
                'Use verified/unverified states consistently',
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-400" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <h4 className="text-sm font-semibold text-red-400 mb-3">Don'ts</h4>
            <ul className="space-y-2">
              {[
                'Never hide eligibility failures',
                'Never use color-only for risk levels',
                'Never auto-approve sensitive fields',
                'Never show unverified claims as verified',
                'Never bury rejection reasons',
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <X size={12} className="mt-0.5 shrink-0 text-red-400" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Goals Section ─── */
function GoalsSection() {
  return (
    <div className="space-y-10">
      <PageHeader title="Goals & Metrics" subtitle="How we measure success" icon={<Target size={24} />} />

      {/* North Star */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">North Star Metric</h3>
        <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp size={20} className="text-emerald-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Verified Qualified Interview Rate</h4>
              <p className="text-xs text-slate-400">Primary measure of product value</p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-900/60 p-4 font-mono text-sm text-center">
            <span className="text-emerald-400">Verified Qualified Interviews</span>
            <span className="text-slate-500"> / </span>
            <span className="text-cyan-400">Eligible Verified Applications</span>
          </div>
        </div>
      </section>

      {/* Supporting Metrics */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Supporting Metrics</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { metric: 'Activation rate', purpose: 'Product onboarding quality', icon: <Users size={14} /> },
            { metric: 'Eligibility false-positive rate', purpose: 'Matching safety', icon: <Scale size={14} /> },
            { metric: 'Unsupported-claim rate', purpose: 'AI truthfulness', icon: <Eye size={14} /> },
            { metric: 'Verified submission rate', purpose: 'Execution reliability', icon: <CheckCircle2 size={14} /> },
            { metric: 'Duplicate submission rate', purpose: 'Execution safety', icon: <ShieldCheck size={14} /> },
            { metric: 'Approval effort/application', purpose: 'UX efficiency', icon: <Workflow size={14} /> },
            { metric: 'Interview lift vs control', purpose: 'Actual product value', icon: <TrendingUp size={14} /> },
            { metric: 'Contribution margin/user', purpose: 'Business sustainability', icon: <BarChart3 size={14} /> },
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-800/40 bg-slate-900/30 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                {m.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{m.metric}</p>
                <p className="text-xs text-slate-500">{m.purpose}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Anti-metrics */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Anti-Metrics (Do Not Optimize)</h3>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-xs text-slate-400 mb-3">These metrics are explicitly excluded from optimization unless they demonstrably improve outcomes:</p>
          <div className="flex flex-wrap gap-2">
            {['Applications/day', 'AI generations/user', 'Time spent in app', 'Notifications opened', 'Jobs viewed'].map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-300">
                <X size={12} />
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Monetization */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Monetization</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
            <h4 className="text-sm font-semibold text-white mb-2">Free</h4>
            <ul className="space-y-1">
              {['Career Graph', 'Job discovery', 'Eligibility', 'Tracker', 'Limited applications'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={10} className="text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <h4 className="text-sm font-semibold text-emerald-400 mb-1">Search Pass</h4>
            <p className="text-xs text-slate-500 mb-2">~$39 / 30 days</p>
            <ul className="space-y-1">
              {['Full matching', 'Tailoring', 'Assisted applications', 'Tracking', 'Receipts'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={10} className="text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
            <h4 className="text-sm font-semibold text-violet-400 mb-1">Agent Pass</h4>
            <p className="text-xs text-slate-500 mb-2">Coming next</p>
            <ul className="space-y-1">
              {['Safe Autopilot', 'Advanced automation', 'Outcome optimization'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={10} className="text-violet-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Validation */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Validation Experiments</h3>
        <div className="space-y-2">
          {[
            { hypothesis: 'Evidence-constrained applications produce higher interview rates than unconstrained AI', method: 'A/B test', sample: 'TBD', metric: 'Interview rate', threshold: 'TBD' },
            { hypothesis: 'Eligibility gating reduces wasted applications', method: 'Cohort comparison', sample: 'TBD', metric: 'Application-to-interview ratio', threshold: 'TBD' },
            { hypothesis: 'Users prefer Copilot over Manual mode', method: 'Feature flag experiment', sample: 'TBD', metric: 'Mode adoption rate', threshold: 'TBD' },
          ].map((exp, i) => (
            <div key={i} className="rounded-lg border border-slate-800/40 bg-slate-900/30 p-4">
              <p className="text-sm text-white font-medium mb-2">{exp.hypothesis}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Method</p>
                  <p className="text-xs text-slate-300">{exp.method}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Sample</p>
                  <p className="text-xs text-slate-300">{exp.sample}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Metric</p>
                  <p className="text-xs text-slate-300">{exp.metric}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Threshold</p>
                  <p className="text-xs text-slate-300">{exp.threshold}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Architecture Section ─── */
function ArchitectureSection() {
  return (
    <div className="space-y-10">
      <PageHeader title="Architecture Deep Dive" subtitle="System design and data flows" icon={<Layers size={24} />} />

      {/* Application State Machine */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Application State Machine</h3>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Progress States</p>
              <div className="flex flex-wrap gap-1.5">
                {['DISCOVERED', 'NORMALIZED', 'ELIGIBILITY_CHECKED', 'MATCHED', 'PLANNED', 'TAILORED', 'POLICY_CHECKED', 'NEEDS_APPROVAL', 'READY', 'EXECUTING', 'SUBMITTED_UNVERIFIED', 'SUBMITTED_VERIFIED'].map((state) => (
                  <span key={state} className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-mono font-medium text-emerald-400">{state}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Outcome States</p>
              <div className="flex flex-wrap gap-1.5">
                {['INTERVIEW', 'REJECTED', 'OFFER', 'WITHDRAWN', 'HIRED'].map((state) => (
                  <span key={state} className="rounded-md bg-cyan-500/10 px-2 py-1 text-[10px] font-mono font-medium text-cyan-400">{state}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Exception States</p>
              <div className="flex flex-wrap gap-1.5">
                {['BLOCKED', 'NEEDS_USER', 'FAILED_RETRYABLE', 'NEEDS_RECONCILIATION', 'FAILED_FINAL', 'CANCELLED'].map((state) => (
                  <span key={state} className="rounded-md bg-amber-500/10 px-2 py-1 text-[10px] font-mono font-medium text-amber-400">{state}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Engine */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Risk & Policy Engine</h3>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Risk Levels</h4>
          <div className="space-y-2 mb-6">
            {[
              { level: 'Low', example: 'Name, email, verified dates', action: 'Auto-fill', color: 'emerald' },
              { level: 'Medium', example: 'Notice period, relocation', action: 'Saved policy / contextual review', color: 'cyan' },
              { level: 'High', example: 'Sponsorship, clearance', action: 'Explicit approval required', color: 'amber' },
              { level: 'Sensitive', example: 'Demographics, disability, health', action: 'User-only input', color: 'red' },
              { level: 'Unsupported', example: 'Unknown qualification', action: 'Block', color: 'slate' },
            ].map((risk) => (
              <div key={risk.level} className="flex items-center gap-3 rounded-lg bg-slate-900/40 p-3">
                <span className={`w-16 shrink-0 rounded px-2 py-0.5 text-center text-xs font-bold ${
                  risk.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                  risk.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' :
                  risk.color === 'amber' ? 'bg-amber-500/10 text-amber-400' :
                  risk.color === 'red' ? 'bg-red-500/10 text-red-400' :
                  'bg-slate-700 text-slate-300'
                }`}>{risk.level}</span>
                <span className="text-xs text-slate-400 flex-1">{risk.example}</span>
                <span className="text-xs text-slate-300 font-medium">{risk.action}</span>
              </div>
            ))}
          </div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Policy Precedence</h4>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {['Legal/Safety Rule', 'Platform Rule', 'Evidara Policy', 'Organization Policy', 'User Policy', 'Application Context'].map((policy, i, arr) => (
              <span key={policy} className="flex items-center gap-2">
                <span className="rounded-md bg-slate-800 px-2 py-1 text-slate-300 font-medium">{policy}</span>
                {i < arr.length - 1 && <ChevronRight size={12} className="text-slate-600" />}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500 italic">Higher-level restrictions cannot be overridden by lower levels.</p>
        </div>
      </section>

      {/* Automation Modes */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Automation Modes</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center">
                <Users size={16} className="text-slate-300" />
              </div>
              <h4 className="text-sm font-semibold text-white">Manual</h4>
            </div>
            <p className="text-xs text-slate-400">Evidara prepares materials; user submits manually.</p>
          </div>
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <GitBranch size={16} className="text-cyan-400" />
              </div>
              <h4 className="text-sm font-semibold text-cyan-400">Copilot</h4>
            </div>
            <p className="text-xs text-slate-400">Evidara fills/prepares; user reviews consequential actions.</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Zap size={16} className="text-emerald-400" />
              </div>
              <h4 className="text-sm font-semibold text-emerald-400">Autopilot</h4>
            </div>
            <p className="text-xs text-slate-400">Evidara executes when all safety conditions pass.</p>
            <div className="mt-2 space-y-1">
              {['Job is eligible', 'Evidence coverage passes', 'No unsupported claims', 'No sensitive approvals outstanding', 'Duplicate check passes'].map((cond, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <CheckCircle2 size={10} className="text-emerald-400" />
                  {cond}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Global Capability Model */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Global Capability Model</h3>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
          <p className="text-xs text-slate-400 mb-4">Every job displays capability across these dimensions:</p>
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60">
                  <th className="px-3 py-2 text-left text-slate-400 font-semibold">Dimension</th>
                  <th className="px-3 py-2 text-left text-slate-400 font-semibold">Possible Values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[
                  { dim: 'Eligibility', values: 'Eligible / Unknown / Ineligible' },
                  { dim: 'Fit', values: 'Strong / Medium / Weak' },
                  { dim: 'Evidence', values: 'Complete / Missing' },
                  { dim: 'Execution', values: 'Verified / Assisted / Manual' },
                  { dim: 'Language', values: 'Supported / Review Required' },
                  { dim: 'Automation', values: 'Manual / Copilot / Autopilot' },
                  { dim: 'Freshness', values: 'Fresh / Aging / Unknown' },
                ].map((row, i) => (
                  <tr key={i} className="bg-slate-900/20">
                    <td className="px-3 py-2 font-medium text-white">{row.dim}</td>
                    <td className="px-3 py-2 text-slate-400">{row.values}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Domain Events */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Domain Events</h3>
        <div className="flex flex-wrap gap-1.5">
          {[
            'UserActivated', 'ClaimVerified', 'EvidenceAdded', 'JobNormalized', 'JobExpired',
            'EligibilityAssessed', 'MatchRanked', 'ApplicationPlanned', 'ApplicationTailored',
            'ApprovalRequested', 'ApprovalGranted', 'SubmissionStarted', 'SubmissionAcknowledged',
            'SubmissionVerified', 'SubmissionFailed', 'ManualHandoffRequired', 'RecruiterMessageReceived',
            'InterviewVerified', 'OutcomeRecorded', 'PolicyChanged', 'DeletionRequested'
          ].map((event) => (
            <span key={event} className="rounded-md bg-slate-800/60 px-2 py-1 text-[10px] font-mono text-slate-400 border border-slate-700/40">
              {event}
            </span>
          ))}
        </div>
      </section>

      {/* Rollout */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Rollout Plan</h3>
        <div className="space-y-3">
          {[
            { phase: 'Phase 1 — MVP', items: ['Identity', 'Career Graph', 'Evidence', 'Jobs', 'Eligibility', 'Matching', 'Tailoring', 'Risk engine', 'Approvals', 'Extension', 'Execution', 'Receipts', 'Tracker', 'Organizations', 'Billing', 'Admin', 'Analytics'], status: 'current' },
            { phase: 'Phase 2', items: ['Email outcomes', 'Interview preparation', 'Additional ATSs', 'Localization', 'Experiments'], status: 'next' },
            { phase: 'Phase 3', items: ['Safe Autopilot', 'Outcome-informed ranking', 'Expanded eligibility', 'B2B integrations', 'Career Vault'], status: 'later' },
          ].map((phase) => (
            <div key={phase.phase} className={`rounded-xl border p-5 ${
              phase.status === 'current' ? 'border-emerald-500/20 bg-emerald-500/5' :
              phase.status === 'next' ? 'border-cyan-500/20 bg-cyan-500/5' :
              'border-slate-800/60 bg-slate-900/40'
            }`}>
              <h4 className={`text-sm font-semibold mb-2 ${
                phase.status === 'current' ? 'text-emerald-400' :
                phase.status === 'next' ? 'text-cyan-400' :
                'text-slate-400'
              }`}>{phase.phase}</h4>
              <div className="flex flex-wrap gap-1.5">
                {phase.items.map((item) => (
                  <span key={item} className="rounded bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-300">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Shared Components ─── */
function PageHeader({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function StatusBadge({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${colorClasses[color]}`}>
      <span className="text-slate-500">{label}:</span> {value}
    </span>
  );
}
