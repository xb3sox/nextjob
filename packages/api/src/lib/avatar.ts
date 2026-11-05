import * as z from "zod";

import {
  ImageContentType,
  ImageContentTypeExtension,
} from "@workspace/shared/constants";

export const MAX_AVATAR_SIZE_MB = 5;
export const MAX_AVATAR_SIZE = MAX_AVATAR_SIZE_MB * 1024 * 1024;

export const AVATAR_PATH_PREFIX = "avatars";

export const uploadAvatarSchema = z.object({
  contentType: z.enum(ImageContentType),
  contentLength: z.number().int().positive().max(MAX_AVATAR_SIZE),
});

export const createAvatarPath = ({
  ownerId,
  contentType,
}: {
  ownerId: string;
  contentType: ImageContentType;
}) => {
  const extension = ImageContentTypeExtension[contentType];

  return `${AVATAR_PATH_PREFIX}/${ownerId}/${crypto.randomUUID()}.${extension}`;
};

/**
 * Verifies that a storage path belongs strictly to the specified owner.
 * Security: strictly requires the path to be contained within the owner's isolated folder,
 * preventing cross-tenant path confusion or prefix collision attacks.
 */
export const isOwnedAvatarPath = ({
  path,
  ownerId,
}: {
  path: string;
  ownerId: string;
}) => {
  if (!ownerId || !path) {
    return false;
  }
  return path.startsWith(`${AVATAR_PATH_PREFIX}/${ownerId}/`);
};

export const getAvatarPath = ({
  avatar,
  ownerId,
}: {
  avatar: string | null | undefined;
  ownerId: string;
}) => {
  const index = avatar?.indexOf(`/${AVATAR_PATH_PREFIX}/`) ?? -1;

  if (!avatar || index === -1) {
    return null;
  }

  const [path] = avatar.slice(index + 1).split("?");

  return path && isOwnedAvatarPath({ path, ownerId }) ? path : null;
};
