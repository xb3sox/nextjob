import { buttonVariants } from "@workspace/ui-web/button";

import { pathsConfig } from "~/config/paths";
import { getTranslation } from "~/lib/i18n";
import { AuthHeader } from "~/modules/auth/layout/header";
import { TurboLink } from "~/modules/common/turbo-link";

export const InvitationExpired = async () => {
  const { t } = await getTranslation({ ns: ["organization"] });

  return (
    <>
      <AuthHeader
        title={t("invitations.expired.title")}
        description={t("invitations.expired.description")}
      />
      <TurboLink
        href={pathsConfig.dashboard.user.index}
        className={buttonVariants({
          variant: "outline",
          size: "lg",
        })}
      >
        {t("invitations.expired.cta")}
      </TurboLink>
    </>
  );
};
