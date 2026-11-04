export const ar = {
  common: () => import("./common.json"),
  auth: () => import("./auth.json"),
  billing: () => import("./billing.json"),
  marketing: () => import("./marketing.json"),
  organization: () => import("./organization.json"),
  admin: () => import("./admin.json"),
  dashboard: () => import("./dashboard.json"),
} as const;
