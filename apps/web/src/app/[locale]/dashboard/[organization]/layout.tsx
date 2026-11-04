import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getBillingSummaryResponseSchema } from "@workspace/api/schema";
import { handle } from "@workspace/api/utils";
import { Member, toMemberRole } from "@workspace/auth";
import { Icons } from "@workspace/ui-web/icons";
import { SidebarInset, SidebarProvider } from "@workspace/ui-web/sidebar";

import { pathsConfig } from "~/config/paths";
import { api } from "~/lib/api/server";
import { authClient } from "~/lib/auth/client";
import {
  getMemberByUserId,
  getOrganization,
  getSession,
} from "~/lib/auth/server";
import { getQueryClient } from "~/lib/query/server";
import { billing } from "~/modules/billing/lib/api";
import { DashboardActionBar } from "~/modules/common/layout/dashboard/action-bar";
import { DashboardInset } from "~/modules/common/layout/dashboard/inset";
import { DashboardSidebar } from "~/modules/common/layout/dashboard/sidebar/index";
import { DashboardSidebarSkeleton } from "~/modules/common/layout/dashboard/sidebar/skeleton";
import { organization } from "~/modules/organization/lib/api";

import type { Menu } from "~/modules/common/layout/dashboard/sidebar/types";

const menu = ({
  slug,
  member,
}: {
  slug: string;
  member: Member | null;
}): Menu => [
  {
    label: "platform",
    items: [
      {
        title: "home",
        href: pathsConfig.dashboard.organization(slug).index,
        icon: <Icons.Home />,
      },
    ],
  },
  {
    label: "organization",
    items: [
      {
        title: "settings",
        href: pathsConfig.dashboard.organization(slug).settings.index,
        icon: <Icons.Settings />,
        menu: [
          {
            items: [
              {
                title: "general",
                href: pathsConfig.dashboard.organization(slug).settings.index,
                icon: <Icons.Settings />,
              },
              ...(authClient.organization.checkRolePermission({
                permissions: {
                  billing: ["read"],
                },
                role: toMemberRole(member?.role),
              })
                ? [
                    {
                      title: "billing",
                      href: pathsConfig.dashboard.organization(slug).settings
                        .billing,
                      icon: <Icons.CreditCard />,
                    },
                  ]
                : []),
            ],
          },
        ],
      },
      {
        title: "members",
        href: pathsConfig.dashboard.organization(slug).members,
        icon: <Icons.UsersRound />,
      },
    ],
  },
];

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    organization: string;
  }>;
}) {
  return (
    <SidebarProvider>
      <Suspense fallback={<DashboardSidebarSkeleton />}>
        <AuthenticatedOrgSidebar params={params} />
      </Suspense>
      <SidebarInset>
        <Suspense fallback={<div className="h-14 border-b" />}>
          <AuthenticatedOrgActionBar params={params} />
        </Suspense>
        <DashboardInset>{children}</DashboardInset>
      </SidebarInset>
    </SidebarProvider>
  );
}

async function getWorkspace(params: Promise<{ organization: string }>) {
  const session = await getSession();

  if (!session?.user) {
    return redirect(pathsConfig.auth.login);
  }

  const { user } = session;

  const organizationSlug = (await params).organization;
  const activeOrganization = await getOrganization({ slug: organizationSlug });

  if (!activeOrganization) {
    return redirect(pathsConfig.dashboard.user.index);
  }

  const items = menu({
    slug: organizationSlug,
    member: await getMemberByUserId({
      organizationId: activeOrganization.id,
      userId: user.id,
    }),
  });

  return { user, activeOrganization, organizationSlug, items };
}

async function AuthenticatedOrgSidebar({
  params,
}: {
  params: Promise<{ organization: string }>;
}) {
  const { user, activeOrganization, organizationSlug, items } =
    await getWorkspace(params);

  const queryClient = getQueryClient();
  queryClient.setQueryData(
    organization.queries.get({ slug: organizationSlug }).queryKey,
    activeOrganization,
  );
  queryClient.setQueryData(
    organization.queries.get({ id: activeOrganization.id }).queryKey,
    activeOrganization,
  );
  await queryClient.query({
    ...billing.queries.summary.get(activeOrganization.id),
    queryFn: () =>
      handle(api.billing.summary.$get, {
        schema: getBillingSummaryResponseSchema,
      })({
        query: { referenceId: activeOrganization.id },
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardSidebar user={user} menu={items} />
    </HydrationBoundary>
  );
}

async function AuthenticatedOrgActionBar({
  params,
}: {
  params: Promise<{ organization: string }>;
}) {
  const { items } = await getWorkspace(params);
  return <DashboardActionBar menu={items} />;
}
