import { useGlobalSearchParams } from "expo-router";

import { toAllowedPath } from "~/config/paths";
import { LoginFlow } from "~/modules/auth/login";

const LoginPage = () => {
  const { redirectTo, invitationId, email } = useGlobalSearchParams<{
    redirectTo?: string;
    invitationId?: string;
    email?: string;
  }>();

  return (
    <LoginFlow
      redirectTo={toAllowedPath(redirectTo)}
      invitationId={invitationId}
      email={email}
    />
  );
};

export default LoginPage;
