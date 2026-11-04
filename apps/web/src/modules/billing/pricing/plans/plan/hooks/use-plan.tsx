import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { Permissions, toMemberRole } from "@workspace/auth";
import {
  BillingReference,
  getHigherPlans,
  getLowerPlans,
} from "@workspace/billing";
import { useTranslation } from "@workspace/i18n";
import { toast } from "@workspace/ui-web/toast";

import { appConfig } from "~/config/app";
import { pathsConfig } from "~/config/paths";
import { authClient } from "~/lib/auth/client";
import { billing } from "~/modules/billing/lib/api";
import { usePricingControls } from "~/modules/billing/pricing/controls";
import { organization } from "~/modules/organization/lib/api";

import type { BillingConfigPlan } from "@workspace/billing";

export const usePlan = ({ plan }: { plan: BillingConfigPlan }) => {
  const { t } = useTranslation("billing");
  const controls = usePricingControls((c) => c.controls);
  const { data: session } = authClient.useSession();
  const user = session?.user ?? null;
  const member = useQuery({
    ...organization.queries.members.getByUserId({
      organizationId: controls.referenceId ?? "",
      userId: user?.id ?? "",
    }),
    enabled:
      controls.referenceType === BillingReference.ORGANIZATION &&
      !!controls.referenceId,
  });

  const organizations = authClient.useListOrganizations();
  const referenceOrganization = useMemo(
    () => organizations.data?.find((o) => o.id === controls.referenceId),
    [organizations.data, controls.referenceId],
  );

  const router = useRouter();
  const queryClient = useQueryClient();
  const checkout = useMutation({
    ...billing.mutations.checkout.create,
    onSuccess: (data) => {
      if (!data.url) {
        return toast.add({ title: t("error.checkout"), type: "error" });
      }
      return router.push(data.url);
    },
  });

  const getPortal = useMutation({
    ...billing.mutations.portal.get,
    onSuccess: async (data) => {
      if (!data.url) {
        return toast.add({ title: t("error.portal"), type: "error" });
      }
      const referenceId = controls.referenceId ?? user?.id;
      if (referenceId) {
        await queryClient.invalidateQueries(
          billing.queries.summary.get(referenceId),
        );
      }
      return router.push(data.url);
    },
  });

  const pathname = usePathname();

  const features = [
    ...plan.features.filter(
      (f) => !getLowerPlans(plan.id).some((p) => p.features.includes(f)),
    ),
    ...(getHigherPlans(plan.id)[0]
      ?.features.filter((f) => !plan.features.includes(f))
      .slice(0, 3) ?? []),
  ].map((feature) => ({
    id: feature,
    available: plan.features.includes(feature),
    key: `feature.${feature.toLowerCase().replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())}`,
  }));

  const handleCheckout = (
    params: Omit<
      Parameters<typeof checkout.mutate>[0]["json"],
      "redirect" | "referenceId"
    >,
  ) => {
    if (!user) {
      const url = new URL(pathsConfig.auth.login, appConfig.url);
      url.searchParams.set("redirectTo", pathsConfig.marketing.pricing);
      return router.push(url.toString());
    }

    const success = new URL(
      controls.referenceType === BillingReference.USER
        ? pathsConfig.dashboard.user.index
        : pathsConfig.dashboard.organization(referenceOrganization?.slug ?? "")
            .index,
      appConfig.url,
    );
    const cancel = new URL(pathname, appConfig.url);

    checkout.mutate({
      json: {
        ...params,
        referenceId: controls.referenceId ?? user.id,
        redirect: {
          success: success.toString(),
          cancel: cancel.toString(),
        },
      },
    });
  };

  const handleOpenPortal = () => {
    if (!user) {
      const url = new URL(pathsConfig.auth.login, appConfig.url);
      url.searchParams.set("redirectTo", pathsConfig.marketing.pricing);
      return router.push(url.toString());
    }

    const redirectUrl = new URL(pathname, appConfig.url);

    getPortal.mutate({
      query: {
        redirectUrl: redirectUrl.toString(),
        referenceId: controls.referenceId ?? user.id,
      },
    });
  };

  const can = useCallback(
    (permission: NonNullable<Permissions["billing"]>[number]) =>
      !user ||
      controls.referenceType === BillingReference.USER ||
      authClient.organization.checkRolePermission({
        permissions: {
          billing: [permission],
        },
        role: toMemberRole(member.data?.role),
      }),
    [member.data?.role, controls.referenceType, user],
  );

  return {
    canRead: can("read"),
    canCreate: can("create"),
    canUpdate: can("update"),
    canDelete: can("delete"),
    isPending: checkout.isPending || getPortal.isPending,
    features,
    handleCheckout,
    handleOpenPortal,
    referenceOrganization,
  };
};
