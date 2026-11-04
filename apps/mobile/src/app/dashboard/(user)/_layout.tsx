import { NativeTabs } from "expo-router/native-tabs";

import { useTranslation } from "@workspace/i18n";

import { useTabsTheme } from "~/modules/common/hooks/use-tabs-theme";

export const unstable_settings = {
  anchor: "index",
};

export default function UserLayout() {
  const { t } = useTranslation("common");
  const theme = useTabsTheme();

  return (
    <NativeTabs {...theme}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          drawable="ic_menu_home"
        />
        <NativeTabs.Trigger.Label>{t("home")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="ai"
        activityEnabled
        disableAutomaticContentInsets
      >
        <NativeTabs.Trigger.Icon sf="sparkles.2" drawable="ic_menu_star" />
        <NativeTabs.Trigger.Label>{t("ai")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          drawable="ic_settings"
        />
        <NativeTabs.Trigger.Label>{t("settings")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
