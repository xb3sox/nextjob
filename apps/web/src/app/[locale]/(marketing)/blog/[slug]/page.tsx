import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  CollectionType,
  getContentItemBySlug,
  getContentItems,
} from "@workspace/cms";
import { badgeVariants } from "@workspace/ui-web/badge";

import { appConfig } from "~/config/app";
import { BLOG_PREFIX, pathsConfig } from "~/config/paths";
import { getTranslation } from "~/lib/i18n";
import { getMetadata } from "~/lib/metadata";
import { Mdx } from "~/modules/common/mdx";
import { TurboLink } from "~/modules/common/turbo-link";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "~/modules/marketing/layout/section";

dayjs.extend(duration);

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const item = getContentItemBySlug({
    collection: CollectionType.BLOG,
    slug,
    locale,
  });

  if (!item) {
    return notFound();
  }

  const { t } = await getTranslation({ ns: "marketing", locale });
  const pageUrl = new URL(
    pathsConfig.marketing.blog.post(item.slug),
    appConfig.url,
  ).toString();

  return (
    <Section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: item.title,
            description: item.description,
            image: item.thumbnail,
            publisher: {
              "@type": "Organization",
              name: appConfig.name,
              logo: {
                "@type": "ImageObject",
                url: `${appConfig.url}/icon.svg`,
              },
            },
            datePublished: item.publishedAt.toISOString(),
            dateModified: item.lastModifiedAt,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": pageUrl,
            },
          }).replaceAll("<", "\\u003c"),
        }}
      />
      <SectionHeader className="max-w-3xl">
        <div className="mr-auto flex flex-wrap gap-1 md:gap-1.5">
          {item.tags.map((tag) => (
            <TurboLink
              key={tag}
              href={`${BLOG_PREFIX}?tag=${tag}`}
              className={badgeVariants({ variant: "outline" })}
            >
              {t(`blog.tag.${tag}`)}
            </TurboLink>
          ))}
        </div>
        <SectionTitle as="h1" className="mt-2 text-left">
          {item.title}
        </SectionTitle>
        <div className="text-muted-foreground mr-auto flex flex-wrap items-center gap-1.5">
          <time
            className="text-muted-foreground"
            dateTime={item.publishedAt.toISOString()}
          >
            {dayjs(item.publishedAt).format("MMMM D, YYYY")}
          </time>

          {item.timeToRead && <span>·</span>}
          {typeof item.timeToRead !== "undefined" && (
            <span>
              {t("blog.timeToRead", {
                time: Math.ceil(dayjs.duration(item.timeToRead).asMinutes()),
              })}
            </span>
          )}
        </div>

        <SectionDescription className="text-left">
          {item.description}
        </SectionDescription>

        <div className="relative -mx-2 mt-4 aspect-[12/8] w-[calc(100%+1rem)]">
          <Image
            alt=""
            fill
            src={item.thumbnail}
            className="rounded-lg object-cover"
          />
        </div>
      </SectionHeader>

      <Mdx mdx={item.mdx} />
    </Section>
  );
}

export function generateStaticParams() {
  return getContentItems({ collection: CollectionType.BLOG }).items.map(
    (post) => ({
      slug: post.slug,
    }),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const item = getContentItemBySlug({
    collection: CollectionType.BLOG,
    slug,
    locale,
  });

  if (!item) {
    return notFound();
  }

  return getMetadata({
    title: item.title,
    description: item.description,
    type: "article",
    canonical: pathsConfig.marketing.blog.post(item.slug),
    images: [
      {
        url: item.thumbnail,
        width: 1200,
        height: 800,
        alt: item.title,
      },
    ],
  })({ params });
}
