# NextJob

> **One Profile. Every Opportunity. Less Work.**
>
> NextJob is an open-source, evidence-backed AI career and job application platform. It merges the verified domain intelligence engines from [`xb3sox/nextjob`](https://github.com/xb3sox/nextjob) with the enterprise-grade **TurboStarter** monorepo architecture.

---

[![Node.js](https://img.shields.io/badge/node->=%2024.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-12.4.1-orange.svg)](https://pnpm.io/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg)](https://nextjs.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.x-blue.svg)](https://turbo.build/repo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE.md)

---

## Table of Contents

- [Overview](#overview)
- [Core Capabilities](#core-capabilities)
  - [1. Today Dashboard (`/dashboard`)](#1-today-dashboard-dashboard)
  - [2. Find Jobs & Fit Analysis (`/dashboard/jobs`)](#2-find-jobs--fit-analysis-dashboardjobs)
  - [3. My Career Identity (`/dashboard/career`)](#3-my-career-identity-dashboardcareer)
  - [4. Applications Pipeline & CV Studio (`/dashboard/applications`)](#4-applications-pipeline--cv-studio-dashboardapplications)
  - [5. Bilingual Arabic (RTL) & English Support](#5-bilingual-arabic-rtl--english-support)
- [Architecture & Monorepo Structure](#architecture--monorepo-structure)
- [Guiding Principles & Engineering Standards](#guiding-principles--engineering-standards)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Database Setup & Migrations](#database-setup--migrations)
  - [Running Applications](#running-applications)
- [Available Commands](#available-commands)
- [Testing & Benchmark Verification](#testing--benchmark-verification)
- [Documentation Index](#documentation-index)
- [Security, Privacy & Compliance](#security-privacy--compliance)
- [License](#license)

---

## Overview

NextJob is designed to solve the critical pitfalls of modern job hunting: fabricated AI resumes, messy application tracking, privacy leaks, and opaque screening criteria.

Instead of generic LLM text generation, NextJob implements:

- **Zero-Fabrication Tailoring**: Output statements strictly derive from user-verified career claims (`confidence >= 0.8`).
- **Deterministic 10-Dimension Eligibility**: Evaluates candidate eligibility _before_ match scoring, maintaining a **0.0% false-positive rate** on benchmark test sets.
- **Cryptographic Submission Receipts**: SHA-256 payload hashes bind every application document and submission state, preventing silent overwrites and unauthorized updates.
- **Privacy-First Data Architecture**: Full PII redaction on ingest, explicit approval gates for sensitive attributes, and GDPR Article 17/20 data portability and erasure compliance.

---

## Core Capabilities

### 1. Today Dashboard (`/dashboard`)

_Action-first daily command center for candidate careers._

- **Action Queue**: Displays applications requiring human review, claims needing verification, upcoming interviews, and scheduled follow-ups.
- **Job Recommendations**: Surfaces top eligible listings matched against verified career preferences.
- **Persistent AI Assistant**: Accessible across workspace screens to draft updates and explain gaps, requiring explicit user confirmation before modifying authoritative records.

### 2. Find Jobs & Fit Analysis (`/dashboard/jobs`)

_Discovery, deduplication, and explainable 5-question match evaluation._

- **Live Feed Ingestion**: Connects to permitted public feeds (e.g., Remotive public API and Lever/Greenhouse normalized schemas) with automated SHA-256 fingerprint deduplication.
- **Deterministic Eligibility Engine**: Evaluates 10 hard criteria: `location`, `work_authorization`, `sponsorship`, `license`, `certification`, `education`, `experience`, `skill`, `language`, and `clearance`.
- **5-Question Job Fit Breakdown**:
  1. _Why does this match me?_ (Weighted multi-factor score breakdown)
  2. _What requirements do I meet?_ (Explicit claim-to-requirement mappings)
  3. _What am I missing?_ (Differentiates between **Required** vs. **Preferred** gaps)
  4. _Is the opportunity credible?_ (Source verification and posting freshness)
  5. _What happens when I apply?_ (Connector type and automation mode)

### 3. My Career Identity (`/dashboard/career`)

_Single authoritative Career Graph and evidence vault._

- **Multi-Format Import**: Ingest resumes from PDF, DOCX, Plain Text, and standard **JSON Resume v1.0.0** formats.
- **Automated Conflict Detection**: Detects date overlaps and role discrepancies against existing verified claims; stages differences for explicit candidate resolution.
- **Claim Verification Workflow**: Claims maintain lifecycle states (`verified`, `unverified`, `pending_review`). Only verified claims are eligible for tailoring.
- **Preferences & Reusable Answers**: Configure target titles, locations, compensation floor, work modes (remote/hybrid/on-site), and verified screening question answers.

### 4. Applications Pipeline & CV Studio (`/dashboard/applications`)

_Comprehensive application lifecycle management and document generation._

- **12-State Pipeline**: Tracks stages from `Saved`, `Preparing`, `Needs Approval`, `Ready`, `Submitting`, `Submission Uncertain`, `Confirmed`, through `Interview`, `Offer`, `Rejected`, `Withdrawn`, and `Failed`.
- **Uncertainty Guard**: Network timeouts or unconfirmed ATS submissions transition to `Submission Uncertain` (`SUBMITTED_UNVERIFIED`), blocking automated retries until verified.
- **Evidence-Constrained CV Studio**: Generate tailored resumes and cover letters with side-by-side claim provenance. Statement-level accept, edit, or reject recalculates document SHA-256 hashes in real time.
- **Multi-Format Document Export**: One-click export to **DOCX**, **Print-ready PDF / HTML**, and **JSON Resume**.

### 5. Bilingual Arabic (RTL) & English Support

_First-class internationalization and bi-directional layout._

- Full Arabic (`ar`) and English (`en`) localized strings via `@workspace/i18n`.
- Dynamic bi-directional document and layout rendering with `<html lang={locale} dir={getLanguageDirection(locale)}>`.
- Full Word processing bidi tags (`<w:bidi/>`) for exported DOCX files.

---

## Architecture & Monorepo Structure

NextJob is organized as a Turborepo monorepo powered by `pnpm` workspaces:

```text
nextjob/
├── apps/
│   ├── web/               # Next.js 16.4 App Router (React 19, RSC, Nuqs, Tailwind CSS)
│   ├── mobile/            # Expo Router & React Native cross-platform app
│   └── extension/         # WXT browser extension for autofill and ATS integration
│
├── packages/
│   ├── api/               # Hono RPC API modules (@workspace/api) mounted at /api/nextjob
│   ├── auth/              # Better Auth server, Drizzle adapter, session guards
│   ├── db/                # Drizzle ORM schema, PostgreSQL migrations, database seeds
│   ├── i18n/              # Bi-directional internationalization (English, Spanish, Arabic)
│   ├── ui/                # Cross-platform component library (web, mobile, shared)
│   ├── shared/            # Shared types, Zod schemas, logging, ID utilities
│   ├── storage/           # S3-compatible document and artifact storage client
│   ├── email/             # React Email templates and transactional senders
│   ├── flags/             # OpenFeature feature flag management
│   ├── analytics/         # PostHog analytics integration
│   └── monitoring/        # Sentry error tracking and performance monitoring
│
├── docs/                  # Comprehensive architecture, API reference, and user guides
│   ├── api/               # REST API reference documentation and OpenAPI specifications
│   └── user-guide/        # User-facing onboarding, applying, tracking, and privacy guides
│
├── tooling/               # Shared toolchains (oxlint, oxfmt, vitest, typescript)
├── DECISIONS.md           # Architectural Decision Records (ADRs) & competitor validation
├── TURBOSTARTER_INTEGRATION.md # Integration mapping & database migration guide
├── TASKS.md               # P0 implementation matrix & traceability backlog
└── PROGRESS.md            # Verification records, test results & benchmark logs
```

---

## Guiding Principles & Engineering Standards

1. **Proof Over Promises**: AI must never extrapolate or hallucinate experience, degrees, or metrics. Every fact generated in a resume maps back to a verified claim ID in the candidate's career graph.
2. **Deterministic Pre-Checks**: Machine learning ranks jobs only after deterministic Boolean rule filters ensure legal eligibility and mandatory requirements are satisfied.
3. **Payload Integrity**: Approval decisions are cryptographically bound to the SHA-256 hash of the exact document payload shown to the user.
4. **Tenant Isolation**: Every database record and API query enforces strict `userId` scoping with server-side validation (`enforceAuth` + `assertResourceOwnership`).

---

## Getting Started

### Prerequisites

- **Node.js**: `>= 24.0.0`
- **pnpm**: `^12.4.1`
- **Docker & Docker Compose**: For local PostgreSQL database services

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/xb3sox/nextjob.git
cd nextjob
pnpm install
```

### Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env
```

Ensure the following minimal variables are configured in `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/turbostarter
PRODUCT_NAME=NextJob
URL=http://localhost:3000
DEFAULT_LOCALE=en
BETTER_AUTH_SECRET=your-secure-random-secret
```

### Database Setup & Migrations

Start the local database container and run migrations:

```bash
# Start PostgreSQL via Docker Compose
pnpm services:start

# Generate and apply Drizzle database migrations
pnpm with-env pnpm -F @workspace/db db:migrate
```

### Running Applications

Run all services in development mode:

```bash
pnpm dev
```

Or target specific applications:

```bash
# Web application (Next.js 16.4 on http://localhost:3000)
pnpm --filter web dev

# Browser extension (WXT Chrome development)
pnpm --filter extension dev

# Mobile application (Expo development server)
pnpm --filter mobile dev
```

---

## Available Commands

| Command               | Description                                                      |
| :-------------------- | :--------------------------------------------------------------- |
| `pnpm dev`            | Start development servers across all workspace apps and packages |
| `pnpm build`          | Build all workspace applications and libraries for production    |
| `pnpm test`           | Run all test suites across the monorepo via Vitest               |
| `pnpm lint`           | Run monorepo type checking and Oxlint static analysis            |
| `pnpm lint:fix`       | Automatically fix linting issues with Oxlint                     |
| `pnpm format`         | Check formatting across files with Oxfmt                         |
| `pnpm format:fix`     | Format files across the codebase with Oxfmt                      |
| `pnpm services:start` | Launch local Docker Compose services (PostgreSQL)                |
| `pnpm services:stop`  | Shut down local Docker Compose services                          |
| `pnpm clean`          | Clean build caches (`.turbo`, `node_modules`, dist outputs)      |

---

## Testing & Benchmark Verification

NextJob maintains comprehensive test suites covering unit logic, security isolation, and quantitative evaluation benchmarks.

```bash
# Run NextJob domain engine tests and 114-case eligibility benchmarks
pnpm --filter @workspace/api test

# Run monorepo-wide test suite
pnpm test
```

### Benchmark Metrics

- **Eligibility Benchmark**: 114 test cases spanning 10 requirement dimensions (`location`, `work_authorization`, `sponsorship`, `license`, `certification`, `education`, `experience`, `skill`, `language`, `clearance`). Achieves a verified **0.0% false-positive rate** (threshold: ≤ 2.0%).
- **Negative Authorization**: Verified rejection (`403 Forbidden`) on unauthorized cross-tenant mutations.
- **Tailoring Factuality**: 100% evidence traceability with 0 unsupported claims generated.

---

## Documentation Index

Comprehensive guides and architectural specifications are located in the repository:

- **Architecture & Decisions**:
  - [`DECISIONS.md`](./DECISIONS.md) — Architectural Decision Records (ADRs) and competitor evaluations.
  - [`TURBOSTARTER_INTEGRATION.md`](./TURBOSTARTER_INTEGRATION.md) — Monorepo mapping, database schema design, and migration guidelines.
  - [`TASKS.md`](./TASKS.md) — Implementation traceability matrix and acceptance criteria.
  - [`PROGRESS.md`](./PROGRESS.md) — Milestone execution and verification log.
- **REST API Specifications**:
  - [`docs/api/README.md`](./docs/api/README.md) — API architecture overview, headers, rate limits, and error handling.
  - [`docs/api/openapi.json`](./docs/api/openapi.json) — Full OpenAPI 3.0 specification.
  - Domain endpoints: [`profile.md`](./docs/api/profile.md), [`jobs.md`](./docs/api/jobs.md), [`eligibility.md`](./docs/api/eligibility.md), [`matches.md`](./docs/api/matches.md), [`applications.md`](./docs/api/applications.md), [`approvals.md`](./docs/api/approvals.md), [`privacy.md`](./docs/api/privacy.md), [`auth.md`](./docs/api/auth.md).
- **User Guides**:
  - [`docs/user-guide/README.md`](./docs/user-guide/README.md) — Overview of candidate workflows.
  - Guides: [`onboarding.md`](./docs/user-guide/onboarding.md), [`applying.md`](./docs/user-guide/applying.md), [`tracking.md`](./docs/user-guide/tracking.md), [`privacy-controls.md`](./docs/user-guide/privacy-controls.md).

---

## Security, Privacy & Compliance

- **GDPR Articles 17 & 20 Compliance**: One-click full data portability archive with SHA-256 checksums, and cascading account erasure with cryptographic `DataDeletionReceipt`.
- **Zero AI Training on User Data**: User data and candidate submissions are never used for model training or evaluation datasets.
- **Sensitive Fields Protection**: Demographics, disability, and health questions are strictly user-gated and never autofilled without explicit real-time approval.

---

## License

This project is licensed under the MIT License — see the [`LICENSE.md`](./LICENSE.md) file for details.
