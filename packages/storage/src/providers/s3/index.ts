import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as getSignedUrlCommand } from "@aws-sdk/s3-request-presigner";

import { env } from "./env";
import { s3 } from "./sdk";

import type { GetObjectUrlInput, GetUploadUrlInput } from "../../lib/schema";
import type { StorageProviderStrategy } from "../types";

export const strategy = {
  getUploadUrl: async ({
    path,
    contentType,
    contentLength,
  }: GetUploadUrlInput) => {
    const url = await getSignedUrlCommand(
      s3(),
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: path,
        ContentType: contentType,
        ContentLength: contentLength,
      }),
      {
        expiresIn: 60,
        // The presigner drops `content-type` from the signature unless it is
        // listed here, which would leave both the declared type and the size
        // unenforced and let the holder of the URL upload any payload.
        signableHeaders: new Set(["content-type", "content-length"]),
      },
    );

    return { url };
  },
  getSignedUrl: async ({ path }: GetObjectUrlInput) => {
    const url = await getSignedUrlCommand(
      s3(),
      new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: path,
      }),
      {
        expiresIn: 3600,
      },
    );

    return { url };
  },
  getPublicUrl: async ({ path }: GetObjectUrlInput) => {
    const bucket = env.S3_BUCKET;
    const endpoint = await s3().config.endpoint?.();

    if (endpoint?.hostname.includes("supabase.co")) {
      return {
        url: `${endpoint.protocol}//${endpoint.hostname}/storage/v1/object/public/${bucket}/${path}`,
      };
    }

    return {
      url: `${endpoint?.protocol}//${bucket}.${endpoint?.hostname}/${path}`,
    };
  },
  getDeleteUrl: async ({ path }: GetObjectUrlInput) => {
    const url = await getSignedUrlCommand(
      s3(),
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: path,
      }),
      {
        expiresIn: 60,
      },
    );

    return { url };
  },
} satisfies StorageProviderStrategy;
