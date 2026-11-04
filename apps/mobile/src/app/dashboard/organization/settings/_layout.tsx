import { Stack } from "expo-router";

export const unstable_settings = {
  anchor: "index",
};

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "fade",
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="organization" options={{ headerShown: false }} />
    </Stack>
  );
}
