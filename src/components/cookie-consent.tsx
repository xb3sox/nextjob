import type React from 'react';
import { useEffect, useState } from 'react';
import { getHeatmapTracker } from '../lib/analytics/heatmaps';

export interface CookieConsentProps {
  onConsentChange?: (preferences: { analytics: boolean; sessionRecording: boolean }) => void;
}

export function CookieConsent({ onConsentChange }: CookieConsentProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(false);

  useEffect(() => {
    const tracker = getHeatmapTracker();
    const existing = tracker.loadConsent();
    if (!existing) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const prefs = { analytics: true, sessionRecording: true };
    getHeatmapTracker().setConsent(prefs);
    setIsVisible(false);
    onConsentChange?.(prefs);
  };

  const handleDeclineAll = () => {
    const prefs = { analytics: false, sessionRecording: false };
    getHeatmapTracker().setConsent(prefs);
    setIsVisible(false);
    onConsentChange?.(prefs);
  };

  const handleSaveCustom = () => {
    const prefs = { analytics: analyticsEnabled, sessionRecording: recordingEnabled };
    getHeatmapTracker().setConsent(prefs);
    setIsVisible(false);
    onConsentChange?.(prefs);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Privacy and Cookie Preferences"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-md shadow-2xl transition-all"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Privacy & Interaction Preferences
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            NextJob never sells candidate data or sends PII to third parties. We use
            privacy-preserving, consent-gated analytics and interaction heatmaps to improve job
            matching and user experience.
          </p>
        </div>

        {isCustomizing ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500"
              />
              Product Analytics
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={recordingEnabled}
                onChange={(e) => setRecordingEnabled(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500"
              />
              Heatmaps & Recording
            </label>
            <button
              type="button"
              onClick={handleSaveCustom}
              className="px-4 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsCustomizing(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 transition-colors"
            >
              Customize
            </button>
            <button
              type="button"
              onClick={handleDeclineAll}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 transition-colors"
            >
              Reject Optional
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition-colors"
            >
              Accept All
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default CookieConsent;
