"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { router } from "expo-router";
import { View } from "react-native";

import { Trans, useTranslation } from "@workspace/i18n";
import { Button } from "@workspace/ui-mobile/button";
import { Icons } from "@workspace/ui-mobile/icons";
import { Spinner } from "@workspace/ui-mobile/spinner";
import { Text } from "@workspace/ui-mobile/text";

import { pathsConfig } from "~/config/paths";
import { authClient } from "~/lib/auth";
import { AuthLayout } from "~/modules/auth/layout/base";
import { AuthHeader } from "~/modules/auth/layout/header";
import { Link } from "~/modules/common/styled";
import { organization } from "~/modules/organization/lib/api";
import { user } from "~/modules/user/lib/api";

import { InvitationSummaryCard } from "./invitation-summary-card";

import type { Invitation as InvitationType } from "@workspace/auth";

dayjs.extend(relativeTime);

interface InvitationProps {
  readonly invitation: InvitationType & {
    inviterEmail: string;
  };
  readonly organization: {
    slug: string | null;
    name: string;
    logo: string | null;
  };
}

export const Invitation = (props: InvitationProps) => {
  const { t } = useTranslation(["common", "organization"]);

  const activeOrganization = authClient.useActiveOrganization();
  const activeMember = authClient.useActiveMember();
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;

  const queryClient = useQueryClient();
  const setActive = useMutation({
    ...organization.mutations.setActive,
    onSuccess: async () => {
      await activeOrganization.refetch();
      await activeMember.refetch();
    },
  });
  const acceptInvitation = useMutation({
    ...organization.mutations.invitations.accept,
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        user.queries.invitations.getAll(userId),
      );
      await setActive.mutateAsync({
        organizationId: props.invitation.organizationId,
      });
      router.replace(pathsConfig.index);
    },
  });
  const rejectInvitation = useMutation({
    ...organization.mutations.invitations.reject,
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        user.queries.invitations.getAll(userId),
      );

      router.replace(pathsConfig.index);
    },
  });

  return (
    <AuthLayout>
      <AuthHeader
        title={t("invitations.invitation.title", {
          organizationName: props.organization.name,
        })}
        description={
          <Trans
            i18nKey="invitations.invitation.description"
            ns="organization"
            values={{
              inviterEmail: props.invitation.inviterEmail,
              organizationName: props.organization.name,
            }}
            components={{ bold: <Text className="text-sm font-medium" /> }}
          />
        }
      />

      <InvitationSummaryCard
        invitation={props.invitation}
        organization={props.organization}
      />

      <View className="flex-row gap-2">
        <Button
          variant="outline"
          className="grow"
          disabled={rejectInvitation.isPending || acceptInvitation.isPending}
          onPress={() =>
            rejectInvitation.mutate({ invitationId: props.invitation.id })
          }
        >
          {rejectInvitation.isPending ? (
            <Spinner className="text-foreground" size={16} />
          ) : (
            <Icons.X className="text-foreground" size={16} />
          )}
          <Text>{t("reject")}</Text>
        </Button>

        <Button
          className="grow"
          onPress={() =>
            acceptInvitation.mutate({ invitationId: props.invitation.id })
          }
          disabled={rejectInvitation.isPending || acceptInvitation.isPending}
        >
          {acceptInvitation.isPending ? (
            <Spinner className="text-primary-foreground" size={16} />
          ) : (
            <Icons.Check className="text-primary-foreground" size={16} />
          )}
          <Text>{t("accept")}</Text>
        </Button>
      </View>
      <Link
        href={pathsConfig.index}
        className="text-muted-foreground self-center font-sans text-sm font-medium underline underline-offset-4"
      >
        {t("invitations.invitation.skip")}
      </Link>
    </AuthLayout>
  );
};
