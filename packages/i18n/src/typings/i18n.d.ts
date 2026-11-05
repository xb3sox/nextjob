import "i18next";
import type { config } from "../config";
import type { en } from "../translations/en";

type ExtractDefault<T> = T extends () => Promise<infer R>
  ? R extends { default: infer D }
    ? D
    : never
  : never;

type Translation = typeof en;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof config.namespaces;
    resources: {
      [K in keyof Translation]: ExtractDefault<Translation[K]>;
    };
  }
}
