export const ImageContentType = {
  JPEG: "image/jpeg",
  JPG: "image/jpg",
  PNG: "image/png",
  WEBP: "image/webp",
} as const;

export type ImageContentType =
  (typeof ImageContentType)[keyof typeof ImageContentType];

export const ImageContentTypeExtension = {
  [ImageContentType.JPEG]: "jpg",
  [ImageContentType.JPG]: "jpg",
  [ImageContentType.PNG]: "png",
  [ImageContentType.WEBP]: "webp",
} as const;

export type ImageContentTypeExtension =
  (typeof ImageContentTypeExtension)[keyof typeof ImageContentTypeExtension];
