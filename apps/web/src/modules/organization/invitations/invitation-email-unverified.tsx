import { Trans } from "@workspace/i18n";
import { buttonVariants } from "@workspace/ui-web/button";

import { pathsConfig } from "~/config/paths";
import { getTranslation } from "~/lib/i18n";
import { AuthHeader } from "~/modules/auth/layout/header";
import { TurboLink } from "~/modules/common/turbo-link";

import { InvitationSendVerification } from "./invitation-send-verification";

interface InvitationEmailUnverifiedProps {
  readonly invitationId: string;
  readonly email: string;
}

export const InvitationEmailUnverified = async ({
  invitationId,
  email,
}: InvitationEmailUnverifiedProps) => {
  const { t } = await getTranslation({ ns: ["organization"] });

  const searchParams = new URLSearchParams();
  searchParams.set("invitationId", invitationId);
  searchParams.set("email", email);

  return (
    <>
      <AuthHeader
        title={t("invitations.emailUnverified.title")}
        description={
          <Trans
            i18nKey="invitations.emailUnverified.description"
            ns="organization"
            values={{ email }}
            components={{ bold: <strong /> }}
          />
        }
      />

      <div className="flex flex-col gap-2">
        <InvitationSendVerification
          email={email}
          callbackURL={`${pathsConfig.auth.join}?${searchParams.toString()}`}
        />

        <TurboLink
          href={pathsConfig.dashboard.user.index}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          {t("invitations.emailUnverified.skip")}
        </TurboLink>
      </div>
    </>
  );
};
