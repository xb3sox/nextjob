import type { ConfigContext, ExpoConfig } from "expo/config";

const SPLASH = {
  imageWidth: 150,
  image: "./public/images/splash/splash.png",
  dark: {
    image: "./public/images/splash/splash.png",
    backgroundColor: "#0D121C",
  },
} as const;

const FONTS = [
  {
    fontFamily: "Geist",
    path: "./public/fonts/Geist-Variable.ttf",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  {
    fontFamily: "Geist Mono",
    path: "./public/fonts/GeistMono-Variable.ttf",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  {
    fontFamily: "Source Serif 4",
    path: "./public/fonts/SourceSerif4-Variable.ttf",
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
  },
] as const;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "TurboStarter",
  slug: "turbostarter",
  scheme: "turbostarter",
  version: "1.8.0",
  orientation: "portrait",
  icon: "./public/images/icon/ios.png",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],
  platforms: ["ios", "android"],
  updates: {
    url: "https://u.expo.dev/a7958179-7450-4e6f-8791-da222215909e",
  },
  ios: {
    bundleIdentifier: "com.turbostarter.core",
    supportsTablet: true,
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.turbostarter.core",
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      monochromeImage: "./public/images/icon/android/monochrome.png",
      foregroundImage: "./public/images/icon/android/adaptive.png",
      backgroundColor: "#0D121C",
    },
  },
  extra: {
    eas: {
      projectId: "a7958179-7450-4e6f-8791-da222215909e",
    },
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
    autolinkingModuleResolution: true,
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  plugins: [
    "expo-router",
    "expo-status-bar",
    [
      "expo-font",
      {
        android: {
          fonts: FONTS.map(({ fontFamily, path, weights }) => ({
            fontFamily,
            path,
            fontDefinitions: weights.map((weight) => ({ weight })),
          })),
        },
        ios: {
          fonts: FONTS.map(({ path }) => path),
        },
      },
    ],
    "expo-image",
    "expo-secure-store",
    "expo-image-picker",
    [
      "expo-notifications",
      {
        icon: "./public/images/icon/android/notification.png",
        defaultChannel: "default",
        color: "#0D121C",
      },
    ],
    "expo-web-browser",
    "expo-apple-authentication",
    "@react-native-google-signin/google-signin",
    /* required to enable i18n */
    "expo-localization",
    [
      "expo-build-properties",
      {
        android: {
          /* https://github.com/expo/expo/issues/15761 */
          extraProguardRules: "-keep public class com.horcrux.svg.** {*;}",
          allowBackup: false,
          usesCleartextTraffic:
            process.env.EXPO_PUBLIC_SITE_URL?.startsWith("http://") ?? false,
        },
        ios: {
          /* https://github.com/react-native-google-signin/google-signin/issues/1517 */
          extraPods: [{ name: "AppCheckCore", version: "11.2.0" }],
        },
      },
    ],
    [
      "expo-tracking-transparency",
      {
        /* 🍎 Describe why you need access to the user's data */
        userTrackingPermission:
          "This identifier will be used to deliver personalized ads to you.",
      },
    ],
    ["expo-splash-screen", SPLASH],
  ],
});
