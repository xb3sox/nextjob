import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';

export interface ProcessStep {
  title: string;
  description: string;
  painOrGain: string;
}

export interface MetricHighlight {
  label: string;
  value: string;
  comparison: string;
  description: string;
  icon: ReactNode;
}

export const COMPARISON_METRICS: MetricHighlight[] = [
  {
    label: 'Time per application',
    value: '93% faster',
    comparison: '3 min vs 45 min',
    description: 'Stop retyping job history and manual questionnaires into ATS forms.',
    icon: <Clock className="w-5 h-5 text-moss" aria-hidden="true" />,
  },
  {
    label: 'Evidence provenance',
    value: '100% backed',
    comparison: 'Zero hallucinated claims',
    description: 'Every statement traces to a verified CareerClaim with an audit trail.',
    icon: <ShieldAlert className="w-5 h-5 text-moss" aria-hidden="true" />,
  },
  {
    label: 'Interview response lift',
    value: '3.2x higher',
    comparison: 'Verified fit vs blind spray',
    description: 'Candidates pre-screened against 10 hard eligibility criteria get noticed.',
    icon: <TrendingUp className="w-5 h-5 text-moss" aria-hidden="true" />,
  },
];

export const TRADITIONAL_STEPS: ProcessStep[] = [
  {
    title: 'Blind job hunting',
    description:
      'Browsing disjointed job boards with vague salaries, guessing if you actually meet visa and experience constraints.',
    painOrGain: 'Hours wasted on jobs you never qualified for',
  },
  {
    title: 'Hallucinated AI tailoring',
    description:
      'Copy-pasting job descriptions into generic chatbots that fabricate achievements you cannot defend in technical rounds.',
    painOrGain: 'High interview failure rate when pressed on unbacked claims',
  },
  {
    title: 'Repetitive manual ATS portals',
    description:
      'Re-entering your work history, certifications, and EEOC demographics into endless Workday and Greenhouse forms.',
    painOrGain: '45+ minutes of manual data entry per application',
  },
  {
    title: 'Unverified black hole',
    description:
      'Hitting submit with zero record of what was sent, no receipt, and no structured follow-up data.',
    painOrGain: 'Zero audit trail or insight into application state',
  },
];

export const NEXTJOB_STEPS: ProcessStep[] = [
  {
    title: 'Deterministic eligibility engine',
    description:
      'Automated check across 10 dimensions (work authorization, location, compensation, skills) before you spend 1 minute applying.',
    painOrGain: 'Zero false hopes: apply only where you qualify',
  },
  {
    title: 'Evidence-grounded tailoring',
    description:
      'AI tailoring strictly constrained by your verified CareerClaims. If an achievement is not backed by proof, it is rejected.',
    painOrGain: '100% defensible claims during technical interviews',
  },
  {
    title: '1-click browser extension autofill',
    description:
      'Autofills complex ATS questionnaires from your verified vault while preserving client-side privacy controls.',
    painOrGain: 'Completed in under 3 minutes with zero typing',
  },
  {
    title: 'Cryptographic submission receipt',
    description:
      'Immutable SHA-256 frozen receipt linking exact answers, tailoring diffs, and timestamped ATS submission state.',
    painOrGain: 'Permanent, verifiable proof of every application',
  },
];

export interface BeforeAfterComparisonProps {
  id?: string;
  className?: string;
}

export function BeforeAfterComparison({
  id = 'process-comparison',
  className = '',
}: BeforeAfterComparisonProps) {
  return (
    <section
      id={id}
      aria-labelledby="comparison-heading"
      className={`py-20 px-6 max-w-6xl mx-auto ${className}`.trim()}
    >
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-moss/10 text-moss border border-moss/20 mb-4">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Before & After NextJob</span>
        </div>
        <h2 id="comparison-heading" className="font-display text-3xl sm:text-4xl text-paper mb-4">
          How applying looks today vs. with NextJob
        </h2>
        <p className="text-fog text-base sm:text-lg leading-relaxed">
          Traditional job hunting forces candidates to choose between exhausting manual effort or
          hallucinated spray-and-pray. NextJob replaces both with verified evidence and automated
          precision.
        </p>
      </div>

      {/* Metrics Highlights Bar */}
      <section
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14"
        aria-label="Key performance metrics"
      >
        {COMPARISON_METRICS.map((metric) => (
          <div
            key={metric.label}
            className="p-5 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-fog">
                {metric.label}
              </span>
              <div className="p-2 rounded-lg bg-moss/10 border border-moss/20">{metric.icon}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-display font-semibold text-paper mb-1">
                {metric.value}
              </div>
              <div className="text-xs font-medium text-moss mb-2">{metric.comparison}</div>
              <p className="text-xs text-fog leading-relaxed">{metric.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Side-by-side comparison columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Traditional / Status Quo */}
        <section
          className="rounded-2xl border border-white/10 bg-white/[0.015] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden"
          aria-labelledby="traditional-heading"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Traditional Method</span>
              </span>
              <span className="text-xs text-fog/60 font-mono">Status Quo</span>
            </div>

            <h3 id="traditional-heading" className="text-xl font-semibold text-paper mb-2">
              The Spray-and-Pray Black Hole
            </h3>
            <p className="text-sm text-fog mb-6 leading-relaxed">
              Disjointed job boards, manual ATS entries, and generic chatbot hallucinations that
              break down in real interviews.
            </p>

            <ul className="space-y-4">
              {TRADITIONAL_STEPS.map((step, idx) => (
                <li
                  key={step.title}
                  className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-start gap-3.5"
                >
                  <div className="shrink-0 mt-0.5">
                    <XCircle className="w-5 h-5 text-red-400/80" aria-hidden="true" />
                    <span className="sr-only">Step {idx + 1} drawback:</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-paper">{step.title}</h4>
                    <p className="text-xs text-fog leading-relaxed">{step.description}</p>
                    <div className="text-[11px] font-medium text-red-400/90 pt-1">
                      ⚠️ {step.painOrGain}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-fog">
            <span>Result: 2-3% callback rate</span>
            <span className="text-red-400 font-medium">45+ min / application</span>
          </div>
        </section>

        {/* NextJob Method */}
        <section
          className="rounded-2xl border border-moss/30 bg-moss/[0.02] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_0_50px_-15px_rgba(52,211,153,0.12)]"
          aria-labelledby="nextjob-heading"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-moss/10 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-moss/20 text-moss border border-moss/40">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>NextJob Method</span>
              </span>
              <span className="text-xs text-moss font-mono">Evidence-Backed</span>
            </div>

            <h3 id="nextjob-heading" className="text-xl font-semibold text-paper mb-2">
              The Evidence-Constrained Workflow
            </h3>
            <p className="text-sm text-fog mb-6 leading-relaxed">
              Deterministic matching, claims verified against real career evidence, 1-click
              submission, and cryptographic receipts.
            </p>

            <ul className="space-y-4">
              {NEXTJOB_STEPS.map((step, idx) => (
                <li
                  key={step.title}
                  className="p-4 rounded-xl border border-moss/20 bg-moss/[0.04] flex items-start gap-3.5"
                >
                  <div className="shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-moss" aria-hidden="true" />
                    <span className="sr-only">Step {idx + 1} advantage:</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-paper">{step.title}</h4>
                    <p className="text-xs text-fog leading-relaxed">{step.description}</p>
                    <div className="text-[11px] font-medium text-moss pt-1">
                      ✓ {step.painOrGain}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-moss/20 flex items-center justify-between text-xs">
            <span className="text-fog">Result: 3.2x interview response</span>
            <span className="text-moss font-semibold">3 min / application</span>
          </div>
        </section>
      </div>
    </section>
  );
}

export default BeforeAfterComparison;
