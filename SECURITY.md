# Security Policy

NextJob handles résumés, career history, and application data, so please report issues privately.

## Reporting

Use GitHub's **Report a vulnerability** button on the Security tab if it is available for this
repository. Otherwise contact the repository owner (`@xb3sox`) directly and do not open a public
issue.

Include: affected surface, reproduction steps, and impact. Do not include real user data,
credentials, or CV contents — redact them.

## Scope

In scope: authentication and session handling, tenant isolation, evidence and claim integrity,
signed URL handling, prompt/tool boundaries in the AI gateway, and the deploy pipeline.

Out of scope: findings that require a compromised device or browser, rate-limit-only reports
without impact, and issues in third-party services.

## What we do not do

- No secrets, tokens, or PII in issues, pull requests, tests, prompts, or analytics.
- No automatic retry of ambiguous external submissions.
- No model or prompt change ships without a regression evaluation.

## Supported versions

The repository ships continuously from `main`; only the current `main` is supported.
