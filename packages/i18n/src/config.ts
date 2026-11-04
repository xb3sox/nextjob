import { logger } from "@workspace/shared/logger";

import { env } from "./env";

import type { InitOptions, Namespace } from "i18next";

export const config = {
  locales: ["en", "es", "ar"],
  defaultLocale: env.NEXT_PUBLIC_DEFAULT_LOCALE,
  namespaces: [
    "common",
    "admin",
    "organization",
    "dashboard",
    "auth",
    "billing",
    "marketing",
  ],
  cookie: "locale",
} as const;

export const isRTL = (locale?: string): boolean => {
  return Boolean(locale && locale.toLowerCase().startsWith("ar"));
};

export const getLanguageDirection = (locale?: string): "rtl" | "ltr" => {
  return isRTL(locale) ? "rtl" : "ltr";
};

export const getInitOptions = ({
  locale,
  defaultLocale,
  ns,
}: {
  locale?: string;
  defaultLocale?: string;
  ns?: Namespace;
}): InitOptions => ({
  supportedLngs: config.locales,
  fallbackLng: defaultLocale ?? config.defaultLocale,
  lng: locale,
  defaultNS: config.namespaces,
  fallbackNS: config.namespaces,
  ns: ns ?? config.namespaces,
  preload: false,
  interpolation: {
    escapeValue: false,
  },
  missingInterpolationHandler: (text, value, options) => {
    logger.debug(
      `Missing interpolation value for key: ${text}`,
      value,
      options,
    );
  },
});
