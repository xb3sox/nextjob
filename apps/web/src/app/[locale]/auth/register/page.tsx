import { toInternalPath } from "@workspace/shared/utils";
import { FieldSeparator } from "@workspace/ui-web/field";

import { authConfig } from "~/config/auth";
import { getTranslation } from "~/lib/i18n";
import { getMetadata } from "~/lib/metadata";
import { AnonymousLogin } from "~/modules/auth/form/anonymous";
import { LoginCta } from "~/modules/auth/form/login/form";
import { RegisterForm } from "~/modules/auth/form/register-form";
import { SocialProviders } from "~/modules/auth/form/social-providers";
import { AuthHeader } from "~/modules/auth/layout/header";
import { InvitationDisclaimer } from "~/modules/auth/layout/invitation-disclaimer";

export const generateMetadata = getMetadata({
  title: "auth:register.title",
});

const Register = async ({
  searchParams,
}: {
  searchParams: Promise<{
    redirectTo?: string;
    invitationId?: string;
    email?: string;
  }>;
}) => {
  const { redirectTo, invitationId, email } = await searchParams;
  const { t } = await getTranslation({ ns: "auth" });

  return (
    <>
      <AuthHeader
        title={t("register.header.title")}
        description={t("register.header.description")}
      />
      {invitationId && <InvitationDisclaimer />}
      <SocialProviders
        providers={authConfig.providers.oAuth}
        redirectTo={toInternalPath(redirectTo)}
        context="signup"
      />
      {authConfig.providers.oAuth.length > 0 && (
        <FieldSeparator>{t("divider")}</FieldSeparator>
      )}
      <div className="flex flex-col gap-2">
        <RegisterForm redirectTo={toInternalPath(redirectTo)} email={email} />
        {authConfig.providers.anonymous && (
          <AnonymousLogin redirectTo={toInternalPath(redirectTo)} />
        )}
      </div>
      <LoginCta />
    </>
  );
};

export default Register;
