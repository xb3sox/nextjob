# Eligibility Assessment API (`/eligibility`)

The Eligibility Assessment domain executes deterministic rule evaluation for candidates against job requirements (location, work authorization, sponsorship, security clearance, licenses) before ranking.

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | RBAC Role |
|--------|----------|-------------|---------------|-----------|
| `POST` | `/eligibility/assess` | Evaluate candidate eligibility against a specific job | Yes | candidate |
| `GET`  | `/eligibility/assessments` | List past eligibility assessment results | Yes | candidate |
| `GET`  | `/eligibility/assessments/:id` | Get single detailed assessment breakdown | Yes | candidate |

---

## 1. Assess Eligibility

### `POST /eligibility/assess`

Run the deterministic Eligibility Engine for the candidate against a specified job posting.

#### Request Body
```json
{
  "jobId": "job_77218"
}
```

#### Response `200 OK`
```json
{
  "assessmentId": "elg_991823",
  "jobId": "job_77218",
  "overallStatus": "ELIGIBLE",
  "confidenceScore": 0.98,
  "evaluatedAt": "2026-01-15T16:00:00.000Z",
  "checks": [
    {
      "checkType": "location",
      "status": "PASS",
      "reason": "Candidate location (San Francisco, CA) matches required hybrid location."
    },
    {
      "checkType": "work_authorization",
      "status": "PASS",
      "reason": "Candidate holds US citizenship."
    },
    {
      "checkType": "sponsorship",
      "status": "PASS",
      "reason": "No visa sponsorship required."
    },
    {
      "checkType": "experience",
      "status": "PASS",
      "reason": "Candidate has 8.5 years experience, exceeding 8 year minimum."
    }
  ]
}
```

#### Overall Status Definitions
- `ELIGIBLE`: All mandatory criteria explicitly verified.
- `INELIGIBLE`: Fails one or more non-negotiable requirements (e.g. unauthorized location or missing mandatory license).
- `UNKNOWN`: Insufficient evidence to verify one or more hard requirements. Defaults to UNKNOWN to maintain ≤2% false-positive rate threshold.

---

## 2. List Assessment History

### `GET /eligibility/assessments`

Retrieve candidate eligibility assessment records.

#### Query Parameters
- `jobId` (optional): Filter assessments by specific job ID.
- `status` (optional): `ELIGIBLE` | `INELIGIBLE` | `UNKNOWN`.

#### Response `200 OK`
```json
{
  "assessments": [
    {
      "id": "elg_991823",
      "jobId": "job_77218",
      "overallStatus": "ELIGIBLE",
      "confidenceScore": 0.98,
      "evaluatedAt": "2026-01-15T16:00:00.000Z"
    }
  ]
}
```

---

## 3. Get Assessment Details

### `GET /eligibility/assessments/:id`

Get comprehensive breakdown for a single eligibility assessment.

#### Response `200 OK`
```json
{
  "id": "elg_991823",
  "jobId": "job_77218",
  "userId": "usr_987654321",
  "overallStatus": "ELIGIBLE",
  "confidenceScore": 0.98,
  "evaluatedAt": "2026-01-15T16:00:00.000Z",
  "checkDetails": [
    {
      "dimension": "clearance",
      "status": "PASS",
      "requirementText": "No security clearance required",
      "evidenceId": null
    }
  ]
}
```
