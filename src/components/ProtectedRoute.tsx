import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Route guard for the authenticated app. Unauthenticated visitors are
 * redirected to /login while preserving their intended destination so they
 * land where they wanted after signing in.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div
        className="min-h-screen bg-ink flex items-center justify-center"
        role="status"
        aria-label="Loading"
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-8 h-8 rounded-full border-2 border-moss/30 border-t-moss animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          <p className="text-sm text-fog">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
