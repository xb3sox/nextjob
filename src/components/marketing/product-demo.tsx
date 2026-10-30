import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';

export type DemoStepId = 'eligibility' | 'tailoring' | 'extension' | 'receipt';

export interface DemoStepMeta {
  id: DemoStepId;
  label: string;
  badge: string;
  summary: string;
}

export const DEMO_STEPS: DemoStepMeta[] = [
  {
    id: 'eligibility',
    label: '1. Eligibility Check',
    badge: 'Deterministic',
    summary: 'Hard constraint evaluation against 10 criteria before spending 1 minute applying.',
  },
  {
    id: 'tailoring',
    label: '2. Evidence Tailoring',
    badge: 'Provenance-Bound',
    summary: 'Every bullet point traces directly to a verified claim. Zero fabricated skills.',
  },
  {
    id: 'extension',
    label: '3. 1-Click Autofill',
    badge: 'Browser Extension',
    summary: 'Securely answers complex ATS questionnaires from your verified vault.',
  },
  {
    id: 'receipt',
    label: '4. Frozen Receipt',
    badge: 'Cryptographic Proof',
    summary: 'SHA-256 tamper-proof record of answers, tailoring, and timestamped submission state.',
  },
];

export interface CriterionResult {
  name: string;
  status: 'passed' | 'review';
  detail: string;
  reason: string;
}

export const MOCK_CRITERIA: CriterionResult[] = [
  {
    name: 'Work Authorization',
    status: 'passed',
    detail: 'US Citizen / Permanent Resident',
    reason: 'Matches requirement: US work authorization required without sponsorship.',
  },
  {
    name: 'Seniority & Experience',
    status: 'passed',
    detail: '7+ years (Req: 5+ years)',
    reason: 'Verified CareerClaims confirm 8.2 years relevant frontend systems engineering.',
  },
  {
    name: 'Core Tech Stack',
    status: 'passed',
    detail: 'TypeScript, React, Performance',
    reason: 'Strong evidence of React concurrency, design systems, and Web Vitals optimization.',
  },
  {
    name: 'Target Compensation',
    status: 'passed',
    detail: '$190k - $220k (Band: $185k-$230k)',
    reason: 'Company posted salary falls within candidate preferred compensation band.',
  },
  {
    name: 'Location / Remote Policy',
    status: 'passed',
    detail: 'Remote (US Timezones)',
    reason: 'Candidate based in US Eastern; role offers nationwide US remote eligibility.',
  },
];

export interface ProductDemoProps {
  id?: string;
  className?: string;
}

export function ProductDemo({ id = 'interactive-demo', className = '' }: ProductDemoProps) {
  const [activeStep, setActiveStep] = useState<DemoStepId>('eligibility');
  const [tailorAccepted, setTailorAccepted] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  const activeIndex = DEMO_STEPS.findIndex((s) => s.id === activeStep);

  const handleNext = () => {
    if (activeIndex < DEMO_STEPS.length - 1) {
      setActiveStep(DEMO_STEPS[activeIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveStep(DEMO_STEPS[activeIndex - 1].id);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' && activeIndex < DEMO_STEPS.length - 1) {
      setActiveStep(DEMO_STEPS[activeIndex + 1].id);
    } else if (e.key === 'ArrowLeft' && activeIndex > 0) {
      setActiveStep(DEMO_STEPS[activeIndex - 1].id);
    }
  };

  const copyReceiptHash = () => {
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  return (
    <section
      id={id}
      aria-labelledby="demo-heading"
      className={`py-20 px-6 max-w-5xl mx-auto ${className}`.trim()}
    >
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-moss/10 text-moss border border-moss/20 mb-4">
          <Zap className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Interactive Product Tour</span>
        </div>
        <h2 id="demo-heading" className="font-display text-3xl sm:text-4xl text-paper mb-4">
          Experience NextJob in 60 seconds
        </h2>
        <p className="text-fog text-base leading-relaxed">
          No sign-up or credit card required. Explore how the eligibility engine, tailoring vault,
          and cryptographic receipts work on a live simulated application.
        </p>
      </div>

      {/* Demo Container */}
      <div className="rounded-2xl border border-white/10 bg-panel/90 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Step Navigation Bar */}
        <div
          role="tablist"
          aria-label="Product demo walkthrough steps"
          className="flex border-b border-white/10 bg-white/[0.02] overflow-x-auto scrollbar-none"
        >
          {DEMO_STEPS.map((step, idx) => {
            const isSelected = activeStep === step.id;
            return (
              <button
                key={step.id}
                role="tab"
                type="button"
                id={`tab-${step.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${step.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveStep(step.id)}
                onKeyDown={handleKeyDown}
                className={`flex-1 min-w-[180px] px-5 py-4 text-left transition-colors flex flex-col gap-1 border-r border-white/5 last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-inset ${
                  isSelected
                    ? 'bg-moss/[0.06] border-b-2 border-b-moss'
                    : 'hover:bg-white/[0.03] text-fog'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${isSelected ? 'text-moss' : 'text-fog/70'}`}
                  >
                    Step 0{idx + 1}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-mono text-fog/60">
                    {step.badge}
                  </span>
                </div>
                <div
                  className={`text-sm font-medium truncate ${
                    isSelected ? 'text-paper' : 'text-fog'
                  }`}
                >
                  {step.label.replace(/^\d+\.\s*/, '')}
                </div>
              </button>
            );
          })}
        </div>

        {/* Step Content Panels */}
        <div className="p-6 sm:p-8 min-h-[420px] flex flex-col justify-between">
          {/* Step 1: Eligibility Check */}
          {activeStep === 'eligibility' && (
            <div
              id="panel-eligibility"
              role="tabpanel"
              aria-labelledby="tab-eligibility"
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-moss uppercase tracking-wider">
                      Target Role
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-moss/20 text-moss">
                      96% Match • Eligible
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-paper">
                    Staff Frontend Systems Engineer
                  </h3>
                  <p className="text-xs text-fog">
                    Stripe • Remote (US) • $190,000 - $220,000 / yr
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-white/10 sm:pl-6">
                  <div className="text-xs text-fog mb-0.5">Eligibility Decision</div>
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-moss">
                    <CheckCircle2 className="w-4 h-4 text-moss" aria-hidden="true" />
                    <span>Hard Criteria Passed</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-fog uppercase tracking-wider mb-3">
                  10-Point Deterministic Rules Evaluation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MOCK_CRITERIA.map((criterion) => (
                    <div
                      key={criterion.name}
                      className="p-3.5 rounded-lg border border-white/5 bg-white/[0.015] hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-medium text-paper">{criterion.name}</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-moss">
                          <Check className="w-3 h-3" aria-hidden="true" />
                          <span>Passed</span>
                        </span>
                      </div>
                      <div className="text-xs text-fog/90 font-mono mb-1">{criterion.detail}</div>
                      <div className="text-[11px] text-fog/60 leading-normal">
                        {criterion.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Evidence Tailoring */}
          {activeStep === 'tailoring' && (
            <div
              id="panel-tailoring"
              role="tabpanel"
              aria-labelledby="tab-tailoring"
              className="space-y-6"
            >
              <div className="p-4 rounded-xl border border-moss/20 bg-moss/[0.03]">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-moss" aria-hidden="true" />
                  <span className="text-xs font-semibold text-moss uppercase tracking-wider">
                    Evidence Constraint Rule Active
                  </span>
                </div>
                <p className="text-xs text-fog leading-relaxed">
                  Every proposed bullet point is strictly constrained by confirmed CareerClaims in
                  your profile. Any statement not backed by proof is discarded to guarantee zero
                  interview surprises.
                </p>
              </div>

              <div className="space-y-4">
                {/* Diff Comparison Card */}
                <div className="rounded-xl border border-white/10 bg-white/[0.015] overflow-hidden">
                  <div className="p-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-xs">
                    <span className="text-fog font-medium">Resume Bullet Tailoring Diff</span>
                    <span className="font-mono text-moss text-[11px]">
                      Claim ID: claim_front_088 (Verified)
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-red-400 font-semibold mb-1">
                        Original Raw Bullet
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/[0.04] border border-red-500/10 text-xs text-fog line-through">
                        Worked on frontend web application and improved page load speeds for users.
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-moss font-semibold mb-1 flex items-center justify-between">
                        <span>Evidence-Constrained Tailored Bullet</span>
                        <span className="text-[10px] text-moss font-mono lowercase">
                          backed by: lighthouse-audit-2025.pdf
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-moss/[0.06] border border-moss/30 text-xs text-paper font-medium leading-relaxed">
                        Architected Core Web Vitals optimization pipeline across React SPA, reducing
                        LCP by 44% (2.8s → 1.55s) and eliminating INP latency for 1.2M monthly
                        users.
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-fog">
                      {tailorAccepted ? '✓ Tailored bullet approved' : 'Review proposed tailoring'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTailorAccepted(!tailorAccepted)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss ${
                        tailorAccepted
                          ? 'bg-moss text-ink'
                          : 'bg-white/10 text-paper hover:bg-white/20'
                      }`}
                    >
                      {tailorAccepted ? 'Tailoring Accepted' : 'Accept Tailoring'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Browser Extension Autofill */}
          {activeStep === 'extension' && (
            <div
              id="panel-extension"
              role="tabpanel"
              aria-labelledby="tab-extension"
              className="space-y-6"
            >
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-moss/10 text-moss">
                    <Zap className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-paper">NextJob Browser Companion</h3>
                    <p className="text-xs text-fog">
                      Greenhouse ATS Portal Detected (Job ID: #440189)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmissionComplete(true)}
                  className="px-4 py-2 rounded-lg bg-moss text-ink text-xs font-semibold hover:bg-moss/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
                >
                  {submissionComplete ? 'Autofill Re-run' : 'Simulate 1-Click Autofill'}
                </button>
              </div>

              {/* Mock ATS Form */}
              <div className="space-y-3 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <div className="text-xs font-medium text-fog uppercase tracking-wider mb-2">
                  Live Form Field Autofill State
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      label: 'Full Legal Name',
                      val: 'Alex Mercer',
                      source: 'Verified Profile Vault',
                    },
                    {
                      label: 'Work Authorization Status',
                      val: 'Authorized to work for any US employer',
                      source: 'Grounded Visa Check',
                    },
                    {
                      label: 'Years of React/TypeScript Experience',
                      val: '8 years',
                      source: 'Calculated from CareerClaims',
                    },
                    {
                      label: 'Why are you interested in this role?',
                      val: 'Tailored response emphasizing high-scale frontend systems from verified Stripe claim history.',
                      source: 'Evidence Constrained Statement',
                    },
                  ].map((field) => (
                    <div
                      key={field.label}
                      className="p-3 rounded-lg border border-white/5 bg-ink flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs text-fog/80">{field.label}</div>
                        <div className="text-xs font-medium text-paper">
                          {submissionComplete ? field.val : '• • • • • • • • • •'}
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-moss/10 text-moss font-mono self-start sm:self-center">
                        {submissionComplete ? `✓ ${field.source}` : 'Pending trigger'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Frozen Receipt */}
          {activeStep === 'receipt' && (
            <div
              id="panel-receipt"
              role="tabpanel"
              aria-labelledby="tab-receipt"
              className="space-y-6"
            >
              <div className="p-4 rounded-xl border border-moss/30 bg-moss/[0.04]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-5 h-5 text-moss" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-semibold text-paper">
                        Cryptographic Submission Receipt
                      </h3>
                      <p className="text-xs text-fog">
                        Immutable SHA-256 frozen record generated at submission
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-moss/20 text-moss border border-moss/30">
                    Verified Submitted
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-ink font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-fog">Receipt ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-paper">rec_9f82d1c0a87e44b3</span>
                    <button
                      type="button"
                      onClick={copyReceiptHash}
                      aria-label="Copy receipt ID"
                      className="text-fog hover:text-paper transition-colors"
                    >
                      {copiedReceipt ? (
                        <Check className="w-3.5 h-3.5 text-moss" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-fog">Payload SHA-256:</span>
                  <span className="text-moss truncate max-w-[240px] sm:max-w-none">
                    e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-fog">Submitted At:</span>
                  <span className="text-paper">2026-10-30T01:38:00Z (UTC)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-fog">ATS Endpoint:</span>
                  <span className="text-paper">boards.greenhouse.io/stripe/jobs/440189</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-fog">Evidence Provenance:</span>
                  <span className="text-moss">100% Verified (0 Hallucinations)</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-fog hover:text-paper disabled:opacity-30 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Previous Step</span>
            </button>

            <div className="text-xs text-fog font-mono">
              Step {activeIndex + 1} of {DEMO_STEPS.length}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={activeIndex === DEMO_STEPS.length - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-moss text-ink hover:bg-moss/90 disabled:opacity-30 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDemo;
