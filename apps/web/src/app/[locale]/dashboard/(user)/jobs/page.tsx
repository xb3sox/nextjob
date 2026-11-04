import { redirect } from "next/navigation";

import { listJobsWithFitForUser } from "@workspace/api/nextjob";

import { pathsConfig } from "~/config/paths";
import { getSession } from "~/lib/auth/server";
import { getLocale } from "~/lib/i18n";
import { getMetadata } from "~/lib/metadata";
import { FindJobsWorkspace } from "~/modules/nextjob/find-jobs-workspace";

export const generateMetadata = getMetadata({
  title: "common:findJobs",
  description: "marketing:product.description",
});

export default async function FindJobsPage() {
  const [session, locale] = await Promise.all([getSession(), getLocale()]);

  if (!session?.user) {
    return redirect(pathsConfig.auth.login);
  }

  const initialJobs = listJobsWithFitForUser(session.user.id);

  return <FindJobsWorkspace initialJobs={initialJobs} locale={locale} />;
}
