# NextJob — One Profile. Every Opportunity. Less Work.

NextJob is an open-source, evidence-backed AI career platform built on the **TurboStarter** monorepo architecture (**Next.js 16.4 App Router**, **Hono RPC**, **Better Auth**, **Drizzle ORM + PostgreSQL**, **Zod v4**, and **Tailwind CSS**).

It merges the production domain engines from [`xb3sox/nextjob`](https://github.com/xb3sox/nextjob) into TurboStarter's full-stack monorepo foundation.

## Core P0 Capabilities

1. **Today (`/dashboard`) — Action-First Daily Career Dashboard**
   - Displays suitable job recommendations, applications ready for human approval, career claims needing verification, interviews, and follow-up reminders.
2. **Find Jobs (`/dashboard/jobs`) — Discovery, Deduplication & 5-Question Fit Analysis**
   - Connects to permitted public job feeds (Remotive public API + Greenhouse/Lever normalized schema) with SHA-256 deduplication and active/expired tracking.
   - Evaluates hard eligibility across 10 dimensions (`location`, `work_authorization`, `sponsorship`, `license`, `certification`, `education`, `experience`, `skill`, `language`, `clearance`) with a verified **0% false-positive rate** across the 114-case benchmark dataset.
   - Answers all 5 mandatory Job Fit questions for every listing:
     1. _Why does this match me?_
     2. _What requirements do I meet?_
     3. _What am I missing?_ (Separated into **Required** vs **Preferred** gaps)
     4. _Is the opportunity credible?_
     5. _What happens when I apply?_
3. **My Career (`/dashboard/career`) — Single Authoritative Career Identity**
   - Import CVs/Resumes (PDF, DOCX, Text) and **JSON Resume** files into structured claims (`summary`, `experience`, `education`, `skill`, `project`, `certification`, `achievement`) with SHA-256 provenance and PII redaction.
   - **Automatic Conflict Detection**: Highlights employment date or role differences against existing verified claims for explicit user resolution instead of silently overwriting verified facts.
   - **Approval-Gated Conversational Updates**: Natural language career updates (e.g., _"I was promoted to Information Manager"_) create structured proposals in `pending_review` state that only modify the authoritative profile after explicit user confirmation.
   - **Preferences & Reusable Answers**: Target roles, locations, work modes, salary floor, excluded companies, and verified screening answers.
4. **Applications (`/dashboard/applications`) — 12-State Pipeline, Evidence-Constrained CV Studio & Cryptographic Receipts**
   - Tracks all 12 lifecycle states: `Saved`, `Preparing`, `Needs Approval`, `Ready`, `Submitting`, `Submission Uncertain`, `Confirmed`, `Interview`, `Offer`, `Rejected`, `Withdrawn`, and `Failed`.
   - **Evidence-Constrained Tailoring Engine**: Generates role-tailored resumes and cover letters using **only** `verified` claims (`confidence >= 0.8`), with side-by-side provenance inspection and one-click export to **DOCX**, **Print-ready PDF/HTML**, and **JSON**.
   - **Payload-Hash Approval Gate & Submission Uncertainty**: Binds human approval to the exact SHA-256 document payload hash. Submissions lacking confirmation signals are recorded as `Submission Uncertain` (`SUBMITTED_UNVERIFIED`) and block automatic retries.
5. **Bilingual English (`en`) & Arabic (`ar`) RTL Support**
   - Full localization and `<html lang={locale} dir={getLanguageDirection(locale)}>` RTL support across the web workspace and exported resume documents.

## Architecture & Project Continuity Records

- [`DECISIONS.md`](./DECISIONS.md) — Architectural Decision Records (ADRs), competitor validation, and conflict resolution between `xb3sox/nextjob` and TurboStarter.
- [`TURBOSTARTER_INTEGRATION.md`](./TURBOSTARTER_INTEGRATION.md) — Monorepo package mapping and integration details.
- [`TASKS.md`](./TASKS.md) — Dependency-ordered P0 task backlog and acceptance criteria status.
- [`PROGRESS.md`](./PROGRESS.md) — Execution log, verification results, and audit summary.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run P0 acceptance, security & 114-case eligibility benchmark tests
pnpm --filter @workspace/api test

# Start development server
pnpm --filter web dev
```
