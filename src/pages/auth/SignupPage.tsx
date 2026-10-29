import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';
import { safeReturnPath } from '@/lib/redirect';

/** Lightweight client-side strength meter (server enforces the real policy). */
function scorePassword(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

export default function SignupPage() {
  const { status, configured, signUp } = useAuth();
  const location = useLocation();
  // After email confirmation Supabase redirects here with ?confirmed=true and
  // an active session; send the user to their intended destination, not back
  // to /signup (which would loop while authenticated).
  const redirectTo = safeReturnPath(
    new URLSearchParams(location.search).get('next') ??
      (location.state as { from?: string } | null)?.from
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState<string | null>(null);

  const strength = useMemo(() => scorePassword(password), [password]);

  if (status === 'authenticated') return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const result = await signUp({ email, password, name: name.trim() });
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.needsEmailConfirmation) {
      setConfirmationSent(email);
    }
    // If a session was returned, the auth state change + guard above navigates.
  };

  if (confirmationSent) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={`We sent a confirmation link to ${confirmationSent}.`}
        footer={
          <>
            Already confirmed?{' '}
            <Link to="/login" className="text-moss hover:text-paper transition-colors font-medium">
              Sign in
            </Link>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-lg border border-moss/30 bg-moss/5 px-4 py-4 text-sm text-paper">
          <Check className="w-5 h-5 text-moss shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Click the link in the email to activate your account, then sign in. The link expires in
            24 hours.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free while in beta · No credit card required."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-moss hover:text-paper transition-colors font-medium">
            Sign in
          </Link>
        </>
      }
    >
      {!configured && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          Authentication isn’t configured on this deployment. Set VITE_SUPABASE_URL and
          VITE_SUPABASE_ANON_KEY to enable sign-up.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="signup-name" className="block text-sm font-medium mb-1.5">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Alex Rivera"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-fog/70 focus:outline-none focus:border-moss/50 focus:ring-1 focus:ring-moss/30 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium mb-1.5">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="you@company.com"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-fog/70 focus:outline-none focus:border-moss/50 focus:ring-1 focus:ring-moss/30 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-fog/70 focus:outline-none focus:border-moss/50 focus:ring-1 focus:ring-moss/30 transition-colors"
              aria-describedby={password ? 'password-strength' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-fog hover:text-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss/50 focus-visible:ring-offset-1 focus-visible:ring-offset-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {password && (
            <div id="password-strength" className="mt-2 flex items-center gap-2" aria-live="polite">
              <div className="flex-1 flex gap-1" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full ${i < strength ? 'bg-moss' : 'bg-white/10'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-fog">{STRENGTH_LABELS[strength]}</span>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="flex items-center gap-2 text-sm text-danger">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-moss-deep hover:bg-moss disabled:opacity-60 disabled:cursor-not-allowed text-moss-dark font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {loading && (
            <span
              className="w-4 h-4 rounded-full border-2 border-moss-dark/30 border-t-moss-dark animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-xs text-fog/70 text-center">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="underline hover:text-paper">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline hover:text-paper">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthLayout>
  );
}
