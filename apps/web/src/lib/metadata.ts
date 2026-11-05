import { isKey } from "@workspace/i18n";

import { appConfig } from "~/config/app";
import { getTranslation } from "~/lib/i18n";

import type { TranslationKey } from "@workspace/i18n";
import type { Metadata, Viewport } from "next";

type OpenGraphType =
  | "article"
  | "book"
  | "music.song"
  | "music.album"
  | "music.playlist"
  | "music.radio_station"
  | "profile"
  | "website"
  | "video.tv_show"
  | "video.other"
  | "video.movie"
  | "video.episode";

interface SeoProps {
  readonly title?: TranslationKey | (string & Record<never, never>);
  readonly description?: TranslationKey | (string & Record<never, never>);
  readonly image?: string;
  readonly url?: string;
  readonly canonical?: string;
  readonly type?: OpenGraphType;
  readonly images?: {
    url: string;
    width: number;
    height: number;
    alt?: string;
  }[];
}

const SITE_NAME_SEPARATOR = " | ";
export const SITE_NAME_TEMPLATE = `%s${SITE_NAME_SEPARATOR}${appConfig.name}`;

export const resolveMetadataBase = (rawUrl?: string): URL => {
  if (!rawUrl?.trim()) return new URL("http://localhost:3000");
  try {
    const formatted =
      rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
        ? rawUrl
        : `https://${rawUrl}`;
    return new URL(formatted);
  } catch {
    return new URL("http://localhost:3000");
  }
};

const DEFAULT_IMAGE = {
  url: `${resolveMetadataBase(appConfig.url).origin}/opengraph-image.png`,
  width: 1200,
  height: 630,
  alt: appConfig.name,
};

export const getMetadata =
  (
    {
      title,
      description = "marketing:product.description",
      url,
      canonical,
      images = [DEFAULT_IMAGE],
      type = "website",
    } = {} as SeoProps,
  ) =>
  async ({
    params,
  }: {
    params?: Promise<{ locale: string }>;
  }): Promise<Metadata> => {
    const { t, i18n } = await getTranslation({
      locale: (await params)?.locale,
    });

    const common = {
      ...(title && {
        title: isKey(title, i18n) ? (t(title) as string) : title,
      }),
      description: isKey(description, i18n)
        ? (t(description) as string)
        : description,
    };

    return {
      metadataBase: resolveMetadataBase(appConfig.url),
      ...common,
      openGraph: {
        ...common,
        url: url ?? canonical ?? appConfig.url,
        siteName: appConfig.name,
        type,
        images,
      },
      ...(canonical && {
        alternates: {
          canonical,
        },
      }),
      twitter: {
        card: "summary_large_image" as const,
        images,
      },
    };
  };

export const DEFAULT_METADATA: Metadata = {
  ...(await getMetadata()({
    params: Promise.resolve({ locale: appConfig.locale }),
  })),
  title: {
    template: SITE_NAME_TEMPLATE,
    default: appConfig.name,
  },
  metadataBase: resolveMetadataBase(appConfig.url),
};

export const DEFAULT_VIEWPORT: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
};
