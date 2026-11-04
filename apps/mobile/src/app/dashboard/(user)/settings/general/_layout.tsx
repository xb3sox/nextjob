import { router, Stack } from "expo-router";

import { useTranslation } from "@workspace/i18n";
import { isKey } from "@workspace/i18n";
import { capitalize } from "@workspace/shared/utils";

import { BaseHeader } from "~/modules/common/layout/header";

export const unstable_settings = {
  anchor: "index",
};

export default function GeneralLayout() {
  const { t, i18n } = useTranslation("common");

  return (
    <Stack
      screenOptions={({ route }) => {
        const name = route.name === "index" ? "general" : route.name;

        return {
          header: () => (
            <BaseHeader
              title={isKey(name, i18n, "common") ? t(name) : capitalize(name)}
              {...(router.canGoBack() && {
                onBack: () => router.back(),
              })}
            />
          ),
          animation: "fade",
          animationDuration: 200,
        };
      }}
    />
  );
}
