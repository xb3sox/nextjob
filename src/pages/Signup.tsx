import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, ArrowRight, AlertCircle, Check } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true, message: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name) {
      setStatus('error');
      setErrorMessage('Please enter your name');
      return;
    }

    if (!formData.email) {
      setStatus('error');
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!validateEmail(formData.email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setStatus('error');
      setErrorMessage(passwordValidation.message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // TODO: Replace with actual API call
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful signup
      console.log('Signup successful:', { 
        name: formData.name, 
        email: formData.email 
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      setStatus('error');
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
              <Zap size={20} className="text-slate-900" />
            </div>
            <span className="text-xl font-bold">NextJob</span>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Create your account</h1>
          <p className="text-sm text-white/60">Start your journey to better opportunities</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
              Full name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-white/40" />
              </div>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={status === 'loading'}
                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="John Doe"
                autoComplete="name"
                aria-invalid={status === 'error'}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/40" />
              </div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={status === 'loading'}
                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="you@company.com"
                autoComplete="email"
                aria-invalid={status === 'error'}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/40" />
              </div>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                disabled={status === 'loading'}
                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Create a strong password"
                autoComplete="new-password"
                aria-invalid={status === 'error'}
              />
            </div>
            {/* Password Requirements */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  {formData.password.length >= 8 ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-white/20" />
                  )}
                  <span className={formData.password.length >= 8 ? 'text-emerald-400' : 'text-white/40'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {/[A-Z]/.test(formData.password) ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-white/20" />
                  )}
                  <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-400' : 'text-white/40'}>
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {/[a-z]/.test(formData.password) ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-white/20" />
                  )}
                  <span className={/[a-z]/.test(formData.password) ? 'text-emerald-400' : 'text-white/40'}>
                    One lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {/[0-9]/.test(formData.password) ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-white/20" />
                  )}
                  <span className={/[0-9]/.test(formData.password) ? 'text-emerald-400' : 'text-white/40'}>
                    One number
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
              Confirm password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/40" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                disabled={status === 'loading'}
                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Confirm your password"
                autoComplete="new-password"
                aria-invalid={status === 'error'}
              />
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
            )}
          </div>

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <div role="alert" className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-0"
            />
            <label htmlFor="terms" className="text-sm text-white/60">
              I agree to the{' '}
              <Link to="/terms" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {status === 'loading' ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#0a0a0a] text-white/40">Or continue with</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-white/60 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>

        {/* Back to Home */}
        <p className="text-center text-sm text-white/40 mt-4">
          <Link to="/" className="hover:text-white/60 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
