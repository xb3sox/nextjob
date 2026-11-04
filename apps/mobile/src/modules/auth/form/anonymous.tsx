"use client";

import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

import { useTranslation } from "@workspace/i18n";
import { Button } from "@workspace/ui-mobile/button";
import { Icons } from "@workspace/ui-mobile/icons";
import { Spinner } from "@workspace/ui-mobile/spinner";
import { Text } from "@workspace/ui-mobile/text";

import { pathsConfig } from "~/config/paths";

import { auth } from "../lib/api";

import type { Href } from "expo-router";

interface AnonymousLoginProps {
  readonly redirectTo?: Href;
}

export const AnonymousLogin = ({
  redirectTo = pathsConfig.index,
}: AnonymousLoginProps) => {
  const { t } = useTranslation(["auth", "common"]);

  const signIn = useMutation({
    ...auth.mutations.signIn.anonymous,
    onSuccess: () => {
      router.navigate(redirectTo);
    },
  });

  return (
    <Button
      variant="outline"
      className="flex-row gap-2"
      size="lg"
      disabled={signIn.isPending}
      onPress={() => signIn.mutate(undefined)}
    >
      {signIn.isPending ? (
        <Spinner className="text-foreground size-5" />
      ) : (
        <>
          <Icons.UserRound className="text-foreground" size={16} />
          <Text>{t("login.anonymous.cta")}</Text>
        </>
      )}
    </Button>
  );
};
