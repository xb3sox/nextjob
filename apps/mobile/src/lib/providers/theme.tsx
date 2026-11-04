import { NavigationBar } from "expo-navigation-bar";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { memo } from "react";
import { View } from "react-native";

import { ThemeMode } from "@workspace/ui";

import { useTheme } from "~/modules/common/hooks/use-theme";

interface ThemeProviderProps {
  readonly children: React.ReactNode;
}

export const ThemeProvider = memo<ThemeProviderProps>(({ children }) => {
  const { resolvedTheme } = useTheme();
  const barStyle =
    resolvedTheme === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK;

  return (
    <NavigationThemeProvider
      value={resolvedTheme === ThemeMode.DARK ? DarkTheme : DefaultTheme}
    >
      <View className="bg-background flex-1">{children}</View>
      <StatusBar style={barStyle} />
      <NavigationBar style={barStyle} />
    </NavigationThemeProvider>
  );
});

ThemeProvider.displayName = "ThemeProvider";
