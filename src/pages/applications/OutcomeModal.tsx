import { Award, CalendarCheck, CheckCircle2, Trophy, UserX, X, XCircle } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ApplicationState, TrackedApplication } from './types';

export const ALLOWED_OUTCOME_TRANSITIONS: Readonly<
  Record<ApplicationState, readonly ApplicationState[]>
> = {
  SUBMITTED_VERIFIED: ['INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'],
  SUBMITTED_UNVERIFIED: ['INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW: ['OFFER', 'REJECTED', 'WITHDRAWN'],
  OFFER: ['HIRED', 'REJECTED', 'WITHDRAWN'],
  DISCOVERED: ['WITHDRAWN'],
  NORMALIZED: ['WITHDRAWN'],
  ELIGIBILITY_CHECKED: ['WITHDRAWN'],
  MATCHED: ['WITHDRAWN'],
  PLANNED: ['WITHDRAWN'],
  TAILORED: ['WITHDRAWN'],
  POLICY_CHECKED: ['WITHDRAWN'],
  NEEDS_APPROVAL: ['WITHDRAWN'],
  READY: ['WITHDRAWN'],
  EXECUTING: ['WITHDRAWN'],
  FAILED_RETRYABLE: ['WITHDRAWN'],
  NEEDS_RECONCILIATION: ['WITHDRAWN'],
  NEEDS_USER: ['WITHDRAWN'],
  BLOCKED: ['WITHDRAWN'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
  CANCELLED: [],
  FAILED_FINAL: [],
};

export const OUTCOME_CONFIG: Record<
  string,
  { label: string; description: string; icon: typeof CheckCircle2; color: string }
> = {
  INTERVIEW: {
    label: 'Interview',
    description: 'Scheduled or completed an interview round',
    icon: CalendarCheck,
    color: 'text-sky-400 border-sky-400/30 bg-sky-500/10',
  },
  OFFER: {
    label: 'Job Offer',
    description: 'Received a formal or informal job offer',
    icon: Award,
    color: 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10',
  },
  HIRED: {
    label: 'Hired / Accepted',
    description: 'Offer accepted! You landed the role',
    icon: Trophy,
    color: 'text-amber-400 border-amber-400/30 bg-amber-500/10',
  },
  REJECTED: {
    label: 'Rejected',
    description: 'Company decided not to move forward',
    icon: XCircle,
    color: 'text-rose-400 border-rose-400/30 bg-rose-500/10',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    description: 'Decided not to pursue this opportunity further',
    icon: UserX,
    color: 'text-fog border-fog/30 bg-white/5',
  },
};

interface OutcomeModalProps {
  application: TrackedApplication;
  isOpen: boolean;
  onClose: () => void;
  onSaveOutcome: (applicationId: string, newOutcome: ApplicationState, notes?: string) => void;
}

export function OutcomeModal({ application, isOpen, onClose, onSaveOutcome }: OutcomeModalProps) {
  const allowed = ALLOWED_OUTCOME_TRANSITIONS[application.state] || [];
  const [selectedOutcome, setSelectedOutcome] = useState<ApplicationState | null>(
    allowed[0] || null
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const titleId = useId();
  const descId = useId();

  // Reset selected outcome when modal opens with new application
  useEffect(() => {
    if (isOpen) {
      const available = ALLOWED_OUTCOME_TRANSITIONS[application.state] || [];
      setSelectedOutcome(available[0] || null);
      setNotes('');
      setError(null);
    }
  }, [isOpen, application.state]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutcome) {
      setError('Please select an outcome state.');
      return;
    }

    onSaveOutcome(application.id, selectedOutcome, notes.trim() || undefined);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-paper">
              Record Application Outcome
            </h2>
            <p id={descId} className="text-xs text-fog mt-0.5">
              {application.jobTitle || 'Application'} · {application.companyName || 'Target Role'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-fog hover:text-paper hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Current status info */}
        <div className="py-3 px-3.5 my-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
          <span className="text-fog">Current Stage:</span>
          <span className="font-mono uppercase font-semibold text-moss px-2 py-0.5 rounded bg-moss/10">
            {application.state}
          </span>
        </div>

        {allowed.length === 0 ? (
          <div className="text-center py-6 text-sm text-fog">
            This application is in a terminal state ({application.state}). No further outcome
            transitions are allowed.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400"
              >
                {error}
              </div>
            )}

            <fieldset className="border-0 p-0 m-0">
              <legend className="text-xs font-medium text-paper mb-2">Select New Outcome</legend>
              <div className="grid gap-2">
                {allowed.map((outcome) => {
                  const config = OUTCOME_CONFIG[outcome] || {
                    label: outcome,
                    description: '',
                    icon: CheckCircle2,
                    color: 'text-fog border-fog/30 bg-white/5',
                  };
                  const Icon = config.icon;
                  const isSelected = selectedOutcome === outcome;

                  return (
                    <label
                      key={outcome}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer',
                        isSelected
                          ? 'border-moss bg-moss/10 ring-1 ring-moss text-paper'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20 text-fog hover:text-paper'
                      )}
                    >
                      <input
                        type="radio"
                        name="outcome-selection"
                        value={outcome}
                        checked={isSelected}
                        onChange={() => {
                          setSelectedOutcome(outcome);
                          setError(null);
                        }}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border',
                          config.color
                        )}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold">{config.label}</div>
                        <div className="text-[11px] text-fog/80 truncate">{config.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="outcome-notes" className="block text-xs font-medium text-paper mb-1">
                Notes / Details <span className="text-fog/60 font-normal">(optional)</span>
              </label>
              <textarea
                id="outcome-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Completed technical round; offer deadline Nov 15..."
                className="w-full text-xs rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-paper placeholder:text-fog/50 focus:outline-none focus:ring-1 focus:ring-moss focus:border-moss"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-fog hover:text-paper hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-moss hover:bg-moss/90 text-ink transition-colors"
              >
                Save Outcome
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
