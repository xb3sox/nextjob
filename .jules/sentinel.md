# Sentinel Journal - Security Learnings

## 2026-03-30 - Open Redirect Validation Bypass via Control Chars and URL Encoding
**Vulnerability:** Simple regex check `/^\/(?!\/|\\)/` for internal redirect paths allows open-redirect bypasses when input contains ASCII control characters (`\t`, `\r`, `\n`) or URL-encoded backslashes (`%5c`, `%5C`), slashes (`%2f`, `%2F`), or double encoding (`%25`).
**Learning:** Browsers strip or normalize control characters and URL-encoded slashes/backslashes during navigation, transforming paths like `/\t/evil.com` or `/%5Cevil.com` into protocol-relative URLs (`//evil.com`).
**Prevention:** Validate redirect targets against ASCII control characters (`\x00-\x1F\x7F`), reject encoded slash/backslash patterns at path start, and validate URI-decoded targets before accepting as safe internal paths.
