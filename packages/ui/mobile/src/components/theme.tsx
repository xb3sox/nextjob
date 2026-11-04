import { oklch, formatHex } from "culori";
import { memo } from "react";
import { FlatList, Platform, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { useTranslation } from "@workspace/i18n";
import {
  cn,
  ThemeColor,
  ThemeFont,
  ThemeMode,
  ThemeRadius,
  themes,
} from "@workspace/ui";

import { Button } from "./button";
import { Icons } from "./icons";
import { Label } from "./label";
import { Slider } from "./slider";
import { Text } from "./text";

import type { ThemeConfig } from "@workspace/ui";

interface ThemeCustomizerProps {
  readonly config: ThemeConfig;
  readonly onChange: (config: ThemeConfig) => void;
  readonly resolvedTheme: Exclude<ThemeMode, "system">;
}

export const MODE_ICONS = {
  [ThemeMode.LIGHT]: Icons.Sun,
  [ThemeMode.DARK]: Icons.Moon,
  [ThemeMode.SYSTEM]: Icons.SunMoon,
} as const;

const getRadiusIndex = (radius: ThemeRadius) => {
  const index = Object.values(ThemeRadius).indexOf(radius);

  return index === -1
    ? Object.values(ThemeRadius).indexOf(ThemeRadius.MEDIUM)
    : index;
};

interface ThemeFontOptionProps {
  readonly font: ThemeFont;
  readonly isActive: boolean;
  readonly onPress: () => void;
}

const ThemeFontOption = ({ font, isActive, onPress }: ThemeFontOptionProps) => {
  const { t } = useTranslation("common");
  const fontFamily = useCSSVariable(`--font-${font}`)?.toString() ?? "";

  return (
    <Button
      variant="outline"
      onPress={onPress}
      hitSlop={2}
      className={cn(
        "h-auto grow flex-row items-center justify-center gap-2 px-2 py-1 capitalize",
        isActive && "border-primary dark:border-primary border-2",
      )}
    >
      <Text className="text-lg" style={{ fontFamily }}>
        {"Ag"}
      </Text>
      <Text className="capitalize">{t(`theme.font.${font}`)}</Text>
    </Button>
  );
};

export const ThemeCustomizer = memo<ThemeCustomizerProps>(
  ({ config, onChange, resolvedTheme }) => {
    const { t } = useTranslation("common");
    const radius = config.radius ?? ThemeRadius.MEDIUM;
    const radiusIndex = getRadiusIndex(radius);

    return (
      <View className="mt-2 flex-1 items-center gap-4">
        <View className="w-full gap-1.5">
          <Label nativeID="color" className="text-xs">
            {t("theme.color.label")}
          </Label>
          <FlatList
            bounces={false}
            showsVerticalScrollIndicator={false}
            numColumns={3}
            data={Object.values(ThemeColor)}
            columnWrapperClassName="gap-2"
            contentContainerClassName="gap-2"
            renderItem={({ item }) => {
              const [l, c, h, alpha] = themes[item][resolvedTheme].primary;
              return (
                <Button
                  variant="outline"
                  key={item}
                  onPress={() => onChange({ ...config, color: item })}
                  hitSlop={2}
                  className={cn(
                    "grow basis-24 flex-row justify-start gap-2.5 px-3",
                    config.color === item &&
                      "border-primary dark:border-primary border-2",
                  )}
                >
                  <View
                    className="flex size-4.5 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: formatHex(
                        oklch({
                          mode: "oklch",
                          l,
                          c,
                          h,
                          alpha,
                        }),
                      ),
                    }}
                  />
                  <Text className="capitalize">{t(`theme.color.${item}`)}</Text>
                </Button>
              );
            }}
          />
        </View>
        <View className="w-full gap-1.5">
          <Label nativeID="mode" className="text-xs">
            {t("theme.mode.label")}
          </Label>
          <FlatList
            bounces={false}
            showsVerticalScrollIndicator={false}
            numColumns={3}
            data={Object.values(ThemeMode)}
            columnWrapperClassName="gap-2"
            contentContainerClassName="gap-2"
            renderItem={({ item }) => {
              const isActive = config.mode === item;
              const Icon = MODE_ICONS[item];

              return (
                <Button
                  variant="outline"
                  key={item}
                  onPress={() => onChange({ ...config, mode: item })}
                  hitSlop={2}
                  className={cn(
                    "grow basis-24 flex-row justify-start gap-2 px-3 capitalize",
                    isActive && "border-primary dark:border-primary border-2",
                  )}
                >
                  <Icon
                    className="text-foreground shrink-0"
                    width={18}
                    height={18}
                  />
                  <Text className="text-sm capitalize">
                    {t(`theme.mode.${item}`)}
                  </Text>
                </Button>
              );
            }}
          />
        </View>
        <View className="w-full">
          <Label nativeID="radius" className="text-xs">
            {t("theme.radius.label")}
          </Label>
          <Slider
            minimumValue={0}
            maximumValue={Object.values(ThemeRadius).length - 1}
            step={1}
            value={radiusIndex}
            onValueChange={(index: number) => {
              const nextRadius = Object.values(ThemeRadius)[Math.round(index)];

              if (nextRadius) {
                onChange({ ...config, radius: nextRadius });
              }
            }}
            className={cn({
              "-mx-4 mt-1": Platform.OS === "android",
            })}
            minimumTrackTintColorClassName="accent-primary"
            maximumTrackTintColorClassName="accent-primary/30"
            {...(Platform.OS === "android" && {
              thumbTintColorClassName: "accent-primary",
            })}
          />
        </View>
        <View className="w-full gap-1.5">
          <Label nativeID="font" className="text-xs">
            {t("theme.font.label")}
          </Label>
          <View className="flex-row gap-2">
            {Object.values(ThemeFont).map((item) => (
              <ThemeFontOption
                key={item}
                font={item}
                isActive={config.font === item}
                onPress={() => onChange({ ...config, font: item })}
              />
            ))}
          </View>
        </View>
      </View>
    );
  },
);

ThemeCustomizer.displayName = "ThemeCustomizer";
