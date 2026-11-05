# Sentinel Security Learnings

## PII Redaction Pipeline
- Career profile data ingestion and conversational inputs in `packages/api/src/modules/nextjob/career-service.ts` sanitize text via `redactPII`.
- Ensure comprehensive regex patterns cover SSNs (`\b\d{3}-\d{2}-\d{4}\b`), credit card numbers, email addresses, and phone numbers prior to claim persistence or AI prompting.
- Workflows in `.github/workflows/` must ensure no private repository source code or secrets are leaked to external or untrusted third-party review bots.
