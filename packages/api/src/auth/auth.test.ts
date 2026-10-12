import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================================================
// In-memory mock of the drizzle `db` module + a simplified operator layer.
// The auth service only uses: db.query.<table>.findFirst({where}),
// db.insert(table).values(...).returning(), db.update(table).set(...).where(...)
// [.returning()], and db.delete(table).where(...). We emulate exactly that so
// business logic can be tested end-to-end without a live Postgres instance.
// ============================================================================


/** Resolve a drizzle table object to its physical SQL name. */
function tableName(table: any): string {
  return table?.[Symbol.for('drizzle:Name')] ?? table?.name ?? String(table);
}

/**
 * Convert a physical SQL column name (as exposed by real drizzle columns via
 * `.name`) into the camelCase property key used by service code and tests
 * (e.g. `refresh_token_hash` -> `refreshTokenHash`). The store is keyed by
 * camelCase so `db.query.*.findFirst` results behave like real drizzle rows.
 */
function toCamel(name: string): string {
  return name.replace(/_([a-z0-9])/g, (_m, c: string) => c.toUpperCase());
}

type Row = Record<string, any>;
type Store = Record<string, Row[]>;

const store: Store = { users: [], accounts: [], sessions: [], verification_tokens: [] };

let insertSeq = 0;

function matches(row: Row, cond: any): boolean {
  if (!cond) return true;
  if (Array.isArray(cond)) return cond.every((c) => matches(row, c));
  if (cond.__kind === 'eq') return row[toCamel(cond.column)] === cond.value;
  if (cond.__kind === 'like') {
    const prefix = String(cond.pattern).replace(/%$/, '');
    return String(row[toCamel(cond.column)] ?? '').startsWith(prefix);
  }
  throw new Error('Unsupported mock condition');
}


function applyUpdate(table: any, patch: Row, cond: unknown): Row[] {
  const name = tableName(table);
  const rows = store[name] ?? [];
  const changed: Row[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (matches(rows[i], cond)) {
      rows[i] = { ...rows[i], ...patch };
      changed.push(rows[i]);
    }
  }
  return changed;
}

function applyDelete(table: any, cond: unknown): void {
  const name = tableName(table);
  store[name] = (store[name] ?? []).filter((r) => !matches(r, cond));
}

/**
 * A promise that also exposes `.returning()` — drizzle queries are thenables,
 * and `await db.update(...).set(...).where(...)` must resolve to the affected
 * rows while `.returning()` yields them too.
 */
function makeThenable(run: () => any): Promise<any> & { returning(): Promise<any> } {
  const p = Promise.resolve().then(run) as Promise<any> & { returning(): Promise<any> };
  p.returning = () => p;
  return p;
}

vi.mock('../db/index', () => {
  const dbMock = {
    query: new Proxy(
      {},
      {
        get(_t, tableName: string) {
          return {
            findFirst: (opts: { where?: unknown }) => {
              const rows = store[tableName] ?? [];
              if (!opts?.where) return rows[0];
              // tables in query use schema table objects keyed by drizzle name
              const cond = opts.where as any;
              return rows.find((r) => matches(r, cond));
            },
          };
        },
      }
    ),
    insert: (table: any) => ({
      values: (vals: Row | Row[]) => ({
        returning: async () => {
          const name = tableName(table);
          const arr = Array.isArray(vals) ? vals : [vals];
          const inserted = arr.map((v) => ({ id: `${name}-${++insertSeq}`, createdAt: new Date(), ...v }));
          (store[name] ??= []).push(...inserted);
          return inserted;
        },
      }),
    }),
    update: (table: any) => ({
      set: (patch: Row) => ({
        where: (cond: unknown) => makeThenable(() => applyUpdate(table, patch, cond)),
      }),
    }),
    delete: (table: any) => ({
      where: (cond: unknown) => makeThenable(() => applyDelete(table, cond)),
    }),
  };
  return { db: dbMock, getDb: () => dbMock, default: dbMock };
});

// Simplified drizzle-orm operators compatible with the mock predicates.
// Column objects expose their physical SQL name via Symbol.for('drizzle:Name').
vi.mock('drizzle-orm', () => ({
  eq: (column: any, value: unknown) => ({
    __kind: 'eq',
    column: column?.[Symbol.for('drizzle:Name')] ?? column?.name,
    value,
  }),
  like: (column: any, pattern: string) => ({
    __kind: 'like',
    column: column?.[Symbol.for('drizzle:Name')] ?? column?.name,
    pattern,
  }),
  and: (...conds: unknown[]) => conds.flat(),
}));

import {
  hashPassword,
  verifyPassword,
  needsRehash,
  isValidEmail,
  registerUser,
  loginUser,
  createSession,
  validateSession,
  deleteSession,
  refreshSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  AuthError,
} from './index';

describe('Authentication', () => {
  beforeEach(() => {
    store.users = [];
    store.accounts = [];
    store.sessions = [];
    store.verification_tokens = [];
    insertSeq = 0;
  });

  describe('Password Hashing', () => {
    it('produces versioned PBKDF2 hashes', async () => {
      const hash = await hashPassword('testPassword123');
      expect(hash.startsWith('pbkdf2:')).toBe(true);
      expect(hash.split(':')).toHaveLength(4);
    });

    it('verifies correct password', async () => {
      const hash = await hashPassword('testPassword123');
      expect(await verifyPassword('testPassword123', hash)).toBe(true);
    });

    it('rejects incorrect password', async () => {
      const hash = await hashPassword('testPassword123');
      expect(await verifyPassword('wrongPassword', hash)).toBe(false);
    });

    it('generates different hashes for same password (salted)', async () => {
      const h1 = await hashPassword('same-password');
      const h2 = await hashPassword('same-password');
      expect(h1).not.toBe(h2);
    });

    it('supports legacy salt:hash format and flags it for rehash', async () => {
      const crypto = await import('crypto');
      const salt = 'a'.repeat(32);
      const legacy = `${salt}:${crypto.pbkdf2Sync('pw', salt, 10_000, 64, 'sha512').toString('hex')}`;
      expect(await verifyPassword('pw', legacy)).toBe(true);
      expect(needsRehash(legacy)).toBe(true);
      expect(needsRehash(await hashPassword('pw'))).toBe(false);
    });
  });

  describe('Validation helpers', () => {
    it('accepts valid emails and rejects invalid ones', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('bad@bad')).toBe(false);
      expect(isValidEmail('a b@c.com')).toBe(false);
      expect(isValidEmail('x'.repeat(300) + '@example.com')).toBe(false);
    });
  });

  describe('User Registration', () => {
    it('registers a new user with normalized email', async () => {
      const user = await registerUser({
        email: 'Test@Example.COM',
        password: 'testPassword123',
        name: 'Test User',
        tenantId: 'tenant-1',
      });
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('candidate');
      expect(user.status).toBe('active');
      expect((user as any).passwordHash).toBeUndefined();
    });

    it('rejects duplicate email', async () => {
      await registerUser({ email: 'dup@example.com', password: 'testPassword123', tenantId: 'tenant-1' });
      await expect(
        registerUser({ email: 'dup@example.com', password: 'testPassword123', tenantId: 'tenant-1' })
      ).rejects.toThrow(AuthError);
    });

    it('rejects weak passwords', async () => {
      await expect(
        registerUser({ email: 'weak@example.com', password: 'short', tenantId: 'tenant-1' })
      ).rejects.toThrow(/between 8 and 128/);
    });

    it('rejects invalid emails', async () => {
      await expect(
        registerUser({ email: 'not-an-email', password: 'longEnough1', tenantId: 'tenant-1' })
      ).rejects.toThrow(/valid email/i);
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      await registerUser({
        email: 'login@example.com',
        password: 'correctHorse1',
        name: 'Loginer',
        tenantId: 'tenant-1',
      });
    });

    it('returns user, session and tokens on success', async () => {
      const result = await loginUser({ email: 'login@example.com', password: 'correctHorse1' });
      expect(result.user.email).toBe('login@example.com');
      expect(result.tokens.accessToken).toBeTruthy();
      expect(result.tokens.refreshToken).toBeTruthy();
      expect(result.tokens.expiresIn).toBe(3600);
      // DB must never contain the raw session token — only its digest
      expect(store.sessions[0].sessionToken).not.toBe(result.tokens.accessToken);
    });

    it('rejects wrong password with generic message', async () => {
      await expect(
        loginUser({ email: 'login@example.com', password: 'wrongPassword' })
      ).rejects.toThrow(/Invalid email or password/);
    });

    it('rejects unknown user with identical message (no enumeration)', async () => {
      await expect(
        loginUser({ email: 'ghost@example.com', password: 'whatever123' })
      ).rejects.toThrow(/Invalid email or password/);
    });

    it('rejects inactive accounts', async () => {
      await vi.waitFor(() => expect(store.users.length).toBeGreaterThan(0));
      store.users[0].status = 'suspended';
      await expect(
        loginUser({ email: 'login@example.com', password: 'correctHorse1' })
      ).rejects.toThrow(/not active/);
    });

    it('transparently upgrades legacy password hashes on login', async () => {
      const crypto = await import('crypto');
      const salt = 'b'.repeat(32);
      // Wait until registration finished writing the row, then downgrade it.
      await vi.waitFor(() => expect(store.users.length).toBeGreaterThan(0));
      store.users[0].passwordHash = `${salt}:${crypto
        .pbkdf2Sync('correctHorse1', salt, 10_000, 64, 'sha512')
        .toString('hex')}`;
      await loginUser({ email: 'login@example.com', password: 'correctHorse1' });
      expect(String(store.users[0].passwordHash).startsWith('pbkdf2:100000:')).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('validates a fresh session', async () => {
      const s = await createSession('user-1', 'tenant-1');
      const validated = await validateSession(s.sessionToken);
      expect(validated?.userId).toBe('user-1');
    });

    it('rejects and cleans up expired sessions', async () => {
      const s = await createSession('user-1', 'tenant-1');
      store.sessions[0].expires = new Date(Date.now() - 1000);
      expect(await validateSession(s.sessionToken)).toBeNull();
      expect(store.sessions).toHaveLength(0);
    });

    it('deletes sessions on logout', async () => {
      const s = await createSession('user-1', 'tenant-1');
      await deleteSession(s.sessionToken);
      expect(await validateSession(s.sessionToken)).toBeNull();
    });

    it('rotates refresh tokens and invalidates the old one', async () => {
      // No registered user -> login throws; instead go through register+login:
      await registerUser({ email: 'rot@example.com', password: 'password123', tenantId: 't' });
      const login = await loginUser({ email: 'rot@example.com', password: 'password123' });
      const oldRefresh = login.tokens.refreshToken;

      const rotated = await refreshSession({ refreshToken: oldRefresh });
      expect(rotated.tokens.refreshToken).not.toBe(oldRefresh);

      await expect(refreshSession({ refreshToken: oldRefresh })).rejects.toThrow(/invalid or expired/i);
      // New access token validates
      const validated = await validateSession(rotated.tokens.accessToken);
      expect(validated?.userId).toBe(login.user.id);
      void refreshToken;
    });

    it('rejects unknown refresh tokens', async () => {
      await expect(refreshSession({ refreshToken: 'bogus' })).rejects.toThrow(/invalid or expired/i);
    });
  });

  describe('Password Reset', () => {
    beforeEach(async () => {
      await registerUser({ email: 'reset@example.com', password: 'firstPassword1', tenantId: 't' });
    });

    it('returns null for unknown emails (no account enumeration)', async () => {
      expect(await requestPasswordReset('nobody@example.com')).toBeNull();
    });

    it('issues a token for existing accounts and resets once', async () => {
      const token = await requestPasswordReset('reset@example.com');
      expect(token).toBeTruthy();

      expect(await resetPassword({ token: token!, newPassword: 'secondPassword2' })).toBe(true);

      await expect(
        resetPassword({ token: token!, newPassword: 'thirdPassword3' })
      ).rejects.toThrow(/invalid or expired/i);

      await expect(loginUser({ email: 'reset@example.com', password: 'secondPassword2' })).resolves.toBeTruthy();
      await expect(loginUser({ email: 'reset@example.com', password: 'firstPassword1' })).rejects.toThrow();
    });

    it('invalidates all sessions after a password reset', async () => {
      await loginUser({ email: 'reset@example.com', password: 'firstPassword1' });
      expect(store.sessions.length).toBe(1);
      const token = await requestPasswordReset('reset@example.com');
      await resetPassword({ token: token!, newPassword: 'secondPassword2' });
      expect(store.sessions).toHaveLength(0);
    });

    it('rejects weak replacement passwords', async () => {
      const token = await requestPasswordReset('reset@example.com');
      await expect(resetPassword({ token: token!, newPassword: 'short' })).rejects.toThrow(/between 8 and 128/);
    });
  });

  describe('Email Verification', () => {
    it('verifies emails with single-use tokens', async () => {
      await registerUser({ email: 'verify@example.com', password: 'password123', tenantId: 't' });
      const token = await sendVerificationEmail('verify@example.com');
      expect(token).toBeTruthy();
      expect(await verifyEmail(token!)).toBe(true);
      expect(store.users[0].emailVerified).toBeInstanceOf(Date);
      await expect(verifyEmail(token!)).rejects.toThrow(/invalid or expired/i);
    });

    it('returns null for unknown or already-verified emails', async () => {
      expect(await sendVerificationEmail('ghost@example.com')).toBeNull();
      await registerUser({ email: 'v2@example.com', password: 'password123', tenantId: 't' });
      await vi.waitFor(() => expect(store.users.length).toBeGreaterThan(0));
      store.users[0].emailVerified = new Date();
      expect(await sendVerificationEmail('v2@example.com')).toBeNull();
    });
  });
});
