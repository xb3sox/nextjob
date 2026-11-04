import { defineCollection } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";
import * as z from "zod";

import { ContentStatus } from "../../types";
import { getLastModifiedAt } from "../../utils";

const contentDirectory = "src/collections/legal/content";

export const legal = defineCollection({
  name: "legal",
  directory: contentDirectory,
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(ContentStatus),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm],
    });
    const lastModifiedAt = await context.cache(
      document._meta.filePath,
      (filePath) => getLastModifiedAt(filePath, contentDirectory),
    );

    return {
      ...document,
      mdx,
      lastModifiedAt,
      slug: document._meta.directory,
      locale: document._meta.fileName.split(".")[0],
    };
  },
});
