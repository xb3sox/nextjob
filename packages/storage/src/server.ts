import { strategy } from "./providers";

export const { getUploadUrl, getSignedUrl, getPublicUrl, getDeleteUrl } =
  strategy;

export * from "./lib/schema";
