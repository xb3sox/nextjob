export const Locale = {
  EN: "en",
  ES: "es",
  AR: "ar",
} as const;

export type Locale = (typeof Locale)[keyof typeof Locale];

export const LocaleLabel: Record<Locale, string> = {
  [Locale.EN]: "English",
  [Locale.ES]: "Español",
  [Locale.AR]: "العربية",
} as const;

export type { TFunction } from "i18next";
