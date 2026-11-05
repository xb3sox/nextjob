import { describe, expect, it } from "vitest";

import { ImageContentType } from "@workspace/shared/constants";

import {
  AVATAR_PATH_PREFIX,
  createAvatarPath,
  getAvatarPath,
  isOwnedAvatarPath,
} from "../avatar";

describe("avatar lib security checks", () => {
  const ownerId = "usr_12345";

  describe("createAvatarPath", () => {
    it("creates a path within the owner's dedicated directory", () => {
      const path = createAvatarPath({
        ownerId,
        contentType: ImageContentType.PNG,
      });

      expect(path.startsWith(`${AVATAR_PATH_PREFIX}/${ownerId}/`)).toBe(true);
      expect(path.endsWith(".png")).toBe(true);
    });
  });

  describe("isOwnedAvatarPath", () => {
    it("returns true for paths inside the owner directory", () => {
      const validPath = `${AVATAR_PATH_PREFIX}/${ownerId}/avatar.png`;
      expect(isOwnedAvatarPath({ path: validPath, ownerId })).toBe(true);
    });

    it("rejects path with prefix confusion (same prefix without boundary slash)", () => {
      // Security test: an attacker with ownerId 'usr_12' or 'usr_12345-other'
      const maliciousPath = `${AVATAR_PATH_PREFIX}/${ownerId}-malicious/avatar.png`;
      expect(isOwnedAvatarPath({ path: maliciousPath, ownerId })).toBe(false);

      const adjacentOwnerPath = `${AVATAR_PATH_PREFIX}/${ownerId}6789/avatar.png`;
      expect(isOwnedAvatarPath({ path: adjacentOwnerPath, ownerId })).toBe(
        false,
      );
    });

    it("rejects paths for different owners", () => {
      const otherOwnerPath = `${AVATAR_PATH_PREFIX}/other_user/avatar.png`;
      expect(isOwnedAvatarPath({ path: otherOwnerPath, ownerId })).toBe(false);
    });

    it("returns false for empty or missing inputs", () => {
      expect(isOwnedAvatarPath({ path: "", ownerId })).toBe(false);
      expect(
        isOwnedAvatarPath({
          path: "avatars/usr_12345/avatar.png",
          ownerId: "",
        }),
      ).toBe(false);
    });
  });

  describe("getAvatarPath", () => {
    it("extracts and validates owner path from full avatar URL", () => {
      const url = `https://storage.example.com/${AVATAR_PATH_PREFIX}/${ownerId}/avatar.png?token=secret`;
      const extracted = getAvatarPath({ avatar: url, ownerId });
      expect(extracted).toBe(`${AVATAR_PATH_PREFIX}/${ownerId}/avatar.png`);
    });

    it("returns null when URL avatar path does not belong to owner", () => {
      const url = `https://storage.example.com/${AVATAR_PATH_PREFIX}/other_owner/avatar.png`;
      expect(getAvatarPath({ avatar: url, ownerId })).toBeNull();
    });

    it("returns null for malformed or prefix-confused URLs", () => {
      const url = `https://storage.example.com/${AVATAR_PATH_PREFIX}/${ownerId}-other/avatar.png`;
      expect(getAvatarPath({ avatar: url, ownerId })).toBeNull();
    });

    it("returns null for null or missing avatar", () => {
      expect(getAvatarPath({ avatar: null, ownerId })).toBeNull();
      expect(getAvatarPath({ avatar: undefined, ownerId })).toBeNull();
    });
  });
});
