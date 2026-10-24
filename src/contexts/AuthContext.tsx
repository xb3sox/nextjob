import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { hasActiveSession, isSupabaseConfigured, supabase } from '@/lib/supabase';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
}

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  /** False when env keys are missing — UI degrades gracefully. */
  configured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    input: SignUpInput
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyAuthError(message: string | undefined, fallback: string): string {
  const m = (message ?? '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (m.includes('email not confirmed'))
    return 'Please confirm your email address first (check your inbox).';
  if (m.includes('already registered') || m.includes('already exists'))
    return 'An account with this email already exists — sign in instead.';
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a minute and try again.';
  return message ? fallback : fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  // Set when the provider unmounts or an explicit signOut() happens, so that
  // late onAuthStateChange callbacks can't flip status back to 'loading'.
  const cancelledRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    if (isSupabaseConfigured) {
      // Only latch while this effect's subscription is still live. Once the
      // provider unmounts, signOut() cannot reach this scope anymore, so a
      // fresh mount must not inherit a stale 'true' latch (which would
      // permanently freeze status at 'loading').
      cancelledRef.current = false;
    } else {
      setStatus('unauthenticated');
      setSession(null);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled || cancelledRef.current) return;
      setSession(data.session);
      setStatus(hasActiveSession(data.session) ? 'authenticated' : 'unauthenticated');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // Ignore stale events after an explicit signOut() or unmount so the
      // status can't flip back to 'loading'.
      if (cancelled || cancelledRef.current) return;
      setSession(newSession);
      setStatus(hasActiveSession(newSession) ? 'authenticated' : 'unauthenticated');
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Authentication is not configured on this deployment.' };
    }
    if (!EMAIL_RE.test(email)) return { error: 'Enter a valid email address.' };
    if (!password) return { error: 'Enter your password.' };

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error)
      return { error: friendlyAuthError(error.message, 'Sign in failed. Please try again.') };
    // Post-sign-in navigation is driven by the login page using this result;
    // don't rely on the async onAuthStateChange handler to flip `status`.
    return { error: hasActiveSession(data.session) ? null : 'Sign in failed. Please try again.' };
  }, []);

  const signUp = useCallback(async ({ email, password, name }: SignUpInput) => {
    if (!isSupabaseConfigured) {
      return {
        error: 'Authentication is not configured on this deployment.',
        needsEmailConfirmation: false,
      };
    }
    if (!EMAIL_RE.test(email))
      return { error: 'Enter a valid email address.', needsEmailConfirmation: false };
    if (password.length < 8)
      return { error: 'Password must be at least 8 characters.', needsEmailConfirmation: false };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/signup` },
    });
    if (error) {
      return {
        error: friendlyAuthError(error.message, 'Sign up failed. Please try again.'),
        needsEmailConfirmation: false,
      };
    }
    // Supabase returns a session only when email confirmation is disabled.
    const needsEmailConfirmation = !data.session;
    return { error: null, needsEmailConfirmation };
  }, []);

  const signOut = useCallback(async () => {
    // Latch first: Supabase fires a delayed SIGNED_OUT onAuthStateChange
    // event; without this the effect cleanup would re-subscribe and a stale
    // callback could flip status back to 'loading' after sign-out.
    cancelledRef.current = true;
    setSession(null);
    setStatus('unauthenticated');
    if (!isSupabaseConfigured) return;
    try {
      await supabase.auth.signOut();
    } catch {
      // Local session is already cleared; server-side cookie cleanup failure
      // must not leave the UI in an inconsistent state.
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured)
      return { error: 'Authentication is not configured on this deployment.' };
    if (!EMAIL_RE.test(email)) return { error: 'Enter a valid email address.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error: error ? 'Could not send the reset email. Please try again.' : null };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      configured: isSupabaseConfigured,
      signInWithPassword,
      signUp,
      signOut,
      resetPassword,
    }),
    [status, session, signInWithPassword, signUp, signOut, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
