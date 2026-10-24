# Job Matching & Ranking API (`/matches`)

The Job Matching & Ranking domain ranks eligible jobs for candidates based on fit scores, evidence provenance, freshness, and preferences, providing full explainability for match recommendations.

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | RBAC Role |
|--------|----------|-------------|---------------|-----------|
| `GET`  | `/matches` | Retrieve candidate matched job feed with explainability | Yes | candidate |
| `GET`  | `/matches/:id` | Get detailed fit score breakdown for a specific match | Yes | candidate |

---

## 1. Get Job Matches

### `GET /matches`

Retrieve ranked list of jobs for the candidate. Eligibility evaluation is automatically enforced prior to ranking.

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `minFitScore` | number | No | Filter minimum fit score (0.0 to 1.0) | `0.75` |
| `workMode` | string | No | `remote` \| `hybrid` \| `onsite` | `remote` |
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 20) | `20` |

#### Response `200 OK`
```json
{
  "matches": [
    {
      "id": "mtc_881920",
      "jobId": "job_77218",
      "job": {
        "title": "Senior Staff Engineer",
        "companyName": "Stripe",
        "location": "San Francisco, CA, USA",
        "workMode": "hybrid"
      },
      "overallFitScore": 0.92,
      "eligibilityStatus": "ELIGIBLE",
      "freshnessScore": 0.95,
      "explanation": {
        "topStrengths": [
          "100% skill match on TypeScript, React, PostgreSQL",
          "8.5 years experience meets 8+ year requirement",
          "Location matches hybrid preference"
        ],
        "potentialGaps": [
          "Ruby experience not found in verified claims"
        ]
      },
      "createdAt": "2026-01-15T16:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 35,
    "page": 1,
    "limit": 20
  }
}
```

---

## 2. Get Match Breakdown

### `GET /matches/:id`

Retrieve fit dimension breakdown for a specific match.

#### Response `200 OK`
```json
{
  "matchId": "mtc_881920",
  "jobId": "job_77218",
  "overallFitScore": 0.92,
  "dimensions": {
    "skillFit": 0.95,
    "experienceFit": 0.90,
    "salaryFit": 0.88,
    "locationFit": 1.0,
    "freshnessFit": 0.95
  },
  "provenanceMap": [
    {
      "requirement": "8+ years software experience",
      "matchedClaimId": "clm_exp_001",
      "evidenceId": "evd_doc_99182",
      "confidence": 0.98
    }
  ]
}
```
