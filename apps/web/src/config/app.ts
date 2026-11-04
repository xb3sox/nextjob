import { ThemeFont, ThemeRadius } from "@workspace/ui";

import env from "../../env.config";
import { version } from "../../package.json";

export const appConfig = {
  name: env.NEXT_PUBLIC_PRODUCT_NAME,
  url: env.NEXT_PUBLIC_URL,
  locale: env.NEXT_PUBLIC_DEFAULT_LOCALE,
  version,
  theme: {
    mode: env.NEXT_PUBLIC_THEME_MODE,
    color: env.NEXT_PUBLIC_THEME_COLOR,
    radius: ThemeRadius.MEDIUM,
    font: ThemeFont.SANS,
  },
} as const;
