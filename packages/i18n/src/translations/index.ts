import { ar } from "./ar";
import { en } from "./en";
import { es } from "./es";

import type { config } from "../config";

export const translations: Record<
  (typeof config.locales)[number],
  typeof en & typeof es & typeof ar
> = {
  en,
  es,
  ar,
} as const;
