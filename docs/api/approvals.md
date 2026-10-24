# Approvals API (`/approvals`)

The Approvals domain routes high-risk field overrides, sensitive candidate questions (disability, demographics, compensation), and tailored application content to the candidate for explicit review and approval.

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | RBAC Role |
|--------|----------|-------------|---------------|-----------|
| `GET`  | `/approvals/pending` | List application items awaiting candidate approval | Yes | candidate |
| `POST` | `/approvals/approve` | Approve proposed answer or tailored content | Yes | candidate |
| `POST` | `/approvals/reject` | Reject proposed answer or block field auto-fill | Yes | candidate |

---

## 1. List Pending Approvals

### `GET /approvals/pending`

Retrieve items requiring candidate review prior to submission.

#### Response `200 OK`
```json
{
  "pendingApprovals": [
    {
      "approvalId": "appr_10092",
      "applicationId": "app_554102",
      "jobTitle": "Senior Staff Engineer",
      "companyName": "Stripe",
      "fieldKey": "expected_salary",
      "riskLevel": "high",
      "questionText": "What is your desired base salary?",
      "proposedValue": "$210,000 USD",
      "evidenceSource": "CareerPreference #pref_12345",
      "createdAt": "2026-01-15T12:02:00.000Z"
    }
  ]
}
```

---

## 2. Approve Request

### `POST /approvals/approve`

Approve a proposed answer or tailoring statement. Can optionally set a scope (`once` vs `always`).

#### Request Body
```json
{
  "approvalId": "appr_10092",
  "scope": "always",
  "customValue": "$210,000 USD"
}
```

#### Response `200 OK`
```json
{
  "approvalId": "appr_10092",
  "status": "APPROVED",
  "scope": "always",
  "updatedAt": "2026-01-15T12:03:00.000Z"
}
```

---

## 3. Reject Request

### `POST /approvals/reject`

Reject proposed answer, preventing automated execution for the specified field.

#### Request Body
```json
{
  "approvalId": "appr_10092",
  "reason": "Prefer not to disclose salary in initial application form."
}
```

#### Response `200 OK`
```json
{
  "approvalId": "appr_10092",
  "status": "REJECTED",
  "updatedAt": "2026-01-15T12:03:30.000Z"
}
```
