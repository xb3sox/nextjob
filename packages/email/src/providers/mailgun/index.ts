import { logger } from "@workspace/shared/logger";

import { env } from "./env";

import type { EmailProviderStrategy } from "../types";

const from = env.EMAIL_FROM;
const apiUrl = env.MAILGUN_API_URL;

export const strategy = {
  send: async ({ to, subject, html, text }) => {
    const body = new URLSearchParams({
      from,
      to,
      subject,
      text,
    });

    if (html) {
      body.set("html", html);
    }

    const response = await fetch(
      `${apiUrl}/v3/${env.MAILGUN_DOMAIN}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${env.MAILGUN_API_KEY}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );

    if (!response.ok) {
      logger.error(await response.json());
      throw new Error("Could not send email!");
    }
  },
} satisfies EmailProviderStrategy;
