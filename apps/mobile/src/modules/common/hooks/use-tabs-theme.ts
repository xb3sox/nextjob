import { useCSSVariable } from "uniwind";

import type { NativeTabsProps } from "expo-router/native-tabs";

export const useTabsTheme = () => {
  const [primary, mutedForeground, background, muted] = useCSSVariable([
    "--primary",
    "--muted-foreground",
    "--background",
    "--muted",
  ]).map((value) => value?.toString());

  return {
    tintColor: primary,
    backgroundColor: background,
    indicatorColor: muted,
    iconColor: {
      default: mutedForeground,
      selected: primary,
    },
    labelStyle: {
      default: { color: mutedForeground },
      selected: { color: primary },
    },
  } satisfies Partial<NativeTabsProps>;
};
