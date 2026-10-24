# NextJob API Documentation

Welcome to the NextJob REST API reference documentation. NextJob provides an API for candidate career profile management, AI-driven job eligibility assessment, match ranking, evidence-constrained tailoring, application lifecycle tracking, and organization management.

---

## 1. Architecture & Overview

The NextJob API is designed as a Fastify modular monolith providing a predictable, type-safe REST interface over HTTPS.

- **Base URL (Production):** `https://api.nextjob.app/v1`
- **Base URL (Staging):** `https://staging-api.nextjob.app/v1`
- **Base URL (Development):** `http://localhost:8799/v1`
- **Format:** JSON (`Content-Type: application/json`)

---

## 2. Authentication & Authorization

### 2.1 Authentication Methods

The API supports two authentication mechanisms:
1. **Bearer Token (JWT):** Pass the access token in the standard HTTP authorization header.
   ```http
   Authorization: Bearer <your_access_token>
   ```
2. **Session Cookie:** Web applications receive an HTTP-only, secure `session` cookie upon successful login via `/auth/login`.

### 2.2 Tenant Isolation

NextJob strictly enforces multi-tenant isolation. Every query and data access is scoped to a specific tenant (`tenant_id`).
- Pass the tenant context using the `X-Tenant-ID` header if operating in multi-tenant or organization mode:
  ```http
  X-Tenant-ID: tnt_123456789
  ```
- For candidate operations, the tenant context is automatically derived from the authenticated user session.

### 2.3 Role-Based Access Control (RBAC)

NextJob enforces role-based permissions across four primary roles:

| Role | Access Scope | Description |
|------|--------------|-------------|
| `candidate` | Self data only | Default role for individual job seekers. |
| `organization_admin` | Cohort / Org data | Managed access for institutional/org administrators. |
| `admin` | System management | Operations and user support staff. |
| `super_admin` | Global platform | Full administrative control and cross-tenant access. |

---

## 3. Standard Headers

| Header | Required | Description | Example |
|--------|----------|-------------|---------|
| `Authorization` | Yes (Protected) | Bearer JWT token | `Bearer eyJhbGci...` |
| `X-Tenant-ID` | Optional | Explicit tenant identifier | `tnt_8f9a2b1c` |
| `Content-Type` | Yes (POST/PUT) | Request payload content type | `application/json` |
| `X-Correlation-ID` | Optional | Request correlation ID for tracing | `req_9921ab02` |

---

## 4. Rate Limiting

API requests are subject to rate limiting based on authentication status and user tier:

| Tier | Rate Limit |
|------|------------|
| Unauthenticated | 60 requests / minute |
| Free Candidate | 300 requests / minute |
| Search Pass / Pro | 1,200 requests / minute |
| Organization Admin | 3,000 requests / minute |

Rate limit status is returned in every API response header:
- `X-RateLimit-Limit`: Maximum requests allowed in the window.
- `X-RateLimit-Remaining`: Remaining requests in current window.
- `X-RateLimit-Reset`: Unix timestamp when the current window resets.

When rate limits are exceeded, the API returns `429 Too Many Requests`.

---

## 5. Error Handling

Errors follow a standardized JSON payload structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input payload",
    "details": [
      {
        "field": "email",
        "issue": "Invalid email address format"
      }
    ],
    "correlationId": "req_881a293f"
  }
}
```

### Common HTTP Status Codes

| Code | Meaning | Cause |
|------|---------|-------|
| `200 OK` | Success | Request succeeded. |
| `201 Created` | Resource Created | Resource successfully created. |
| `400 Bad Request` | Client Error | Invalid parameter or payload. |
| `401 Unauthorized` | Unauthenticated | Missing or expired token/session. |
| `403 Forbidden` | Access Denied | Insufficient permissions for role. |
| `404 Not Found` | Not Found | Requested resource does not exist. |
| `409 Conflict` | Resource Conflict | Duplicate submission or version conflict. |
| `429 Too Many Requests` | Rate Limited | Exceeded rate quota. |
| `500 Internal Error` | Server Error | An unexpected error occurred. |

---

## 6. API Domains Reference

The NextJob API is organized into 13 core domains as defined in `TECH.md §API Domains`:

1. [Authentication (`/auth`)](./auth.md) — Authentication, OAuth, session management
2. [Users & Preferences (`/users`)](./users.md) — User profiles, settings, and job search preferences
3. [Your Profile & Evidence (`/profile`)](./profile.md) — Career claims, evidence provenance, and document upload
4. [Jobs & Companies (`/jobs`)](./jobs.md) — Job ingestion, discovery, search, company management
5. [Eligibility Assessment (`/eligibility`)](./eligibility.md) — Deterministic eligibility check engine
6. [Job Matching & Ranking (`/matches`)](./matches.md) — Fit scoring, ranking, explainability
7. [Applications (`/applications`)](./applications.md) — Application state machine, apply workflow, receipts
8. [Approvals (`/approvals`)](./approvals.md) — High-risk field and tailoring approval workflow
9. [Organizations & Cohorts (`/organizations`)](./organizations.md) — B2B cohorts, licensing, aggregate reporting
10. [Billing & Subscriptions (`/billing`)](./billing.md) — Stripe plans, subscriptions, entitlement tracking
11. [Notifications (`/notifications`)](./notifications.md) — In-app notifications and preferences
12. [Admin Console (`/admin`)](./admin.md) — Operations support, connector health, kill-switches
13. [Privacy & Data Rights (`/privacy`)](./privacy.md) — GDPR data export, deletion, and consent management
