"use client";

import { useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";
import { buttonVariants } from "@workspace/ui-web/button";

import { pathsConfig } from "~/config/paths";
import { authClient, type Session } from "~/lib/auth/client";
import { TurboLink } from "~/modules/common/turbo-link";

export const CtaButton = ({
  initialSession,
  ...props
}: Omit<React.ComponentProps<typeof TurboLink>, "href"> & {
  initialSession: Session | null;
}) => {
  const { t } = useTranslation(["common", "marketing"]);
  authClient.hydrateSession(initialSession);
  const { data, isPending, isRefetching } = authClient.useSession();
  const session = isPending && !isRefetching ? initialSession : data;

  return (
    <TurboLink
      {...props}
      href={
        session?.session
          ? pathsConfig.dashboard.user.index
          : pathsConfig.auth.login
      }
      className={cn(buttonVariants(), props.className)}
    >
      {session?.session ? t("dashboard") : t("cta.button")}
    </TurboLink>
  );
};
