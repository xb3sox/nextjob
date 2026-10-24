# Organizations & Cohorts API (`/organizations`)

The Organizations & Cohorts domain handles B2B institutional client accounts, workforce development cohorts, candidate license allocations, and aggregate reporting with strict privacy protection (minimum cohort size ≥5 enforcement).

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | RBAC Role |
|--------|----------|-------------|---------------|-----------|
| `GET`  | `/organizations/orgs` | Retrieve organization details and active seat licenses | Yes | organization_admin, admin |
| `POST` | `/organizations/orgs` | Create or update organization account | Yes | admin, super_admin |
| `GET`  | `/organizations/cohorts` | List candidate cohorts within organization | Yes | organization_admin, admin |
| `POST` | `/organizations/cohorts` | Create candidate cohort and allocate licenses | Yes | organization_admin, admin |
| `GET`  | `/organizations/reports` | Get privacy-safeguarded aggregate cohort analytics | Yes | organization_admin, admin |

---

## 1. Get Organization Details

### `GET /organizations/orgs`

Retrieve organization metadata and license quotas.

#### Response `200 OK`
```json
{
  "id": "org_4412",
  "name": "Bay Area Career Accelerator",
  "type": "workforce_agency",
  "allocatedLicenses": 100,
  "usedLicenses": 64,
  "activeCohortsCount": 3,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

## 2. List Cohorts

### `GET /organizations/cohorts`

List all cohorts managed by the organization.

#### Response `200 OK`
```json
{
  "cohorts": [
    {
      "id": "chr_9912",
      "organizationId": "org_4412",
      "name": "Winter 2026 Tech Fellowship",
      "participantCount": 28,
      "startDate": "2026-01-05",
      "endDate": "2026-04-05",
      "status": "active"
    }
  ]
}
```

---

## 3. Create Cohort

### `POST /organizations/cohorts`

Create a new participant cohort and assign Search Pass licenses.

#### Request Body
```json
{
  "name": "Spring 2026 Tech Fellowship",
  "allocatedLicenses": 30,
  "startDate": "2026-04-01",
  "endDate": "2026-07-01"
}
```

#### Response `201 Created`
```json
{
  "id": "chr_9913",
  "name": "Spring 2026 Tech Fellowship",
  "participantCount": 0,
  "allocatedLicenses": 30,
  "status": "active"
}
```

---

## 4. Aggregate Cohort Reports

### `GET /organizations/reports`

Get aggregate outcome metrics for a cohort.

*Note: In compliance with PRD §G-10, queries against cohorts with fewer than 5 active participants return an error blocking individual data leakage.*

#### Query Parameters
- `cohortId` (required): ID of cohort to query.

#### Response `200 OK`
```json
{
  "cohortId": "chr_9912",
  "cohortName": "Winter 2026 Tech Fellowship",
  "participantCount": 28,
  "metrics": {
    "activationRate": 0.89,
    "totalApplicationsSubmitted": 342,
    "avgApplicationsPerParticipant": 12.2,
    "interviewOutcomeCount": 48,
    "interviewRate": 0.14
  },
  "privacyNotice": "Report contains aggregate data only. Individual candidate data is suppressed."
}
```

#### Response `400 Bad Request` (Insufficient Cohort Size)
```json
{
  "error": {
    "code": "INSUFFICIENT_COHORT_SIZE",
    "message": "Cohort has fewer than 5 participants (minimum required for aggregate reporting: 5)."
  }
}
```
