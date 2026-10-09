import { db } from '../db/index';
import { users, accounts, sessions } from '../db/schema';
import { eq, and } from 'drizzle-orm';
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
  emailVerifiedAt: Date | null;
}

export interface Session {
  id: string;
  userId: string;
  tenantId: string;
  expiresAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================================================
// Password Hashing
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
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

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const [user] = await db
    .insert(users)
    .values({
      tenantId,
      email: email.toLowerCase(),
      name,
      passwordHash,
      role,
      status: 'active',
    })
    .returning();

  return user;
}

// ============================================================================
// User Login
// ============================================================================

export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<{ user: User; tokens: AuthTokens }> {
  const { email, password } = params;

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.passwordHash) {
    throw new Error('Password not set. Please use social login.');
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  // Check user status
  if (user.status !== 'active') {
    throw new Error('Account is not active');
  }

  // Generate tokens
  const tokens = await generateAuthTokens(user.id, user.tenantId);

  return { user, tokens };
}

// ============================================================================
// Session Management
// ============================================================================

export async function createSession(userId: string, tenantId: string): Promise<Session> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [session] = await db
    .insert(sessions)
    .values({
      tenantId,
      userId,
      sessionToken,
      expires: expiresAt,
    })
    .returning();

  return session;
}

export async function validateSession(sessionToken: string): Promise<Session | null> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.sessionToken, sessionToken),
  });

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (session.expires < new Date()) {
    await deleteSession(sessionToken);
    return null;
  }

  return session;
}

export async function deleteSession(sessionToken: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// ============================================================================
// Token Generation
// ============================================================================

async function generateAuthTokens(userId: string, tenantId: string): Promise<AuthTokens> {
  const accessToken = generateToken();
  const refreshToken = generateToken();
  const expiresIn = 3600; // 1 hour

  // Store refresh token in database (simplified - in production use a separate table)
  // For now, we'll just return the tokens

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

// ============================================================================
// OAuth Providers (Google, GitHub)
// ============================================================================

export interface OAuthProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export async function findOrCreateOAuthUser(params: {
  provider: string;
  profile: OAuthProfile;
  tenantId: string;
}): Promise<User> {
  const { provider, profile, tenantId } = params;

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
      throw new Error('User not found');
    }
    return user;
  }

  // Check if user with same email exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, profile.email.toLowerCase()),
  });

  if (existingUser) {
    // Link OAuth account to existing user
    await db.insert(accounts).values({
      tenantId,
      userId: existingUser.id,
      provider,
      providerAccountId: profile.id,
    });
    return existingUser;
  }

  // Create new user
  const [user] = await db
    .insert(users)
    .values({
      tenantId,
      email: profile.email.toLowerCase(),
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      emailVerified: new Date(),
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

  return user;
}

// ============================================================================
// Password Reset
// ============================================================================

export async function requestPasswordReset(email: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (!user) {
    return null; // Don't reveal if user exists
  }

  // Generate reset token
  const resetToken = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store reset token (simplified - in production use a separate table)
  // For now, we'll just return the token

  return resetToken;
}

export async function resetPassword(params: {
  token: string;
  newPassword: string;
}): Promise<boolean> {
  const { token, newPassword } = params;

  // In production, validate token and check expiration
  // For now, this is a simplified implementation

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update user password (simplified - need to find user by token)
  // This would require a password_reset_tokens table

  return true;
}

// ============================================================================
// Email Verification
// ============================================================================

export async function sendVerificationEmail(email: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (!user) {
    return null;
  }

  if (user.emailVerifiedAt) {
    return null; // Already verified
  }

  // Generate verification token
  const verificationToken = generateToken();

  // Store verification token (simplified - in production use a separate table)
  // For now, we'll just return the token

  return verificationToken;
}

export async function verifyEmail(token: string): Promise<boolean> {
  // In production, validate token and update user
  // For now, this is a simplified implementation

  return true;
}
