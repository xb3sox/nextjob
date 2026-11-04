import { useMutation } from "@tanstack/react-query";

import { useTranslation } from "@workspace/i18n";
import { toast } from "@workspace/ui-web/toast";

import { authClient } from "~/lib/auth/client";
import { auth } from "~/modules/auth/lib/api";

export const useTwoFactor = () => {
  const { data } = authClient.useSession();
  const { t } = useTranslation("auth");

  const enabled = data?.user.twoFactorEnabled ?? false;

  const enable = useMutation(auth.mutations.twoFactor.enable);

  const disable = useMutation({
    ...auth.mutations.twoFactor.disable,
    onSuccess: () => {
      toast.add({
        title: t("account.twoFactor.disable.success"),
        type: "success",
      });
    },
  });

  return { enabled, enable, disable };
};
