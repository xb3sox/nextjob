"use client";

import { useTranslation } from "@workspace/i18n";
import { Icons } from "@workspace/ui-web/icons";

import { pathsConfig } from "~/config/paths";
import { ThemeControls } from "~/modules/common/theme";
import { TurboLink } from "~/modules/common/turbo-link";
import { CtaButton } from "~/modules/marketing/layout/cta-button";

import { MobileNavigation } from "./navigation/mobile-navigation";
import { Navigation } from "./navigation/navigation";

import type { Session } from "~/lib/auth/client";

const links = [
  {
    label: "common:today",
    href: pathsConfig.dashboard.user.index,
  },
  {
    label: "common:findJobs",
    href: pathsConfig.dashboard.user.jobs,
  },
  {
    label: "common:myCareer",
    href: pathsConfig.dashboard.user.career,
  },
  {
    label: "common:applications",
    href: pathsConfig.dashboard.user.applications,
  },
  {
    label: "resources",
    items: [
      {
        title: "common:ai",
        description: "marketing:ai.description",
        href: pathsConfig.dashboard.user.ai,
        icon: Icons.Brain,
      },
      {
        title: "marketing:blog.label",
        description: "marketing:blog.description",
        href: pathsConfig.marketing.blog.index,
        icon: Icons.BookOpen,
      },
      {
        title: "marketing:contact.label",
        description: "marketing:contact.description",
        href: pathsConfig.marketing.contact,
        icon: Icons.SendHorizontal,
      },
    ],
  },
] as const;

export const Header = ({
  initialSession,
}: {
  initialSession: Session | null;
}) => {
  const { t } = useTranslation("common");
  return (
    <header className="bg-background/80 sticky inset-0 top-(--banner-height,0px) z-40 w-full py-3 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 pr-4 sm:container">
        <TurboLink
          href={pathsConfig.index}
          className="flex shrink-0 items-center gap-3"
          aria-label={t("home")}
        >
          <Icons.Logo className="text-primary h-8" />
          <Icons.LogoText className="text-foreground h-4" />
        </TurboLink>

        <Navigation links={links} />

        <div className="flex items-center justify-center lg:gap-2">
          <ThemeControls />
          <CtaButton
            className="hidden lg:inline-flex"
            initialSession={initialSession}
          />
          <MobileNavigation links={links} initialSession={initialSession} />
        </div>
      </div>
    </header>
  );
};
