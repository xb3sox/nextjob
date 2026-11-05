# NextJob System & Architecture Audit

## 1. Multi-Perspective Review & Gaps Analysis

### A. Design & UX/UI
- **Findings**: Strong typographic hierarchy with Geist & Source Serif 4, semantic light/dark token system, WCAG 2.2 AA contrast compliance.
- **Gaps**:
  1. Directional margin classes (`mr-*` instead of logical `me-*` or `gap-*`) in several component buttons cause minor alignment issues in Arabic (`dir="rtl"`).
  2. Mobile action sheets need explicit `accessibilityLabel` and `accessibilityRole` on icon-only triggers.

### B. Performance
- **Findings**: Heavy dashboard fetches leverage React Suspense with skeleton loading states; read-only endpoints utilize edge-caching headers (`Cache-Control: public, s-maxage=300, stale-while-revalidate=600`).
- **Gaps**:
  1. Large client component trees in `my-career-workspace.tsx` and `applications-workspace.tsx` should use `next/dynamic` code splitting for modal/drawer views.
  2. Workspace re-fetches full state instead of leveraging optimistic mutations in TanStack Query.

### C. Security & Privacy
- **Findings**: Better Auth session guards on `/api/nextjob/*`; automatic PII redaction pipeline (`redactPII`); SHA-256 payload hash binding for submission approvals; GDPR Articles 17 & 20 data export and deletion endpoints.
- **Gaps**:
  1. Extension dev mode hardcodes `localhost:3000`; needs configurable `VITE_PUBLIC_API_URL` environment variable.
  2. AI endpoints require per-window rate-limiting to protect against automated quota exhaustion.

### D. Architecture & System Design
- **Findings**: Strict monorepo package boundaries; Drizzle ORM schema for all 16+ career entities; 12-state deterministic application machine with cryptographic receipts.
- **Gaps**:
  1. Primary state writes to in-memory store with async Postgres sync; mission-critical mutations should use direct write-through transactions.
  2. Align `TURBOSTARTER_INTEGRATION.md` route documentation to reference the canonical `/api/nextjob/*` base router.

---

## 2. Ultra-Short Prioritized Action Plan

| Priority | Area | Action Items |
| :--- | :--- | :--- |
| **P0** | **Data Integrity** | Implement direct write-through persistence in Drizzle ORM for application submissions and claim verifications. |
| **P0** | **Extension Gateway** | Support dynamic API URL configuration in `apps/extension` for non-local environments. |
| **P1** | **RTL Polish** | Convert all physical `mr-*` classes to logical `me-*` classes across NextJob web modules. |
| **P1** | **Code Splitting** | Lazy-load heavy sub-dialogs (`VisualDiffViewer`, `TailoredDocumentStudio`) via `next/dynamic`. |
| **P2** | **Optimistic UI** | Implement optimistic UI updates in TanStack Query for application transitions. |
| **P2** | **Docs Alignment** | Sync OpenAPI specs and route tables in `TURBOSTARTER_INTEGRATION.md` with `/api/nextjob/*`. |
