import { redirect } from "next/navigation";

import { getUserStore, listApplicationsForUser } from "@workspace/api/nextjob";

import { pathsConfig } from "~/config/paths";
import { getSession } from "~/lib/auth/server";
import { getLocale } from "~/lib/i18n";
import { getMetadata } from "~/lib/metadata";
import { ApplicationsWorkspace } from "~/modules/nextjob/applications-workspace";

export const generateMetadata = getMetadata({
  title: "common:applications",
  description: "marketing:product.description",
});

export default async function ApplicationsPage() {
  const [session, locale] = await Promise.all([getSession(), getLocale()]);

  if (!session?.user) {
    return redirect(pathsConfig.auth.login);
  }

  const store = getUserStore(session.user.id);
  const initialApplications = listApplicationsForUser(session.user.id);

  return (
    <ApplicationsWorkspace
      initialApplications={initialApplications}
      initialDocuments={store.tailoredDocuments}
      locale={locale}
    />
  );
}
