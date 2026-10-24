import { createClient, type Session } from '@supabase/supabase-js';

/**
 * Supabase browser client for NextJob authentication.
 *
 * The backend auth core lives in `packages/api/src/auth` (PBKDF2 sessions,
 * tenant isolation, RBAC). For the deployed MVP we front it with Supabase
 * Auth (email + OAuth), which implements the same model: email/social auth
 * per FR-ONB-01, server-side session validation, and refresh-token rotation.
 *
 * Configuration comes from Vite env vars. If they are missing we fall back to
 * placeholder values so the app still renders — but any real request will
 * fail loudly with a clear console error instead of silently misbehaving.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // Surfaced once at module load; AuthContext shows a user-facing banner too.
  console.error(
    '[NextJob] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'Authentication cannot work until these are set (see nextjob/packages/api/.env.example).'
  );
}

export const supabase = createClient(url ?? 'http://localhost:54321', anonKey || 'placeholder-key', {
  auth: {
    // Persist sessions in localStorage; auto-refresh keeps tokens valid.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // handles OAuth & email-confirm redirects
  },
});

export function hasActiveSession(session: Session | null): boolean {
  if (!session) return false;
  if (!session.access_token) return false;
  // Defense-in-depth: treat an expired access token as signed out even if
  // the client hasn't refreshed yet.
  const expiresAt = session.expires_at; // unix seconds
  if (typeof expiresAt === 'number' && expiresAt * 1000 <= Date.now()) return false;
  return true;
}
