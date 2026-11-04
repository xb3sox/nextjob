import { Stack } from "expo-router";

export const unstable_settings = {
  anchor: "welcome",
};

export default function SetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 200,
      }}
    />
  );
}
