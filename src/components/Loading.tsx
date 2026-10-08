import { Loader2 } from 'lucide-react';

export function ButtonLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <Loader2 
      className={`${sizeClasses[size]} animate-spin`} 
      aria-label="Loading"
      role="status"
    />
  );
}

export function LoadingButton({ 
  children, 
  loading, 
  className = '',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`relative ${className}`}
      aria-busy={loading}
    >
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <ButtonLoader />
        </span>
      )}
    </button>
  );
}

export function PageLoader() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-slate-950"
      role="status"
      aria-label="Loading page"
    >
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-400 mx-auto mb-4" />
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

export function InlineLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
      <span className="text-sm text-slate-400">{text}</span>
    </div>
  );
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label 
}: { 
  value: number; 
  max?: number; 
  label?: string;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-slate-400">{label}</span>
          <span className="text-sm text-slate-400">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function SuccessMessage({ message }: { message: string }) {
  return (
    <div 
      className="flex items-center gap-2 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
      role="alert"
      aria-live="polite"
    >
      <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-sm text-emerald-400">{message}</span>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div 
      className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20"
      role="alert"
      aria-live="assertive"
    >
      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      <span className="text-sm text-red-400">{message}</span>
    </div>
  );
}
