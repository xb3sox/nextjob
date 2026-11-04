import { useMutation } from "@tanstack/react-query";

import { useTranslation } from "@workspace/i18n";
import { Button } from "@workspace/ui-web/button";
import { Icons } from "@workspace/ui-web/icons";
import { Spinner } from "@workspace/ui-web/spinner";

import { pathsConfig } from "~/config/paths";
import { admin } from "~/modules/admin/lib/api";

interface ImpersonateProps {
  readonly id: string;
}

export const Impersonate = ({ id }: ImpersonateProps) => {
  const { t } = useTranslation("common");

  const impersonate = useMutation({
    ...admin.mutations.users.impersonate,
    onSuccess: () => {
      window.open(pathsConfig.index, "_blank");
    },
  });

  const isPending =
    impersonate.isPending && impersonate.variables.userId === id;

  return (
    <Button
      variant="secondary"
      onClick={() => impersonate.mutate({ userId: id })}
      disabled={isPending}
    >
      {isPending ? <Spinner /> : <Icons.VenetianMask />}
      {t("impersonate")}
    </Button>
  );
};
