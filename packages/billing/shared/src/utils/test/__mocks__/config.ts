import {
  billingConfigSchema,
  type BillingConfig,
} from "../../../config/schema";
import {
  BillingDiscountType,
  BillingModel,
  BillingPlan,
  BillingType,
  RecurringInterval,
} from "../../../types";

export const config = billingConfigSchema.parse({
  plans: [
    {
      id: BillingPlan.FREE,
      name: "plan.free.name",
      description: "plan.free.description",
      badge: null,
      features: ["FEATURE_1", "FEATURE_2"],
      limits: {
        projects: 3,
        members: 1,
        storage: null,
      },
      variants: [
        {
          id: "free-lifetime",
          type: BillingType.FLAT,
          cost: 0,
          model: BillingModel.ONE_TIME,
        },
        {
          id: "free-monthly",
          type: BillingType.FLAT,
          cost: 0,
          model: BillingModel.RECURRING,
          interval: RecurringInterval.MONTH,
        },
        {
          id: "free-yearly",
          type: BillingType.FLAT,
          cost: 0,
          model: BillingModel.RECURRING,
          interval: RecurringInterval.YEAR,
        },
      ],
    },
    {
      id: BillingPlan.STARTER,
      name: "plan.starter.name",
      description: "plan.starter.description",
      badge: "plan.starter.badge",
      features: ["FEATURE_1", "FEATURE_2", "FEATURE_3", "FEATURE_4"],
      limits: {
        projects: 10,
        members: 5,
      },
      variants: [
        {
          id: "premium-one-time",
          type: BillingType.FLAT,
          cost: 19900,
          model: BillingModel.ONE_TIME,
        },
        {
          id: "premium-monthly",
          type: BillingType.FLAT,
          cost: 1900,
          model: BillingModel.RECURRING,
          interval: RecurringInterval.MONTH,
          trialDays: 7,
        },
        {
          id: "premium-yearly",
          type: BillingType.FLAT,
          cost: 19000, // Higher than monthly * 12 to test recurring discount
          model: BillingModel.RECURRING,
          interval: RecurringInterval.YEAR,
          trialDays: 7,
        },
        {
          id: "premium-monthly-hidden",
          type: BillingType.FLAT,
          cost: 1900,
          custom: false,
          currency: "usd",
          hidden: true,
          model: BillingModel.RECURRING,
          interval: RecurringInterval.MONTH,
        },
      ],
    },
    {
      id: BillingPlan.PRO,
      name: "plan.pro.name",
      description: "plan.pro.description",
      badge: null,
      features: [
        "FEATURE_1",
        "FEATURE_2",
        "FEATURE_3",
        "FEATURE_4",
        "FEATURE_5",
      ],
      variants: [
        {
          id: "pro-lifetime",
          type: BillingType.FLAT,
          custom: true,
          label: "common:contactUs",
          href: "/contact",
          hidden: false,
          model: BillingModel.ONE_TIME,
        },
      ],
    },
    {
      id: BillingPlan.POWER,
      name: "plan.power.name",
      description: "plan.power.description",
      badge: null,
      features: [
        "FEATURE_1",
        "FEATURE_2",
        "FEATURE_3",
        "FEATURE_4",
        "FEATURE_5",
        "FEATURE_6",
      ],
      variants: [
        {
          id: "enterprise-lifetime",
          type: BillingType.FLAT,
          custom: true,
          label: "common:contactUs",
          href: "/contact",
          hidden: false,
          model: BillingModel.ONE_TIME,
        },
        {
          id: "enterprise-monthly",
          type: BillingType.FLAT,
          custom: true,
          label: "common:contactUs",
          href: "/contact",
          hidden: false,
          model: BillingModel.RECURRING,
          interval: RecurringInterval.MONTH,
        },
        {
          id: "enterprise-yearly",
          type: BillingType.FLAT,
          custom: true,
          label: "common:contactUs",
          href: "/contact",
          hidden: false,
          model: BillingModel.RECURRING,
          interval: RecurringInterval.YEAR,
        },
      ],
    },
  ],
  discounts: [
    {
      code: "50OFF",
      type: BillingDiscountType.PERCENT,
      off: 50,
      appliesTo: ["premium-monthly", "premium-yearly"],
    },
    {
      code: "100OFF",
      type: BillingDiscountType.AMOUNT,
      off: 1000,
      appliesTo: ["premium-monthly"],
    },
    {
      code: "10OFF",
      type: BillingDiscountType.PERCENT,
      off: 10,
      appliesTo: ["premium-yearly"],
    },
  ],
}) satisfies BillingConfig;

export const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing"] as const;
