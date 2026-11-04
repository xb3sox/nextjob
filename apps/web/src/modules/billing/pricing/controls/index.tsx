import { useEffect } from "react";
import { create } from "zustand";

import {
  BillingModel,
  BillingReference,
  RecurringInterval,
  BillingType,
} from "@workspace/billing";

import { authClient } from "~/lib/auth/client";

import { IntervalSelector } from "./interval-selector";
import { ModelSelector } from "./model-selector";
import { ReferenceSelector } from "./reference-selector";
import { TypeSelector } from "./type-selector";

interface PricingControls {
  model: BillingModel;
  interval: RecurringInterval | null;
  type: BillingType;
  referenceType: BillingReference;
  referenceId: string | null;
}

export const usePricingControls = create<{
  controls: PricingControls;
  setControls: (controls: Partial<PricingControls>) => void;
}>((set) => ({
  controls: {
    model: BillingModel.RECURRING,
    interval: RecurringInterval.MONTH,
    type: BillingType.FLAT,
    referenceType: BillingReference.USER,
    referenceId: null,
  },
  setControls: (controls) =>
    set((state) => ({ controls: { ...state.controls, ...controls } })),
}));

export const PricingControls = () => {
  const { controls, setControls } = usePricingControls();
  const { data } = authClient.useSession();
  const userId = data?.user?.id;

  useEffect(() => {
    if (controls.referenceType === BillingReference.USER && userId) {
      setControls({ referenceId: userId });
    }

    if (!userId && controls.referenceId) {
      setControls({ referenceType: BillingReference.USER, referenceId: null });
    }

    if (
      controls.referenceType === BillingReference.USER &&
      controls.type === BillingType.PER_SEAT
    ) {
      setControls({ type: BillingType.FLAT });
    }

    if (
      controls.type === BillingType.METERED &&
      controls.model === BillingModel.ONE_TIME
    ) {
      setControls({
        model: BillingModel.RECURRING,
        interval: RecurringInterval.MONTH,
      });
    }
  }, [
    controls.referenceType,
    controls.referenceId,
    controls.type,
    controls.model,
    userId,
    setControls,
  ]);

  return (
    <div className="mt-2 flex w-full flex-wrap items-center justify-center gap-4 lg:mt-4">
      <ReferenceSelector />
      <TypeSelector />
      <ModelSelector />
      {controls.model === BillingModel.RECURRING && <IntervalSelector />}
    </div>
  );
};
