import { Hono } from "hono";
import { some } from "hono/combine";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger as loggerMiddleware } from "hono/logger";

import { auth } from "@workspace/auth/server";
import { Platform } from "@workspace/shared/constants";
import { logger } from "@workspace/shared/logger";
import { matchesPattern } from "@workspace/shared/utils";

import { localize, delay } from "./middleware";
import { adminRouter } from "./modules/admin/router";
import { aiRouter } from "./modules/ai/router";
import { authRouter } from "./modules/auth/router";
import { billingRouter } from "./modules/billing/router";
import { nextjobRouter } from "./modules/nextjob/router";
import { organizationRouter } from "./modules/organization/router";
import { userRouter } from "./modules/user/router";
import { monitor } from "./monitor";
import { onError } from "./utils/on-error";

import type { Context } from "hono";

const appRouter = new Hono()
  .basePath("/api")
  .use(
    some(
      (c: Context) =>
        !!c.req.header("x-client-platform")?.startsWith(Platform.MOBILE),
      csrf({
        origin: (origin, c) =>
          [...auth.options.trustedOrigins, new URL(c.req.url).origin].some(
            (trustedOrigin) => matchesPattern(origin, trustedOrigin),
          ),
      }),
    ),
  )
  .use(
    cors({
      origin: (origin) => {
        if (!origin) return null;
        const isTrusted = auth.options.trustedOrigins.some((trustedOrigin) =>
          matchesPattern(origin, trustedOrigin),
        );
        return isTrusted ? origin : null;
      },
      allowHeaders: ["Content-Type", "Authorization", "x-client-platform"],
      maxAge: 3600,
      credentials: true,
    }),
  )
  .get("/health", (c) =>
    c.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  )
  .use(loggerMiddleware((...args) => logger.info(...args)))
  .use(delay)
  .use(localize)
  .use(monitor.middleware)
  .route("/status", monitor.routes)
  .route("/admin", adminRouter)
  .route("/ai", aiRouter)
  .route("/auth", authRouter)
  .route("/billing", billingRouter)
  .route("/nextjob", nextjobRouter)
  .route("/organizations", organizationRouter)
  .route("/user", userRouter)
  .onError(onError);

type AppRouter = typeof appRouter;

export type { AppRouter };
export { appRouter };
