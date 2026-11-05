import { BuiltWith } from "@workspace/ui-web/built-with";
import { Icons } from "@workspace/ui-web/icons";

import { appConfig } from "~/config/app";
import { pathsConfig } from "~/config/paths";
import { getTranslation } from "~/lib/i18n";
import { I18nControls } from "~/modules/common/i18n/controls";
import { TurboLink } from "~/modules/common/turbo-link";
import { FooterNavigation } from "~/modules/marketing/layout/footer/navigation";
import { StatusIndicator } from "~/modules/marketing/layout/status-indicator";

const socials = [
  {
    id: "github",
    href: "https://github.com/xb3sox/nextjob",
    icon: Icons.Github,
  },
];

export const Footer = async () => {
  const { t } = await getTranslation({
    ns: ["common", "marketing", "billing"],
  });

  return (
    <footer className="mt-auto w-full border-t px-6 pt-8 pb-6 sm:pt-10 sm:pb-8 md:pt-14 md:pb-10 lg:pt-16">
      <div className="sm:container">
        <div className="flex w-full flex-col items-start justify-between gap-10 md:gap-16 lg:flex-row lg:gap-24 xl:gap-32">
          <div className="flex flex-col items-start justify-center gap-2">
            <TurboLink
              href={pathsConfig.index}
              className="flex shrink-0 items-center gap-3"
              aria-label={t("common:home")}
            >
              <Icons.Logo className="text-primary h-8" />
              <Icons.LogoText className="text-foreground h-4" />
            </TurboLink>

            <p className="text-muted-foreground text-sm text-pretty">
              {t("product.title")}
            </p>

            <I18nControls />

            <div className="mt-2 flex items-center gap-2.5">
              {socials.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.id}
                >
                  <social.icon className="size-7" />
                </a>
              ))}
            </div>
          </div>

          <FooterNavigation />
        </div>
        <div className="mt-8 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <p className="text-muted-foreground text-sm">
                {/* oxlint-disable-next-line i18next/no-literal-string */}
                &copy; {new Date().getFullYear()} {appConfig.name}.{" "}
                {t("legal.copyright")}.
              </p>
              <StatusIndicator />
            </div>

            <div className="flex flex-col items-center gap-1 sm:items-end">
              <BuiltWith />
              <p className="text-muted-foreground text-xs sm:pr-0.5">
                {`v${appConfig.version}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
