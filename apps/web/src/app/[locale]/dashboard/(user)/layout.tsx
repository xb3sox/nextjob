import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getBillingSummaryResponseSchema } from "@workspace/api/schema";
import { handle } from "@workspace/api/utils";
import { logger } from "@workspace/shared/logger";
import { Icons } from "@workspace/ui-web/icons";
import { SidebarInset, SidebarProvider } from "@workspace/ui-web/sidebar";

import { pathsConfig } from "~/config/paths";
import { api } from "~/lib/api/server";
import { getSession } from "~/lib/auth/server";
import { getQueryClient } from "~/lib/query/server";
import { billing } from "~/modules/billing/lib/api";
import { DashboardActionBar } from "~/modules/common/layout/dashboard/action-bar";
import { DashboardInset } from "~/modules/common/layout/dashboard/inset";
import { DashboardSidebar } from "~/modules/common/layout/dashboard/sidebar/index";
import { DashboardSidebarSkeleton } from "~/modules/common/layout/dashboard/sidebar/skeleton";
import { PersistentCareerAssistant } from "~/modules/nextjob/persistent-assistant";

const menu = [
  {
    label: "platform",
    items: [
      {
        title: "today",
        href: pathsConfig.dashboard.user.index,
        icon: <Icons.Home />,
      },
      {
        title: "findJobs",
        href: pathsConfig.dashboard.user.jobs,
        icon: <Icons.Briefcase />,
      },
      {
        title: "myCareer",
        href: pathsConfig.dashboard.user.career,
        icon: <Icons.UserRound />,
      },
      {
        title: "applications",
        href: pathsConfig.dashboard.user.applications,
        icon: <Icons.FileText />,
      },
      {
        title: "ai",
        href: pathsConfig.dashboard.user.ai,
        icon: <Icons.Brain />,
      },
    ],
  },
  {
    label: "account",
    items: [
      {
        title: "settings",
        href: pathsConfig.dashboard.user.settings.index,
        icon: <Icons.Settings />,
        menu: [
          {
            items: [
              {
                title: "general",
                href: pathsConfig.dashboard.user.settings.index,
                icon: <Icons.Settings />,
              },
              {
                title: "security",
                href: pathsConfig.dashboard.user.settings.security,
                icon: <Icons.Lock />,
              },
            ],
          },
        ],
      },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Suspense fallback={<DashboardSidebarSkeleton />}>
        <AuthenticatedSidebar />
      </Suspense>
      <SidebarInset>
        <DashboardActionBar menu={menu} />
        <DashboardInset>
          {children}
          <PersistentCareerAssistant />
        </DashboardInset>
      </SidebarInset>
    </SidebarProvider>
  );
}

async function AuthenticatedSidebar() {
  const session = await getSession();

  if (!session?.user) {
    return redirect(pathsConfig.auth.login);
  }

  const { user } = session;

  const queryClient = getQueryClient();
  try {
    await queryClient.prefetchQuery({
      ...billing.queries.summary.get(user.id),
      queryFn: () =>
        handle(api.billing.summary.$get, {
          schema: getBillingSummaryResponseSchema,
        })({
          query: {
            referenceId: user.id,
          },
        }),
    });
  } catch (error) {
    logger.error("Failed to prefetch billing summary in dashboard layout", {
      userId: user.id,
      error,
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardSidebar user={user} menu={menu} />
    </HydrationBoundary>
  );
}
