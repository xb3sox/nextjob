import { db } from '../db/index';
import { users, accounts, sessions, verificationTokens } from '../db/schema';
import { eq, and, like } from 'drizzle-orm';
import crypto from 'crypto';

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string | null;
  role: 'candidate' | 'admin' | 'organization_admin';
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: Date | null;
}

export interface Session {
  id: string;
  userId: string;
  tenantId: string;
  sessionToken: string;
  expires: Date;
}

// ============================================================================
// Errors
// ============================================================================

/**
 * Auth errors carry a stable machine-readable code so HTTP layers can map them
 * to status codes without parsing message strings, and so callers never see
 * internal details (e.g. whether an account exists).
 */
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_TAKEN'
  | 'ACCOUNT_NOT_ACTIVE'
  | 'PASSWORD_NOT_SET'
  | 'INVALID_TOKEN'
  | 'VALIDATION_FAILED';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

// ============================================================================
// Validation helpers
// ============================================================================

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return typeof email === 'string' && email.length <= 254 && EMAIL_PATTERN.test(email);
}

export function validatePasswordStrength(password: string): void {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new AuthError(
      'VALIDATION_FAILED',
      'Password must be between 8 and 128 characters'
    );
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================================================
// Password Hashing
// ============================================================================

const PBKDF2_ITERATIONS = 100_000; // OWASP-style work factor for PBKDF2-SHA512
const LEGACY_ITERATIONS = 10_000; // iterations used by the original implementation

/**
 * Hash a password with PBKDF2-SHA512. Format: `pbkdf2:<iterations>:<saltHex>:<hashHex>`.
 * The iteration count is embedded so old hashes remain verifiable while new
 * hashes use a stronger work factor (and can be transparently upgraded on login).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await pbkdf2HexAsync(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2:${PBKDF2_ITERATIONS}:${salt}:${hash}`;
}

/** Async PBKDF2 — never block the event loop with 100k-iteration derivations. */
function pbkdf2HexAsync(password: string, salt: string, iterations: number): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, dk) => {
      if (err) reject(err);
      else resolve(dk.toString('hex'));
    });
  });
}

async function pbkdf2Hex(password: string, salt: string, iterations: number): Promise<string> {
  return pbkdf2HexAsync(password, salt, iterations);
}

/**
 * Verify a password against a stored hash. Supports both the legacy bare
 * `salt:hash` format (10k iterations) and the current versioned format.
 * Uses a constant-time comparison to avoid timing side channels.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (typeof password !== 'string' || typeof storedHash !== 'string') return false;

  const parts = storedHash.split(':');

  // Versioned format: pbkdf2:<iterations>:<salt>:<hash>
  if (parts.length === 4 && parts[0] === 'pbkdf2') {
    const iterations = Number.parseInt(parts[1], 10);
    if (!Number.isFinite(iterations) || iterations <= 0) return false;
    const candidate = await pbkdf2Hex(password, parts[2], iterations);
    return timingSafeEqualHex(candidate, parts[3]);
  }

  // Legacy format: <salt>:<hash> (10k iterations)
  if (parts.length === 2) {
    const candidate = await pbkdf2Hex(password, parts[0], LEGACY_ITERATIONS);
    return timingSafeEqualHex(candidate, parts[1]);
  }

  return false;
}

/** True when the stored hash should be re-hashed with current parameters. */
export function needsRehash(storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length === 4 && parts[0] === 'pbkdf2') {
    return Number.parseInt(parts[1], 10) !== PBKDF2_ITERATIONS;
  }
  return true; // legacy or unknown format
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// ============================================================================
// Token Generation
// ============================================================================

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateSessionToken(): string {
  return crypto.randomBytes(48).toString('base64url');
}

/**
 * Session tokens are looked up by value in the database. To avoid leaking the
 * raw token (e.g. via DB dumps or logs), we store/lookup a SHA-256 digest.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ============================================================================
// User Registration
// ============================================================================

export async function registerUser(params: {
  email: string;
  password: string;
  name?: string;
  tenantId: string;
  role?: 'candidate' | 'admin' | 'organization_admin';
}): Promise<User> {
  const { email, password, name, tenantId, role = 'candidate' } = params;

  if (!isValidEmail(email)) {
    throw new AuthError('VALIDATION_FAILED', 'Please provide a valid email address');
  }
  validatePasswordStrength(password);

  const normalizedEmail = email.toLowerCase();

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });

  if (existingUser) {
    throw new AuthError('EMAIL_TAKEN', 'An account with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const [user] = await db
    .insert(users)
    .values({
      tenantId,
      email: normalizedEmail,
      name,
      passwordHash,
      role,
      status: 'active',
    })
    .returning();

  return toSafeUser(user);
}

// ============================================================================
// User Login
// ============================================================================

export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<{ user: User; session: Session; tokens: AuthTokens }> {
  const { email, password } = params;

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, String(email ?? '').toLowerCase()),
  });

  if (!user) {
    // Spend comparable time (hash against a dummy salt) so response timing
    // does not reveal whether the account exists.
    await hashPassword(password ?? '');
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password');
  }

  if (!user.passwordHash) {
    throw new AuthError(
      'PASSWORD_NOT_SET',
      'No password is set for this account. Please sign in with your linked provider or reset your password.'
    );
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // Check user status
  if (user.status !== 'active') {
    throw new AuthError('ACCOUNT_NOT_ACTIVE', 'This account is not active');
  }

  // Transparently upgrade legacy hashes to current work factor
  if (needsRehash(user.passwordHash)) {
    const freshHash = await hashPassword(password);
    await db.update(users).set({ passwordHash: freshHash }).where(eq(users.id, user.id));
    user.passwordHash = freshHash;
  }

  // Create a real persisted session + derive tokens from it
  const session = await createSession(user.id, user.tenantId);
  const tokens = await generateAuthTokens(session.sessionToken, user.tenantId);

  return { user: toSafeUser(user), session, tokens };
}

/** Strip sensitive columns before returning DB rows to callers. */
function toSafeUser(u: typeof users.$inferSelect): User {
  const { passwordHash: _ph, ...safe } = u as typeof u & { passwordHash?: string | null };
  void _ph;
  return safe as User;
}

// ============================================================================
// Session Management
// ============================================================================

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const ACCESS_TOKEN_TTL_S = 3600; // 1 hour

/**
 * Registry mapping raw access tokens to their issue time, so the advertised
 * `expiresIn` (ACCESS_TOKEN_TTL_S) is actually enforced server-side. Entries
 * are pruned opportunistically and on session teardown.
 * NOTE: in-memory only — a multi-instance deployment should move this to Redis
 * or switch to signed short-lived JWTs bound to the session id.
 */
const accessTokenIssuedAt = new Map<string, number>();

function rememberAccessToken(token: string): void {
  accessTokenIssuedAt.set(token, Date.now());
}

function forgetAccessToken(token: string): void {
  accessTokenIssuedAt.delete(token);
}

/** Opportunistic prune so the map cannot grow unbounded under load. */
function pruneAccessTokens(): void {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [token, issued] of accessTokenIssuedAt) {
    if (issued < cutoff) accessTokenIssuedAt.delete(token);
  }
}

export async function createSession(userId: string, tenantId: string): Promise<Session> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const [session] = await db
    .insert(sessions)
    .values({
      tenantId,
      userId,
      sessionToken: hashSessionToken(sessionToken),
      expires: expiresAt,
    })
    .returning();

  // Return the session with the RAW token so callers can hand it to clients.
  // The database only ever stores the digest.
  return { ...session, sessionToken };
}

export async function validateSession(rawToken: string): Promise<Session | null> {
  if (!rawToken || typeof rawToken !== 'string') return null;

  // Enforce the advertised access-token TTL (see generateAuthTokens). Tokens
  // issued more than ACCESS_TOKEN_TTL_S ago are rejected even if the underlying
  // session is still alive — clients must use the refresh token to continue.
  const issuedAt = accessTokenIssuedAt.get(rawToken);
  if (issuedAt !== undefined && Date.now() - issuedAt > ACCESS_TOKEN_TTL_S * 1000) {
    forgetAccessToken(rawToken);
    return null;
  }

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.sessionToken, hashSessionToken(rawToken)),
  });

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (session.expires < new Date()) {
    await deleteSessionByTokenHash(session.sessionToken);
    return null;
  }

  pruneAccessTokens();

  // Sliding expiration: renew when more than half the TTL has elapsed.
  // This keeps active sessions alive without writing on every request.
  const remainingMs = session.expires.getTime() - Date.now();
  if (remainingMs < SESSION_TTL_MS / 2) {
    const newExpiry = new Date(Date.now() + SESSION_TTL_MS);
    await db.update(sessions).set({ expires: newExpiry }).where(eq(sessions.id, session.id));
    session.expires = newExpiry;
  }

  // Reconstruct the raw token for downstream consumers (e.g. middleware).
  return { ...session, sessionToken: rawToken };
}

export async function deleteSession(rawToken: string): Promise<void> {
  forgetAccessToken(rawToken);
  await deleteSessionByTokenHash(hashSessionToken(rawToken));
}

async function deleteSessionByTokenHash(tokenHash: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.sessionToken, tokenHash));
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Access tokens are opaque bearer credentials bound to a persisted session.
 * The access token IS the session token (hashed at rest); the refresh token is
 * a separate random credential stored alongside the session record so it can be
 * rotated and revoked server-side.
 */
async function generateAuthTokens(
  sessionToken: string,
  _tenantId: string
): Promise<AuthTokens> {
  const refreshToken = generateToken();

  await db
    .update(sessions)
    .set({ refreshTokenHash: hashRefreshToken(refreshToken) })
    .where(eq(sessions.sessionToken, hashSessionToken(sessionToken)));

  // Track issue time so validateSession can enforce the advertised TTL.
  rememberAccessToken(sessionToken);

  return {
    accessToken: sessionToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_TTL_S,
  };
}

function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(`refresh:${token}`).digest('hex');
}

/**
 * Exchange a refresh token for a new session (rotation: old refresh token is
 * invalidated). Returns fresh tokens or throws INVALID_TOKEN.
 */
export async function refreshSession(params: {
  refreshToken: string;
}): Promise<{ session: Session; tokens: AuthTokens }> {
  const { refreshToken } = params;
  if (!refreshToken) throw new AuthError('INVALID_TOKEN', 'Missing refresh token');

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.refreshTokenHash, hashRefreshToken(refreshToken)),
  });

  if (!session || session.expires < new Date()) {
    throw new AuthError('INVALID_TOKEN', 'Refresh token is invalid or expired');
  }

  // Rotate: revoke the old session and issue a new one. The old access token
  // is forgotten so it stops validating immediately (it was only ever known to
  // the client; the DB stores just its digest, which cannot be reversed here).
  await db.delete(sessions).where(eq(sessions.id, session.id));
  const newSession = await createSession(session.userId, session.tenantId);
  const tokens = await generateAuthTokens(newSession.sessionToken, session.tenantId);

  return { session: newSession, tokens };
}

// ============================================================================
// OAuth Providers (Google, GitHub)
// ============================================================================

export interface OAuthProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  /**
   * Whether the provider asserts the email address is verified by them.
   * Defaults to false — auto-linking an OAuth identity onto an existing
   * password account is only safe when the provider has proven email control,
   * otherwise it is an account-takeover vector (attacker registers a Google
   * account using the victim's unverified email).
   */
  emailVerified?: boolean;
}

export async function findOrCreateOAuthUser(params: {
  provider: string;
  profile: OAuthProfile;
  tenantId: string;
}): Promise<User> {
  const { provider, profile, tenantId } = params;

  if (!profile?.email || !isValidEmail(profile.email)) {
    throw new AuthError('VALIDATION_FAILED', 'OAuth provider did not return a valid email');
  }

  // Check if account already exists
  const existingAccount = await db.query.accounts.findFirst({
    where: and(
      eq(accounts.provider, provider),
      eq(accounts.providerAccountId, profile.id)
    ),
  });

  if (existingAccount) {
    // Return existing user
    const user = await db.query.users.findFirst({
      where: eq(users.id, existingAccount.userId),
    });
    if (!user) {
      throw new AuthError('INVALID_TOKEN', 'Linked account references a missing user');
    }
    if (user.status !== 'active') {
      throw new AuthError('ACCOUNT_NOT_ACTIVE', 'This account is not active');
    }
    return toSafeUser(user);
  }

  // Check if user with same email exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, profile.email.toLowerCase()),
  });

  if (existingUser) {
    // Only auto-link when the provider asserts a verified email; otherwise an
    // attacker could claim any unverified address and inherit that account.
    if (!profile.emailVerified) {
      throw new AuthError(
        'VALIDATION_FAILED',
        'The email on this OAuth account is not verified by the provider. Sign in with your password or verify the email first.'
      );
    }
    // Link OAuth account to existing user
    await db.insert(accounts).values({
      tenantId: existingUser.tenantId ?? tenantId,
      userId: existingUser.id,
      provider,
      providerAccountId: profile.id,
    });
    return toSafeUser(existingUser);
  }

  // Create new user
  const [user] = await db
    .insert(users)
    .values({
      tenantId,
      email: profile.email.toLowerCase(),
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      // Trust the provider's verification assertion only; never blanket-mark.
      emailVerified: profile.emailVerified ? new Date() : null,
      role: 'candidate',
      status: 'active',
    })
    .returning();

  // Link OAuth account
  await db.insert(accounts).values({
    tenantId,
    userId: user.id,
    provider,
    providerAccountId: profile.id,
  });

  return toSafeUser(user);
}

// ============================================================================
// Password Reset
// ============================================================================

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashActionToken(prefix: string, token: string): string {
  return crypto.createHash('sha256').update(`${prefix}:${token}`).digest('hex');
}

/**
 * Create a password-reset token for the user owning `email`. Returns the raw
 * token for the caller to deliver out-of-band (email), or null when no account
 * exists — callers MUST surface a generic success message either way so the
 * endpoint does not reveal account existence.
 */
export async function requestPasswordReset(email: string): Promise<string | null> {
  const normalized = String(email ?? '').toLowerCase();
  const user = await db.query.users.findFirst({
    where: eq(users.email, normalized),
  });

  if (!user) {
    return null; // Don't reveal if user exists
  }

  // Generate reset token; store only its digest.
  const resetToken = generateToken();
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, `reset:${normalized}`));
  await db.insert(verificationTokens).values({
    identifier: `reset:${normalized}`,
    token: hashActionToken('reset', resetToken),
    expires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });

  return resetToken;
}

export async function resetPassword(params: {
  token: string;
  newPassword: string;
}): Promise<boolean> {
  const { token, newPassword } = params;

  validatePasswordStrength(newPassword);

  if (!token) throw new AuthError('INVALID_TOKEN', 'Reset token is required');

  const record = await db.query.verificationTokens.findFirst({
    where: and(
      like(verificationTokens.identifier, 'reset:%'),
      eq(verificationTokens.token, hashActionToken('reset', token))
    ),
  });

  if (!record || record.expires < new Date()) {
    throw new AuthError('INVALID_TOKEN', 'Reset token is invalid or expired');
  }

  const email = record.identifier.slice('reset:'.length);
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (!user) throw new AuthError('INVALID_TOKEN', 'Reset token is invalid or expired');

  // Single-use: remove the token before applying the change.
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, record.identifier));

  // Hash new password and update the user.
  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

  // Invalidate all existing sessions for this user (credential hygiene).
  await deleteUserSessions(user.id);

  return true;
}

// ============================================================================
// Email Verification
// ============================================================================

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Create an email-verification token. Returns the raw token for the caller to
 * deliver via email, or null when the user is unknown/already verified.
 */
export async function sendVerificationEmail(email: string): Promise<string | null> {
  const normalized = String(email ?? '').toLowerCase();
  const user = await db.query.users.findFirst({
    where: eq(users.email, normalized),
  });

  if (!user) {
    return null;
  }

  if (user.emailVerified) {
    return null; // Already verified
  }

  // Generate verification token; store only its digest.
  const verificationToken = generateToken();
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, `verify:${normalized}`));
  await db.insert(verificationTokens).values({
    identifier: `verify:${normalized}`,
    token: hashActionToken('verify', verificationToken),
    expires: new Date(Date.now() + VERIFY_TOKEN_TTL_MS),
  });

  return verificationToken;
}

export async function verifyEmail(token: string): Promise<boolean> {
  if (!token) throw new AuthError('INVALID_TOKEN', 'Verification token is required');

  const record = await db.query.verificationTokens.findFirst({
    where: and(
      like(verificationTokens.identifier, 'verify:%'),
      eq(verificationTokens.token, hashActionToken('verify', token))
    ),
  });

  if (!record || record.expires < new Date()) {
    throw new AuthError('INVALID_TOKEN', 'Verification token is invalid or expired');
  }

  const email = record.identifier.slice('verify:'.length);
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (!user) throw new AuthError('INVALID_TOKEN', 'Verification token is invalid or expired');

  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.id, user.id));

  // Single-use cleanup.
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, record.identifier));

  return true;
}
