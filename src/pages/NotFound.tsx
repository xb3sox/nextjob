import { useState } from 'react';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [darkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  const bg = darkMode ? 'bg-slate-950' : 'bg-white';
  const text = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-300' : 'text-slate-600';
  const textSubtle = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen ${bg} ${text} flex items-center justify-center px-4`}>
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className={textMuted}>
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-500 px-6 py-3 text-base font-medium text-white hover:bg-emerald-600 transition-colors"
          >
            <Home size={18} />
            Go Home
          </a>

          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-slate-700 bg-slate-900/50 px-6 py-3 text-base font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
            Go Back
          </a>

          <a
            href="/#features"
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-slate-700 bg-slate-900/50 px-6 py-3 text-base font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Search size={18} />
            Explore Features
          </a>
        </div>

        <div className={`mt-12 pt-8 border-t border-slate-800`}>
          <p className={`text-sm ${textSubtle}`}>
            Looking for something specific?{' '}
            <a href="/#pricing" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Check our pricing
            </a>{' '}
            or{' '}
            <a href="/#b2b" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              B2B solutions
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
