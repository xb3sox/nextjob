import { ArrowLeft, FileCheck, LogOut, Search, ShieldAlert, Zap } from 'lucide-react';
import { useId, useMemo } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { verifyReceipt } from './receiptVerifier';
import {
  APPLICATION_GROUPS,
  type ApplicationGroup,
  STATE_TO_GROUP,
  type TrackedApplication,
} from './types';
import { useApplications } from './useApplications';

export default function ApplicationsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications] = useApplications();
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

      // Filter by search query
      if (query.trim()) {
        const q = query.toLowerCase();
        const titleMatch = app.jobTitle?.toLowerCase().includes(q);
        const companyMatch = app.companyName?.toLowerCase().includes(q);
        const idMatch = app.id.toLowerCase().includes(q);
        if (!titleMatch && !companyMatch && !idMatch) {
          return false;
        }
      }

      return true;
    });
  }, [applications, stateFilter, query]);

  // Group applications by the eight defined groups in exact order
  const groupedApps = useMemo(() => {
    const map = new Map<ApplicationGroup, TrackedApplication[]>();
    for (const group of APPLICATION_GROUPS) {
      map.set(group, []);
    }
    for (const app of filteredApps) {
      const group = STATE_TO_GROUP[app.state] || 'Planned';
      map.get(group)?.push(app);
    }
    return map;
  }, [filteredApps]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSearchChange = (newQuery: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newQuery) {
          next.set('q', newQuery);
        } else {
          next.delete('q');
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleGroupFilter = (groupOrAll: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (groupOrAll === 'all') {
          next.delete('state');
        } else {
          next.set('state', groupOrAll.toLowerCase().replace(/\s+/g, '-'));
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const hasAnyApps = applications.length > 0;
  const hasMatchingApps = filteredApps.length > 0;

  return (
    <div className="min-h-screen bg-ink text-paper">
      {/* Header */}
      <header className="border-b border-white/5 bg-ink/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Zap className="w-5 h-5 text-moss" aria-hidden="true" />
              <span>NextJob</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-sm font-medium text-white/80">Application Tracker</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-fog hover:text-paper transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Dashboard</span>
            </Link>
            <span className="hidden sm:block text-xs text-fog/60 truncate max-w-40">
              {user.email}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-xs text-fog hover:text-paper transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Page Title & Controls */}
        <div className="mb-8">
          <h1 className="font-display text-4xl mb-2">Application Tracker</h1>
          <p className="text-fog text-sm max-w-xl">
            Track and verify the end-to-end lifecycle of every job application, from planned
            tailoring to immutable submission receipts.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <label htmlFor={searchInputId} className="sr-only">
              Search applications by title, company, or ID
            </label>
            <Search
              className="w-4 h-4 text-fog/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id={searchInputId}
              type="search"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search applications..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-paper placeholder:text-fog/50 focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent transition-all"
            />
          </div>

          {/* Group Filter Tabs (Buttons) */}
          <div
            className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-none"
            role="tablist"
            aria-label="Filter applications by state"
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
                        <ApplicationItem key={app.id} application={app} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function ApplicationItem({ application }: { application: TrackedApplication }) {
  const { id, state, jobTitle, companyName, receipt, audit } = application;
  const isReceiptValid = receipt ? verifyReceipt(receipt) : true;

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
    </div>
  );
}
