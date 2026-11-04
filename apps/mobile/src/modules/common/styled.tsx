import { BlurView as NativeBlurView } from "expo-blur";
import { GlassView as NativeGlassView } from "expo-glass-effect";
import { Link as NativeLink } from "expo-router";
import { View } from "react-native";
import { ScrollView as NativeScrollView } from "react-native-gesture-handler";
import { KeyboardAvoidingView as NativeKeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView as NativeSafeAreaView } from "react-native-safe-area-context";
import { SafeAreaView as NativeTabSafeAreaView } from "react-native-screens/experimental";
import { withUniwind } from "uniwind";

import { cn } from "@workspace/ui";

import type { ComponentProps } from "react";

export const KeyboardAvoidingView = withUniwind(NativeKeyboardAvoidingView);
export const Link = withUniwind(NativeLink);
export const ScrollView = withUniwind(NativeScrollView);
export const SafeAreaView = withUniwind(NativeSafeAreaView);
export const BlurView = withUniwind(NativeBlurView);
export const GlassView = withUniwind(NativeGlassView);

const UniwindTabSafeAreaView = withUniwind(NativeTabSafeAreaView);

export function TabSafeAreaView({
  className,
  ...props
}: ComponentProps<typeof UniwindTabSafeAreaView>) {
  return (
    <View className="bg-background flex-1">
      <UniwindTabSafeAreaView className={cn("flex-1", className)} {...props} />
    </View>
  );
}
