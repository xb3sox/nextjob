# Agent Instructions

## Status

In Progress. Landing page and database schema implemented. Technology stack and all threshold decisions approved (2026-01-15):
- Eligibility false-positive threshold: ≤2%
- Autopilot evidence coverage: ≥80%
- Minimum cohort size for reporting: ≥5 participants

**Completed:**
- ✅ T-01: Repository structure initialized
- ✅ T-02: Development environment set up
- ✅ T-03: Database schema created (20+ tables)
- ✅ T-52: Landing page implemented (ultra-minimal design)
- ✅ T-55: Legal compliance (Privacy Policy, Terms of Service)
- ✅ T-80, T-95-T-99: Technical excellence features

## Commands

### Current (npm-based)
```bash
# Frontend (Landing Page)
npm install                    # Install dependencies
npm run dev                    # Start development server (http://localhost:3000)
npm run build                  # Production build
npm run typecheck              # TypeScript validation
npm run lint                   # ESLint check

# Backend (API)
cd nextjob/packages/api
npm install                    # Install API dependencies
npm run dev                    # Start API server (http://localhost:4000)
npm run db:generate            # Generate database migrations
npm run db:migrate             # Run database migrations
npm run db:seed                # Seed test data
npm run db:studio              # Open Drizzle Studio

# Testing (coming soon)
npm run test                   # Unit and integration tests
npm run test:eval              # AI evaluation suite
```

### Planned (Bun-based - T-03a)
```bash
bun install                    # Install dependencies (30x faster)
bun run dev                    # Start development server
bun run build                  # Production build
bun run typecheck              # TypeScript validation
bun run lint                   # Lint check (Biome - 56x faster)
bun run format                 # Format code (Biome)
bun run test                   # Unit and integration tests (Vitest - 5x faster)
bun run test:coverage          # Generate coverage report
bun run test:eval              # AI evaluation suite
```

### shadcn/ui Commands (T-03e)
```bash
npx shadcn@latest add <component>  # Add shadcn/ui component
npx shadcn@latest list             # List available components
npx shadcn@latest diff             # Show component differences
```

## Structure

```
nextjob/
├── apps/
│   ├── web/                # Next.js + TypeScript (FR-ONB, matching, tracker, marketing)
│   │   └── src/app/
│   │       ├── (marketing)/  # Landing page, B2B section
│   │       ├── (legal)/      # Privacy policy, terms of service
│   │       └── (app)/        # Authenticated app (dashboard, applications, etc.)
│   └── extension/          # WXT browser extension (ATS execution)
├── packages/
│   ├── api/                # Fastify modular monolith
│   ├── career-graph/       # Career claims, evidence, verification
│   ├── eligibility/        # Eligibility engine (rules + provenance)
│   ├── matching/           # Job ranking and fit scoring
│   ├── tailoring/          # Evidence-constrained generation
│   ├── policy/             # Risk engine, approval workflow
│   ├── applications/       # State machine, receipts, tracking
│   ├── connectors/         # ATS integrations (Temporal workers)
│   ├── ai-gateway/         # Model routing, eval, observability
│   └── shared/             # Types, schemas, utilities
├── docs/                   # PRD, TECH, DESIGN
└── evals/                  # AI evaluation datasets
```

## Rules

- Every generated factual statement MUST trace to a verified CareerClaim.
- Eligibility MUST run before ranking. Unknown MUST NOT become Eligible silently.
- Sensitive fields (demographics, disability, health) MUST be user-only.
- No secrets, PII, or raw CV content in prompts or analytics.
- All external actions MUST be idempotent with unique user+job constraints.
- Every automated action MUST be explainable (reason, source, evidence).
- No model or prompt change ships without regression evaluation passing.
- Higher-level policy restrictions cannot be overridden by lower levels.
- Follow WCAG 2.2 AA for all user-facing interfaces.
- Use Zod schemas for all API boundaries and AI structured output.

## Completion Gates

Before any feature merges to main:

1. Requirements satisfied (traceable to PRD FR/NFR IDs)
2. Acceptance criteria passing (Given/When/Then)
3. Unit and integration tests green
4. AI eval suite passing (no regression)
5. Accessibility audit passing critical journeys
6. Security review complete (no secrets in prompts, RBAC verified)
7. Privacy controls verified (export/delete functional)
8. Telemetry events emitted without sensitive content
9. Documentation updated
10. Rollback procedure documented

## Boundaries

**Protected — do not modify without approval:**
- `docs/PRD.md` (product requirements authority)
- `docs/TECH.md` (architecture authority)
- `evals/` (evaluation datasets)
- Policy precedence rules in `packages/policy/`
- Eligibility final-rule logic in `packages/eligibility/`

**Prohibited:**
- Fabricating candidate experience or claims
- Auto-approving sensitive fields
- Sending PII to product analytics or AI providers
- Retrying ambiguous external submissions automatically
- Overriding Legal/Safety or Platform rules with lower-level policy
- Shipping model changes without eval regression

## References

- [Product Requirements](docs/PRD.md)
- [Technical Design](docs/TECH.md)
- [Design System](docs/DESIGN.md)
