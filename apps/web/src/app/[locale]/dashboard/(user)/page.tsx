import { redirect } from "next/navigation";

import { getTodayDashboardForUser } from "@workspace/api/nextjob";

import { pathsConfig } from "~/config/paths";
import { getSession } from "~/lib/auth/server";
import { getLocale } from "~/lib/i18n";
import { getMetadata } from "~/lib/metadata";
import { TodayDashboard } from "~/modules/nextjob/today-dashboard";

export const generateMetadata = getMetadata({
  title: "common:today",
  description: "dashboard:user.home.description",
});

export default async function TodayPage() {
  const [session, locale] = await Promise.all([getSession(), getLocale()]);

  if (!session?.user) {
    return redirect(pathsConfig.auth.login);
  }

  const initialData = getTodayDashboardForUser(session.user.id);

  return <TodayDashboard initialData={initialData} locale={locale} />;
}
