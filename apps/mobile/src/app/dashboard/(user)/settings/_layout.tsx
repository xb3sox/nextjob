import { router, Stack } from "expo-router";

import { useTranslation } from "@workspace/i18n";

import { BaseHeader } from "~/modules/common/layout/header";

export const unstable_settings = {
  anchor: "index",
};

export default function SettingsLayout() {
  const { t } = useTranslation("common");
  return (
    <Stack
      screenOptions={{
        animation: "fade",
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="general" options={{ headerShown: false }} />
      <Stack.Screen name="account" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />

      <Stack.Screen
        name="billing"
        options={{
          header: () => (
            <BaseHeader title={t("billing")} onBack={router.back} />
          ),
        }}
      />
    </Stack>
  );
}
