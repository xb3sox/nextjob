import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';
import { safeReturnPath } from '@/lib/redirect';

export default function LoginPage() {
  const { status, configured, signInWithPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = safeReturnPath((location.state as { from?: string } | null)?.from);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (status === 'authenticated') return <Navigate to={from} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signInWithPassword(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      // Navigate explicitly; don't depend on the async onAuthStateChange
      // subscription having re-rendered this component yet.
      navigate(from, { replace: true });
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your NextJob account."
      footer={
        <>
          Don’t have an account?{' '}
          <Link to="/signup" className="text-moss hover:text-paper transition-colors font-medium">
            Create one
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
          VITE_SUPABASE_ANON_KEY to enable sign-in.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium mb-1.5">
            Email
          </label>
          <input
            id="login-email"
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
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-sm font-medium">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-fog hover:text-moss transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
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
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
