# Jobs & Companies API (`/jobs`)

The Jobs & Companies domain provides job discovery, search filtering, detailed job posting inspection, ingestion of external ATS jobs, company profiles, and job freshness tracking.

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | RBAC Role |
|--------|----------|-------------|---------------|-----------|
| `GET`  | `/jobs` | Search and discover normalized job listings | Yes | candidate, admin |
| `GET`  | `/jobs/:id` | Get job details and requirement breakdown | Yes | candidate, admin |
| `GET`  | `/jobs/companies` | List companies and employer details | Yes | candidate, admin |
| `POST` | `/jobs/ingest` | Ingest and normalize raw job posting | Yes | admin |

---

## 1. Search Jobs

### `GET /jobs`

Search normalized job listings with filters for keywords, location, work mode, seniority, and salary.

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `query` | string | No | Search keywords | `Software Engineer` |
| `workMode` | string | No | `remote` \| `hybrid` \| `onsite` | `remote` |
| `location` | string | No | City, State, or Country | `San Francisco` |
| `minSalary` | number | No | Minimum annual salary | `150000` |
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 20) | `20` |

#### Response `200 OK`
```json
{
  "jobs": [
    {
      "id": "job_77218",
      "title": "Senior Staff Engineer",
      "company": {
        "id": "cmp_331",
        "name": "Stripe"
      },
      "location": "San Francisco, CA, USA",
      "workMode": "hybrid",
      "seniorityLevel": "senior",
      "salaryMin": 190000,
      "salaryMax": 240000,
      "currency": "USD",
      "freshnessScore": 0.95,
      "postedAt": "2026-01-14T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## 2. Get Job Details

### `GET /jobs/:id`

Retrieve detailed requirements, responsibilities, and capability dimensions for a specific job posting.

#### Response `200 OK`
```json
{
  "id": "job_77218",
  "canonicalId": "job_77218",
  "title": "Senior Staff Engineer",
  "company": {
    "id": "cmp_331",
    "name": "Stripe",
    "website": "https://stripe.com"
  },
  "description": "We are seeking a Senior Staff Engineer to lead core payments architecture...",
  "workMode": "hybrid",
  "location": "San Francisco, CA, USA",
  "requirements": [
    { "type": "experience", "description": "8+ years of software engineering experience", "mandatory": true },
    { "type": "skill", "description": "Expertise in Node.js / TypeScript and PostgreSQL", "mandatory": true },
    { "type": "authorization", "description": "Must be authorized to work in the US", "mandatory": true }
  ],
  "freshnessScore": 0.95,
  "status": "active",
  "createdAt": "2026-01-14T08:00:00.000Z"
}
```

---

## 3. List Companies

### `GET /jobs/companies`

List normalized company entities and job posting statistics.

#### Response `200 OK`
```json
{
  "companies": [
    {
      "id": "cmp_331",
      "name": "Stripe",
      "industry": "Fintech",
      "website": "https://stripe.com",
      "activeJobsCount": 24
    }
  ]
}
```

---

## 4. Ingest Job Posting

### `POST /jobs/ingest`

Ingest raw job posting data for parsing, normalization, and deduplication.

#### Request Body
```json
{
  "rawTitle": "Sr. Full-Stack Engineer (Remote - US)",
  "companyName": "Acme Inc",
  "rawDescription": "Looking for a Sr Full-Stack Dev with 5+ yrs exp...",
  "sourceUrl": "https://greenhouse.io/acme/jobs/123",
  "atsProvider": "greenhouse"
}
```

#### Response `201 Created`
```json
{
  "id": "job_99182",
  "normalizedTitle": "Senior Full Stack Engineer",
  "workMode": "remote",
  "isDuplicate": false,
  "canonicalId": "job_99182",
  "status": "active"
}
```
