import { Hono } from "hono";
import * as z from "zod";

import { MemberRole } from "@workspace/auth";
import {
  canLeaveOrganization,
  getOrganizationsBlockingAccountDeletion,
} from "@workspace/auth/server";
import { HttpStatusCode } from "@workspace/shared/constants";
import { HttpException } from "@workspace/shared/utils";
import {
  getDeleteUrl,
  getPublicUrl,
  getUploadUrl,
  getObjectUrlSchema,
} from "@workspace/storage/server";

import {
  createAvatarPath,
  isOwnedAvatarPath,
  uploadAvatarSchema,
} from "../../lib/avatar";
import {
  enforceAuth,
  enforceMembership,
  enforceOrganizationPermission,
  validate,
} from "../../middleware";
import { getInvitationsInputSchema, getMembersInputSchema } from "../../schema";
import { generateSlug } from "./queries/generate-slug";
import { getInvitations } from "./queries/invitations";
import { getMembers } from "./queries/members";
import { getOrganizationForUser } from "./queries/organizations";

export const organizationRouter = new Hono()
  .use(enforceAuth)
  .get(
    "/slug",
    validate(
      "query",
      z.object({
        name: z.string(),
      }),
    ),
    async (c) => c.json(await generateSlug(c.req.valid("query").name)),
  )
  .get("/blocking-account-deletion", async (c) =>
    c.json(
      await getOrganizationsBlockingAccountDeletion({ userId: c.var.user.id }),
    ),
  )
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const organization = await getOrganizationForUser({
      id,
      userId: c.var.user.id,
      email: c.var.user.email,
      headers: c.req.raw.headers,
    });

    if (!organization) {
      throw new HttpException(HttpStatusCode.FORBIDDEN, {
        code: "error.forbidden",
      });
    }

    return c.json({ organization });
  })
  .post(
    "/:id/logo",
    (c, next) =>
      enforceOrganizationPermission({
        organizationId: c.req.param("id"),
        permissions: {
          organization: ["update"],
        },
      })(c, next),
    validate("json", uploadAvatarSchema),
    async (c) => {
      const { contentType, contentLength } = c.req.valid("json");
      const path = createAvatarPath({
        ownerId: c.req.param("id"),
        contentType,
      });

      const [{ url: uploadUrl }, { url: publicUrl }] = await Promise.all([
        getUploadUrl({ path, contentType, contentLength }),
        getPublicUrl({ path }),
      ]);

      return c.json({ uploadUrl, publicUrl, path });
    },
  )
  .delete(
    "/:id/logo",
    (c, next) =>
      enforceOrganizationPermission({
        organizationId: c.req.param("id"),
        permissions: {
          organization: ["update"],
        },
      })(c, next),
    validate("query", getObjectUrlSchema),
    async (c) => {
      const organizationId = c.req.param("id");
      const { path } = c.req.valid("query");

      if (!isOwnedAvatarPath({ path, ownerId: organizationId })) {
        throw new HttpException(HttpStatusCode.FORBIDDEN, {
          code: "error.forbidden",
        });
      }

      return c.json(await getDeleteUrl({ path }));
    },
  )
  .get(
    "/:id/members",
    validate("query", getMembersInputSchema),
    (c, next) =>
      enforceMembership({ organizationId: c.req.param("id") })(c, next),
    async (c) =>
      c.json(
        await getMembers({
          organizationId: c.req.param("id"),
          ...c.req.valid("query"),
        }),
      ),
  )

  .get(
    "/:id/invitations",
    validate("query", getInvitationsInputSchema),
    (c, next) =>
      enforceMembership({ organizationId: c.req.param("id") })(c, next),
    async (c) =>
      c.json(
        await getInvitations({
          organizationId: c.req.param("id"),
          ...c.req.valid("query"),
        }),
      ),
  )
  .get(
    "/:id/can-leave",
    (c, next) =>
      enforceMembership({
        organizationId: c.req.param("id"),
        role: MemberRole.OWNER,
      })(c, next),
    async (c) =>
      c.json({
        allowed: await canLeaveOrganization({
          organizationId: c.req.param("id"),
          userId: c.var.user.id,
        }),
      }),
  );
