# Second-pass code review — 2026-10-28

This is a separate pass by the same Arena agent, **not an independent expert review**. It covers security-sensitive and product-critical paths and the prior patch; it is not a complete line-by-line audit or penetration test. No production configuration, live database, real ATS, external identity provider, or historical Temporal workflows were tested. Findings below are code-level risks, not claims that deployed systems are exploitable.

## Findings

### High

1. **Raw AI prompts reach observability.** `packages/ai-gateway/src/index.ts:65-69,90-94` redacts messages for the provider but passes the original request to `recordGeneration`; `packages/ai-gateway/src/observability.ts:79-88` sends original messages and raw output to Langfuse. Error messages, stacks and arbitrary context metadata are also sent (`observability.ts:122-134`). When observability is enabled, private CV/application text can leave the system unredacted. Disable content logging by default and whitelist/redact telemetry, including errors and metadata; test both success and failure paths.

2. **RLS and grants are not established in the repository.** `packages/api/drizzle/0000_init.sql:10-88` creates sensitive public-schema tables without RLS or policies; `supabase/config.toml:15-23` describes automatic exposure of new public tables. If these migrations are applied to a Supabase project with permissive API grants, the Data API could expose user and credential data without tenant filtering. Actual production grants/configuration are unknown. Verify the live project immediately; place private tables in a non-exposed schema or revoke API grants, enable RLS and add tenant-scoped policies and integration tests.

3. **Ambiguous submissions can loop back to execution.** `packages/applications/src/state-machine.ts:71-73,88-98,106-110` allows `SUBMITTED_UNVERIFIED → NEEDS_USER → READY → EXECUTING`, and a similar route from `NEEDS_RECONCILIATION`, without requiring reconciliation. The guard at lines 255–260 checks only one direct transition. Further, the READY guard at lines 241–246 accepts omitted eligibility and approval values. A future connector could resubmit an ambiguous application or bypass approvals. Persist provenance/eligibility/approval state and enforce guards on every path; add adversarial transition tests. Current ATS activities fail closed.

4. **Profile claim/evidence methods do not enforce ownership.** `packages/profile/src/claims/claims-service.ts:64-82,122-146` and `packages/profile/src/claims/evidence-service.ts:58-81,103-104` access or mutate by ID without checking tenant or user. Callers receive mutable stored objects (`claims-service.ts:55-71`; `evidence-service.ts:48-65`) and can bypass versioning or alter verification state. The verification wrapper checks ownership, but direct callers are not protected. If exposed through an insufficiently guarded API this becomes cross-tenant access/tampering. Require an authenticated principal and tenant on every operation, enforce permissions internally, return defensive copies, and test direct access.

5. **Privileged role can be supplied to registration.** `packages/api/src/auth/index.ts:176-183,205-214` accepts `admin` or `organization_admin` and an arbitrary tenant ID. No public API handler is present to demonstrate exploitability; any future public handler passing client input through would permit privilege escalation. Separate public candidate registration from authenticated admin provisioning, and authorize tenant membership server-side.

### Medium

6. **Refresh and reset tokens are not atomically consumed.** `packages/api/src/auth/index.ts:385-398,552-577` reads then deletes tokens in separate operations. Concurrent requests can both pass the read, issue two sessions or reuse a reset token; failures between writes can also leave inconsistent state. Use conditional consumption and a transaction, with concurrent tests on real PostgreSQL.

7. **Rate limit can be bypassed under concurrency.** `packages/ai-gateway/src/index.ts:53-55,97-98,210-255` checks before the provider call but increments only after success; simultaneous or failing requests can evade the limit. It also skips callers without a user ID and is instance-local. Reserve capacity atomically before invocation and enforce a shared rate limit at the authenticated boundary.

8. **Retry limits disappear on restore.** `packages/applications/src/state-machine.ts:164-175,263-265,272-277` snapshots `retryCount`, but the constructor cannot restore it. Restarting/reconstructing a machine resets the retry budget. Persist and restore validated state and retry count atomically; test restart and concurrent transitions.

9. **Receipt hashes are not tamper-proof or private.** `packages/applications/src/receipts.ts:54-55,90-95,115-128` uses unkeyed SHA-256: anyone who can modify a receipt can recompute its hash and ID; low-entropy field values can be guessed offline. Deep freeze applies only to the current object. Use an authenticated signature or trusted immutable store for tamper evidence, and assess keyed hashing and access control for sensitive field values.

10. **Misleading duplicate verification.** `packages/api/src/activities/ats-connector.ts:61-71` only checks status `submitted`, not a verified receipt, while `packages/api/src/workflows/connector-execution.ts:69-75` reports `verified: true` for every duplicate. Return the actual verified status based on confirmation evidence. Account for Temporal replay compatibility and historic simulated activities.

11. **Unbounded signed URL lifetime and partial upload on failure.** `packages/profile/src/storage/evidence-storage-service.ts:117-123,187-191` accepts any positive safe integer expiry, including extremely large valid dates or values causing `toISOString()` to throw after data is stored. Cap expiry, validate the resulting date before storing, and make upload atomic. The in-memory download URLs are still placeholders and should not be presented as usable production links.

12. **Tailoring evaluation is not an independent quality gate.** `evals/tailoring/tailoring-eval.test.ts:13-53` uses a mock that returns expected outputs from the test dataset, not the production engine. Passing results do not validate evidence grounding or real AI output. Run the real engine against held-out cases and compare independently computed expectations.

## Static analysis and checks

- Semgrep 1.182.1 with selected JavaScript, Express, Node crypto, TypeScript and React security rules from `semgrep/semgrep-rules` commit `16b9e6d45f10649f6a531ec4838ed9924372c3bc`: 89 rules, 289 tracked targets, 28 findings, no scan errors. Tests were excluded and one file over 1 MB skipped. 27 findings are in vendored `.agents/skills/impeccable/scripts`; they require separate context-specific triage. The remaining finding at `src/i18n/I18nContext.tsx:99` is a read-only dictionary lookup, not the write required by the rule's prototype-pollution scenario.
- Prior pass: 668 tests, build, typechecks and lint passed; lint still reports warnings. The previous Bun audit found 13 dependency advisories, including one high. See `docs/AUDIT.md` for scope and details.
- No source fixes were made in this review pass. Obtain an independent human/security reviewer and validate live deployment controls before production use.
