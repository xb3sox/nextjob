/* oxlint-disable i18next/no-literal-string */
import { buttonVariants } from "@workspace/ui-web/button";
import { Icons } from "@workspace/ui-web/icons";

import { pathsConfig } from "~/config/paths";
import { getSession } from "~/lib/auth/server";
import { getTranslation } from "~/lib/i18n";
import { TurboLink } from "~/modules/common/turbo-link";
import { CtaButton } from "~/modules/marketing/layout/cta-button";
import { Section } from "~/modules/marketing/layout/section";

export const Banner = async () => {
  const { t } = await getTranslation({ ns: "marketing" });
  const session = await getSession();

  return (
    <Section id="banner" className="py-12 sm:py-16 md:py-20">
      <div className="border-primary/20 from-primary/10 via-card/80 to-card/40 relative w-full max-w-5xl overflow-hidden rounded-3xl border bg-gradient-to-b p-8 text-center shadow-lg backdrop-blur-sm sm:p-12 md:p-16">
        {/* Ambient subtle glow */}
        <div
          className="bg-primary/15 pointer-events-none absolute -top-24 left-1/2 -z-10 h-48 w-96 -translate-x-1/2 rounded-full blur-3xl"
          aria-hidden="true"
        />

        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-medium">
            <span className="bg-primary size-1.5 animate-pulse rounded-full" />
            <span>NextJob Autonomous Career Engine</span>
          </div>

          <h2 className="text-foreground text-3xl leading-[1.12] font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
            {t("banner.title")}
          </h2>

          <p className="text-muted-foreground text-sm leading-relaxed text-balance sm:text-base">
            {t("banner.subtitle")}
          </p>

          <div className="mt-4 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <CtaButton
              initialSession={session}
              className="h-11 w-full px-6 text-sm font-medium shadow-sm transition-all hover:shadow-md sm:h-12 sm:w-auto sm:px-8 sm:text-base"
            />

            <TurboLink
              href={pathsConfig.dashboard.user.jobs}
              className={buttonVariants({
                variant: "outline",
                className:
                  "h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-medium border-border/70 hover:bg-muted/50 transition-all w-full sm:w-auto",
              })}
            >
              <span>{t("cta.buy.join.button")}</span>
              <Icons.ArrowRight className="ms-1.5 size-3.5 rtl:rotate-180" />
            </TurboLink>
          </div>

          <div className="text-muted-foreground mt-4 flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
            <Icons.ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("banner.trust")}</span>
          </div>
        </div>
      </div>
    </Section>
  );
};
