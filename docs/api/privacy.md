# Privacy & Data Rights API (`/privacy`)

The Privacy & Data Rights domain enforces candidate GDPR / CCPA rights, including full data export, account deletion, consent record versioning, and learning preferences.

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | RBAC Role |
|--------|----------|-------------|---------------|-----------|
| `POST` | `/privacy/export` | Request complete JSON package of candidate data | Yes | candidate |
| `POST` | `/privacy/delete` | Request permanent erasure of profile & PII data | Yes | candidate |
| `GET`  | `/privacy/consent` | Retrieve active candidate consent records | Yes | candidate |
| `POST` | `/privacy/consent` | Grant or revoke explicit processing consent | Yes | candidate |

---

## 1. Request Data Export

### `POST /privacy/export`

Request a comprehensive archive containing all user profile data, career claims, evidence documents, application history, and audit logs.

#### Response `202 Accepted`
```json
{
  "exportRequestId": "exp_req_99012",
  "status": "PROCESSING",
  "estimatedCompletionAt": "2026-01-15T17:00:00.000Z",
  "message": "Data export archive is being prepared. You will receive an in-app notification when ready."
}
```

---

## 2. Request Data Deletion

### `POST /privacy/delete`

Trigger permanent erasure of candidate profile, evidence files, and PII in compliance with GDPR Right to be Forgotten.

#### Request Body
```json
{
  "confirmationText": "DELETE MY ACCOUNT AND DATA",
  "reason": "No longer seeking job search services"
}
```

#### Response `200 OK`
```json
{
  "deletionRequestId": "del_req_44102",
  "status": "SCHEDULED",
  "scheduledErasureAt": "2026-01-16T16:55:00.000Z",
  "message": "Account deletion scheduled. All PII and evidence documents will be permanently purged."
}
```

---

## 3. Get Consent Status

### `GET /privacy/consent`

Retrieve active candidate consent declarations for data processing and model learning.

#### Response `200 OK`
```json
{
  "consents": [
    {
      "purpose": "data_processing",
      "status": "GRANTED",
      "version": "1.0",
      "grantedAt": "2026-01-15T10:00:00.000Z"
    },
    {
      "purpose": "anonymized_model_learning",
      "status": "REVOKED",
      "version": "1.0",
      "updatedAt": "2026-01-15T11:30:00.000Z"
    }
  ]
}
```

---

## 4. Update Consent

### `POST /privacy/consent`

Grant or revoke consent for specific processing purposes.

#### Request Body
```json
{
  "purpose": "anonymized_model_learning",
  "action": "revoke"
}
```

#### Response `200 OK`
```json
{
  "purpose": "anonymized_model_learning",
  "status": "REVOKED",
  "updatedAt": "2026-01-15T16:58:00.000Z"
}
```
