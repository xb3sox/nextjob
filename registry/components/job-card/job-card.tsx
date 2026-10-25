import { AlertCircle, CheckCircle, Clock, DollarSign, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MatchStatus = 'excellent' | 'good' | 'weak' | 'none';
export type EligibilityStatus = 'eligible' | 'ineligible' | 'unknown';
export type ExecutionStatus = 'verified' | 'assisted' | 'manual';
export type AutomationStatus = 'automatic' | 'review_required' | 'manual';
export type FreshnessStatus = 'fresh' | 'aging' | 'unknown';

export interface JobCapabilityModel {
  eligibility: EligibilityStatus;
  fit: MatchStatus;
  evidence: 'complete' | 'missing';
  execution: ExecutionStatus;
  language: 'supported' | 'review_required';
  automation: AutomationStatus;
  freshness: FreshnessStatus;
  matchScore: number;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  missingRequirements?: string[];
}

export interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  remote?: boolean;
  salary?: { min?: number; max?: number; currency?: string };
  capabilities: JobCapabilityModel;
  onView?: () => void;
  onApply?: () => void;
  onSave?: () => void;
  onSkip?: () => void;
  className?: string;
}

export function JobCard({
  title,
  company,
  location,
  remote,
  salary,
  capabilities,
  onView,
  onApply,
  onSave,
  onSkip,
  className,
}: JobCardProps) {
  const {
    eligibility,
    fit,
    evidence,
    execution,
    language,
    automation,
    freshness,
    matchScore,
    confidence,
    strengths,
    weaknesses,
    missingRequirements,
  } = capabilities;

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 transition-all',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-white/60">{company}</p>
        </div>
        <div className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
          {fit} · {matchScore}%
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
          {remote && <span className="text-emerald-400">· Remote</span>}
        </div>
        {salary && (
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>
              {salary.min && `$${(salary.min / 1000).toFixed(0)}k`}
              {salary.min && salary.max && ' - '}
              {salary.max && `$${(salary.max / 1000).toFixed(0)}k`}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        {eligibility === 'eligible' ? (
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        ) : eligibility === 'ineligible' ? (
          <AlertCircle className="w-4 h-4 text-red-400" />
        ) : (
          <Clock className="w-4 h-4 text-amber-400" />
        )}
        <span className="text-sm text-white/60">
          {eligibility === 'eligible'
            ? 'You can apply'
            : eligibility === 'ineligible'
              ? 'Probably not eligible'
              : 'Check before applying'}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-white mb-2">Why it fits</h4>
        {strengths.length > 0 ? (
          <ul className="space-y-1">
            {strengths.slice(0, 3).map((strength) => (
              <li key={strength} className="flex items-start gap-2 text-sm text-white/60">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/40">No specific strengths identified</p>
        )}
      </div>

      {(weaknesses.length > 0 || (missingRequirements && missingRequirements.length > 0)) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-white mb-2">
            {missingRequirements && missingRequirements.length > 0 ? 'Missing' : 'Gaps'}
          </h4>
          <ul className="space-y-1">
            {missingRequirements && missingRequirements.length > 0
              ? missingRequirements.slice(0, 2).map((req) => (
                  <li key={req} className="flex items-start gap-2 text-sm text-white/60">
                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))
              : weaknesses.slice(0, 2).map((weakness) => (
                  <li key={weakness} className="flex items-start gap-2 text-sm text-white/60">
                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>{weakness}</span>
                  </li>
                ))}
          </ul>
        </div>
      )}

      <div className="mb-6 pt-4 border-t border-white/5">
        <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
          Capability Model
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-white/40">Evidence</span>
            <span
              className={
                evidence === 'complete'
                  ? 'text-emerald-400 font-medium'
                  : 'text-amber-400 font-medium'
              }
            >
              {evidence === 'complete' ? 'Complete' : 'Missing'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Execution</span>
            <span className="text-emerald-400 font-medium">{execution}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Language</span>
            <span className="text-emerald-400 font-medium">{language}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Automation</span>
            <span className="text-emerald-400 font-medium">{automation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Freshness</span>
            <span className="text-emerald-400 font-medium">{freshness}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Confidence</span>
            <span className="text-emerald-400 font-medium">{Math.round(confidence * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onApply && (
          <button
            type="button"
            onClick={onApply}
            disabled={eligibility === 'ineligible'}
            className={cn(
              'flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
              eligibility === 'ineligible'
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            )}
          >
            {eligibility === 'ineligible' ? 'Not Eligible' : 'Review & Apply'}
          </button>
        )}
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white text-sm font-medium transition-colors"
          >
            Save
          </button>
        )}
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white/60 text-sm font-medium transition-colors"
          >
            Skip
          </button>
        )}
        {onView && (
          <button
            type="button"
            onClick={onView}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white text-sm font-medium transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}
