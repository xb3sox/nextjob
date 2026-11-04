import * as z from "zod";

import { logger } from "@workspace/shared/logger";

import { config } from "../config";
import { translations } from "../translations";

import type { TranslationKey } from "../client";
import type {
  DefaultNamespace,
  Namespace,
  Resource,
  TOptions,
  i18n,
} from "i18next";

export const loadTranslation = async (
  locale: (typeof config.locales)[number],
  namespace: (typeof config.namespaces)[number],
) => {
  try {
    const data = await translations[locale][namespace]();

    return data.default;
  } catch {
    logger.error(`Error while loading i18n file: ${locale}/${namespace}.json`);

    return {};
  }
};

export const isKey = <T extends Namespace = DefaultNamespace>(
  key: string,
  i18n?: i18n,
  ns?: T,
  options?: TOptions,
): key is TranslationKey<T> => {
  return i18n?.exists(key, { ns, ...options }) ?? false;
};

export const isLocaleSupported = (
  locale: string,
): locale is (typeof config.locales)[number] => config.locales.includes(locale);

export const loadLocaleResources = async (
  locale: string,
): Promise<Resource> => {
  const language = isLocaleSupported(locale) ? locale : config.defaultLocale;

  const namespaces = await Promise.all(
    config.namespaces.map(async (namespace) => {
      const data = await loadTranslation(language, namespace);
      return [namespace, data] as const;
    }),
  );

  return {
    [language]: Object.fromEntries(namespaces),
  };
};

export const getValidationLocale = (locale?: string) => {
  if (locale && isLocaleSupported(locale)) {
    const localesMap = z.locales as Record<string, typeof z.locales.en>;
    return localesMap[locale] ?? z.locales.en;
  }
  return z.locales.en;
};

export const getPathname = ({
  locale,
  path,
  defaultLocale,
}: {
  locale: string;
  path: string;
  defaultLocale?: string;
}) => {
  const pathname = path.replace(
    new RegExp(`^/(${config.locales.join("|")})`),
    "",
  );

  if (locale === (defaultLocale ?? config.defaultLocale)) {
    return pathname.startsWith("/") ? pathname : `/${pathname}`;
  }

  return `/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
};
