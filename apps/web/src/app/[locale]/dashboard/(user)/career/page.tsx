import { redirect } from "next/navigation";

import { getCareerWorkspace } from "@workspace/api/nextjob";

import { pathsConfig } from "~/config/paths";
import { getSession } from "~/lib/auth/server";
import { getLocale } from "~/lib/i18n";
import { getMetadata } from "~/lib/metadata";
import { MyCareerWorkspace } from "~/modules/nextjob/my-career-workspace";

export const generateMetadata = getMetadata({
  title: "common:myCareer",
  description: "marketing:product.description",
});

export default async function MyCareerPage() {
  const [session, locale] = await Promise.all([getSession(), getLocale()]);

  if (!session?.user) {
    return redirect(pathsConfig.auth.login);
  }

  const initialData = getCareerWorkspace(session.user.id);

  return <MyCareerWorkspace initialData={initialData} locale={locale} />;
}
