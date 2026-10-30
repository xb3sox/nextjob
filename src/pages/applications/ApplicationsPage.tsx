import { ArrowLeft, FileCheck, LogOut, Search, ShieldAlert, Zap } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ALLOWED_OUTCOME_TRANSITIONS, OutcomeModal } from './OutcomeModal';
import { verifyReceipt } from './receiptVerifier';
import {
  APPLICATION_GROUPS,
  type ApplicationGroup,
  type ApplicationState,
  STATE_TO_GROUP,
  type TrackedApplication,
} from './types';
import { useApplications } from './useApplications';

export default function ApplicationsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useApplications();
  const [outcomeTargetApp, setOutcomeTargetApp] = useState<TrackedApplication | null>(null);
  const searchInputId = useId();

  const query = searchParams.get('q') || '';
  const stateFilter = (searchParams.get('state') || 'all').toLowerCase();

  // Filter applications by query and selected group/state (hooks called unconditionally at top level)
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const group = STATE_TO_GROUP[app.state] || 'Planned';
      const normalizedGroup = group.toLowerCase().replace(/\s+/g, '-');
      const normalizedState = app.state.toLowerCase();

      // Filter by state/group tab
      if (stateFilter !== 'all') {
        const matchesGroup = normalizedGroup === stateFilter;
        const matchesState = normalizedState === stateFilter;
        if (!matchesGroup && !matchesState) {
          return false;
        }
      }

      // Filter by query string
      if (query.trim()) {
        const q = query.toLowerCase();
        const title = (app.jobTitle || '').toLowerCase();
        const company = (app.companyName || '').toLowerCase();
        const id = app.id.toLowerCase();
        if (!title.includes(q) && !company.includes(q) && !id.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [applications, stateFilter, query]);

  // Group applications by the 8 lifecycle groups
  const groupedApps = useMemo(() => {
    const map = new Map<ApplicationGroup, TrackedApplication[]>();
    for (const group of APPLICATION_GROUPS) {
      map.set(group, []);
    }
    for (const app of filteredApps) {
      const group = STATE_TO_GROUP[app.state] || 'Planned';
      const list = map.get(group);
      if (list) {
        list.push(app);
      }
    }
    return map;
  }, [filteredApps]);

  // Auth gate after hooks
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleGroupFilter = (group: string) => {
    const next = new URLSearchParams(searchParams);
    if (group === 'all') {
      next.delete('state');
    } else {
      next.set('state', group.toLowerCase().replace(/\s+/g, '-'));
    }
    setSearchParams(next);
  };

  const handleSearchChange = (val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val.trim()) {
      next.set('q', val);
    } else {
      next.delete('q');
    }
    setSearchParams(next);
  };

  const handleSaveOutcome = (
    applicationId: string,
    newOutcome: ApplicationState,
    notes?: string
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== applicationId) return app;
        const newAudit = {
          at: new Date().toISOString(),
          from: app.state,
          to: newOutcome,
          actor: 'candidate',
          reason: notes || `Outcome updated to ${newOutcome}`,
        };
        return {
          ...app,
          state: newOutcome,
          audit: [...(app.audit || []), newAudit],
        };
      })
    );
  };

  const hasAnyApps = applications.length > 0;
  const hasMatchingApps = filteredApps.length > 0;

  return (
    <div className="min-h-screen bg-ink text-paper flex flex-col font-sans selection:bg-moss/20">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-ink/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 -ml-2 rounded-lg text-fog hover:text-paper hover:bg-white/5 transition-colors"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-moss animate-pulse" />
              <span className="font-bold tracking-tight text-lg text-paper">NextJob</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-fog font-mono ml-1">
                Tracker
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-fog hidden sm:inline" data-testid="user-email">
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => {
                signOut();
                navigate('/login');
              }}
              className="p-2 rounded-lg text-fog hover:text-paper hover:bg-white/5 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Title and Controls */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-paper tracking-tight flex items-center gap-2">
                <span>Application Tracker</span>
                <span className="text-xs font-mono font-normal text-moss px-2 py-0.5 rounded-full bg-moss/10 border border-moss/20">
                  {applications.length} Total
                </span>
              </h1>
              <p className="text-sm text-fog mt-1">
                Track and inspect lifecycle stages, cryptographic receipts, and outcome progress.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-moss/10 border border-moss/30 hover:bg-moss/20 text-moss text-xs font-semibold transition-colors shrink-0"
            >
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Match New Jobs</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <label htmlFor={searchInputId} className="sr-only">
              Search applications
            </label>
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fog/60 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id={searchInputId}
              type="search"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by job title, company, or ID..."
              className="w-full text-sm rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2 text-paper placeholder:text-fog/50 focus:outline-none focus:ring-1 focus:ring-moss focus:border-moss transition-all"
            />
          </div>

          {/* Lifecycle Group Tabs */}
          <div
            role="tablist"
            aria-label="Lifecycle groups"
            className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none"
          >
            <button
              type="button"
              role="tab"
              aria-selected={stateFilter === 'all'}
              onClick={() => handleGroupFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                stateFilter === 'all'
                  ? 'bg-moss text-ink font-semibold'
                  : 'bg-white/5 text-fog hover:text-paper hover:bg-white/10'
              )}
            >
              All ({applications.length})
            </button>

            {APPLICATION_GROUPS.map((group) => {
              const count = applications.filter(
                (a) => (STATE_TO_GROUP[a.state] || 'Planned') === group
              ).length;
              const groupSlug = group.toLowerCase().replace(/\s+/g, '-');
              const isSelected = stateFilter === groupSlug;

              return (
                <button
                  key={group}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleGroupFilter(group)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                    isSelected
                      ? 'bg-moss text-ink font-semibold'
                      : 'bg-white/5 text-fog hover:text-paper hover:bg-white/10'
                  )}
                >
                  {group} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {!hasMatchingApps ? (
          <div className="border border-white/10 rounded-xl bg-white/[0.02] p-12 text-center max-w-lg mx-auto">
            <FileCheck className="w-10 h-10 text-moss/60 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-paper mb-2">No applications found</h2>
            <p className="text-fog text-sm mb-6">
              {!hasAnyApps
                ? 'You have not submitted or planned any job applications yet. Visit your dashboard to match jobs and start tailoring.'
                : 'No applications match your active search query or state filter.'}
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-moss hover:bg-moss/90 text-ink text-sm font-semibold transition-colors"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        ) : (
          /* Eight Groups rendered in order */
          <div className="space-y-10">
            {APPLICATION_GROUPS.map((group) => {
              const apps = groupedApps.get(group) || [];
              if (apps.length === 0 && stateFilter !== 'all') {
                return null;
              }

              return (
                <section key={group} aria-labelledby={`group-heading-${group}`}>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                    <h2
                      id={`group-heading-${group}`}
                      className="text-base font-semibold text-paper flex items-center gap-2"
                    >
                      <span>{group}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-fog font-normal">
                        {apps.length}
                      </span>
                    </h2>
                  </div>

                  {apps.length === 0 ? (
                    <p className="text-xs text-fog/60 italic py-2">No applications in this stage</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {apps.map((app) => (
                        <ApplicationItem
                          key={app.id}
                          application={app}
                          onOpenOutcome={(target) => setOutcomeTargetApp(target)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* Modal for capturing outcome */}
        {outcomeTargetApp && (
          <OutcomeModal
            application={outcomeTargetApp}
            isOpen={!!outcomeTargetApp}
            onClose={() => setOutcomeTargetApp(null)}
            onSaveOutcome={handleSaveOutcome}
          />
        )}
      </main>
    </div>
  );
}

function ApplicationItem({
  application,
  onOpenOutcome,
}: {
  application: TrackedApplication;
  onOpenOutcome: (app: TrackedApplication) => void;
}) {
  const { id, state, jobTitle, companyName, receipt, audit } = application;
  const isReceiptValid = receipt ? verifyReceipt(receipt) : true;
  const allowed = ALLOWED_OUTCOME_TRANSITIONS[state] || [];
  const canUpdateOutcome = allowed.length > 0;

  return (
    <div className="border border-white/10 rounded-xl bg-white/[0.03] hover:border-white/20 transition-all p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-paper text-sm line-clamp-1">
            {jobTitle || `Application ${id.slice(0, 8)}`}
          </h3>
          <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-white/10 text-moss font-semibold shrink-0">
            {state}
          </span>
        </div>

        <p className="text-xs text-fog mb-3">{companyName || 'Target Role'}</p>

        {audit && audit.length > 0 && (
          <p className="text-[11px] text-fog/60 mb-3 truncate">
            Last update: {audit[audit.length - 1].reason || audit[audit.length - 1].to}
          </p>
        )}
      </div>

      <div>
        {/* Submission Receipt Section */}
        {receipt && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-fog flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-moss" aria-hidden="true" />
                <span>Receipt:</span>
              </span>
              <span
                className={cn(
                  'font-mono text-[11px] px-1.5 py-0.5 rounded capitalize',
                  receipt.verificationStatus === 'verified'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                )}
              >
                {receipt.verificationStatus}
              </span>
            </div>

            <div
              className="text-[11px] font-mono text-fog/80 truncate mb-1"
              title={receipt.contentHash}
            >
              Hash: {receipt.contentHash.slice(0, 16)}...
            </div>

            {/* Tamper / Verification Warning */}
            {!isReceiptValid && (
              <div
                role="alert"
                className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" aria-hidden="true" />
                <span>Warning: Receipt verification mismatch. Submission may be tampered.</span>
              </div>
            )}
          </div>
        )}

        {/* Outcome Update Action */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          {canUpdateOutcome ? (
            <button
              type="button"
              onClick={() => onOpenOutcome(application)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-moss/10 hover:bg-moss/20 text-moss border border-moss/20 hover:border-moss/40 transition-colors"
            >
              Update Outcome
            </button>
          ) : (
            <span className="text-[11px] text-fog/60 italic">Outcome finalized</span>
          )}
        </div>
      </div>
    </div>
  );
}
