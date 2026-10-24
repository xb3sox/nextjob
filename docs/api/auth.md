# Authentication API (`/auth`)

The Authentication domain manages user sign-up, login, session validation, OAuth 2.0 integration (Google, GitHub), password resets, and logout.

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | RBAC Role |
|--------|----------|-------------|---------------|-----------|
| `POST` | `/auth/register` | Register a new user account | No | Public |
| `POST` | `/auth/login` | Authenticate with email/password | No | Public |
| `POST` | `/auth/logout` | End session and invalidate refresh tokens | Yes | Any |
| `GET`  | `/auth/me` | Retrieve current authenticated user session | Yes | Any |
| `POST` | `/auth/oauth/google` | Authenticate or register via Google OAuth | No | Public |
| `POST` | `/auth/oauth/github` | Authenticate or register via GitHub OAuth | No | Public |
| `POST` | `/auth/reset-password` | Request or execute password reset | No | Public |

---

## 1. Register Account

### `POST /auth/register`

Register a new user candidate account.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "candidate@example.com",
  "password": "SecurePassword123!",
  "fullName": "Alex Mercer"
}
```

#### Response `201 Created`
```json
{
  "user": {
    "id": "usr_987654321",
    "email": "candidate@example.com",
    "fullName": "Alex Mercer",
    "role": "candidate",
    "emailVerified": false,
    "createdAt": "2026-01-15T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

#### Example cURL
```bash
curl -X POST https://api.nextjob.app/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"candidate@example.com","password":"SecurePassword123!","fullName":"Alex Mercer"}'
```

---

## 2. User Login

### `POST /auth/login`

Authenticate with email and password to receive a JWT access token and session cookie.

#### Request Body
```json
{
  "email": "candidate@example.com",
  "password": "SecurePassword123!"
}
```

#### Response `200 OK`
```json
{
  "user": {
    "id": "usr_987654321",
    "email": "candidate@example.com",
    "fullName": "Alex Mercer",
    "role": "candidate",
    "tenantId": "tnt_cnd_98765"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

---

## 3. Current User Session

### `GET /auth/me`

Retrieve authenticated user profile, active tenant ID, and permissions.

#### Request Headers
```http
Authorization: Bearer <access_token>
```

#### Response `200 OK`
```json
{
  "user": {
    "id": "usr_987654321",
    "email": "candidate@example.com",
    "fullName": "Alex Mercer",
    "role": "candidate",
    "tenantId": "tnt_cnd_98765",
    "permissions": ["profile:read", "profile:write", "applications:read", "applications:write"]
  }
}
```

---

## 4. Logout

### `POST /auth/logout`

Invalidate the current session and JWT token.

#### Request Headers
```http
Authorization: Bearer <access_token>
```

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

## 5. OAuth Authentication (Google & GitHub)

### `POST /auth/oauth/google` / `POST /auth/oauth/github`

Authenticate or register a candidate account using an OAuth authorization code.

#### Request Body
```json
{
  "code": "4/0AeaYSHC...",
  "redirectUri": "https://nextjob.app/auth/callback"
}
```

#### Response `200 OK`
```json
{
  "user": {
    "id": "usr_987654321",
    "email": "candidate@example.com",
    "fullName": "Alex Mercer",
    "role": "candidate"
  },
  "accessToken": "eyJhbGciOiJIUzI1Ni...",
  "expiresIn": 3600
}
```

---

## 6. Reset Password

### `POST /auth/reset-password`

Request a password reset email or reset password using a valid token.

#### Request Body (Request Reset)
```json
{
  "email": "candidate@example.com"
}
```

#### Request Body (Execute Reset)
```json
{
  "token": "rst_tok_123456",
  "newPassword": "NewSecurePassword123!"
}
```

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Password reset processed successfully"
}
```
