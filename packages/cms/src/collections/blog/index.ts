import { defineCollection } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypeShiki from "@shikijs/rehype";
import readingTime from "reading-time";
import remarkGfm from "remark-gfm";
import * as z from "zod";

import { ContentStatus, ContentTag } from "../../types";
import { getLastModifiedAt } from "../../utils";

const contentDirectory = "src/collections/blog/content";

export const blog = defineCollection({
  name: "blog",
  directory: contentDirectory,
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    thumbnail: z.string(),
    publishedAt: z.coerce.date(),
    tags: z.array(z.enum(ContentTag)),
    status: z.enum(ContentStatus),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        [
          rehypeShiki,
          {
            /* see https://shiki.matsu.io/themes for available themes */
            theme: "one-dark-pro",
          },
        ],
      ],
    });

    const lastModifiedAt = await context.cache(
      document._meta.filePath,
      (filePath) => getLastModifiedAt(filePath, contentDirectory),
    );

    const timeToRead = readingTime(document.content).time;

    return {
      ...document,
      mdx,
      lastModifiedAt,
      timeToRead,
      slug: document._meta.directory,
      locale: document._meta.fileName.split(".")[0],
    };
  },
});
