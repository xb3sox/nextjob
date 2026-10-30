import {
  ArrowLeft,
  Award,
  Building2,
  CalendarCheck,
  FileCheck2,
  Lock,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export const MINIMUM_COHORT_SIZE = 5;

export interface CohortReportData {
  cohortId: string;
  cohortName: string;
  organizationName: string;
  participantCount: number;
  activeSeekersCount: number;
  totalApplicationsSubmitted: number;
  interviewRatePercentage: number;
  offerRatePercentage: number;
  averageApplicationsPerSeeker: number;
  generatedAt: string;
}

// Sample cohorts for demonstration / offline use
export const SEED_COHORTS: Record<string, CohortReportData> = {
  'cohort-small': {
    cohortId: 'cohort-small',
    cohortName: 'Spring 2026 Pilot (4 participants)',
    organizationName: 'Tech Career Accelerator',
    participantCount: 4,
    activeSeekersCount: 4,
    totalApplicationsSubmitted: 18,
    interviewRatePercentage: 22,
    offerRatePercentage: 15,
    averageApplicationsPerSeeker: 4.5,
    generatedAt: '2026-10-30T00:00:00Z',
  },
  'cohort-compliant': {
    cohortId: 'cohort-compliant',
    cohortName: 'Fall 2026 Software Engineering (12 participants)',
    organizationName: 'Tech Career Accelerator',
    participantCount: 12,
    activeSeekersCount: 12,
    totalApplicationsSubmitted: 144,
    interviewRatePercentage: 32,
    offerRatePercentage: 42,
    averageApplicationsPerSeeker: 12.0,
    generatedAt: '2026-10-30T00:00:00Z',
  },
};

export default function CohortReportPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedCohortId, setSelectedCohortId] = useState<string>(id || 'cohort-compliant');

  const report = useMemo(() => {
    return SEED_COHORTS[selectedCohortId] || SEED_COHORTS['cohort-compliant'];
  }, [selectedCohortId]);

  const isProtected = report.participantCount < MINIMUM_COHORT_SIZE;

  return (
    <div className="min-h-screen bg-ink text-paper flex flex-col font-sans selection:bg-moss/20">
      {/* Header */}
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
              <Building2 className="w-5 h-5 text-moss" aria-hidden="true" />
              <span className="font-bold tracking-tight text-lg text-paper">
                {report.organizationName}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-fog font-mono ml-1">
                B2B Reporting
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-moss font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full bg-moss/10 border border-moss/20">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>FR-09 & G-10 Compliant</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Cohort Selector and Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-paper tracking-tight">
              Cohort Aggregate Performance
            </h1>
            <p className="text-sm text-fog mt-1">
              Privacy-safe outcome analytics with strict k-anonymity thresholds (G-10).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="cohort-select" className="text-xs text-fog whitespace-nowrap">
              Select Cohort:
            </label>
            <select
              id="cohort-select"
              value={selectedCohortId}
              onChange={(e) => setSelectedCohortId(e.target.value)}
              className="text-xs rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-paper focus:outline-none focus:ring-1 focus:ring-moss"
            >
              <option value="cohort-compliant" className="bg-slate-900 text-paper">
                Fall 2026 (12 participants - Compliant)
              </option>
              <option value="cohort-small" className="bg-slate-900 text-paper">
                Spring 2026 (4 participants - Shielded)
              </option>
            </select>
          </div>
        </div>

        {/* G-10 Privacy Shield for Small Cohorts */}
        {isProtected ? (
          <div
            role="alert"
            className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.05] p-8 text-center max-w-xl mx-auto my-12"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-amber-400" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-paper mb-2">
              Aggregate Reporting Shielded (G-10)
            </h2>
            <p className="text-sm text-fog leading-relaxed mb-4">
              This cohort currently has{' '}
              <strong className="text-paper">{report.participantCount} active participants</strong>.
              Under NextJob privacy safeguard G-10, aggregate reporting requires at least{' '}
              <strong className="text-paper">{MINIMUM_COHORT_SIZE} participants</strong> to prevent
              exposing individual job search outcomes.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-fog">
              <span>
                Threshold Progress: {report.participantCount} / {MINIMUM_COHORT_SIZE} participants
              </span>
            </div>
          </div>
        ) : (
          /* Compliant Aggregate Metrics Display */
          <div className="space-y-8" data-testid="aggregate-metrics-container">
            {/* Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between text-xs text-fog mb-2">
                  <span>Cohort Size</span>
                  <Users className="w-4 h-4 text-moss" aria-hidden="true" />
                </div>
                <div className="text-2xl font-bold text-paper font-mono">
                  {report.participantCount}
                </div>
                <p className="text-[11px] text-fog/60 mt-1">Active participants enrolled</p>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between text-xs text-fog mb-2">
                  <span>Applications Sent</span>
                  <FileCheck2 className="w-4 h-4 text-sky-400" aria-hidden="true" />
                </div>
                <div className="text-2xl font-bold text-paper font-mono">
                  {report.totalApplicationsSubmitted}
                </div>
                <p className="text-[11px] text-fog/60 mt-1">
                  Avg {report.averageApplicationsPerSeeker} per participant
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between text-xs text-fog mb-2">
                  <span>Interview Rate</span>
                  <CalendarCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                </div>
                <div className="text-2xl font-bold text-paper font-mono">
                  {report.interviewRatePercentage}%
                </div>
                <p className="text-[11px] text-fog/60 mt-1">Applications leading to interview</p>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between text-xs text-fog mb-2">
                  <span>Offer Rate</span>
                  <Award className="w-4 h-4 text-amber-400" aria-hidden="true" />
                </div>
                <div className="text-2xl font-bold text-paper font-mono">
                  {report.offerRatePercentage}%
                </div>
                <p className="text-[11px] text-fog/60 mt-1">Interviews converted to offer</p>
              </div>
            </div>

            {/* Privacy Compliance Footer Note */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-start gap-3 text-xs text-fog">
              <ShieldCheck className="w-5 h-5 text-moss shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-paper mb-0.5">Privacy Notice (FR-09)</p>
                <p>
                  All metrics displayed above are strictly aggregated across the entire cohort.
                  NextJob does not disclose individual candidate identities, submitted applications,
                  resumes, or confidential candidate data to organizational administrators.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
