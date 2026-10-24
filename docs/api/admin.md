# Admin Console API (`/admin`)

The Admin Console domain provides system oversight for platform administrators, user account management, ATS connector status monitoring, connector kill-switches, and audit logging.

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | RBAC Role |
|--------|----------|-------------|---------------|-----------|
| `GET`  | `/admin/users` | List platform users with filter options | Yes | admin, super_admin |
| `GET`  | `/admin/connectors` | Monitor ATS connector execution health | Yes | admin, super_admin |
| `POST` | `/admin/kill-switch` | Activate emergency kill-switch for an ATS connector | Yes | super_admin |

---

## 1. List Users

### `GET /admin/users`

List platform user accounts with role, tenant ID, and account status filters.

#### Query Parameters
- `role` (optional): `candidate` | `organization_admin` | `admin` | `super_admin`
- `status` (optional): `active` | `suspended`

#### Response `200 OK`
```json
{
  "users": [
    {
      "id": "usr_987654321",
      "email": "candidate@example.com",
      "fullName": "Alex Mercer",
      "role": "candidate",
      "tenantId": "tnt_cnd_98765",
      "status": "active",
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "total": 1250
}
```

---

## 2. Monitor ATS Connectors

### `GET /admin/connectors`

View real-time operational metrics, error rates, and status for all ATS connectors (Greenhouse, Lever, Workday, iCIMS).

#### Response `200 OK`
```json
{
  "connectors": [
    {
      "name": "greenhouse",
      "status": "HEALTHY",
      "successRate24h": 0.985,
      "totalSubmissions24h": 412,
      "failedSubmissions24h": 6,
      "killSwitchActive": false,
      "lastExecutionAt": "2026-01-15T16:45:00.000Z"
    },
    {
      "name": "workday",
      "status": "DEGRADED",
      "successRate24h": 0.912,
      "totalSubmissions24h": 180,
      "failedSubmissions24h": 16,
      "killSwitchActive": false,
      "lastExecutionAt": "2026-01-15T16:42:00.000Z"
    }
  ]
}
```

---

## 3. Connector Kill-Switch

### `POST /admin/kill-switch`

Immediately stop execution of a specific ATS connector in case of upstream UI breakage or unexpected behavior.

#### Request Body
```json
{
  "connectorName": "workday",
  "enabled": true,
  "reason": "Workday form UI update broke field selector logic"
}
```

#### Response `200 OK`
```json
{
  "connectorName": "workday",
  "killSwitchActive": true,
  "updatedBy": "usr_admin_001",
  "message": "Kill-switch enabled for workday connector. Further automated applications are blocked.",
  "updatedAt": "2026-01-15T16:50:00.000Z"
}
```
