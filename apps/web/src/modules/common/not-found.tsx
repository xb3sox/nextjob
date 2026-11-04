import { buttonVariants } from "@workspace/ui-web/button";

import { pathsConfig } from "~/config/paths";
import { getTranslation } from "~/lib/i18n";
import { TurboLink } from "~/modules/common/turbo-link";

export async function NotFound({ locale }: { locale?: string } = {}) {
  const { t } = await getTranslation({ ns: "common", locale });

  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-center text-4xl font-bold tracking-tighter">
          {t("error.notFound")}
        </h1>
        <p className="text-muted-foreground max-w-md text-center">
          {t("error.resourceDoesNotExist")}
        </p>
      </div>

      <TurboLink
        href={pathsConfig.index}
        className={buttonVariants({ variant: "outline" })}
      >
        {t("goBackHome")}
      </TurboLink>
    </main>
  );
}
