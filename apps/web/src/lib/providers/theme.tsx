"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { memo, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ThemeFont, ThemeRadius, THEME_RADIUS_VALUES } from "@workspace/ui";

import { appConfig } from "~/config/app";

import type { ThemeConfig } from "@workspace/ui";

export const useThemeConfig = create<{
  config: Omit<ThemeConfig, "mode">;
  setConfig: (config: Omit<ThemeConfig, "mode">) => void;
}>()(
  persist(
    (set) => ({
      config: appConfig.theme,
      setConfig: (config) => set({ config }),
    }),
    {
      name: "theme-config",
    },
  ),
);

interface ThemeProviderProps {
  readonly children: React.ReactNode;
}

export const ThemeProvider = memo<ThemeProviderProps>(({ children }) => {
  const config = useThemeConfig((s) => s.config);

  useEffect(() => {
    document.documentElement.dataset.theme = config.color;
  }, [config.color]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--radius",
      THEME_RADIUS_VALUES[config.radius ?? ThemeRadius.MEDIUM],
    );
  }, [config.radius]);

  useEffect(() => {
    if (config.font === ThemeFont.SANS) {
      document.documentElement.style.removeProperty("--font-sans");
      return;
    }

    document.documentElement.style.setProperty(
      "--font-sans",
      `var(--font-${config.font})`,
    );
  }, [config.font]);

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme={appConfig.theme.mode}
      enableSystem
      disableTransitionOnChange
      // React 19 + next-themes: https://github.com/pacocoursey/next-themes/issues/387
      scriptProps={
        typeof window === "undefined"
          ? undefined
          : ({ type: "application/json" } as const)
      }
    >
      {children}
    </NextThemeProvider>
  );
});

ThemeProvider.displayName = "ThemeProvider";
