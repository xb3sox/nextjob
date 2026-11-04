import { NativeTabs } from "expo-router/native-tabs";

import { useTranslation } from "@workspace/i18n";

import { useTabsTheme } from "~/modules/common/hooks/use-tabs-theme";

export const unstable_settings = {
  anchor: "index",
};

export default function OrganizationLayout() {
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

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          drawable="ic_settings"
        />
        <NativeTabs.Trigger.Label>{t("settings")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="members" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon
          sf={{ default: "person.2", selected: "person.2.fill" }}
          drawable="ic_menu_friendslist"
        />
        <NativeTabs.Trigger.Label>{t("members")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
