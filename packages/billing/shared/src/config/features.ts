import { BillingPlan } from "../types";

const FREE_FEATURES = {
  LIFETIME_LIMIT: "LIFETIME_LIMIT",
} as const;

const STARTER_FEATURES = {
  ...FREE_FEATURES,
  STANDARD_REVIEW_MODE: "STANDARD_REVIEW_MODE",
} as const;

const PRO_FEATURES = {
  ...STARTER_FEATURES,
  PRIORITY_TAILORING: "PRIORITY_TAILORING",
  REVIEW_DIFF: "REVIEW_DIFF",
} as const;

const POWER_FEATURES = {
  ...PRO_FEATURES,
  AUTONOMOUS_BOUNDED_AUTOPILOT: "AUTONOMOUS_BOUNDED_AUTOPILOT",
} as const;

export const FEATURES = {
  [BillingPlan.FREE]: FREE_FEATURES,
  [BillingPlan.STARTER]: STARTER_FEATURES,
  [BillingPlan.PRO]: PRO_FEATURES,
  [BillingPlan.POWER]: POWER_FEATURES,
} as const;

export type Feature =
  | (typeof FREE_FEATURES)[keyof typeof FREE_FEATURES]
  | (typeof STARTER_FEATURES)[keyof typeof STARTER_FEATURES]
  | (typeof PRO_FEATURES)[keyof typeof PRO_FEATURES]
  | (typeof POWER_FEATURES)[keyof typeof POWER_FEATURES];
