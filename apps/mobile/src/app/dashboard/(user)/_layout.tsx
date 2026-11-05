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
        name="jobs"
        activityEnabled
        disableAutomaticContentInsets
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: "briefcase", selected: "briefcase.fill" }}
          drawable="ic_menu_star"
        />
        <NativeTabs.Trigger.Label>Jobs</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="applications">
        <NativeTabs.Trigger.Icon
          sf={{ default: "doc.text", selected: "doc.text.fill" }}
          drawable="ic_menu_star"
        />
        <NativeTabs.Trigger.Label>Applications</NativeTabs.Trigger.Label>
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
