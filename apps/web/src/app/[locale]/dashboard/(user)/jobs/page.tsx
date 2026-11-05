import { redirect } from "next/navigation";
import { Suspense } from "react";

import { listJobsWithFitForUser } from "@workspace/api/nextjob";

import { pathsConfig } from "~/config/paths";
import { getSession } from "~/lib/auth/server";
import { getLocale } from "~/lib/i18n";
import { getMetadata } from "~/lib/metadata";
import {
  FindJobsWorkspace,
  FindJobsWorkspaceSkeleton,
} from "~/modules/nextjob/find-jobs-workspace";

export const generateMetadata = getMetadata({
  title: "common:findJobs",
  description: "marketing:product.description",
});

async function FindJobsWorkspaceStream({
  userId,
  locale,
}: {
  readonly userId: string;
  readonly locale: string;
}) {
  const initialJobs = listJobsWithFitForUser(userId);
  return <FindJobsWorkspace initialJobs={initialJobs} locale={locale} />;
}

export default async function FindJobsPage() {
  const [session, locale] = await Promise.all([getSession(), getLocale()]);

  if (!session?.user) {
    return redirect(pathsConfig.auth.login);
  }

  return (
    <Suspense fallback={<FindJobsWorkspaceSkeleton />}>
      <FindJobsWorkspaceStream userId={session.user.id} locale={locale} />
    </Suspense>
  );
}
