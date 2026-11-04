import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo } from "react";
import { useColorScheme } from "react-native";
import { Uniwind } from "uniwind";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { captureException } from "@workspace/monitoring-mobile";
import { logger } from "@workspace/shared/logger";
import {
  THEME_RADIUS_VALUES,
  ThemeFont,
  ThemeMode,
  ThemeRadius,
  themes,
} from "@workspace/ui";

import { appConfig } from "~/config/app";

import type { ColorVariable, ThemeConfig } from "@workspace/ui";

const REM_BASE = 16;

const FONTS = {
  [ThemeFont.SANS]: "Geist",
  [ThemeFont.SERIF]: "Source Serif 4",
  [ThemeFont.MONO]: "Geist Mono",
};

const getPixelFromRem = (value: string) => {
  return parseFloat(value) * REM_BASE;
};

const useThemeConfig = create<{
  config: ThemeConfig;
  setConfig: (config: ThemeConfig) => void;
}>()(
  persist(
    (set) => ({
      config: appConfig.theme,
      setConfig: (config) => set({ config }),
    }),
    {
      name: "theme-config",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const { config, setConfig } = useThemeConfig();

  const isDark = useMemo(
    () =>
      config.mode === ThemeMode.DARK ||
      (config.mode === ThemeMode.SYSTEM && colorScheme === ThemeMode.DARK),
    [config.mode, colorScheme],
  );

  const resolvedTheme = useMemo(
    () => (isDark ? ThemeMode.DARK : ThemeMode.LIGHT),
    [isDark],
  );

  const updateTheme = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!config) {
      return;
    }

    try {
      Uniwind.setTheme(config.mode);

      const colors = themes[config.color][resolvedTheme];
      const radius = getPixelFromRem(
        THEME_RADIUS_VALUES[config.radius ?? ThemeRadius.MEDIUM],
      );
      const sharedVariables = {
        "--radius": radius,
        "--font-sans": FONTS[config.font],
        "--font-serif": FONTS[ThemeFont.SERIF],
        "--font-mono": FONTS[ThemeFont.MONO],
      };

      Uniwind.updateCSSVariables(ThemeMode.LIGHT, sharedVariables);
      Uniwind.updateCSSVariables(ThemeMode.DARK, sharedVariables);

      Uniwind.updateCSSVariables(resolvedTheme, {
        ...Object.entries(colors).reduce(
          (acc, [key, value]: [string, ColorVariable]) => {
            const [l, c, h, a] = value;
            acc[`--${key}`] =
              a !== undefined
                ? `oklch(${l} ${c} ${h} / ${a * 100}%)`
                : `oklch(${l} ${c} ${h})`;
            return acc;
          },
          {} as Record<string, string>,
        ),
        ...sharedVariables,
      });
    } catch (error) {
      logger.error(error);
      captureException(error);
    }
  }, [resolvedTheme, config]);

  useEffect(() => {
    updateTheme();
  }, [updateTheme]);

  return {
    config,
    setConfig,
    resolvedTheme,
  };
};
