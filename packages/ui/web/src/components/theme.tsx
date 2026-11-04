"use client";

import * as React from "react";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";

import {
  ThemeColor,
  ThemeFont,
  ThemeMode,
  ThemeRadius,
  cn,
} from "@workspace/ui";

import { Button } from "#components/button";
import { Icons } from "#components/icons";
import { Label } from "#components/label";
import { Slider } from "#components/slider";
import { useThemeKeyboardShortcut } from "#hooks/use-theme-keyboard-shortcut";

import type { ThemeConfig } from "@workspace/ui";

interface ThemeCustomizerProps {
  readonly config: ThemeConfig;
  readonly defaultConfig?: ThemeConfig;
  readonly onChange: (config: ThemeConfig) => void;
}

const getResolvedThemeMode = (mode: ThemeMode) => {
  if (mode === ThemeMode.SYSTEM) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? ThemeMode.DARK
      : ThemeMode.LIGHT;
  }

  return mode;
};

export const useThemeModeShortcut = (
  config: ThemeConfig,
  onChange: (config: ThemeConfig) => void,
) => {
  const toggleMode = useCallback(() => {
    const resolvedMode = getResolvedThemeMode(config.mode);

    onChange({
      ...config,
      mode: resolvedMode === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK,
    });
  }, [config, onChange]);

  useThemeKeyboardShortcut(toggleMode);
};

const MODE_ICONS = {
  [ThemeMode.LIGHT]: Icons.Sun,
  [ThemeMode.DARK]: Icons.Moon,
  [ThemeMode.SYSTEM]: Icons.SunMoon,
} as const;

const getRadiusIndex = (radius: ThemeRadius | undefined) => {
  const index = Object.values(ThemeRadius).indexOf(
    radius ?? ThemeRadius.MEDIUM,
  );

  return index === -1
    ? Object.values(ThemeRadius).indexOf(ThemeRadius.MEDIUM)
    : index;
};

export const ThemeCustomizer = memo<ThemeCustomizerProps>(
  ({ config, onChange }) => {
    const { t } = useTranslation("common");
    const radius = config.radius ?? ThemeRadius.MEDIUM;
    const radiusIndex = getRadiusIndex(radius);

    return (
      <div className="flex flex-1 flex-col items-center space-y-4 md:space-y-6">
        <div className="w-full space-y-1.5">
          <Label className="text-xs">{t("theme.color.label")}</Label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(ThemeColor).map((color) => {
              const isActive = config.color === color;

              return (
                <Button
                  variant="outline"
                  size="sm"
                  key={color}
                  onClick={() => onChange({ ...config, color })}
                  className={cn(
                    "justify-start gap-2 text-xs capitalize",
                    isActive && "border-primary dark:border-primary border-2",
                  )}
                  data-theme={color}
                >
                  <span className="bg-primary flex size-4 shrink-0 items-center justify-center rounded-full"></span>
                  {t(`theme.color.${color}`)}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="w-full space-y-1.5">
          <Label className="text-xs">{t("theme.mode.label")}</Label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(ThemeMode).map((mode) => {
              const isActive = config.mode === mode;
              const Icon = MODE_ICONS[mode];

              return (
                <Button
                  variant="outline"
                  key={mode}
                  size="sm"
                  onClick={() => onChange({ ...config, mode })}
                  className={cn(
                    "justify-start gap-2 text-xs capitalize",
                    isActive && "border-primary dark:border-primary border-2",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {t(`theme.mode.${mode}`)}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="w-full space-y-3">
          <Label className="text-xs">{t("theme.radius.label")}</Label>
          <Slider
            min={0}
            max={Object.values(ThemeRadius).length - 1}
            step={1}
            value={[radiusIndex]}
            onValueChange={(value) => {
              const nextIndex = Array.isArray(value) ? value[0] : value;
              const nextRadius = Object.values(ThemeRadius)[Number(nextIndex)];

              if (nextRadius) {
                onChange({ ...config, radius: nextRadius });
              }
            }}
          />
        </div>
        <div className="w-full space-y-1.5">
          <Label className="text-xs">{t("theme.font.label")}</Label>
          <div className="flex gap-2">
            {Object.values(ThemeFont).map((font) => {
              const isActive = config.font === font;
              return (
                <Button
                  variant="outline"
                  size="sm"
                  key={font}
                  onClick={() => onChange({ ...config, font })}
                  className={cn(
                    "flex-1 gap-2 text-xs capitalize",
                    isActive && "border-primary dark:border-primary border-2",
                  )}
                  style={{
                    fontFamily:
                      font === ThemeFont.SANS
                        ? "Geist, sans-serif"
                        : `var(--font-${font})`,
                  }}
                >
                  <span className="text-base leading-none">{"Ag"}</span>
                  {t(`theme.font.${font}`)}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

ThemeCustomizer.displayName = "ThemeCustomizer";
