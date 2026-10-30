import { ArrowRight, CheckCircle2, Download, Mail, ShieldCheck } from 'lucide-react';
import { useId, useState } from 'react';
import { POST as submitNewsletter } from '../../pages/api/newsletter/route';

export interface EmailCaptureProps {
  variant?: 'footer' | 'lead_magnet' | 'inline';
  title?: string;
  description?: string;
  buttonText?: string;
  source?: 'footer' | 'lead_magnet' | 'exit_intent' | 'standalone';
  leadMagnetId?: string;
  onSuccess?: (email: string) => void;
  className?: string;
  compact?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailCapture({
  variant = 'footer',
  title,
  description,
  buttonText,
  source = 'footer',
  leadMagnetId,
  onSuccess,
  className = '',
  compact = false,
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const emailInputId = useId();
  const consentCheckboxId = useId();
  const errorId = useId();

  const getDefaultTitle = () => {
    if (title) return title;
    if (variant === 'lead_magnet') return 'Download the 2026 Evidence Playbook';
    if (variant === 'inline') return 'Get Career Insights in Your Inbox';
    return 'Subscribe to Career Engineering';
  };

  const getDefaultDescription = () => {
    if (description) return description;
    if (variant === 'lead_magnet') {
      return 'Get actionable strategies for verified career claims, ATS proofing, and receipt-backed applications.';
    }
    return 'Weekly evidence-backed insights on job matching, AI tailoring, and hiring benchmarks. Zero spam.';
  };

  const getDefaultButtonText = () => {
    if (buttonText) return buttonText;
    if (variant === 'lead_magnet') return 'Get Free Playbook';
    return 'Subscribe';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = email.trim();

    if (!val) {
      setStatus('error');
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!EMAIL_REGEX.test(val)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!consent) {
      setStatus('error');
      setErrorMessage('Please confirm your consent to receive emails.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await submitNewsletter({
        email: val,
        consent,
        source,
        leadMagnetId,
      });

      if (res.status >= 200 && res.status < 300) {
        setStatus('success');
        if (onSuccess) onSuccess(val);
      } else {
        setStatus('error');
        const errBody = res.body as { error?: string };
        setErrorMessage(errBody.error || 'Failed to submit. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-300 ${className}`}
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-white text-sm sm:text-base">You're subscribed!</h4>
            <p className="text-xs sm:text-sm text-neutral-300">
              We’ve sent a confirmation to{' '}
              <span className="font-mono text-emerald-300">{email}</span>. Check your inbox shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {!compact && (
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            {variant === 'lead_magnet' ? (
              <Download className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span>{getDefaultTitle()}</span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-lg">
            {getDefaultDescription()}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <label htmlFor={emailInputId} className="sr-only">
              Email address
            </label>
            <input
              id={emailInputId}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              disabled={status === 'loading'}
              aria-invalid={status === 'error'}
              aria-describedby={status === 'error' ? errorId : undefined}
              className="w-full rounded-lg border border-white/15 bg-neutral-900/90 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 shrink-0"
          >
            {status === 'loading' ? (
              <span>Submitting...</span>
            ) : (
              <>
                <span>{getDefaultButtonText()}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        <div className="flex items-start gap-2.5 pt-1">
          <input
            id={consentCheckboxId}
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (status === 'error') setStatus('idle');
            }}
            disabled={status === 'loading'}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-neutral-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-neutral-950"
          />
          <label
            htmlFor={consentCheckboxId}
            className="text-xs text-neutral-400 leading-snug cursor-pointer select-none"
          >
            I agree to receive emails and accept the GDPR data processing policy. Unsubscribe
            anytime.
          </label>
        </div>

        {status === 'error' && (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-rose-400 flex items-center gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}
      </form>
    </div>
  );
}
