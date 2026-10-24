import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

/**
 * Reached after the user clicks the emailed reset link. Supabase's
 * detectSessionInUrl exchanges the recovery code for a session, so this page
 * simply collects the new password and calls updateUser.
 */
export default function ResetPasswordPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!cancelled) setReady(Boolean(data.session));
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError('This reset link is invalid or has expired. Request a new one.');
      return;
    }
    // Supabase keeps the recovery session active after updateUser, so
    // immediately sign it out before returning to login — otherwise the user
    // stays silently authenticated mid-reset.
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  // A user who already has an active session and did not arrive via a fresh
  // recovery link should not be able to load this page (prevents using a
  // leftover session to call updateUser without a password-recovery grant).
  const params = new URLSearchParams(window.location.search);
  const arrivedViaRecoveryLink = params.has('code') || params.has('access_token');
  if (!arrivedViaRecoveryLink && status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={ready ? undefined : 'Waiting for your reset link to activate…'}
      footer={
        <Link to="/login" className="text-moss hover:text-paper transition-colors font-medium">
          Back to sign in
        </Link>
      }
    >
      {!ready ? (
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-4 text-sm text-fog">
          <span
            className="w-4 h-4 rounded-full border-2 border-moss/30 border-t-moss animate-spin motion-reduce:animate-none shrink-0"
            aria-hidden="true"
          />
          Open the “Reset password” link from your email to continue. If you clicked it already,
          refresh this page.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="reset-password" className="block text-sm font-medium mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                id="reset-password"
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
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-fog hover:text-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss/50 focus-visible:ring-offset-1 focus-visible:ring-offset-ink"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="reset-confirm" className="block text-sm font-medium mb-1.5">
              Confirm new password
            </label>
            <input
              id="reset-confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError('');
              }}
              placeholder="Repeat the new password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-fog/70 focus:outline-none focus:border-moss/50 focus:ring-1 focus:ring-moss/30 transition-colors"
            />
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
            className="w-full py-3 px-4 rounded-lg bg-moss-deep hover:bg-moss disabled:opacity-60 disabled:cursor-not-allowed text-moss-dark font-semibold transition-colors"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
