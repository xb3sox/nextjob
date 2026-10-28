import { beforeEach, describe, expect, it, vi } from 'vitest';

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

/** Inverse of `toCamel` (camelCase property -> physical SQL column name). */
function toSnake(name: string): string {
  return name.replace(/[A-Z]/g, (c: string) => `_${c.toLowerCase()}`);
}

/** Map a row's keys from one casing to the other (values untouched). */
function remapKeys(row: Row, map: (k: string) => string): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) out[map(k)] = v;
  return out;
}

/**
 * Relational-API accessors are keyed by the schema PROPERTY name (e.g.
 * `db.query.verificationTokens`), while insert/update/delete receive the
 * table object and resolve to the PHYSICAL name (`verification_tokens`).
 * This maps property keys to physical store keys so both paths hit the same
 * array — mirroring how drizzle resolves `.query.<prop>` through its schema
 * config. Unknown keys pass through unchanged.
 */
type Row = Record<string, any>;
type Store = Record<string, Row[]>;

// The store mirrors the PHYSICAL SQL shape: rows are keyed by snake_case
// column names (as real Postgres would return via drizzle's `db.query`), so
// insert/where/update predicates — which carry physical column names from the
// schema — match without casing surprises. The query API converts back to
// camelCase on read, exactly like drizzle does.
// The store is keyed by the PHYSICAL SQL table name, which is also the key
// drizzle's relational `db.query.<key>` API uses for these tables (schema
// property `verificationTokens` maps to physical `verification_tokens`).
const store: Store = { users: [], accounts: [], sessions: [], verification_tokens: [] };

/** Read a stored row using the camelCase property name callers/tests use. */
function getProp(row: Row, prop: string): any {
  return row[toSnake(prop)];
}

/** Write a stored row using the camelCase property name callers/tests use. */
function setProp(row: Row, prop: string, value: unknown): void {
  row[toSnake(prop)] = value;
}

let insertSeq = 0;

function matches(row: Row, cond: any): boolean {
  if (!cond) return true;
  if (Array.isArray(cond)) return cond.every((c) => matches(row, c));
  if (cond.__kind === 'eq') {
    return row[cond.column] === cond.value;
  }
  if (cond.__kind === 'like') {
    const prefix = String(cond.pattern).replace(/%$/, '');
    return String(row[cond.column] ?? '').startsWith(prefix);
  }
  throw new Error('Unsupported mock condition');
}

function applyUpdate(table: any, patch: Row, cond: unknown): Row[] {
  const name = tableName(table);
  const rows = store[name] ?? [];
  // Patch keys arrive as camelCase property names (drizzle semantics);
  // normalize them to the physical snake_case columns used in the store.
  const normalizedPatch = remapKeys(patch, toSnake);
  const changed: Row[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (matches(rows[i], cond)) {
      rows[i] = { ...rows[i], ...normalizedPatch };
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
        get(_t, propKey: string | symbol) {
          // Relational-API accessors are keyed by the schema PROPERTY name
          // (`db.query.verificationTokens`), while the store is keyed by the
          // PHYSICAL table name (`verification_tokens`). Resolve through both
          // so either casing hits the same array, mirroring drizzle.
          if (typeof propKey !== 'string') return undefined;
          const tableName = propKey in store ? propKey : toSnake(propKey);
          const rows = store[tableName];
          if (!rows) return undefined;
          return {
            findFirst: (opts: { where?: unknown }) => {
              // Rows are stored with physical snake_case column names; the
              // relational query API returns camelCase property rows, exactly
              // like real drizzle does.
              const mapRow = (r: Row) => remapKeys(r, toCamel);
              if (!opts?.where) return rows[0] ? mapRow(rows[0]) : undefined;
              const cond = opts.where as any;
              const found = rows.find((r) => matches(r, cond));
              return found ? mapRow(found) : undefined;
            },
          };
        },
      }
    ),
    insert: (table: any) => ({
      values: (vals: Row | Row[]) => {
        const doInsert = () => {
          const name = tableName(table);
          const arr = Array.isArray(vals) ? vals : [vals];
          const inserted = arr.map((v) => ({
            ...remapKeys(v, toSnake),
            id: `${name}-${++insertSeq}`,
            created_at: new Date(),
          }));
          store[name] ??= [];
          store[name].push(...inserted);
          return inserted.map((r) => remapKeys(r, toCamel));
        };
        return makeThenable(doInsert);
      },
    }),
    update: (table: any) => ({
      set: (patch: Row) => ({
        where: (cond: unknown) =>
          makeThenable(() => applyUpdate(table, patch, cond).map((r) => remapKeys(r, toCamel))),
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
//
// IMPORTANT: spread `importActual()` so the real drizzle-orm surface stays
// available to other modules in the graph (e.g. src/db/schema.ts imports
// `drizzle-orm/pg-core`, which internally re-exports from the mocked root).
// A bare-stub factory here previously hid every non-overridden export and
// broke schema loading (`uuid is not a function`). Only `eq`/`like`/`and`
// are overridden, because the in-memory db mock understands just those
// predicate shapes.
vi.mock('drizzle-orm', async (importActual) => {
  const actual = await importActual<typeof import('drizzle-orm')>();
  return {
    ...actual,
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
  };
});

import {
  AuthError,
  createSession,
  deleteSession,
  hashPassword,
  isValidEmail,
  loginUser,
  needsRehash,
  refreshSession,
  registerUser,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  validateSession,
  verifyEmail,
  verifyPassword,
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
      await registerUser({
        email: 'dup@example.com',
        password: 'testPassword123',
        tenantId: 'tenant-1',
      });
      await expect(
        registerUser({
          email: 'dup@example.com',
          password: 'testPassword123',
          tenantId: 'tenant-1',
        })
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
      setProp(store.users[0], 'status', 'suspended');
      await expect(
        loginUser({ email: 'login@example.com', password: 'correctHorse1' })
      ).rejects.toThrow(/not active/);
    });

    it('transparently upgrades legacy password hashes on login', async () => {
      const crypto = await import('crypto');
      const salt = 'b'.repeat(32);
      // Wait until registration finished writing the row, then downgrade it.
      await vi.waitFor(() => expect(store.users.length).toBeGreaterThan(0));
      setProp(
        store.users[0],
        'passwordHash',
        `${salt}:${crypto.pbkdf2Sync('correctHorse1', salt, 10_000, 64, 'sha512').toString('hex')}`
      );
      await loginUser({ email: 'login@example.com', password: 'correctHorse1' });
      expect(String(getProp(store.users[0], 'passwordHash')).startsWith('pbkdf2:100000:')).toBe(
        true
      );
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
      setProp(store.sessions[0], 'expires', new Date(Date.now() - 1000));
      expect(await validateSession(s.sessionToken)).toBeNull();
      expect(store.sessions).toHaveLength(0);
    });

    it('rejects expired access tokens on every attempt while allowing refresh', async () => {
      await registerUser({ email: 'ttl@example.com', password: 'password123', tenantId: 't' });
      const login = await loginUser({ email: 'ttl@example.com', password: 'password123' });
      setProp(store.sessions[0], 'createdAt', new Date(Date.now() - 3600_000));
      expect(await validateSession(login.tokens.accessToken)).toBeNull();
      expect(await validateSession(login.tokens.accessToken)).toBeNull();
      const refreshed = await refreshSession({ refreshToken: login.tokens.refreshToken });
      expect(await validateSession(refreshed.tokens.accessToken)).not.toBeNull();
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

      await expect(refreshSession({ refreshToken: oldRefresh })).rejects.toThrow(
        /invalid or expired/i
      );
      // New access token validates
      const validated = await validateSession(rotated.tokens.accessToken);
      expect(validated?.userId).toBe(login.user.id);
    });

    it('rejects unknown refresh tokens', async () => {
      await expect(refreshSession({ refreshToken: 'bogus' })).rejects.toThrow(
        /invalid or expired/i
      );
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

      await expect(resetPassword({ token: token!, newPassword: 'thirdPassword3' })).rejects.toThrow(
        /invalid or expired/i
      );

      await expect(
        loginUser({ email: 'reset@example.com', password: 'secondPassword2' })
      ).resolves.toBeTruthy();
      await expect(
        loginUser({ email: 'reset@example.com', password: 'firstPassword1' })
      ).rejects.toThrow();
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
      await expect(resetPassword({ token: token!, newPassword: 'short' })).rejects.toThrow(
        /between 8 and 128/
      );
    });
  });

  describe('Email Verification', () => {
    it('verifies emails with single-use tokens', async () => {
      await registerUser({ email: 'verify@example.com', password: 'password123', tenantId: 't' });
      const token = await sendVerificationEmail('verify@example.com');
      expect(token).toBeTruthy();
      expect(await verifyEmail(token!)).toBe(true);
      expect(getProp(store.users[0], 'emailVerified')).toBeInstanceOf(Date);
      await expect(verifyEmail(token!)).rejects.toThrow(/invalid or expired/i);
    });

    it('returns null for unknown or already-verified emails', async () => {
      expect(await sendVerificationEmail('ghost@example.com')).toBeNull();
      await registerUser({ email: 'v2@example.com', password: 'password123', tenantId: 't' });
      await vi.waitFor(() => expect(store.users.length).toBeGreaterThan(0));
      setProp(store.users[0], 'emailVerified', new Date());
      expect(await sendVerificationEmail('v2@example.com')).toBeNull();
    });
  });
});
