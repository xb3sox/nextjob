# Sentinel Security Learnings

## PII Redaction Pipeline
- Career profile data ingestion and conversational inputs in `packages/api/src/modules/nextjob/career-service.ts` sanitize text via `redactPII`.
- Ensure comprehensive regex patterns cover SSNs (`\b\d{3}-\d{2}-\d{4}\b`), credit card numbers, email addresses, and phone numbers prior to claim persistence or AI prompting.
- Workflows in `.github/workflows/` must ensure no private repository source code or secrets are leaked to external or untrusted third-party review bots.

## 2026-11-05 - Document Export HTML/XSS Injection Mitigation
**Vulnerability:** `exportTailoredDocument` in `packages/api/src/modules/nextjob/tailoring-service.ts` interpolated user-controlled candidate statements, job details, and resume summaries directly into HTML without escaping markup entities.
**Learning:** DOCX exports used `escapeXml`, but HTML exports (`pdf_html`) constructed templates without escaping special characters (`&`, `<`, `>`, `"`, `'`), risking Stored Cross-Site Scripting (XSS) and renderer exploits during document generation or viewing.
**Prevention:** Always sanitize/escape interpolated strings in server-rendered markup exports using `escapeHtml`.
