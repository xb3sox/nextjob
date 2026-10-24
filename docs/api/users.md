# Users & Preferences API (`/users`)

The Users & Preferences domain manages candidate profile settings, contact details, job search preferences, salary expectations, target roles, and location preferences.

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | RBAC Role |
|--------|----------|-------------|---------------|-----------|
| `GET`  | `/users/profile` | Retrieve user account profile | Yes | candidate, admin |
| `PUT`  | `/users/profile` | Update user account profile | Yes | candidate, admin |
| `GET`  | `/users/preferences` | Retrieve job search preferences | Yes | candidate, admin |
| `PUT`  | `/users/preferences` | Update job search preferences | Yes | candidate, admin |

---

## 1. Get User Profile

### `GET /users/profile`

Retrieve candidate personal details and account settings.

#### Response `200 OK`
```json
{
  "id": "usr_987654321",
  "email": "alex.mercer@example.com",
  "fullName": "Alex Mercer",
  "phone": "+1-555-019-2834",
  "location": "San Francisco, CA",
  "timezone": "America/Los_Angeles",
  "createdAt": "2026-01-15T10:00:00.000Z"
}
```

---

## 2. Update User Profile

### `PUT /users/profile`

Update personal details.

#### Request Body
```json
{
  "fullName": "Alex Mercer",
  "phone": "+1-555-019-2834",
  "location": "San Francisco, CA, USA",
  "timezone": "America/Los_Angeles"
}
```

#### Response `200 OK`
```json
{
  "id": "usr_987654321",
  "fullName": "Alex Mercer",
  "phone": "+1-555-019-2834",
  "location": "San Francisco, CA, USA",
  "timezone": "America/Los_Angeles",
  "updatedAt": "2026-01-15T12:30:00.000Z"
}
```

---

## 3. Get Search Preferences

### `GET /users/preferences`

Retrieve target roles, work modes, salary thresholds, location preferences, and exclusions.

#### Response `200 OK`
```json
{
  "id": "pref_12345",
  "userId": "usr_987654321",
  "targetRoles": ["Senior Full Stack Engineer", "Staff Software Engineer"],
  "seniorityLevels": ["senior", "staff"],
  "workModes": ["remote", "hybrid"],
  "targetLocations": ["United States", "Remote - US"],
  "minimumSalary": 180000,
  "currency": "USD",
  "salaryPeriod": "annual",
  "targetIndustries": ["Technology", "Fintech"],
  "excludedCompanies": ["BadCorp Inc"],
  "noticePeriodDays": 14,
  "relocationPreferred": false,
  "version": 2,
  "updatedAt": "2026-01-15T11:00:00.000Z"
}
```

---

## 4. Update Search Preferences

### `PUT /users/preferences`

Update job search parameters and thresholds used by the Matching Engine.

#### Request Body
```json
{
  "targetRoles": ["Senior Full Stack Engineer", "Staff Software Engineer"],
  "seniorityLevels": ["senior", "staff"],
  "workModes": ["remote", "hybrid"],
  "targetLocations": ["United States", "Remote - US"],
  "minimumSalary": 185000,
  "currency": "USD",
  "salaryPeriod": "annual",
  "excludedCompanies": ["BadCorp Inc", "Unfair Tech"]
}
```

#### Response `200 OK`
```json
{
  "id": "pref_12345",
  "userId": "usr_987654321",
  "minimumSalary": 185000,
  "version": 3,
  "updatedAt": "2026-01-15T14:22:00.000Z"
}
```
