"use client";

import { useMutation } from "@tanstack/react-query";

import { useTranslation } from "@workspace/i18n";
import { Button } from "@workspace/ui-web/button";
import { toast } from "@workspace/ui-web/toast";

import { auth } from "~/modules/auth/lib/api";

interface InvitationSendVerificationProps {
  readonly email: string;
  readonly callbackURL: string;
}

export const InvitationSendVerification = ({
  email,
  callbackURL,
}: InvitationSendVerificationProps) => {
  const { t } = useTranslation(["auth", "organization"]);

  const sendVerification = useMutation({
    ...auth.mutations.email.sendVerification,
    onSuccess: () => {
      toast.add({
        title: t("account.email.confirm.email.sent"),
        type: "success",
      });
    },
  });

  return (
    <Button
      size="lg"
      onClick={() => sendVerification.mutate({ email, callbackURL })}
      disabled={sendVerification.isPending}
    >
      {sendVerification.isPending
        ? t("account.email.confirm.loading")
        : t("organization:invitations.emailUnverified.cta")}
    </Button>
  );
};
