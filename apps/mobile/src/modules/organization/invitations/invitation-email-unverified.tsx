import { useMutation } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Alert, View } from "react-native";

import { Trans, useTranslation } from "@workspace/i18n";
import { Button } from "@workspace/ui-mobile/button";
import { Text } from "@workspace/ui-mobile/text";

import { pathsConfig } from "~/config/paths";
import { authClient } from "~/lib/auth";
import { AuthLayout } from "~/modules/auth/layout/base";
import { AuthHeader } from "~/modules/auth/layout/header";
import { auth } from "~/modules/auth/lib/api";

interface InvitationEmailUnverifiedProps {
  readonly invitationId: string;
  readonly email: string;
}

export const InvitationEmailUnverified = ({
  invitationId,
  email,
}: InvitationEmailUnverifiedProps) => {
  const { t } = useTranslation(["common", "auth", "organization"]);
  const { refetch } = authClient.useSession();

  // The email is verified outside the app, so re-check once the user comes back.
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const sendVerification = useMutation({
    ...auth.mutations.email.sendVerification,
    onSuccess: () => {
      Alert.alert(t("message"), t("account.email.confirm.email.sent"));
    },
  });

  const searchParams = new URLSearchParams();
  searchParams.set("invitationId", invitationId);
  searchParams.set("email", email);
  const callbackURL = `${pathsConfig.setup.auth.join}?${searchParams.toString()}`;

  return (
    <AuthLayout>
      <AuthHeader
        title={t("organization:invitations.emailUnverified.title")}
        description={
          <Trans
            i18nKey="invitations.emailUnverified.description"
            ns="organization"
            values={{ email }}
            components={{ bold: <Text className="text-sm font-medium" /> }}
          />
        }
      />

      <View className="gap-2">
        <Button
          onPress={() =>
            sendVerification.mutate({
              email,
              callbackURL,
              fetchOptions: {
                headers: { "x-url": Linking.createURL(callbackURL) },
              },
            })
          }
          disabled={sendVerification.isPending}
          size="lg"
        >
          <Text>
            {sendVerification.isPending
              ? t("account.email.confirm.loading")
              : t("organization:invitations.emailUnverified.cta")}
          </Text>
        </Button>
        <Button
          onPress={() => router.replace(pathsConfig.index)}
          variant="outline"
          size="lg"
        >
          <Text>{t("organization:invitations.emailUnverified.skip")}</Text>
        </Button>
      </View>
    </AuthLayout>
  );
};
