import { getPathname } from "@workspace/i18n";

import { appConfig } from "~/config/app";
import { pathsConfig } from "~/config/paths";
import { getTranslation } from "~/lib/i18n";

import type { MetadataRoute } from "next";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { t } = await getTranslation({ locale: appConfig.locale });
  const startUrl = getPathname({
    path: pathsConfig.index,
    locale: appConfig.locale,
    defaultLocale: appConfig.locale,
  });

  return {
    id: startUrl,
    name: appConfig.name,
    short_name: appConfig.name,
    description: t("marketing:product.description"),
    lang: appConfig.locale,
    dir: "ltr",
    start_url: startUrl,
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#F34904",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: t("common:goToDashboard"),
        short_name: t("common:dashboard"),
        url: pathsConfig.dashboard.user.index,
      },
    ],
  };
}
