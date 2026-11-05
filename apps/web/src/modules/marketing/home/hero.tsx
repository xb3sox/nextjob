/* oxlint-disable i18next/no-literal-string */
import { buttonVariants } from "@workspace/ui-web/button";
import { Icons } from "@workspace/ui-web/icons";

import { pathsConfig } from "~/config/paths";
import { getSession } from "~/lib/auth/server";
import { getTranslation } from "~/lib/i18n";
import { TurboLink } from "~/modules/common/turbo-link";
import { HeroPreview } from "~/modules/marketing/home/hero-preview";
import { CtaButton } from "~/modules/marketing/layout/cta-button";
import { Section, SectionBadge } from "~/modules/marketing/layout/section";

export const Hero = async () => {
  const { t } = await getTranslation({ ns: ["common", "marketing"] });
  const session = await getSession();

  return (
    <Section
      id="hero"
      className="gap-6 pt-6 pb-8 sm:gap-8 sm:pt-10 sm:pb-12 md:pt-14"
    >
      {/* Announcement Pill Badge */}
      <TurboLink
        href={pathsConfig.dashboard.user.index}
        className="animate-fade-in -translate-y-4 opacity-[0.001] transition-transform hover:scale-[1.01]"
      >
        <SectionBadge className="border-border/60 bg-muted/40 hover:bg-muted/70 gap-2 px-3 py-1 text-xs backdrop-blur-sm">
          <span className="relative flex size-2 shrink-0">
            <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="bg-primary relative inline-flex size-2 rounded-full" />
          </span>
          <span className="text-foreground font-semibold tracking-tight">
            {t("hero.badge")}
          </span>
          <span
            data-orientation="vertical"
            role="none"
            className="bg-border/80 h-3.5 w-px shrink-0"
          />
          <span className="text-muted-foreground max-w-[260px] truncate font-normal sm:max-w-none">
            {t("announcement")}
          </span>
          <Icons.ChevronRight className="text-muted-foreground ms-1 size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
        </SectionBadge>
      </TurboLink>

      {/* Main Headline */}
      <h1 className="animate-fade-in mt-2 max-w-4xl -translate-y-4 text-center text-4xl leading-[1.06] font-semibold tracking-[-0.035em] text-balance opacity-[0.001] [--animation-delay:200ms] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
        {t("product.title")}
      </h1>

      {/* Product Subtitle */}
      <p className="animate-fade-in text-muted-foreground mx-auto max-w-2xl -translate-y-4 text-center text-base leading-relaxed font-normal text-balance opacity-[0.001] [--animation-delay:400ms] sm:text-lg md:text-xl">
        {t("product.description")}
      </p>

      {/* Action Buttons */}
      <div className="animate-fade-in mx-auto flex w-full -translate-y-4 flex-col gap-2.5 opacity-[0.001] ease-in-out [--animation-delay:600ms] sm:w-auto sm:flex-row sm:gap-3">
        <CtaButton
          initialSession={session}
          className="h-11 px-6 text-sm font-medium shadow-sm transition-all hover:shadow-md sm:h-12 sm:px-8 sm:text-base"
        />

        <TurboLink
          href={pathsConfig.dashboard.user.jobs}
          className={buttonVariants({
            variant: "outline",
            className:
              "h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-medium border-border/70 hover:bg-muted/50 transition-all",
          })}
        >
          {t("cta.buy.join.button")}
        </TurboLink>
      </div>

      {/* Micro-Trust Strip */}
      <div className="animate-fade-in text-muted-foreground flex -translate-y-2 flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-xs opacity-[0.001] [--animation-delay:700ms]">
        <div className="flex items-center gap-1.5">
          <Icons.ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{t("hero.trust.guarantee")}</span>
        </div>
        <span className="text-border hidden sm:inline" aria-hidden="true">
          •
        </span>
        <div className="flex items-center gap-1.5">
          <Icons.Plug className="text-primary size-3.5" />
          <span>{t("hero.trust.platforms")}</span>
        </div>
        <span className="text-border hidden sm:inline" aria-hidden="true">
          •
        </span>
        <div className="flex items-center gap-1.5">
          <Icons.Lock className="size-3.5 text-amber-500" />
          <span>{t("hero.trust.safeguards")}</span>
        </div>
      </div>

      {/* Interactive Career Agent Preview Console */}
      <div className="animate-fade-up relative mt-4 flex w-full justify-center opacity-[0.001] [--animation-delay:800ms]">
        <HeroPreview />
      </div>
    </Section>
  );
};
