import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getTodayDashboardForUser } from "@workspace/api/nextjob";

import { pathsConfig } from "~/config/paths";
import { getSession } from "~/lib/auth/server";
import { getLocale } from "~/lib/i18n";
import { getMetadata } from "~/lib/metadata";
import {
  TodayDashboard,
  TodayDashboardSkeleton,
} from "~/modules/nextjob/today-dashboard";

export const generateMetadata = getMetadata({
  title: "common:today",
  description: "dashboard:user.home.description",
});

async function TodayDashboardStream({
  userId,
  locale,
}: {
  readonly userId: string;
  readonly locale: string;
}) {
  const initialData = getTodayDashboardForUser(userId);
  return <TodayDashboard initialData={initialData} locale={locale} />;
}

export default async function TodayPage() {
  const [session, locale] = await Promise.all([getSession(), getLocale()]);

  if (!session?.user) {
    return redirect(pathsConfig.auth.login);
  }

  return (
    <Suspense fallback={<TodayDashboardSkeleton />}>
      <TodayDashboardStream userId={session.user.id} locale={locale} />
    </Suspense>
  );
}
