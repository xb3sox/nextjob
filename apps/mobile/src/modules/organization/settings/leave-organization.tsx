import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";

import { MemberRole } from "@workspace/auth";
import { useTranslation } from "@workspace/i18n";
import { Icons } from "@workspace/ui-mobile/icons";
import { Text } from "@workspace/ui-mobile/text";

import { pathsConfig } from "~/config/paths";
import { authClient } from "~/lib/auth";
import { SettingsTile } from "~/modules/common/settings-tile";
import { Spinner } from "~/modules/common/spinner";
import { organization } from "~/modules/organization/lib/api";

export const LeaveOrganization = () => {
  const { t } = useTranslation(["common", "organization"]);
  const session = authClient.useSession();
  const activeOrganization = authClient.useActiveOrganization();
  const listOrganizations = authClient.useListOrganizations();
  const activeMember = authClient.useActiveMember();
  const isOwner = activeMember.data?.role === MemberRole.OWNER;

  const userId = session.data?.user.id;
  const canLeave = useQuery({
    ...organization.queries.canLeave({
      id: activeOrganization.data?.id ?? "",
      userId,
    }),
    enabled: isOwner && !!userId,
  });
  const canCurrentMemberLeave = !isOwner || canLeave.data?.allowed === true;

  const leaveOrganization = useMutation({
    ...organization.mutations.leave,
    onSuccess: async () => {
      await authClient.organization.setActive({ organizationId: null });
      await Promise.all([
        session.refetch(),
        activeOrganization.refetch(),
        listOrganizations.refetch(),
        activeMember.refetch(),
      ]);
      router.replace(pathsConfig.dashboard.user.index);
    },
  });

  if (!activeOrganization.data) {
    return null;
  }

  return (
    <>
      <SettingsTile
        icon={Icons.LogOut}
        destructive
        onPress={() => {
          if (!canCurrentMemberLeave) {
            Alert.alert(t("leave.title"), t("leave.cannotLeaveAsOnlyOwner"));
            return;
          }

          Alert.alert(t("leave.title"), t("leave.disclaimer"), [
            { text: t("cancel"), style: "cancel" },
            {
              text: t("leave.cta"),
              style: "destructive",
              onPress: () => {
                leaveOrganization.mutate({
                  organizationId: activeOrganization.data?.id ?? "",
                });
              },
            },
          ]);
        }}
      >
        <Text>{t("leave.title")}</Text>
      </SettingsTile>
      {leaveOrganization.isPending && <Spinner />}
    </>
  );
};
