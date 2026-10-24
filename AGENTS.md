# Agent Instructions

## Status

In Progress. Modern toolchain implemented with Bun, Vitest, and Biome. Technology stack and all threshold decisions approved (2026-01-15):
- Eligibility false-positive threshold: ≤2%
- Autopilot evidence coverage: ≥80%
- Minimum cohort size for reporting: ≥5 participants

**Completed:**
- ✅ T-01: Repository structure initialized
- ✅ T-02: Development environment set up
- ✅ T-03: Database schema created (20+ tables)
- ✅ T-03a: Migrated to Bun package manager (30x faster)
- ✅ T-03b: Added Vitest testing framework (5x faster, 20 example tests)
- ✅ T-03c: Migrated to Biome linter/formatter (56x faster)
- ✅ T-03d: Added Turborepo for build caching (9x faster builds)
- ✅ T-03e: Integrated shadcn/ui component library (8 core components)
- ✅ T-04: Authentication & tenant isolation (OAuth 2.0, RBAC, 33 tests)
- ✅ T-05: AI Gateway (3 providers, 7 schemas, PII redaction, Langfuse, 55+ tests)
- ✅ T-06: Temporal workflow infrastructure (durable execution, idempotency, 18 tests)
- ✅ T-07: Profile import & extraction (PDF/DOCX, AI extraction, 20+ tests)
- ✅ T-08: Your Profile with evidence provenance (claims service, evidence tracking, versioning, 20+ tests)
- ✅ T-09: Claim verification workflow (confirm/edit/remove/mark unverified, bulk verification, 15+ tests)
- ✅ T-09a: Preferences capture (comprehensive preferences schema, versioning, 20+ tests)
- ✅ T-09b: Automation policy (Manual/Copilot/Autopilot modes, field overrides, 25+ tests)
- ✅ T-10: Evidence storage (S3/local/memory, signed URLs, access control, 30+ tests)
- ✅ T-11: Job ingestion & normalization (normalization, deduplication, freshness tracking, 50+ tests)
- ✅ T-12: Eligibility engine (10 check types, rule management, confidence scoring, 25+ tests)
- ✅ T-13: Create eligibility evaluation dataset (114 cases, 117 tests, 0% false-positive rate)
- ✅ T-14: Matching and ranking engine (ranking by fit, eligibility, freshness, explainability, 15 tests)
- ✅ T-15: Job card UI with capability model (29 tests)
- ✅ T-16: AI evaluation dataset for tailoring (64 tests)
- ✅ T-17: Tailoring engine with evidence constraints (18 tests)
- ✅ T-18: Tailoring UI with evidence display (original → proposed → evidence, 4 tests)
- ✅ T-52: Landing page implemented (ultra-minimal design)
- ✅ T-55: Legal compliance (Privacy Policy, Terms of Service)
- ✅ T-80, T-95-T-99: Technical excellence features

**Progress:** 33/118 tasks complete (28.0%)

> Note: T-13 through T-18 are complete with all eval/unit tests passing. Next up: T-19 (risk & policy engine) or T-03f/T-03g.

## Agent Skills

### Installed Skills (11 total, ~90% coverage)

**Priority 1: Critical (4 skills)**
- ✅ `shadcn` - Official shadcn/ui skill with comprehensive component knowledge
- ✅ `@vercel/nextjs` - Next.js patterns for planned migration
- ✅ `@supabase/supabase` - Supabase integration patterns
- ✅ `@testing-library/react` - React testing patterns

**Priority 2: Important (3 skills)**
- ✅ `@drizzle-orm/drizzle` - Advanced ORM patterns
- ✅ `@turbo-repo/turborepo` - Monorepo management
- ✅ `@tailwindcss/tailwind` - Advanced styling patterns

**Priority 3: Useful (4 skills)**
- ✅ `@radix-ui/primitives` - Accessible component patterns
- ✅ `@biomejs/biome` - Advanced linting configuration
- ✅ `@vercel/analytics` - Web analytics integration
- ✅ `@vercel/edge` - Edge computing patterns

### Installation Commands

Run the installation script:
```bash
chmod +x install-skills.sh
./install-skills.sh
```

Or install manually:
```bash
# Priority 1: Critical
npx skills add https://github.com/shadcn-ui/ui --skill shadcn
npx skills add vercel-labs/skills --skill nextjs -y
npx skills add supabase/skills --skill supabase -y
npx skills add testing-library/skills --skill react -y

# Priority 2: Important
npx skills add drizzle-team/skills --skill drizzle -y
npx skills add vercel/skills --skill turborepo -y
npx skills add tailwindlabs/skills --skill tailwind -y

# Priority 3: Useful
npx skills add radix-ui/skills --skill primitives -y
npx skills add biomejs/skills --skill biome -y
npx skills add vercel/skills --skill analytics -y
npx skills add vercel/skills --skill edge -y
```

### Remaining Gaps (5 areas)

1. **AI/LLM Integration** - No official skills for Vercel AI SDK
2. **Browser Extension** - No skills for WXT (Web Extension Toolkit)
3. **Temporal Workflow** - No skills for Temporal patterns
4. **Accessibility Testing** - No dedicated a11y testing skills
5. **Security Audit** - No comprehensive security scanning skills

### Rejected Skills

Webpack, Jest, ESLint, npm, Create React App, Redux, GraphQL, Docker, AWS - all obsolete or not in tech stack.

### Risky/Unverified Skills

`@openai/openai`, `@anthropic/claude`, third-party AI skills - wait for official releases.

## Commands

### Commands (Bun — the only package manager)

```bash
bun install                    # CI uses --frozen-lockfile
bun run dev                    # dev server
bun run build                  # production build -> dist/
bun run typecheck              # tsc --noEmit
bun run test                   # vitest
bun run test:coverage          # coverage report
bun run test:eval              # AI evaluation suite
bunx wrangler dev --port 8799  # serve dist/ exactly as Workers does
```

`bun.lock` is the single lockfile. `npm install` or `npx` re-creates
`package-lock.json` and breaks CI's `--frozen-lockfile` gate.

`bun run lint` is a CI gate (Biome: format + lint). Errors fail the build;
174 warnings (mostly `noExplicitAny`, `noNonNullAssertion`) are tolerated for
now. Keep it that way — do not add `--error-on-warnings` until they're fixed.

### shadcn/ui Commands (T-03e)
```bash
npx shadcn@latest add <component>  # Add shadcn/ui component
npx shadcn@latest list             # List available components
npx shadcn@latest diff             # Show component differences
```

## Structure

What is in the repo today:

```
./
├── src/                    # Vite + React 18 SPA — the shipped application
│   ├── pages/              # landing (App.tsx), auth/*, dashboard, tailor, legal
│   ├── components/         # JobCard, WaitlistForm, ProtectedRoute, ui/ (shadcn)
│   ├── contexts/           # AuthContext (Supabase session)
│   ├── lib/                # supabase client, cn(), redirect helpers
│   └── test/               # vitest setup (happy-dom)
├── packages/
│   ├── api/                # Fastify modular monolith, Temporal workflows, jobs, auth
│   ├── profile/            # claims, evidence, import/extraction
│   ├── tailoring/          # evidence-constrained generation (T-17 engine)
│   └── ai-gateway/         # model routing, Zod schemas, PII redaction
├── evals/                  # evaluation datasets (protected)
├── supabase/               # local stack config and migrations
├── docs/                   # PRD, TECH, DESIGN (PRD and TECH are protected)
└── public/
```

**Target architecture vs. today.** `docs/TECH.md` describes a Next.js `apps/web` and a WXT
`apps/extension`. Neither exists yet. Until they do:

- A task that names `apps/web/src/...` means the equivalent path under `src/` (e.g.
  `apps/web/src/app/tailor/` → `src/pages/TailorPage.tsx`).
- A task that names `apps/extension/...` means a new top-level `extension/` directory (T-21).
- A task that names a `packages/<name>/` that does not exist yet means create that package
  (plain TypeScript, `src/index.ts` entry, vitest next to source).

Do not create an `apps/` tree to satisfy a path in a task brief. Ask on the issue if the
mapping is unclear.

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

## GitHub Workflow

Work is tracked on the [NextJob Roadmap board](https://github.com/users/xb3sox/projects/11)
(`#11`). Every open task in [TASKS.md](TASKS.md) has exactly one issue.

**One issue = one task = one PR.** Do not bundle tasks; do not open a PR without an issue.

### Labels

| Label | Meaning |
| --- | --- |
| `jules` | **Dispatch trigger.** Adding it starts a task in the Jules GitHub App ([docs](https://jules.google/docs/changelog/2025-06-26/)). Never pre-applied: the repo keeps it off ready issues so installing the app cannot spray tasks. |
| `jules-queued` | Good agent work, but a dependency has not merged. Do not dispatch yet. |
| `human` | Needs a person: approval, credentials, legal/compliance judgement, or an unresolved decision. |

Phase lives in the project's `Phase` field, not in labels.

**Ready work** = open, no `jules-queued`, no `human` (22 issues today), MVP milestone first.

### Workflow

1. Pick ready work. Read its brief. **Adding `jules` dispatches the agent** — that single label is the trigger, never an assignment.
2. Branch from `main`: `feat/<task-id>-<slug>` (e.g. `feat/t-18-tailoring-review-ui`).
3. Implement only the scope in the issue. Protected paths stay untouched.
4. Run the gates below; paste the output into the PR body.
5. Open the PR against `main`, link the issue (`Refs T-XX`), and move the board item to `In Progress` then `Done`.

### Gates before any PR

```bash
bun run typecheck
bun run lint
bunx vitest run --maxWorkers 2
bun run build
```

`bun.lock` is the single lockfile — never run `npm install`/`npx`. Install with
`bun install --frozen-lockfile` (CI does).

### Stop and comment instead of guessing when

- A dependency listed on the issue is still open.
- Acceptance criteria conflict with `docs/PRD.md` or `docs/TECH.md`.
- The change would touch a protected path or need a new dependency.
- The work needs a credential, a paid service, or a production action.

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
