import { locale } from "next/root-params";

import { getTranslation as getServerTranslation } from "@workspace/i18n/server";

import { appConfig } from "~/config/app";

import type { Namespace } from "i18next";

export const getLocale = async () => {
  return (await locale()) ?? appConfig.locale;
};

export const getTranslation = async <T extends Namespace>({
  locale: passedLocale,
  ns,
}: {
  locale?: string;
  ns?: T;
} = {}) => {
  return getServerTranslation({
    locale: passedLocale ?? (await getLocale()),
    ns,
  });
};
