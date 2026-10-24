# Billing & Subscriptions API (`/billing`)

The Billing domain manages subscription plans (Free Tier, Search Pass at $39/30 days), Stripe payment processing, entitlement status, and billing invoice history.

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | RBAC Role |
|--------|----------|-------------|---------------|-----------|
| `GET`  | `/billing/plans` | List available subscription plans | No | Public |
| `POST` | `/billing/subscribe` | Create Stripe checkout session for Search Pass | Yes | candidate |
| `GET`  | `/billing/invoices` | List billing invoices and receipt receipts | Yes | candidate |

---

## 1. List Plans

### `GET /billing/plans`

List active subscription tiers and feature entitlements.

#### Response `200 OK`
```json
{
  "plans": [
    {
      "id": "plan_free",
      "name": "Free Tier",
      "price": 0,
      "currency": "USD",
      "interval": "forever",
      "features": [
        "Career profile import & evidence storage",
        "Job match discovery & eligibility check",
        "Application state tracking"
      ]
    },
    {
      "id": "plan_search_pass",
      "name": "Search Pass",
      "price": 3900,
      "currency": "USD",
      "interval": "30_days",
      "features": [
        "All Free tier features",
        "Unlimited evidence-constrained tailoring",
        "Automated ATS application execution & receipts",
        "Priority match ranking"
      ]
    }
  ]
}
```

---

## 2. Subscribe to Search Pass

### `POST /billing/subscribe`

Initiate a Stripe Checkout session to purchase or renew Search Pass.

#### Request Body
```json
{
  "planId": "plan_search_pass",
  "successUrl": "https://nextjob.app/dashboard?billing=success",
  "cancelUrl": "https://nextjob.app/pricing"
}
```

#### Response `200 OK`
```json
{
  "sessionId": "cs_test_a1b2c3d4e5...",
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4e5..."
}
```

---

## 3. List Invoices

### `GET /billing/invoices`

Retrieve invoice history for candidate subscription payments.

#### Response `200 OK`
```json
{
  "invoices": [
    {
      "id": "inv_991823",
      "amountPaid": 3900,
      "currency": "usd",
      "status": "paid",
      "pdfUrl": "https://pay.stripe.com/invoices/inv_991823/pdf",
      "paidAt": "2026-01-01T10:00:00.000Z"
    }
  ]
}
```
