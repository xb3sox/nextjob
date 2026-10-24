# Application Lifecycle API (`/applications`)

The Application Lifecycle domain manages application execution, state transitions (DISCOVERED → SUBMITTED_VERIFIED), evidence-constrained tailoring, ATS submission, and immutable receipt generation.

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | RBAC Role |
|--------|----------|-------------|---------------|-----------|
| `GET`  | `/applications` | List candidate applications across lifecycle states | Yes | candidate |
| `POST` | `/applications/apply` | Initiate application execution workflow | Yes | candidate |
| `GET`  | `/applications/:id` | Get application details and state history | Yes | candidate |
| `GET`  | `/applications/receipts` | List immutable submission receipts | Yes | candidate |
| `GET`  | `/applications/receipts/:id` | Get detailed submission receipt proof | Yes | candidate |

---

## 1. List Applications

### `GET /applications`

Filter candidate applications by state (`PLANNED`, `NEEDS_APPROVAL`, `SUBMITTED_VERIFIED`, `INTERVIEW`, `REJECTED`, `OFFER`).

#### Query Parameters
- `state` (optional): State filter (e.g., `SUBMITTED_VERIFIED`, `NEEDS_APPROVAL`)

#### Response `200 OK`
```json
{
  "applications": [
    {
      "id": "app_554102",
      "jobId": "job_77218",
      "jobTitle": "Senior Staff Engineer",
      "companyName": "Stripe",
      "state": "SUBMITTED_VERIFIED",
      "automationMode": "copilot",
      "tailoringVersion": 1,
      "receiptId": "rcp_990182",
      "createdAt": "2026-01-15T12:00:00.000Z",
      "updatedAt": "2026-01-15T12:05:00.000Z"
    }
  ]
}
```

---

## 2. Apply / Start Workflow

### `POST /applications/apply`

Trigger tailoring and application orchestration workflow.

#### Request Body
```json
{
  "jobId": "job_77218",
  "automationMode": "copilot"
}
```

#### Response `202 Accepted`
```json
{
  "applicationId": "app_554102",
  "state": "PLANNED",
  "workflowInstanceId": "wf_temp_991823",
  "message": "Application workflow initiated successfully"
}
```

---

## 3. Get Application Details

### `GET /applications/:id`

Retrieve application details, current state, and audit event transitions.

#### Response `200 OK`
```json
{
  "id": "app_554102",
  "jobId": "job_77218",
  "state": "SUBMITTED_VERIFIED",
  "tailoredContent": {
    "resumeVariantId": "res_var_123",
    "coverLetter": "Dear Hiring Manager at Stripe..."
  },
  "stateHistory": [
    { "from": "DISCOVERED", "to": "PLANNED", "timestamp": "2026-01-15T12:00:00Z" },
    { "from": "PLANNED", "to": "TAILORED", "timestamp": "2026-01-15T12:01:00Z" },
    { "from": "TAILORED", "to": "SUBMITTED_VERIFIED", "timestamp": "2026-01-15T12:05:00Z" }
  ]
}
```

---

## 4. Get Submission Receipts

### `GET /applications/receipts` / `GET /applications/receipts/:id`

Retrieve immutable proof of ATS submission including job version, submitted fields, answer hashes, and confirmation evidence.

#### Response `200 OK`
```json
{
  "receipt": {
    "id": "rcp_990182",
    "applicationId": "app_554102",
    "jobId": "job_77218",
    "atsProvider": "greenhouse",
    "confirmationNumber": "GH-CONF-88912",
    "answerHashes": {
      "years_experience": "a1b2c3d4e5f6...",
      "sponsorship_required": "f6e5d4c3b2a1..."
    },
    "submittedAt": "2026-01-15T12:05:00.000Z",
    "verificationStatus": "verified"
  }
}
```
