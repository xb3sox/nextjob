import { memo } from "react";

import { Skeleton } from "@workspace/ui-web/skeleton";

import { Plan } from "./plan/plan";

import type { BillingConfigPlan } from "@workspace/billing";

interface PlansProps {
  readonly plans: BillingConfigPlan[];
}

export const Plans = memo<PlansProps>(({ plans }) => {
  return (
    <div className="flex w-full flex-wrap items-stretch justify-center gap-8 md:gap-6 lg:gap-4">
      {plans.map((plan) => (
        <Plan key={plan.id} plan={plan} />
      ))}
    </div>
  );
});

export const PlansSkeleton = () => {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-12 md:gap-6 lg:gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="grow-0 basis-100 md:shrink-0">
          <Skeleton className="h-128 w-full" />
        </div>
      ))}
    </div>
  );
};

Plans.displayName = "Plans";
