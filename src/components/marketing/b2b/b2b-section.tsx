import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck,
  Check,
  FileCheck2,
  Lock,
  Mail,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

export interface B2BSectionProps {
  className?: string;
}

export function B2BSection({ className = '' }: B2BSectionProps) {
  const [activeSimulation, setActiveSimulation] = useState<'compliant' | 'shielded'>('compliant');
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [cohortSize, setCohortSize] = useState('25-50');

  const handleDemoSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!institutionName.trim() || !workEmail.trim()) return;
    setDemoSubmitted(true);
  };

  return (
    <section
      id="for-institutions"
      aria-label="NextJob for Institutions & Career Accelerators"
      className={`py-24 px-6 border-t border-white/5 scroll-mt-20 ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-moss/10 text-moss border border-moss/20 mb-4">
            <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>NextJob for Institutions & Bootcamps</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl mb-6 tracking-tight">
            Elevate cohort outcomes. <em className="not-italic text-moss">Zero surveillance.</em>
          </h2>
          <p className="text-fog text-base sm:text-lg leading-relaxed">
            Equip your students and fellows with truthful, evidence-backed job search automation.
            Track aggregate placement lift while upholding absolute candidate privacy.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-moss/10 text-moss flex items-center justify-center mb-4">
                <Users className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-paper mb-2">Cohort Management</h3>
              <p className="text-sm text-fog leading-relaxed">
                Organize seekers by graduation batch or track. Provision bulk Search Passes with a
                single onboarding link and track cohort progression seamlessly.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-moss flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Bulk license provisioning</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-paper mb-2">
                Privacy Safeguards (G-10 & FR-09)
              </h3>
              <p className="text-sm text-fog leading-relaxed">
                Aggregate reporting is strictly locked unless cohort size is ≥5 participants. Admins
                never see personal resumes, target companies, or individual rejections.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Zero candidate surveillance</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-paper mb-2">Aggregate ROI Analytics</h3>
              <p className="text-sm text-fog leading-relaxed">
                Measure macro placement velocity, application-to-interview conversion rates, and
                market response trends to continually refine your curriculum.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-sky-400 flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Exportable audit reports</span>
            </div>
          </div>
        </div>

        {/* Live Privacy Simulation Widget (Interactive Showcase of G-10 & FR-09) */}
        <div className="mb-20 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-moss">
                Live Safeguard Architecture
              </span>
              <h3 className="text-xl font-bold text-paper mt-1">
                Experience NextJob Privacy Architecture (G-10)
              </h3>
            </div>
            {/* Toggle Switch */}
            <div
              role="tablist"
              aria-label="Cohort size simulation mode"
              className="inline-flex rounded-xl p-1 bg-white/5 border border-white/10"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeSimulation === 'compliant'}
                onClick={() => setActiveSimulation('compliant')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeSimulation === 'compliant'
                    ? 'bg-moss text-ink font-semibold'
                    : 'text-fog hover:text-paper'
                }`}
              >
                Compliant Cohort (N = 12)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeSimulation === 'shielded'}
                onClick={() => setActiveSimulation('shielded')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeSimulation === 'shielded'
                    ? 'bg-amber-500 text-ink font-semibold'
                    : 'text-fog hover:text-paper'
                }`}
              >
                Sub-Threshold (N = 4)
              </button>
            </div>
          </div>

          {/* Simulation Output Area */}
          {activeSimulation === 'compliant' ? (
            <div className="space-y-6" data-testid="b2b-compliant-view">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between text-xs text-fog mb-1">
                    <span>Enrolled Cohort</span>
                    <Users className="w-3.5 h-3.5 text-moss" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-paper">12</div>
                  <span className="text-[11px] text-moss">≥5 threshold met</span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between text-xs text-fog mb-1">
                    <span>Applications Sent</span>
                    <FileCheck2 className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-paper">144</div>
                  <span className="text-[11px] text-fog/70">12 avg / seeker</span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between text-xs text-fog mb-1">
                    <span>Interview Rate</span>
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-paper">32%</div>
                  <span className="text-[11px] text-emerald-400">+14% vs benchmark</span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between text-xs text-fog mb-1">
                    <span>Offer Conversion</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-paper">42%</div>
                  <span className="text-[11px] text-fog/70">Aggregate cohort rate</span>
                </div>
              </div>
              <p className="text-xs text-fog/80 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
                <span>
                  All metrics aggregate across all 12 participants. Zero individual application
                  records are shared.
                </span>
              </p>
            </div>
          ) : (
            <div
              role="alert"
              className="p-6 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] text-center max-w-xl mx-auto"
              data-testid="b2b-shielded-view"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5 text-amber-400" aria-hidden="true" />
              </div>
              <h4 className="text-base font-semibold text-paper mb-1">
                Aggregate Reporting Shielded (Threshold &lt; 5)
              </h4>
              <p className="text-xs text-fog leading-relaxed mb-3">
                With 4 seekers enrolled, individual outcomes could be reverse-engineered. Under
                NextJob G-10 privacy rules, reports require ≥5 seekers before disclosing cohort
                metrics.
              </p>
              <span className="inline-block text-xs font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded">
                Active Participants: 4 / 5 required
              </span>
            </div>
          )}
        </div>

        {/* Institutional Pricing & Demo Form Grid */}
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Organization Pricing Tiers */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-paper">Transparent Institutional Plans</h3>
            <p className="text-sm text-fog leading-relaxed">
              Equip your job seekers with verified applications, real-time receipt hashing, and
              curated eligibility checks.
            </p>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-paper">Pilot Cohort</h4>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/10 text-fog">
                    Single batch
                  </span>
                </div>
                <div className="text-2xl font-bold text-paper font-mono mb-2">
                  $490{' '}
                  <span className="text-xs font-normal text-fog">/ cohort (up to 25 seekers)</span>
                </div>
                <ul className="text-xs text-fog space-y-2 mt-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-moss shrink-0" aria-hidden="true" />
                    <span>90-day Search Pass access for all enrolled seekers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-moss shrink-0" aria-hidden="true" />
                    <span>Aggregate cohort outcome dashboard (G-10 compliant)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-moss shrink-0" aria-hidden="true" />
                    <span>Single-link invitation flow for easy student onboarding</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl border border-moss/30 bg-moss/[0.03] shadow-[0_0_40px_-15px_rgba(52,211,153,0.2)]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-paper">Career Accelerator</h4>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-moss/20 text-moss">
                    Most Popular
                  </span>
                </div>
                <div className="text-2xl font-bold text-paper font-mono mb-2">
                  $1,800{' '}
                  <span className="text-xs font-normal text-fog">
                    / quarter (up to 150 seekers)
                  </span>
                </div>
                <ul className="text-xs text-fog space-y-2 mt-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-moss shrink-0" aria-hidden="true" />
                    <span>Unlimited cohorts & ongoing seeker enrollment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-moss shrink-0" aria-hidden="true" />
                    <span>Curriculum alignment and role requirement insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-moss shrink-0" aria-hidden="true" />
                    <span>Quarterly aggregate placement report & CSV export</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Testimonial Quote */}
            <blockquote className="p-5 rounded-xl border border-white/5 bg-white/[0.01] text-xs text-fog leading-relaxed italic">
              "NextJob doubled our bootcamp's 90-day placement rate while maintaining 100% student
              privacy trust. Our career team finally has objective, aggregate metrics."
              <footer className="mt-2 font-semibold not-italic text-paper">
                — Director of Career Outcomes, Apex Tech Academy
              </footer>
            </blockquote>
          </div>

          {/* Interactive Request Demo / Contact Form */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h3 className="text-xl font-bold text-paper mb-2">Request an Institutional Demo</h3>
            <p className="text-xs text-fog mb-6">
              Connect with our enterprise partnerships team to pilot NextJob for your upcoming
              cohort.
            </p>

            {demoSubmitted ? (
              <div
                role="status"
                aria-live="polite"
                className="p-6 rounded-xl border border-moss/30 bg-moss/[0.05] text-center"
              >
                <div className="w-10 h-10 rounded-full bg-moss/20 text-moss flex items-center justify-center mx-auto mb-3">
                  <Check className="w-5 h-5" aria-hidden="true" />
                </div>
                <h4 className="font-semibold text-paper mb-1">Demo Request Received</h4>
                <p className="text-xs text-fog leading-relaxed mb-4">
                  Thank you, <strong className="text-paper">{institutionName}</strong>. Our
                  partnerships team will reach out to{' '}
                  <strong className="text-paper">{workEmail}</strong> within 1 business day.
                </p>
                <Link
                  to="/organizations/cohort-compliant/reports"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-moss hover:underline"
                >
                  <span>Explore interactive sample cohort report</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleDemoSubmit}
                className="space-y-4"
                aria-label="Request institutional demo"
              >
                <div>
                  <label
                    htmlFor="b2b-institution-name"
                    className="block text-xs font-medium text-fog mb-1.5"
                  >
                    Institution or Bootcamp Name *
                  </label>
                  <input
                    id="b2b-institution-name"
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. Apex Coding Academy"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-ink/60 text-paper text-sm placeholder:text-fog/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
                  />
                </div>

                <div>
                  <label
                    htmlFor="b2b-work-email"
                    className="block text-xs font-medium text-fog mb-1.5"
                  >
                    Work Email *
                  </label>
                  <div className="relative">
                    <input
                      id="b2b-work-email"
                      type="email"
                      required
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      placeholder="career.services@institution.edu"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-white/10 bg-ink/60 text-paper text-sm placeholder:text-fog/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
                    />
                    <Mail
                      className="w-4 h-4 text-fog/50 absolute left-3 top-3 pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="b2b-cohort-size"
                    className="block text-xs font-medium text-fog mb-1.5"
                  >
                    Expected Active Seekers per Cohort
                  </label>
                  <select
                    id="b2b-cohort-size"
                    value={cohortSize}
                    onChange={(e) => setCohortSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-ink/80 text-paper text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
                  >
                    <option value="5-25">5 - 25 seekers (Pilot)</option>
                    <option value="25-50">25 - 50 seekers (Standard)</option>
                    <option value="50-150">50 - 150 seekers (Accelerator)</option>
                    <option value="150+">150+ seekers (University / Multi-campus)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-moss hover:bg-moss/90 text-ink font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Request Institutional Demo</span>
                </button>

                <p className="text-[11px] text-center text-fog/60">
                  Zero spam · No candidate PII collected · SOC 2 and GDPR aligned
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
