import { MapPin, Briefcase, DollarSign, Globe, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export type MatchStatus = 'excellent' | 'good' | 'weak' | 'none';
export type EligibilityStatus = 'eligible' | 'ineligible' | 'unknown';
export type ExecutionStatus = 'verified' | 'assisted' | 'manual';
export type AutomationStatus = 'automatic' | 'review_required' | 'manual';
export type FreshnessStatus = 'fresh' | 'aging' | 'unknown';

export interface JobCapabilityModel {
  // Core dimensions
  eligibility: EligibilityStatus;
  fit: MatchStatus;
  evidence: 'complete' | 'missing';
  execution: ExecutionStatus;
  language: 'supported' | 'review_required';
  automation: AutomationStatus;
  freshness: FreshnessStatus;
  
  // Scores
  matchScore: number; // 0-100
  confidence: number; // 0-1
  
  // Details
  strengths: string[];
  weaknesses: string[];
  missingRequirements?: string[];
}

export interface JobCardProps {
  // Job info
  id: string;
  title: string;
  company: string;
  location: string;
  remote?: boolean;
  salary?: { min?: number; max?: number; currency?: string };
  
  // Capability model
  capabilities: JobCapabilityModel;
  
  // Actions
  onView?: () => void;
  onApply?: () => void;
  onSave?: () => void;
  onSkip?: () => void;
  
  // Styling
  className?: string;
}

// ============================================================================
// Helper Components
// ============================================================================

function MatchBadge({ status, score }: { status: MatchStatus; score: number }) {
  const colors = {
    excellent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    good: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    weak: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    none: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const labels = {
    excellent: 'Excellent match',
    good: 'Good match',
    weak: 'Weak match',
    none: 'No match',
  };

  return (
    <div className={cn('px-3 py-1 rounded-full border text-xs font-medium', colors[status])}>
      {labels[status]} · {score}%
    </div>
  );
}

function EligibilityBadge({ status }: { status: EligibilityStatus }) {
  const config = {
    eligible: {
      icon: CheckCircle,
      color: 'text-emerald-400',
      label: 'You can apply',
    },
    ineligible: {
      icon: AlertCircle,
      color: 'text-red-400',
      label: 'Probably not eligible',
    },
    unknown: {
      icon: Clock,
      color: 'text-amber-400',
      label: 'Check before applying',
    },
  };

  const { icon: Icon, color, label } = config[status];

  return (
    <div className="flex items-center gap-2">
      <Icon className={cn('w-4 h-4', color)} />
      <span className="text-sm text-white/60">{label}</span>
    </div>
  );
}

function CapabilityIndicator({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/40">{label}</span>
      <span className={cn('font-medium', color)}>{value}</span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function JobCard({
  id,
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
    <div className={cn(
      'rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 transition-all',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-white/60">{company}</p>
        </div>
        <MatchBadge status={fit} score={matchScore} />
      </div>

      {/* Meta Info */}
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

      {/* Eligibility */}
      <div className="mb-4">
        <EligibilityBadge status={eligibility} />
      </div>

      {/* Why It Fits */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-white mb-2">Why it fits</h4>
        {strengths.length > 0 ? (
          <ul className="space-y-1">
            {strengths.slice(0, 3).map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/40">No specific strengths identified</p>
        )}
      </div>

      {/* Gaps */}
      {(weaknesses.length > 0 || (missingRequirements && missingRequirements.length > 0)) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-white mb-2">
            {missingRequirements && missingRequirements.length > 0 ? 'Missing' : 'Gaps'}
          </h4>
          <ul className="space-y-1">
            {missingRequirements && missingRequirements.length > 0 ? (
              missingRequirements.slice(0, 2).map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))
            ) : (
              weaknesses.slice(0, 2).map((weakness, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Capability Dimensions */}
      <div className="mb-6 pt-4 border-t border-white/5">
        <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
          Capability Model
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <CapabilityIndicator
            label="Evidence"
            value={evidence === 'complete' ? 'Complete' : 'Missing'}
            color={evidence === 'complete' ? 'text-emerald-400' : 'text-amber-400'}
          />
          <CapabilityIndicator
            label="Execution"
            value={execution === 'verified' ? 'Verified' : execution === 'assisted' ? 'Assisted' : 'Manual'}
            color={execution === 'verified' ? 'text-emerald-400' : 'text-cyan-400'}
          />
          <CapabilityIndicator
            label="Language"
            value={language === 'supported' ? 'Supported' : 'Review required'}
            color={language === 'supported' ? 'text-emerald-400' : 'text-amber-400'}
          />
          <CapabilityIndicator
            label="Automation"
            value={automation === 'automatic' ? 'Automatic' : automation === 'review_required' ? 'Review' : 'Manual'}
            color={automation === 'automatic' ? 'text-emerald-400' : 'text-cyan-400'}
          />
          <CapabilityIndicator
            label="Freshness"
            value={freshness === 'fresh' ? 'Fresh' : freshness === 'aging' ? 'Aging' : 'Unknown'}
            color={freshness === 'fresh' ? 'text-emerald-400' : freshness === 'aging' ? 'text-amber-400' : 'text-slate-400'}
          />
          <CapabilityIndicator
            label="Confidence"
            value={`${Math.round(confidence * 100)}%`}
            color={confidence > 0.8 ? 'text-emerald-400' : confidence > 0.6 ? 'text-cyan-400' : 'text-amber-400'}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {onApply && (
          <button
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
            onClick={onSave}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white text-sm font-medium transition-colors"
          >
            Save
          </button>
        )}
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white/60 text-sm font-medium transition-colors"
          >
            Skip
          </button>
        )}
        {onView && (
          <button
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

// ============================================================================
// Skeleton Component
// ============================================================================

export function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 w-3/4 bg-white/10 rounded mb-2" />
          <div className="h-4 w-1/2 bg-white/10 rounded" />
        </div>
        <div className="h-6 w-24 bg-white/10 rounded-full" />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-4 w-24 bg-white/10 rounded" />
      </div>

      <div className="h-4 w-48 bg-white/10 rounded mb-4" />

      <div className="mb-4">
        <div className="h-4 w-20 bg-white/10 rounded mb-2" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-5/6 bg-white/10 rounded" />
          <div className="h-4 w-4/6 bg-white/10 rounded" />
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <div className="h-3 w-24 bg-white/10 rounded mb-3" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-4 bg-white/10 rounded" />
          <div className="h-4 bg-white/10 rounded" />
          <div className="h-4 bg-white/10 rounded" />
          <div className="h-4 bg-white/10 rounded" />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <div className="flex-1 h-10 bg-white/10 rounded-lg" />
        <div className="h-10 w-20 bg-white/10 rounded-lg" />
        <div className="h-10 w-20 bg-white/10 rounded-lg" />
      </div>
    </div>
  );
}
