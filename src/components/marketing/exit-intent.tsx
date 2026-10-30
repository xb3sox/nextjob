import { ArrowRight, Check, CheckCircle2, Download, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type UseExitIntentOptions, useExitIntent } from '../../hooks/use-exit-intent';

export interface ExitIntentModalProps extends UseExitIntentOptions {
  forceOpen?: boolean;
  onLeadCapture?: (email: string) => Promise<void> | void;
  title?: string;
  description?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ExitIntentModal (T-72, FR-CRO-04)
 * Desktop exit-intent lead magnet modal offering the 2026 Evidence Playbook.
 */
export function ExitIntentModal({
  forceOpen = false,
  storageKey = 'nextjob_exit_intent_shown',
  delay = 1000,
  threshold = 20,
  disabled = false,
  onLeadCapture,
  title = 'Wait! Get The 2026 Engineering Career & Evidence Playbook',
  description = 'Learn how top engineers achieve a 3.2x callback lift by applying with verified career claims and cryptographic receipts.',
}: ExitIntentModalProps) {
  const { isTriggered, dismiss } = useExitIntent({
    storageKey,
    delay,
    threshold,
    disabled: disabled && !forceOpen,
  });

  const isOpen = forceOpen || isTriggered;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    dismiss();
    setStatus('idle');
    setErrorMessage('');
    previousFocus.current?.focus();
  }, [dismiss]);

  useEffect(() => {
    if (!isOpen) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => emailInputRef.current?.focus(), 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    const handleBackdrop = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleBackdrop);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleBackdrop);
    };
  }, [isOpen, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = email.trim();
    if (!val) {
      setStatus('error');
      setErrorMessage('Please enter your work or personal email address.');
      return;
    }
    if (!EMAIL_REGEX.test(val)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    try {
      if (onLeadCapture) await onLeadCapture(val);
      else await new Promise((res) => setTimeout(res, 600));
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Failed to send playbook. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      aria-describedby="exit-intent-desc"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 focus:outline-none"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/95 p-6 sm:p-8 text-neutral-100 shadow-2xl backdrop-blur-xl"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <X className="h-5 w-5" />
        </button>

        {status === 'success' ? (
          <div className="py-6 text-center space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 id="exit-intent-title" className="text-xl font-semibold text-white">
              Playbook Sent!
            </h3>
            <p id="exit-intent-desc" className="text-sm text-neutral-300 max-w-sm mx-auto">
              We’ve dispatched the <strong className="text-white">2026 Evidence Playbook</strong> to{' '}
              <span className="font-mono text-emerald-300">{email}</span>. Check your inbox to
              begin.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full mt-2 rounded-lg bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Close & Return to Page
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Free 2026 Candidate Resource</span>
            </div>

            <div className="space-y-2">
              <h2
                id="exit-intent-title"
                className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug"
              >
                {title}
              </h2>
              <p id="exit-intent-desc" className="text-sm text-neutral-300 leading-relaxed">
                {description}
              </p>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-neutral-300 border-y border-white/10 py-3.5">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Zero-hallucination resume tailoring checklist</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>The 10 hard eligibility checks preventing silent rejections</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Cryptographic SHA-256 submission receipt template</span>
              </li>
            </ul>

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div>
                <label htmlFor="exit-intent-email" className="sr-only">
                  Email address
                </label>
                <input
                  ref={emailInputRef}
                  id="exit-intent-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="engineer@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') {
                      setStatus('idle');
                      setErrorMessage('');
                    }
                  }}
                  disabled={status === 'loading'}
                  aria-invalid={status === 'error'}
                  aria-describedby={status === 'error' ? 'exit-intent-error' : undefined}
                  className="w-full rounded-lg border border-white/15 bg-neutral-800/80 px-4 py-2.5 text-sm text-white placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                />
                {status === 'error' && (
                  <p id="exit-intent-error" role="alert" className="mt-1.5 text-xs text-rose-400">
                    {errorMessage}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <span>Sending Playbook...</span>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download Free Playbook</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors underline-offset-4 hover:underline"
              >
                No thanks, I prefer manual applications
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
