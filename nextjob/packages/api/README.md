# @nextjob/api

NextJob API server built with Fastify, PostgreSQL, and Drizzle ORM.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL with Drizzle ORM
- **Migrations**: Drizzle Kit

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials.

4. Generate and run migrations:
```bash
npm run db:generate
npm run db:migrate
```

5. Seed the database (optional):
```bash
npm run db:seed
```

## Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

## Database

### Schema

The database schema includes:

- **Users & Identity**: users, accounts, sessions
- **Organizations**: organizations, cohorts, cohort_members
- **Career Graph**: career_profiles, career_claims, evidence
- **Jobs**: companies, jobs
- **Eligibility & Matching**: eligibility_assessments, matches
- **Applications**: application_plans, approvals, receipts
- **Outcomes**: outcomes
- **Audit & Compliance**: audit_events, consent_records
- **Billing**: subscriptions
- **Notifications**: notifications

### Migrations

Generate migrations after schema changes:
```bash
npm run db:generate
```

Apply migrations:
```bash
npm run db:migrate
```

### Studio

Open Drizzle Studio to explore your database:
```bash
npm run db:studio
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/v1/status` - API status

More endpoints will be added as features are implemented.

## Environment Variables

See `.env.example` for all required environment variables.

## Testing

Tests will be added as the API develops.

## Deployment

The API is designed to be deployed on AWS with:
- RDS for PostgreSQL
- ECS or Lambda for compute
- S3 for evidence storage
- Valkey for caching

See the main NextJob documentation for deployment details.
