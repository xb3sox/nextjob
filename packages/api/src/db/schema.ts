import {
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// ============================================================================
// Auth / tenancy tables (referenced by packages/api/src/auth and middleware)
// ============================================================================

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// Index strategy (hot lookup paths)
//
// Indexes are declared in the pgTable callback config (drizzle's canonical
// pattern) rather than via standalone `index('...').on(col)` calls: the
// chained top-level form crashes on this toolchain (column-builder class
// fields such as `defaultConfig` are not applied under the installed Node/
// transpile output, so `.on()` hits `JSON.parse(JSON.stringify(undefined))`).
// The callback form is evaluated by the table builder itself and is safe.
// Note: `users.email` keeps a plain `.unique()` constraint; a separate unique
// index on the same column would be redundant.
// ============================================================================

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    email: text('email').notNull().unique(),
    name: text('name'),
    passwordHash: text('password_hash'),
    avatarUrl: text('avatar_url'),
    role: text('role')
      .$type<'candidate' | 'admin' | 'organization_admin'>()
      .notNull()
      .default('candidate'),
    status: text('status').$type<'active' | 'inactive' | 'suspended'>().notNull().default('active'),
    emailVerified: timestamp('email_verified', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('users_tenant_idx').on(t.tenantId)]
);

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('accounts_provider_account_idx').on(t.provider, t.providerAccountId)]
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionToken: text('session_token').notNull().unique(),
    refreshTokenHash: text('refresh_token_hash'),
    expires: timestamp('expires', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('sessions_user_idx').on(t.userId),
    index('sessions_refresh_idx').on(t.refreshTokenHash),
  ]
);

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { withTimezone: true }).notNull(),
  },
  (t) => [
    // Auth.js convention: one live token per identifier; composite PK also
    // satisfies drizzle-kit's requirement that every table has a primary key.
    primaryKey({ columns: [t.identifier, t.token] }),
    index('verification_expires_idx').on(t.expires),
  ]
);

// ============================================================================
// Domain tables referenced by existing services
// ============================================================================

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id'),
  atsName: text('ats_name'),
  url: text('url'),
  status: text('status')
    .$type<'draft' | 'ready' | 'submitting' | 'submitted' | 'needs_user' | 'failed' | 'unknown'>()
    .notNull()
    .default('draft'),
  payload: jsonb('payload'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const receipts = pgTable('receipts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  applicationId: uuid('application_id')
    .notNull()
    .references(() => applications.id, { onDelete: 'cascade' }),
  resumeHash: text('resume_hash'),
  coverLetterHash: text('cover_letter_hash'),
  confirmationCode: text('confirmation_code'),
  screenshotUrl: text('screenshot_url'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  verificationStatus: text('verification_status')
    .$type<'pending' | 'verified' | 'failed'>()
    .default('pending'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
