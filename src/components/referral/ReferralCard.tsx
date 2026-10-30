import { Check, Copy, Gift, TrendingUp, Users } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export interface ReferralCardProps {
  referralCode?: string;
  referralUrl?: string;
  stats?: {
    clicks: number;
    successfulSignups: number;
    rewardCreditsEarned: number;
  };
}

export function ReferralCard({
  referralCode = 'REF-NEXTJOB',
  referralUrl = 'https://nextjob.ai/?ref=REF-NEXTJOB',
  stats = { clicks: 0, successfulSignups: 0, rewardCreditsEarned: 0 },
}: ReferralCardProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="bg-card border border-border rounded-xl p-6 shadow-sm text-card-foreground"
      data-testid="referral-card"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
          <Gift className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Refer Friends & Earn Credits</h2>
          <p className="text-sm text-muted-foreground">
            Give candidates $10 off their Search Pass and earn $10 credit for each verified signup.
          </p>
        </div>
      </div>

      <div className="bg-muted/40 rounded-lg p-4 border border-border/60 mb-6">
        <label
          htmlFor="referral-url-input"
          className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider"
        >
          Your Unique Referral Link (Code: {referralCode})
        </label>
        <div className="flex gap-2">
          <input
            id="referral-url-input"
            type="text"
            readOnly
            value={referralUrl}
            className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Your unique referral link"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={copied ? 'Link copied to clipboard' : 'Copy referral link to clipboard'}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
        <div className="sr-only" aria-live="polite">
          {copied ? 'Referral link copied to clipboard' : ''}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-background border border-border text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Link Clicks</span>
          </div>
          <div
            className="text-xl font-bold tracking-tight text-foreground"
            data-testid="stat-clicks"
          >
            {stats.clicks}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-background border border-border text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1 text-xs font-medium">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Signups</span>
          </div>
          <div
            className="text-xl font-bold tracking-tight text-foreground"
            data-testid="stat-signups"
          >
            {stats.successfulSignups}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-background border border-border text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1 text-xs font-medium">
            <Gift className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Credits Earned</span>
          </div>
          <div
            className="text-xl font-bold tracking-tight text-emerald-400"
            data-testid="stat-rewards"
          >
            ${stats.rewardCreditsEarned}
          </div>
        </div>
      </div>
    </div>
  );
}
