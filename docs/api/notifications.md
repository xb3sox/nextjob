# Notifications API (`/notifications`)

The Notifications domain delivers actionable real-time notifications (approval requests, submission confirmations, interview milestones) and manages candidate notification channels and delivery preferences.

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | RBAC Role |
|--------|----------|-------------|---------------|-----------|
| `GET`  | `/notifications` | List in-app notifications for candidate | Yes | candidate |
| `PUT`  | `/notifications/preferences` | Update notification delivery channels | Yes | candidate |

---

## 1. Get Notifications

### `GET /notifications`

List candidate notifications. Only actionable events trigger notifications.

#### Query Parameters
- `unreadOnly` (boolean, optional): Filter for unread notifications (`true` | `false`).

#### Response `200 OK`
```json
{
  "notifications": [
    {
      "id": "ntf_881920",
      "type": "APPROVAL_REQUIRED",
      "title": "Approval Required: Senior Staff Engineer",
      "message": "High-risk salary expectation field requires your confirmation before ATS submission.",
      "read": false,
      "actionUrl": "/approvals?id=appr_10092",
      "createdAt": "2026-01-15T12:02:00.000Z"
    },
    {
      "id": "ntf_881921",
      "type": "SUBMISSION_VERIFIED",
      "title": "Application Submitted to Stripe",
      "message": "Your application was verified. Receipt #rcp_990182 generated.",
      "read": true,
      "actionUrl": "/applications/app_554102",
      "createdAt": "2026-01-15T12:05:00.000Z"
    }
  ]
}
```

---

## 2. Update Notification Preferences

### `PUT /notifications/preferences`

Configure email and in-app alert preferences.

#### Request Body
```json
{
  "emailAlerts": {
    "approvalRequired": true,
    "submissionVerified": true,
    "highFitMatchFound": false,
    "weeklyDigest": true
  },
  "inAppAlerts": {
    "approvalRequired": true,
    "submissionVerified": true
  }
}
```

#### Response `200 OK`
```json
{
  "updatedAt": "2026-01-15T16:00:00.000Z",
  "emailAlerts": {
    "approvalRequired": true,
    "submissionVerified": true,
    "highFitMatchFound": false,
    "weeklyDigest": true
  }
}
```
