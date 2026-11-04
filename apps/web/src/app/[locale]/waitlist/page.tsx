import { Trans } from "@workspace/i18n";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@workspace/ui-web/components/avatar";
import { Icons } from "@workspace/ui-web/icons";

import { pathsConfig } from "~/config/paths";
import { getTranslation } from "~/lib/i18n";
import { getMetadata } from "~/lib/metadata";
import { TurboLink } from "~/modules/common/turbo-link";
import { WaitlistForm } from "~/modules/marketing/waitlist/form";
import { WaitlistGradient } from "~/modules/marketing/waitlist/gradient";

const socials = [
  {
    id: "x",
    href: "https://x.com/turbostarter_",
    icon: Icons.Twitter,
  },
  {
    id: "linkedin",
    href: "#",
    icon: Icons.Linkedin,
  },
  {
    id: "facebook",
    href: "#",
    icon: Icons.Facebook,
  },
  {
    id: "discord",
    href: "https://discord.gg/KjpK2uk3JP",
    icon: Icons.Discord,
  },
] as const;

export const generateMetadata = getMetadata({
  title: "marketing:waitlist.label",
  description: "marketing:waitlist.description",
});

export default async function WaitlistPage() {
  const { t } = await getTranslation({ ns: ["marketing", "common"] });

  return (
    <main className="bg-background relative flex min-h-svh flex-col items-center justify-between overflow-hidden p-8 md:p-10 lg:p-12">
      <WaitlistGradient />

      <TurboLink
        href={pathsConfig.index}
        aria-label={t("common:home")}
        className="relative z-10"
      >
        <Icons.Logo className="text-primary h-8 md:h-10" />
      </TurboLink>

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-foreground animate-fade-in -translate-y-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
            {t("waitlist.title")}
          </h1>
          <p className="text-muted-foreground animate-fade-in max-w-xl -translate-y-4 text-base text-balance opacity-0 [--animation-delay:100ms] sm:text-lg lg:text-xl">
            {t("waitlist.subtitle")}
          </p>
        </div>

        <WaitlistForm />

        <div className="flex flex-col items-center gap-2">
          <AvatarGroup className="animate-fade-in -space-x-3 opacity-0 [--animation-delay:250ms] *:data-[slot=avatar]:ring-0">
            {Array.from({ length: 5 }).map((_, index) => (
              <Avatar key={index} className="size-10 md:size-12">
                <AvatarImage
                  src={`https://randomuser.me/api/portraits/men/${index}.jpg`}
                />
                <AvatarFallback>
                  <Icons.UserRound className="size-5 md:size-7" />
                </AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>

          <span className="text-muted-foreground animate-fade-in text-sm font-medium tracking-tight opacity-0 [--animation-delay:300ms]">
            <Trans
              t={t}
              i18nKey="waitlist.proof"
              components={{
                highlight: <span className="text-foreground font-semibold" />,
              }}
            />
          </span>
        </div>
      </div>

      <footer className="relative z-10 flex gap-5">
        {socials.map((social) => (
          <a
            key={social.id}
            href={social.href}
            rel="noopener noreferrer"
            target="_blank"
            className="text-background hover:text-background/80 transition-colors"
            aria-label={social.id}
          >
            <social.icon className="size-5" />
          </a>
        ))}
      </footer>
    </main>
  );
}
