import { Hono } from "hono";
import * as z from "zod";

import { auth } from "@workspace/auth/server";
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
import { enforceAuth, validate } from "../../middleware";
import { getSession, getSessions } from "./queries";

export const userRouter = new Hono()
  .use(enforceAuth)
  .get("/sessions", async (c) => {
    c.header("Cache-Control", "no-store");
    return c.json(await getSessions(c.var.user.id));
  })
  .post(
    "/sessions/:id/revoke",
    validate("param", z.object({ id: z.string().min(1) })),
    async (c) => {
      const [session] = await getSession({
        id: c.req.valid("param").id,
        userId: c.var.user.id,
      });

      if (!session) {
        throw new HttpException(HttpStatusCode.NOT_FOUND, {
          code: "error.notFound",
        });
      }

      return c.json(
        await auth.api.revokeSession({
          headers: c.req.raw.headers,
          body: { token: session.token },
        }),
      );
    },
  )
  .post("/avatar", validate("json", uploadAvatarSchema), async (c) => {
    const { contentType, contentLength } = c.req.valid("json");
    const path = createAvatarPath({ ownerId: c.var.user.id, contentType });

    const [{ url: uploadUrl }, { url: publicUrl }] = await Promise.all([
      getUploadUrl({ path, contentType, contentLength }),
      getPublicUrl({ path }),
    ]);

    return c.json({ uploadUrl, publicUrl, path });
  })
  .delete("/avatar", validate("query", getObjectUrlSchema), async (c) => {
    const { path } = c.req.valid("query");

    if (!isOwnedAvatarPath({ path, ownerId: c.var.user.id })) {
      throw new HttpException(HttpStatusCode.FORBIDDEN, {
        code: "error.forbidden",
      });
    }

    return c.json(await getDeleteUrl({ path }));
  });
