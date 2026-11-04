# TurboStarter & NextJob Integration Guide (TURBOSTARTER_INTEGRATION.md)

## Overview

This repository merges the official **TurboStarter** monorepo architecture (`apps/web`, `apps/extension`, `apps/mobile`, `packages/*`) with the **NextJob** domain implementation from [`xb3sox/nextjob`](https://github.com/xb3sox/nextjob).

**Integration Status:** `MERGE VERIFIED` (in progress — merging directly into the target TurboStarter repository).

## Package & Module Mapping

| Source (`xb3sox/nextjob`)                                                  | Target (`TurboStarter`)                                                                      | Integration Strategy                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/api/src/db/schema.ts`                                            | `packages/db/src/schema/career.ts`                                                           | Ported and expanded to full relational Drizzle schema covering all 16+ NextJob career entities, foreign-keyed to Better Auth `user.id`. Exported from `@workspace/db/schema`.                                                                                                         |
| `packages/profile/src/{import,claims,verification,preferences,automation}` | `packages/api/src/modules/career/`                                                           | Ported into `@workspace/api` career domain services and exposed via Hono RPC routes under `/api/career/*`. Added JSON Resume import/export, conflict detection against existing claims, and conversational update proposal engine.                                                    |
| `packages/api/src/{jobs,eligibility,matching}`                             | `packages/api/src/modules/jobs/`                                                             | Ported `JobNormalizationService`, `JobDeduplicationService`, `EligibilityEngineService` (10 check dimensions), and `MatchingEngineService` (7 weighted factors) + added live permitted public job source connector (Remotive public API with resilient fallback) under `/api/jobs/*`. |
| `packages/tailoring/src/*`                                                 | `packages/api/src/modules/tailoring/`                                                        | Ported evidence-constrained `TailoringEngine` + added structured CV/Resume document builder and DOCX / PDF (print-ready HTML/PDF) / JSON Resume exporters under `/api/tailoring/*`.                                                                                                   |
| `packages/applications/src/*` & `packages/policy/src/*`                    | `packages/api/src/modules/applications/`                                                     | Ported `ApplicationStateMachine`, `SubmissionReceipt` (SHA-256 content-hashed receipts), `PolicyEngine`, and `ApprovalService` (payload-bound approvals) under `/api/applications/*`.                                                                                                 |
| `packages/ai-gateway/src/pii-redaction.ts` & `validation.ts`               | `packages/api/src/modules/ai/`                                                               | Ported PII redaction and Zod structured schema validation into `@workspace/api` AI module so all AI assistant and extraction operations strip sensitive PII and enforce evidence constraints.                                                                                         |
| `packages/shared/src/i18n/*` & `src/i18n/translations.ts`                  | `packages/i18n/src/` & `apps/web/src/modules/common/layout/base.tsx`                         | Added `ar` (Arabic) locale to `@workspace/i18n`, added `getLanguageDirection()` / `isRTL()` helpers, and wired `dir` attribute onto root `<html>`.                                                                                                                                    |
| `src/pages/*` & `src/components/JobCard.tsx`                               | `apps/web/src/app/[locale]/dashboard/(user)/`                                                | Built the 4 core NextJob screens (`Today`, `Find Jobs`, `My Career`, `Applications`) + persistent AI Career Assistant inside Next.js 16.4 App Router using `@workspace/ui-web`.                                                                                                       |
| `evals/eligibility` & `evals/tailoring`                                    | `packages/api/src/modules/jobs/__tests__/` & `packages/api/src/modules/tailoring/__tests__/` | Ported the 114-case eligibility evaluation dataset and 64-case tailoring evaluation dataset into Vitest suites inside `@workspace/api`.                                                                                                                                               |

## Database Migration Instructions

1. Ensure `.env` exists at repository root with `DATABASE_URL` configured.
2. Generate migrations:
   ```bash
   pnpm with-env pnpm -F @workspace/db db:generate
   ```
3. Apply migrations:
   ```bash
   pnpm with-env pnpm -F @workspace/db db:migrate
   ```

## Rollback Instructions

- All NextJob domain tables are additive in `packages/db/src/schema/career.ts` and do not destructively alter existing Better Auth (`user`, `session`, `account`, `organization`) or billing tables.
- To roll back API routes, remove `.route("/career", careerRouter)`, `.route("/jobs", jobsRouter)`, `.route("/tailoring", tailoringRouter)`, and `.route("/applications", applicationsRouter)` from `packages/api/src/index.ts`.
