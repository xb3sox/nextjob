import CloseIcon from "@expo/material-symbols/close.xml";
import SendIcon from "@expo/material-symbols/send.xml";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Alert, Pressable, View } from "react-native";

import { getAllRolesAtOrBelow, toMemberRole } from "@workspace/auth";
import { useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";
import { Badge } from "@workspace/ui-mobile/badge";
import {
  ContextMenu,
  type ContextMenuSection,
} from "@workspace/ui-mobile/context-menu";
import { Skeleton } from "@workspace/ui-mobile/skeleton";
import { Text } from "@workspace/ui-mobile/text";

import { authClient } from "~/lib/auth";
import { organization } from "~/modules/organization/lib/api";

import type { Invitation } from "@workspace/auth";

export const InvitationListItem = ({
  invitation,
}: {
  invitation: Invitation;
}) => {
  const { t, i18n } = useTranslation(["common", "organization"]);
  const queryClient = useQueryClient();
  const activeMember = authClient.useActiveMember();

  const resendInvitation = useMutation({
    ...organization.mutations.invitations.resend,
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        organization.queries.invitations.getAll({
          id: invitation.organizationId,
        }),
      );
      Alert.alert(t("invitations.resend.success"));
    },
  });

  const cancelInvitation = useMutation({
    ...organization.mutations.invitations.cancel,
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        organization.queries.invitations.getAll({
          id: invitation.organizationId,
        }),
      );
      Alert.alert(t("invitations.cancel.success"));
    },
  });

  const hasInvitePermission =
    authClient.organization.checkRolePermission({
      permissions: {
        invitation: ["create"],
      },
      role: toMemberRole(activeMember.data?.role),
    }) &&
    getAllRolesAtOrBelow(toMemberRole(activeMember.data?.role)).includes(
      invitation.role,
    );

  const hasCancelPermission =
    authClient.organization.checkRolePermission({
      permissions: {
        invitation: ["cancel"],
      },
      role: toMemberRole(activeMember.data?.role),
    }) &&
    getAllRolesAtOrBelow(toMemberRole(activeMember.data?.role)).includes(
      invitation.role,
    );

  const isResendPending =
    resendInvitation.isPending &&
    resendInvitation.variables.email === invitation.email &&
    resendInvitation.variables.organizationId === invitation.organizationId;

  const isCancelPending =
    cancelInvitation.isPending &&
    cancelInvitation.variables.invitationId === invitation.id;

  const sections: ContextMenuSection[] = [];

  if (hasInvitePermission) {
    sections.push([
      {
        title: t("resend"),
        icon: { ios: "arrow.clockwise", android: SendIcon },
        disabled: isResendPending,
        onPress: () => resendInvitation.mutate(invitation),
      },
    ]);
  }

  if (hasCancelPermission) {
    sections.push([
      {
        title: t("cancel"),
        icon: { ios: "xmark", android: CloseIcon },
        destructive: true,
        disabled: isCancelPending,
        onPress: () =>
          cancelInvitation.mutate({
            invitationId: invitation.id,
          }),
      },
    ]);
  }

  const isMenuDisabled = isResendPending || isCancelPending;

  return (
    <ContextMenu
      disabled={isMenuDisabled}
      fullWidth
      sections={sections}
      trigger={
        <Pressable
          className={cn(
            "active:bg-accent dark:active:bg-accent/50 bg-background w-full flex-row items-center gap-3 px-4 py-3",
            {
              "opacity-50": isMenuDisabled,
            },
          )}
          disabled={isMenuDisabled}
        >
          <View className="flex-1">
            <Text
              className="shrink text-sm leading-tight font-medium"
              numberOfLines={1}
            >
              {invitation.email}
            </Text>
            <Text
              className={cn("text-muted-foreground text-sm", {
                "text-destructive": dayjs(invitation.expiresAt).isBefore(
                  dayjs(),
                ),
              })}
              numberOfLines={1}
            >
              {dayjs().isAfter(invitation.expiresAt)
                ? t("expired")
                : t("expires")}{" "}
              {new Date(invitation.expiresAt).toLocaleString(i18n.language, {
                hour: "2-digit",
                minute: "2-digit",
                year: "numeric",
                month: "numeric",
                day: "2-digit",
              })}
            </Text>
          </View>
          <View className="ml-auto flex-row items-center gap-1">
            <Badge variant="secondary">
              <Text>{t(invitation.status)}</Text>
            </Badge>
            <Badge variant="outline">
              <Text>{t(invitation.role)}</Text>
            </Badge>
          </View>
        </Pressable>
      }
    />
  );
};

export const InvitationListItemSkeleton = () => {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <View className="flex-1 gap-1.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-4 w-40" />
      </View>
      <View className="ml-auto flex-row items-center gap-1">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-12" />
      </View>
    </View>
  );
};
