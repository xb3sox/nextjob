import { Check, Minus, X } from 'lucide-react';
import type React from 'react';

export interface ComparisonRow {
  feature: string;
  description: string;
  nextjob: {
    status: 'yes' | 'no' | 'partial';
    label: string;
  };
  manual: {
    status: 'yes' | 'no' | 'partial';
    label: string;
  };
  genericAi: {
    status: 'yes' | 'no' | 'partial';
    label: string;
  };
}

export const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: 'Fact-checked claims only',
    description: 'Every statement strictly traced to verified candidate evidence',
    nextjob: { status: 'yes', label: '100% verified evidence' },
    manual: { status: 'yes', label: 'Manual, time-consuming' },
    genericAi: { status: 'no', label: 'Frequent hallucinations' },
  },
  {
    feature: 'Pre-apply eligibility engine',
    description: 'Checks work auth, location, seniority & sponsorship before applying',
    nextjob: { status: 'yes', label: 'Automated 10-check engine' },
    manual: { status: 'partial', label: 'Guesswork / manual check' },
    genericAi: { status: 'no', label: 'Zero eligibility checks' },
  },
  {
    feature: 'Cryptographic submission receipts',
    description: 'SHA-256 hash verifying exactly what was submitted to employer',
    nextjob: { status: 'yes', label: 'Tamper-evident receipt' },
    manual: { status: 'no', label: 'No proof of submission' },
    genericAi: { status: 'no', label: 'Unverified black box' },
  },
  {
    feature: 'Human-in-the-loop control',
    description: 'Candidates review and approve all tailored answers before dispatch',
    nextjob: { status: 'yes', label: 'Review & approve anytime' },
    manual: { status: 'yes', label: 'Full manual control' },
    genericAi: { status: 'partial', label: 'Uncontrolled auto-submit' },
  },
  {
    feature: 'Transparent pricing',
    description: 'Simple $39 Search Pass or Free tier with no hidden fees',
    nextjob: { status: 'yes', label: '$39/30 days, zero credits' },
    manual: { status: 'partial', label: 'Free, but 40+ hrs/wk' },
    genericAi: { status: 'no', label: 'Hidden token & credit walls' },
  },
  {
    feature: 'Data privacy & zero training sale',
    description: 'Candidate profile never sold or used to train public LLM weights',
    nextjob: { status: 'yes', label: 'Strict tenant isolation' },
    manual: { status: 'yes', label: 'Direct to employer ATS' },
    genericAi: { status: 'no', label: 'Data retained for training' },
  },
];

function StatusIndicator({ status, label }: { status: 'yes' | 'no' | 'partial'; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {status === 'yes' && (
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-moss/20 text-moss shrink-0">
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="sr-only">Supported:</span>
        </span>
      )}
      {status === 'partial' && (
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 shrink-0">
          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="sr-only">Partially supported:</span>
        </span>
      )}
      {status === 'no' && (
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 shrink-0">
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="sr-only">Not supported:</span>
        </span>
      )}
      <span className="text-xs sm:text-sm font-medium">{label}</span>
    </div>
  );
}

export function ComparisonTable(): React.JSX.Element {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-panel/40 backdrop-blur-sm">
      <table className="w-full text-left border-collapse min-w-[640px]">
        <caption className="sr-only">
          Comparison between NextJob, Manual Job Search, and Generic AI Tools
        </caption>
        <thead>
          <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-fog">
            <th scope="col" className="py-4 px-6 w-2/5">
              Capability
            </th>
            <th
              scope="col"
              className="py-4 px-6 w-1/5 bg-moss/[0.08] text-moss border-x border-moss/20"
            >
              <div className="flex items-center gap-1.5">
                <span>NextJob</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-moss/20 text-moss-dark font-bold">
                  PROVEN
                </span>
              </div>
            </th>
            <th scope="col" className="py-4 px-6 w-1/5 text-fog/80">
              Manual Search
            </th>
            <th scope="col" className="py-4 px-6 w-1/5 text-fog/80">
              Generic AI Tools
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-paper">
          {COMPARISON_DATA.map((row) => (
            <tr key={row.feature} className="hover:bg-white/[0.02] transition-colors">
              <th scope="row" className="py-4 px-6 font-normal">
                <div className="font-medium text-sm text-paper">{row.feature}</div>
                <div className="text-xs text-fog mt-0.5">{row.description}</div>
              </th>
              <td className="py-4 px-6 bg-moss/[0.04] border-x border-moss/20">
                <StatusIndicator status={row.nextjob.status} label={row.nextjob.label} />
              </td>
              <td className="py-4 px-6 text-fog">
                <StatusIndicator status={row.manual.status} label={row.manual.label} />
              </td>
              <td className="py-4 px-6 text-fog">
                <StatusIndicator status={row.genericAi.status} label={row.genericAi.label} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
