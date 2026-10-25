import { AlertCircle, CheckCircle, Clock, DollarSign, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MatchStatus = 'excellent' | 'good' | 'weak' | 'none';
export type EligibilityStatus = 'eligible' | 'ineligible' | 'unknown';
export type ExecutionStatus = 'verified' | 'assisted' | 'manual';
export type AutomationStatus = 'automatic' | 'review_required' | 'manual';
export type FreshnessStatus = 'fresh' | 'aging' | 'unknown';

export interface ApplicationCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  remote?: boolean;
  salary?: { min?: number; max?: number; currency?: string };
  matchStatus?: MatchStatus;
  matchScore?: number;
  eligibilityStatus?: EligibilityStatus;
  executionStatus?: ExecutionStatus;
  automationStatus?: AutomationStatus;
  freshnessStatus?: FreshnessStatus;
  strengths?: string[];
  gaps?: string[];
  onApply?: () => void;
  onSave?: () => void;
  onSkip?: () => void;
  className?: string;
}

export function ApplicationCard({
  title,
  company,
  location,
  remote,
  salary,
  matchStatus = 'good',
  matchScore = 85,
  eligibilityStatus = 'eligible',
  strengths = [],
  gaps = [],
  onApply,
  onSave,
  onSkip,
  className,
}: ApplicationCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 transition-all',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-white/60">{company}</p>
        </div>
        <div className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
          {matchStatus} · {matchScore}%
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
        {eligibilityStatus === 'eligible' ? (
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        ) : eligibilityStatus === 'ineligible' ? (
          <AlertCircle className="w-4 h-4 text-red-400" />
        ) : (
          <Clock className="w-4 h-4 text-amber-400" />
        )}
        <span className="text-sm text-white/60">
          {eligibilityStatus === 'eligible'
            ? 'You can apply'
            : eligibilityStatus === 'ineligible'
              ? 'Probably not eligible'
              : 'Check before applying'}
        </span>
      </div>

      {strengths.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-white mb-2">Why it fits</h4>
          <ul className="space-y-1">
            {strengths.slice(0, 3).map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-white/60">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {gaps.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-white mb-2">Gaps</h4>
          <ul className="space-y-1">
            {gaps.slice(0, 2).map((g) => (
              <li key={g} className="flex items-start gap-2 text-sm text-white/60">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-3">
        {onApply && (
          <button
            type="button"
            onClick={onApply}
            disabled={eligibilityStatus === 'ineligible'}
            className={cn(
              'flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
              eligibilityStatus === 'ineligible'
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            )}
          >
            {eligibilityStatus === 'ineligible' ? 'Not Eligible' : 'Review & Apply'}
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
      </div>
    </div>
  );
}
