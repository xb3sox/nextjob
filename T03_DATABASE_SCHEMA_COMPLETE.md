# T-03: Database Schema Implementation - Complete

**Date:** 2026-01-15  
**Status:** ✅ Complete  
**Duration:** ~2 hours

## Overview

Successfully implemented the complete PostgreSQL database schema for NextJob using Drizzle ORM. The schema covers all entities defined in TECH.md and includes proper indexing, constraints, and relationships.

## What Was Implemented

### Database Schema (20+ Tables)

#### Identity & Authentication
- **users** - User accounts with roles and status
- **accounts** - OAuth provider accounts (Google, GitHub, etc.)
- **sessions** - User sessions with expiration

#### Organizations (B2B)
- **organizations** - B2B organizations with plans and settings
- **cohorts** - Cohorts within organizations
- **cohort_members** - Users in cohorts with roles

#### Career Graph
- **career_profiles** - User career profiles with preferences
- **career_claims** - Verified career claims (experience, education, skills, etc.)
- **evidence** - Evidence documents stored in S3

#### Jobs
- **companies** - Company information
- **jobs** - Job postings with requirements and metadata

#### Eligibility & Matching
- **eligibility_assessments** - Eligibility check results
- **matches** - Job matches with scoring

#### Applications
- **application_plans** - Application plans with status tracking
- **approvals** - Approval requests for sensitive fields
- **receipts** - Immutable submission receipts with hashes

#### Outcomes
- **outcomes** - Application outcomes (interview, rejected, offer, etc.)

#### Audit & Compliance
- **audit_events** - Immutable audit log
- **consent_records** - User consent tracking

#### Billing
- **subscriptions** - Stripe subscription tracking

#### Notifications
- **notifications** - User notifications

### Schema Features

✅ **Base Columns on Every Table**
- `id` - UUID primary key
- `tenant_id` - Multi-tenancy support
- `version` - Optimistic locking
- `source` - Data source tracking
- `provenance` - JSONB provenance data
- `created_at` / `updated_at` - Timestamps
- `retention_policy` - JSONB retention rules
- `deletion_state` - Soft delete support

✅ **Proper Indexing**
- Tenant ID indexes on all tables
- User ID indexes for fast lookups
- Foreign key indexes
- Unique constraints for business rules
- Composite indexes for common queries

✅ **Data Types**
- UUIDs for primary keys
- JSONB for flexible data (preferences, requirements, metadata)
- Proper timestamp handling
- Enumerated statuses with VARCHAR

✅ **Relationships**
- Foreign key constraints with CASCADE deletes
- Proper reference integrity
- Many-to-many relationships (cohort_members)

### Infrastructure

✅ **Drizzle ORM Configuration**
- `drizzle.config.ts` - Migration configuration
- `src/db/index.ts` - Database connection
- `src/db/migrate.ts` - Migration runner
- `src/db/seed.ts` - Test data seeder

✅ **API Package Structure**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `src/index.ts` - Fastify server entry point
- `.env.example` - Environment variable documentation
- `README.md` - Setup and usage guide

✅ **Database Scripts**
- `npm run db:generate` - Generate migrations
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed test data
- `npm run db:studio` - Open Drizzle Studio

### Test Data

The seed script creates:
- 3 test users (2 candidates, 1 admin)
- 1 test organization
- 1 test cohort
- 1 career profile with preferences
- 3 career claims (experience, skill, education)
- 2 test companies (Stripe, Vercel)
- 2 test jobs with requirements

## Technical Details

### Entity Relationships

```
users
  ├─> accounts (OAuth providers)
  ├─> sessions (active sessions)
  ├─> career_profiles (1:1)
  │     └─> career_claims (1:N)
  │           └─> evidence (1:N)
  ├─> cohort_members (N:M via cohorts)
  ├─> application_plans (1:N)
  │     ├─> approvals (1:N)
  │     └─> receipts (1:N)
  │           └─> outcomes (1:N)
  └─> notifications (1:N)

organizations
  ├─> cohorts (1:N)
  │     └─> cohort_members (1:N)
  └─> subscriptions (1:N)

companies
  └─> jobs (1:N)
        ├─> eligibility_assessments (1:N)
        ├─> matches (1:N)
        └─> application_plans (1:N)
```

### Key Design Decisions

1. **UUID Primary Keys** - Better for distributed systems and security
2. **Tenant Isolation** - Every table has `tenant_id` for multi-tenancy
3. **JSONB for Flexibility** - Preferences, requirements, metadata stored as JSONB
4. **Soft Deletes** - `deletion_state` column for audit trail
5. **Version Tracking** - `version` column for optimistic locking
6. **Provenance** - Track data source and history
7. **Retention Policies** - JSONB field for compliance requirements

### Performance Considerations

- Indexed all foreign keys
- Indexed tenant_id on all tables
- Composite indexes for common query patterns
- JSONB GIN indexes can be added later for complex queries
- Proper cascade deletes to maintain referential integrity

## Files Created

```
nextjob/packages/api/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── .env.example
├── README.md
└── src/
    ├── index.ts
    └── db/
        ├── schema.ts (20+ tables)
        ├── index.ts (connection)
        ├── migrate.ts (migration runner)
        └── seed.ts (test data)
```

## Next Steps

1. **T-04: Authentication** - Implement OAuth 2.0 and tenant isolation middleware
2. **T-07: CV Import** - Build PDF/DOCX extraction pipeline
3. **T-08: Career Graph** - Implement evidence provenance tracking

## Verification

To verify the implementation:

```bash
cd nextjob/packages/api

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed

# Start API server
npm run dev
```

## Compliance with Requirements

✅ **TECH.md Compliance**
- All entities from TECH.md §Data & Integrations implemented
- All base columns present on every table
- Proper classification (PII, Evidence, Audit)
- Tenant isolation via tenant_id

✅ **PRD.md Compliance**
- Career Graph entities (career_profiles, career_claims, evidence)
- Eligibility tracking (eligibility_assessments)
- Application lifecycle (application_plans, approvals, receipts)
- Outcomes tracking (outcomes)
- Audit trail (audit_events)
- Privacy compliance (consent_records)

✅ **Security Requirements**
- Tenant isolation on every table
- Proper foreign key constraints
- Soft delete support
- Audit logging infrastructure
- Consent tracking

## Summary

T-03 is complete. The database schema is production-ready with:
- 20+ tables covering all business entities
- Proper indexing and constraints
- Multi-tenancy support
- Migration infrastructure
- Test data seeder
- API server skeleton

The foundation is now in place for implementing the core features: authentication, CV import, Career Graph, eligibility engine, and application workflow.
