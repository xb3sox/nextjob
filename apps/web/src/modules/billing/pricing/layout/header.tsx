"use client";

import { memo } from "react";

import { useTranslation } from "@workspace/i18n";

import { PricingControls } from "~/modules/billing/pricing/controls";
import {
  SectionBadge,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "~/modules/marketing/layout/section";

import { Discount } from "./discount";

export const PricingHeader = memo(() => {
  const { t } = useTranslation(["common", "billing"]);

  return (
    <SectionHeader>
      <SectionBadge>{t("pricing.label")}</SectionBadge>
      <SectionTitle>{t("pricing.title")}</SectionTitle>
      <SectionDescription className="text-muted-foreground max-w-2xl text-center">
        {t("pricing.description")}
      </SectionDescription>

      <Discount />
      <PricingControls />
    </SectionHeader>
  );
});

PricingHeader.displayName = "PricingHeader";
