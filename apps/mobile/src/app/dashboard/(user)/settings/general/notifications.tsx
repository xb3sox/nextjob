import { useMutation } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Linking, View } from "react-native";

import { Trans, useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui-mobile/alert";
import { Button } from "@workspace/ui-mobile/button";
import { Icons } from "@workspace/ui-mobile/icons";
import { Switch } from "@workspace/ui-mobile/switch";
import { Text } from "@workspace/ui-mobile/text";

import { useNotificationsPermissions } from "~/modules/common/hooks/notifications/use-notifications-permissions";
import { usePushToken } from "~/modules/common/hooks/notifications/use-push-token";
import { useCopy } from "~/modules/common/hooks/use-copy";
import { ScrollView, TabSafeAreaView } from "~/modules/common/styled";

export default function NotificationsSettings() {
  const { t } = useTranslation(["dashboard", "common"]);
  const { copied, copy } = useCopy();

  const permissions = useNotificationsPermissions();
  const pushToken = usePushToken();

  const enable = useMutation({
    mutationFn: permissions.request,
  });

  const handleCheckedChange = async (checked: boolean) => {
    if (
      !checked ||
      permissions.status === Notifications.PermissionStatus.DENIED
    ) {
      await Linking.openSettings();
      return;
    }

    return enable.mutateAsync();
  };

  return (
    <TabSafeAreaView className="p-6" edges={{ bottom: true }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6"
        bounces={false}
      >
        <View className="gap-4">
          <View className="flex-row items-start justify-between gap-8">
            <View className="flex-1">
              <Text className="text-muted-foreground text-base font-medium">
                {t("notifications.description")}
              </Text>
            </View>

            <Switch
              checked={permissions.isGranted}
              disabled={enable.isPending || permissions.isLoading}
              onCheckedChange={handleCheckedChange}
            />
          </View>

          <Alert
            icon={permissions.isGranted ? Icons.BadgeCheck : Icons.Ban}
            variant={permissions.isGranted ? "success" : "default"}
          >
            <AlertTitle>
              {permissions.isGranted
                ? t("notifications.status.enabled")
                : t("notifications.status.disabled")}
            </AlertTitle>
            <AlertDescription>
              {permissions.status
                ? t("notifications.status.permissions", {
                    status: t(permissions.status),
                  })
                : t("notifications.status.unknown")}
            </AlertDescription>
          </Alert>
        </View>

        <View className="gap-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-medium">
              {t("notifications.token.title")}
            </Text>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => copy(pushToken.token ?? "")}
              disabled={copied || !pushToken.token}
              className="-mr-1 h-8"
            >
              {copied ? (
                <>
                  <Icons.Check className="text-foreground" size={12} />
                  <Text className="text-xs">{t("copied")}</Text>
                </>
              ) : (
                <>
                  <Icons.Copy className="text-foreground" size={12} />
                  <Text className="text-xs">{t("copy")}</Text>
                </>
              )}
            </Button>
          </View>
          <View className="border-border bg-muted/50 min-h-24 rounded-lg border border-dashed p-3">
            <Text
              className={cn("text-sm", {
                "text-muted-foreground": !pushToken.token,
              })}
            >
              {pushToken.token ?? t("notifications.token.placeholder")}
            </Text>
          </View>
        </View>

        <View className="-mt-2 gap-2">
          <Text className="text-muted-foreground text-sm">
            {t("notifications.note")}
          </Text>

          <Text className="text-muted-foreground text-sm">
            <Trans
              t={t}
              i18nKey="notifications.tool"
              components={{
                a: (
                  <Text
                    className="text-primary text-sm font-medium underline active:no-underline"
                    onPress={() =>
                      Linking.openURL("https://expo.dev/notifications")
                    }
                  />
                ),
              }}
            />
          </Text>

          <Text className="text-muted-foreground text-sm">
            <Trans
              t={t}
              i18nKey="notifications.docs"
              components={{
                a: (
                  <Text
                    className="text-primary text-sm font-medium underline active:no-underline"
                    onPress={() =>
                      Linking.openURL(
                        "https://www.turbostarter.dev/docs/mobile/push-notifications",
                      )
                    }
                  />
                ),
              }}
            />
          </Text>
        </View>
      </ScrollView>

      <Button
        className="mt-auto"
        size="lg"
        onPress={() =>
          Notifications.scheduleNotificationAsync({
            content: {
              title: t("notifications.notification.title"),
              body: t("notifications.notification.body"),
            },
            trigger: null,
          })
        }
        disabled={!permissions.isGranted}
      >
        <Icons.Bell className="text-primary-foreground" size={16} />
        <Text>{t("notifications.cta")}</Text>
      </Button>
    </TabSafeAreaView>
  );
}
