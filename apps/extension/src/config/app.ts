import { ThemeFont, ThemeRadius } from "@workspace/ui";

import env from "../../env.config";
import { version } from "../../package.json";

export const appConfig = {
  name: env.VITE_PRODUCT_NAME,
  url: env.VITE_SITE_URL,
  locale: env.VITE_DEFAULT_LOCALE,
  version,
  theme: {
    mode: env.VITE_THEME_MODE,
    color: env.VITE_THEME_COLOR,
    radius: ThemeRadius.MEDIUM,
    font: ThemeFont.SANS,
  },
} as const;
