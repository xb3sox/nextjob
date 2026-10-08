import { pgTable, uuid, text, timestamp, jsonb, integer, boolean, varchar, index, uniqueIndex } from 'drizzle-orm/pg-core';

// Base columns that every entity includes
const baseColumns = {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  version: integer('version').notNull().default(1),
  source: text('source'),
  provenance: jsonb('provenance'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  retentionPolicy: jsonb('retention_policy'),
  deletionState: varchar('deletion_state', { length: 20 }).default('active'),
};

// ============================================================================
// USER & IDENTITY
// ============================================================================

export const users = pgTable('users', {
  ...baseColumns,
  email: varchar('email', { length: 255 }).notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  emailVerified: timestamp('email_verified_at'),
  passwordHash: text('password_hash'),
  role: varchar('role', { length: 20 }).notNull().default('candidate'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  tenantIdx: index('users_tenant_idx').on(table.tenantId),
}));

export const accounts = pgTable('accounts', {
  ...baseColumns,
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  tokenType: varchar('token_type', { length: 50 }),
  scope: text('scope'),
  idToken: text('id_token'),
}, (table) => ({
  providerIdx: uniqueIndex('accounts_provider_idx').on(table.provider, table.providerAccountId),
  userIdx: index('accounts_user_idx').on(table.userId),
}));

export const sessions = pgTable('sessions', {
  ...baseColumns,
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: varchar('session_token', { length: 255 }).notNull(),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  tokenIdx: uniqueIndex('sessions_token_idx').on(table.sessionToken),
  userIdx: index('sessions_user_idx').on(table.userId),
}));

// ============================================================================
// ORGANIZATIONS & COHORTS (B2B)
// ============================================================================

export const organizations = pgTable('organizations', {
  ...baseColumns,
  name: text('name').notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  plan: varchar('plan', { length: 50 }).notNull().default('free'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  settings: jsonb('settings'),
}, (table) => ({
  slugIdx: uniqueIndex('organizations_slug_idx').on(table.slug),
}));

export const cohorts = pgTable('cohorts', {
  ...baseColumns,
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  settings: jsonb('settings'),
}, (table) => ({
  orgIdx: index('cohorts_org_idx').on(table.organizationId),
}));

export const cohortMembers = pgTable('cohort_members', {
  ...baseColumns,
  cohortId: uuid('cohort_id').notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('participant'),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
}, (table) => ({
  cohortIdx: index('cohort_members_cohort_idx').on(table.cohortId),
  userIdx: index('cohort_members_user_idx').on(table.userId),
  uniqueMember: uniqueIndex('cohort_members_unique_idx').on(table.cohortId, table.userId),
}));

// ============================================================================
// CAREER GRAPH
// ============================================================================

export const careerProfiles = pgTable('career_profiles', {
  ...baseColumns,
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  headline: text('headline'),
  summary: text('summary'),
  location: jsonb('location'),
  preferences: jsonb('preferences'),
}, (table) => ({
  userIdx: uniqueIndex('career_profiles_user_idx').on(table.userId),
}));

export const careerClaims = pgTable('career_claims', {
  ...baseColumns,
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // experience, education, skill, certification, project, achievement
  title: text('title').notNull(),
  content: jsonb('content').notNull(),
  evidenceId: uuid('evidence_id').references(() => evidence.id, { onDelete: 'set null' }),
  verificationStatus: varchar('verification_status', { length: 20 }).notNull().default('unverified'),
  confidence: integer('confidence').notNull().default(0),
  verifiedBy: uuid('verified_by'),
  verifiedAt: timestamp('verified_at'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
}, (table) => ({
  userIdx: index('career_claims_user_idx').on(table.userId),
  typeIdx: index('career_claims_type_idx').on(table.type),
  evidenceIdx: index('career_claims_evidence_idx').on(table.evidenceId),
}));

export const evidence = pgTable('evidence', {
  ...baseColumns,
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // cv, certificate, portfolio, document
  name: text('name').notNull(),
  storageKey: text('storage_key').notNull(), // S3 key
  mimeType: varchar('mime_type', { length: 100 }),
  size: integer('size'),
  hash: text('hash'), // SHA-256 hash for integrity
  metadata: jsonb('metadata'),
  expiresAt: timestamp('expires_at'),
}, (table) => ({
  userIdx: index('evidence_user_idx').on(table.userId),
  hashIdx: index('evidence_hash_idx').on(table.hash),
}));

// ============================================================================
// JOBS
// ============================================================================

export const companies = pgTable('companies', {
  ...baseColumns,
  name: text('name').notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  website: text('website'),
  logoUrl: text('logo_url'),
  description: text('description'),
  industry: varchar('industry', { length: 100 }),
  size: varchar('size', { length: 50 }),
}, (table) => ({
  slugIdx: uniqueIndex('companies_slug_idx').on(table.slug),
}));

export const jobs = pgTable('jobs', {
  ...baseColumns,
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  externalId: varchar('external_id', { length: 255 }),
  source: varchar('source', { length: 50 }).notNull(), // linkedin, indeed, greenhouse, etc.
  title: text('title').notNull(),
  description: text('description'),
  location: jsonb('location'),
  remote: boolean('remote').default(false),
  salary: jsonb('salary'),
  requirements: jsonb('requirements'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  postedAt: timestamp('posted_at'),
  expiresAt: timestamp('expires_at'),
}, (table) => ({
  companyIdx: index('jobs_company_idx').on(table.companyId),
  sourceIdx: index('jobs_source_idx').on(table.source),
  statusIdx: index('jobs_status_idx').on(table.status),
  externalIdx: uniqueIndex('jobs_external_idx').on(table.source, table.externalId),
}));

// ============================================================================
// ELIGIBILITY & MATCHING
// ============================================================================

export const eligibilityAssessments = pgTable('eligibility_assessments', {
  ...baseColumns,
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull(), // eligible, ineligible, unknown
  reason: text('reason'),
  confidence: integer('confidence').notNull().default(0),
  checks: jsonb('checks').notNull(), // detailed check results
  assessedAt: timestamp('assessed_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('eligibility_user_idx').on(table.userId),
  jobIdx: index('eligibility_job_idx').on(table.jobId),
  uniqueAssessment: uniqueIndex('eligibility_unique_idx').on(table.userId, table.jobId),
}));

export const matches = pgTable('matches', {
  ...baseColumns,
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  eligibilityId: uuid('eligibility_id').references(() => eligibilityAssessments.id, { onDelete: 'set null' }),
  factors: jsonb('factors').notNull(), // breakdown of scoring factors
  rankedAt: timestamp('ranked_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('matches_user_idx').on(table.userId),
  jobIdx: index('matches_job_idx').on(table.jobId),
  scoreIdx: index('matches_score_idx').on(table.score),
  uniqueMatch: uniqueIndex('matches_unique_idx').on(table.userId, table.jobId),
}));

// ============================================================================
// APPLICATIONS
// ============================================================================

export const applicationPlans = pgTable('application_plans', {
  ...baseColumns,
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 30 }).notNull().default('draft'), // draft, planned, approved, submitted, verified
  resumeVariant: jsonb('resume_variant'),
  coverLetter: text('cover_letter'),
  answers: jsonb('answers'),
  eligibilityId: uuid('eligibility_id').references(() => eligibilityAssessments.id, { onDelete: 'set null' }),
  plannedAt: timestamp('planned_at'),
  approvedAt: timestamp('approved_at'),
  submittedAt: timestamp('submitted_at'),
}, (table) => ({
  userIdx: index('application_plans_user_idx').on(table.userId),
  jobIdx: index('application_plans_job_idx').on(table.jobId),
  statusIdx: index('application_plans_status_idx').on(table.status),
}));

export const approvals = pgTable('approvals', {
  ...baseColumns,
  applicationPlanId: uuid('application_plan_id').notNull().references(() => applicationPlans.id, { onDelete: 'cascade' }),
  field: text('field').notNull(), // which field requires approval
  proposedValue: jsonb('proposed_value'),
  riskLevel: varchar('risk_level', { length: 20 }).notNull(), // low, medium, high, sensitive
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, approved, rejected
  decidedBy: uuid('decided_by').references(() => users.id, { onDelete: 'set null' }),
  decidedAt: timestamp('decided_at'),
  reason: text('reason'),
}, (table) => ({
  planIdx: index('approvals_plan_idx').on(table.applicationPlanId),
  statusIdx: index('approvals_status_idx').on(table.status),
}));

export const receipts = pgTable('receipts', {
  ...baseColumns,
  applicationPlanId: uuid('application_plan_id').notNull().references(() => applicationPlans.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  submittedFields: jsonb('submitted_fields').notNull(),
  fieldHashes: jsonb('field_hashes').notNull(), // SHA-256 hashes of submitted data
  confirmationEvidence: jsonb('confirmation_evidence'),
  verificationStatus: varchar('verification_status', { length: 20 }).notNull().default('unverified'), // unverified, verified, failed
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  verifiedAt: timestamp('verified_at'),
}, (table) => ({
  planIdx: index('receipts_plan_idx').on(table.applicationPlanId),
  jobIdx: index('receipts_job_idx').on(table.jobId),
  statusIdx: index('receipts_status_idx').on(table.verificationStatus),
}));

// ============================================================================
// OUTCOMES
// ============================================================================

export const outcomes = pgTable('outcomes', {
  ...baseColumns,
  receiptId: uuid('receipt_id').notNull().references(() => receipts.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull(), // interview, rejected, offer, withdrawn, hired
  notes: text('notes'),
  reportedAt: timestamp('reported_at').notNull().defaultNow(),
  reportedBy: uuid('reported_by').references(() => users.id, { onDelete: 'set null' }),
}, (table) => ({
  receiptIdx: index('outcomes_receipt_idx').on(table.receiptId),
  statusIdx: index('outcomes_status_idx').on(table.status),
}));

// ============================================================================
// AUDIT & COMPLIANCE
// ============================================================================

export const auditEvents = pgTable('audit_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id'),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  resourceId: uuid('resource_id'),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('audit_events_tenant_idx').on(table.tenantId),
  userIdx: index('audit_events_user_idx').on(table.userId),
  actionIdx: index('audit_events_action_idx').on(table.action),
  createdAtIdx: index('audit_events_created_idx').on(table.createdAt),
}));

export const consentRecords = pgTable('consent_records', {
  ...baseColumns,
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  consentType: varchar('consent_type', { length: 50 }).notNull(), // privacy_policy, terms_of_service, marketing, analytics
  version: varchar('version', { length: 20 }).notNull(),
  granted: boolean('granted').notNull(),
  grantedAt: timestamp('granted_at').notNull().defaultNow(),
  revokedAt: timestamp('revoked_at'),
}, (table) => ({
  userIdx: index('consent_records_user_idx').on(table.userId),
  typeIdx: index('consent_records_type_idx').on(table.consentType),
}));

// ============================================================================
// BILLING
// ============================================================================

export const subscriptions = pgTable('subscriptions', {
  ...baseColumns,
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  plan: varchar('plan', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
}, (table) => ({
  userIdx: index('subscriptions_user_idx').on(table.userId),
  orgIdx: index('subscriptions_org_idx').on(table.organizationId),
  stripeCustomerIdx: index('subscriptions_stripe_customer_idx').on(table.stripeCustomerId),
}));

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = pgTable('notifications', {
  ...baseColumns,
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: jsonb('data'),
  read: boolean('read').notNull().default(false),
  readAt: timestamp('read_at'),
}, (table) => ({
  userIdx: index('notifications_user_idx').on(table.userId),
  readIdx: index('notifications_read_idx').on(table.read),
  createdAtIdx: index('notifications_created_idx').on(table.createdAt),
}));
