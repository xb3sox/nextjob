# Repository audit — 2026-10-28

Scope: repository inventory and targeted review of authentication, tenancy, storage,
submission, deployment, extension and evaluation code; frozen Bun install, CI
checks, tests, build and `bun audit`. This is not a penetration test or a
line-by-line security certification. No live database, provider, browser-extension
store or production deployment was tested.

## Addressed in this pass

- Persisted session creation time now enforces the one-hour access-token lifetime
  across retries, restarts and instances. Refresh sessions remain valid until their
  separate expiry. Existing access tokens older than one hour will require refresh.
- Tenant middleware checks all supplied tenant identifiers, including conflicts,
  and handles missing bodies. Query filtering remains the caller's responsibility.
- Unimplemented ATS activities fail closed rather than inventing submissions or
  confirmations; unimplemented S3/local evidence uploads fail instead of losing data.
  Review existing receipts and in-flight workflows for prior simulated results.
- Memory evidence storage copies metadata and buffers, rejects invalid expiry, and
  revokes signed URLs after deletion. It remains ephemeral and is not a production
  storage backend; its example URLs are not an implemented download endpoint.
- Removed the simulated waitlist, fixed Vercel SPA deep links, and restricted manual
  Cloudflare production deployments to main.

## Remaining priorities

1. **Dependency security:** `bun audit` on the frozen lock reported 13 advisories:
   1 high, 8 moderate and 4 low. The high is
   [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)
   affecting Zod below 4.6.6, including direct Zod 3 dependencies. Upgrade and
   test Zod and dependent AI SDKs together; bound request sizes before parsing.
   Other advisories include React Router, uuid, esbuild and AI SDK dependencies.
   Audit results identify dependency versions, not confirmed exploitability.
2. **Authentication concurrency:** refresh rotation and password-reset token use
   involve separate reads and writes; concurrent requests can race. Use atomic
   transactions/conditional consumption and test against real Postgres. Review
   OAuth account linking/status and tenant semantics before exposing API endpoints.
3. **Submission safety:** duplicate checking does not enforce the idempotency key;
   implement durable atomic idempotency, real connectors and verified receipts
   before enabling workflows. Preserve Temporal replay compatibility when changing
   workflow code. In-flight historical activity results may still represent simulations.
4. **Product completeness:** profile AI extraction is heuristic/mock; the tailoring
   evaluation returns dataset expected outputs rather than exercising the real engine.
   Replace with real integrations and independent evaluations. Extension content
   script currently runs on all URLs despite being a scaffold; narrow permissions
   before release. The app and API have separate auth paths; end-to-end integration
   and actual deployment configuration need verification.
5. **Quality/operations:** lint passes with existing warnings; add integration tests
   for Postgres, authorization, deployment routing and real storage. Review privacy
   and marketing claims against actual functionality. CI blocks critical dependency
   advisories only; high advisories are currently report-only.

References: [npm audit documentation](https://docs.npmjs.com/cli/audit/),
[Vercel rewrite precedence](https://vercel.com/docs/project-configuration/vercel-json).
