# Your Profile & Evidence API (`/profile`)

The Your Profile domain manages factual candidate career claims (employment, skills, education, certifications), evidence provenance (documents, transcripts, certificates), claim verification workflows, and CV import/extraction.

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | RBAC Role |
|--------|----------|-------------|---------------|-----------|
| `GET`  | `/profile/claims` | List candidate career claims with evidence status | Yes | candidate |
| `POST` | `/profile/verify` | Verify, edit, remove, or mark claim unverified | Yes | candidate |
| `POST` | `/profile/evidence` | Upload evidence document to S3 storage | Yes | candidate |
| `POST` | `/profile/import` | Import PDF/DOCX resume and extract claims | Yes | candidate |

---

## 1. List Career Claims

### `GET /profile/claims`

Retrieve all structured claims for the authenticated candidate along with linked evidence IDs and verification status.

#### Response `200 OK`
```json
{
  "claims": [
    {
      "id": "clm_exp_001",
      "claimType": "employment",
      "title": "Senior Software Engineer",
      "organization": "Acme Corp",
      "startDate": "2021-03-01",
      "endDate": "2024-12-31",
      "isCurrent": false,
      "verificationStatus": "verified",
      "confidence": 0.98,
      "evidenceIds": ["evd_doc_99182"],
      "version": 1
    },
    {
      "id": "clm_skl_002",
      "claimType": "skill",
      "title": "TypeScript",
      "skillLevel": "expert",
      "yearsExperience": 6,
      "verificationStatus": "verified",
      "confidence": 0.95,
      "evidenceIds": ["evd_doc_99182"],
      "version": 1
    }
  ]
}
```

---

## 2. Verify / Edit Career Claim

### `POST /profile/verify`

Execute a verification action (`confirm`, `edit`, `remove`, `mark_unverified`) on one or more career claims.

#### Request Body
```json
{
  "claimId": "clm_exp_001",
  "action": "edit",
  "updates": {
    "title": "Staff Software Engineer",
    "organization": "Acme Corp"
  }
}
```

#### Response `200 OK`
```json
{
  "claim": {
    "id": "clm_exp_001",
    "title": "Staff Software Engineer",
    "verificationStatus": "verified",
    "version": 2,
    "updatedAt": "2026-01-15T15:00:00.000Z"
  }
}
```

---

## 3. Upload Evidence Document

### `POST /profile/evidence`

Upload evidence document (PDF, DOCX, image) to secure S3 storage and generate signed access URLs.

#### Request Headers
```http
Content-Type: multipart/form-data
```

#### Form Data Parameters
- `file`: Document binary file (PDF / DOCX)
- `claimId`: (Optional) Associated claim ID
- `documentType`: `resume` | `transcript` | `certificate` | `employment_letter`

#### Response `201 Created`
```json
{
  "evidence": {
    "id": "evd_doc_99182",
    "fileName": "Alex_Mercer_Resume_2026.pdf",
    "fileSize": 245120,
    "mimeType": "application/pdf",
    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "signedUrl": "https://s3.us-west-2.amazonaws.com/nextjob-evidence/evd_doc_99182.pdf?X-Amz-Signature=...",
    "expiresAt": "2026-01-15T16:00:00.000Z",
    "createdAt": "2026-01-15T15:00:00.000Z"
  }
}
```

---

## 4. Import Resume & AI Extraction

### `POST /profile/import`

Upload a CV/Resume document for automated AI extraction into candidate CareerClaims.

#### Request Headers
```http
Content-Type: multipart/form-data
```

#### Form Data Parameters
- `file`: Resume file (PDF or DOCX, max 10MB)

#### Response `200 OK`
```json
{
  "importedEvidenceId": "evd_doc_99182",
  "extractedClaims": [
    {
      "claimType": "employment",
      "title": "Senior Engineer",
      "organization": "Acme Corp",
      "startDate": "2021-03",
      "confidence": 0.96
    },
    {
      "claimType": "education",
      "degree": "B.S. Computer Science",
      "institution": "Stanford University",
      "confidence": 0.99
    }
  ],
  "processingTimeMs": 1420
}
```
