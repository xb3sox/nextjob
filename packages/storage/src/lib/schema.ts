import * as z from "zod";

export const storagePathSchema = z
  .string()
  .min(1)
  .refine(
    (path) =>
      !path.includes("..") && !path.startsWith("/") && !path.includes("\\"),
    { message: "Invalid path" },
  );

export const getObjectUrlSchema = z.object({
  path: storagePathSchema,
});

export const getUploadUrlSchema = getObjectUrlSchema.extend({
  contentType: z.string().min(1).max(255),
  contentLength: z.number().int().positive(),
});

export type GetObjectUrlInput = z.input<typeof getObjectUrlSchema>;
export type GetUploadUrlInput = z.input<typeof getUploadUrlSchema>;
