import { ArrowRight, Calculator, CheckCircle2, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { useId, useState } from 'react';
import { analytics } from '../../lib/analytics';

export interface RoiCalculatorProps {
  className?: string;
  initialApplications?: number;
  initialHoursPerApp?: number;
  initialCallbackRate?: number;
  ctaHref?: string;
  onCtaClick?: () => void;
}

export interface RoiMetrics {
  manualMonthlyHours: number;
  nextJobMonthlyHours: number;
  monthlyHoursSaved: number;
  yearlyDaysSaved: number;
  timeReductionPercent: number;
  currentCallbacks: number;
  projectedCallbacks: number;
  extraCallbacks: number;
  provenanceScore: number;
  atsPassRate: number;
}

export function calculateRoi(
  applicationsPerMonth: number,
  hoursPerApplication: number,
  callbackRatePercent: number
): RoiMetrics {
  const manualMonthlyHours = Math.round(applicationsPerMonth * hoursPerApplication * 10) / 10;
  // NextJob averages 3 minutes (0.05 hrs) per verified, tailored application
  const nextJobMonthlyHours = Math.round(applicationsPerMonth * 0.05 * 10) / 10;
  const monthlyHoursSaved = Math.max(1, Math.round(manualMonthlyHours - nextJobMonthlyHours));
  // 8 hours per working day
  const yearlyDaysSaved = Math.max(1, Math.round((monthlyHoursSaved * 12) / 8));
  const timeReductionPercent = 93;

  const currentCallbacks = Math.round(applicationsPerMonth * (callbackRatePercent / 100) * 10) / 10;
  // 3.2x interview callback lift from verified career claims and tailored fit
  const projectedCallbacks = Math.round(currentCallbacks * 3.2 * 10) / 10;
  const extraCallbacks = Math.max(1, Math.round((projectedCallbacks - currentCallbacks) * 10) / 10);

  return {
    manualMonthlyHours,
    nextJobMonthlyHours,
    monthlyHoursSaved,
    yearlyDaysSaved,
    timeReductionPercent,
    currentCallbacks,
    projectedCallbacks,
    extraCallbacks,
    provenanceScore: 100,
    atsPassRate: 99.4,
  };
}

export const SEARCH_PRESETS = [
  { label: 'Casual Search', apps: 10, hours: 1.0, callback: 3.0 },
  { label: 'Active Transition', apps: 30, hours: 1.5, callback: 3.0 },
  { label: 'Aggressive Search', apps: 60, hours: 2.0, callback: 2.5 },
];

/**
 * RoiCalculator Component (T-71, FR-CRO-03)
 * Interactive career search ROI calculator estimating time saved, interview lift, and quality score.
 */
export function RoiCalculator({
  className = '',
  initialApplications = 30,
  initialHoursPerApp = 1.5,
  initialCallbackRate = 3.0,
  ctaHref = '/signup',
  onCtaClick,
}: RoiCalculatorProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [hoursPerApp, setHoursPerApp] = useState(initialHoursPerApp);
  const [callbackRate, setCallbackRate] = useState(initialCallbackRate);

  const appsInputId = useId();
  const hoursInputId = useId();
  const callbackInputId = useId();

  const metrics = calculateRoi(applications, hoursPerApp, callbackRate);

  const handleCtaClick = () => {
    analytics.trackCtaClick('roi_calculator', ctaHref);
    if (onCtaClick) onCtaClick();
  };

  const applyPreset = (preset: (typeof SEARCH_PRESETS)[number]) => {
    setApplications(preset.apps);
    setHoursPerApp(preset.hours);
    setCallbackRate(preset.callback);
  };

  return (
    <section
      aria-label="Career search ROI calculator"
      className={`rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-sm p-6 sm:p-8 md:p-10 ${className}`}
    >
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
          <Calculator className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Interactive Value Estimator</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-paper">
          Calculate Your Career Search ROI
        </h2>
        <p className="text-sm sm:text-base text-fog leading-relaxed">
          See how many hours you save and how many more interview callbacks you earn when every
          application is grounded in verified evidence.
        </p>

        {/* Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-fog font-medium mr-1">Quick Presets:</span>
          {SEARCH_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                applications === preset.apps &&
                hoursPerApp === preset.hours &&
                callbackRate === preset.callback
                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'border-white/10 bg-white/5 text-fog hover:text-paper hover:bg-white/10'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6 bg-neutral-950/60 p-6 rounded-xl border border-white/5">
          <h3 className="text-base font-semibold text-paper flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-moss" aria-hidden="true" />
            <span>Your Current Search Metrics</span>
          </h3>

          {/* Applications Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor={appsInputId} className="text-sm font-medium text-paper">
                Monthly Applications
              </label>
              <span className="text-sm font-semibold text-emerald-400 font-mono">
                {applications} / mo
              </span>
            </div>
            <input
              id={appsInputId}
              type="range"
              min="5"
              max="100"
              step="5"
              value={applications}
              onChange={(e) => setApplications(Number(e.target.value))}
              aria-valuemin={5}
              aria-valuemax={100}
              aria-valuenow={applications}
              aria-valuetext={`${applications} applications per month`}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-between text-xs text-fog">
              <span>5 roles</span>
              <span>50 roles</span>
              <span>100 roles</span>
            </div>
          </div>

          {/* Hours Per App Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor={hoursInputId} className="text-sm font-medium text-paper">
                Hours Spent Per Role (Manual)
              </label>
              <span className="text-sm font-semibold text-emerald-400 font-mono">
                {hoursPerApp.toFixed(1)} hrs
              </span>
            </div>
            <input
              id={hoursInputId}
              type="range"
              min="0.5"
              max="4.0"
              step="0.5"
              value={hoursPerApp}
              onChange={(e) => setHoursPerApp(Number(e.target.value))}
              aria-valuemin={0.5}
              aria-valuemax={4.0}
              aria-valuenow={hoursPerApp}
              aria-valuetext={`${hoursPerApp.toFixed(1)} hours per application`}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-between text-xs text-fog">
              <span>30 min</span>
              <span>2 hours</span>
              <span>4 hours</span>
            </div>
          </div>

          {/* Current Callback Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor={callbackInputId} className="text-sm font-medium text-paper">
                Current Callback Rate
              </label>
              <span className="text-sm font-semibold text-emerald-400 font-mono">
                {callbackRate.toFixed(1)}%
              </span>
            </div>
            <input
              id={callbackInputId}
              type="range"
              min="1.0"
              max="15.0"
              step="0.5"
              value={callbackRate}
              onChange={(e) => setCallbackRate(Number(e.target.value))}
              aria-valuemin={1.0}
              aria-valuemax={15.0}
              aria-valuenow={callbackRate}
              aria-valuetext={`${callbackRate.toFixed(1)} percent callback rate`}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-between text-xs text-fog">
              <span>1% (Industry avg)</span>
              <span>8%</span>
              <span>15%</span>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <section
          aria-live="polite"
          aria-label="ROI calculation outcomes"
          className="lg:col-span-7 space-y-6"
        >
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Time Saved Card */}
            <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Time Saved</span>
                <Clock className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-paper font-mono">
                  {metrics.monthlyHoursSaved}
                </span>
                <span className="text-sm text-emerald-300 font-medium">hrs / month</span>
              </div>
              <p className="text-xs text-neutral-300">
                ~{metrics.yearlyDaysSaved} full work days saved annually with 93% application time
                reduction.
              </p>
            </div>

            {/* Interview Lift Card */}
            <div className="p-5 rounded-xl border border-white/10 bg-neutral-950/70 space-y-2">
              <div className="flex items-center justify-between text-moss">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Interview Lift
                </span>
                <TrendingUp className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-paper font-mono">
                  +{metrics.extraCallbacks}
                </span>
                <span className="text-sm text-fog font-medium">interviews / mo</span>
              </div>
              <p className="text-xs text-fog">
                Projected {metrics.projectedCallbacks} callbacks/mo vs {metrics.currentCallbacks}{' '}
                baseline (3.2x lift).
              </p>
            </div>
          </div>

          {/* Secondary Quality Indicators */}
          <div className="p-5 rounded-xl border border-white/10 bg-neutral-950/40 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-fog">
              Evidence Quality & Compliance Guarantees
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-moss shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-sm font-semibold text-paper">
                    {metrics.provenanceScore}% Provenance
                  </div>
                  <div className="text-xs text-fog">Zero hallucinated statements</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-moss shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-sm font-semibold text-paper">
                    {metrics.atsPassRate}% ATS Pass Rate
                  </div>
                  <div className="text-xs text-fog">vs 35% industry baseline</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Box */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="text-sm font-semibold text-paper">
                Ready to reclaim {metrics.monthlyHoursSaved} hours this month?
              </div>
              <div className="text-xs text-fog">
                Start applying with cryptographic proof and zero spam.
              </div>
            </div>
            <a
              href={ctaHref}
              onClick={handleCtaClick}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-950 shrink-0 w-full sm:w-auto"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </section>
  );
}
