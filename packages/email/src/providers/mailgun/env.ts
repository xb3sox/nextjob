import { defineEnv } from "envin";
import * as z from "zod";

import { envConfig } from "@workspace/shared/constants";

import { sharedPreset } from "../../utils/env";

import type { Preset } from "envin/types";

export const preset = {
  id: "mailgun",
  server: {
    MAILGUN_API_KEY: z.string(),
    MAILGUN_DOMAIN: z.string(),
    MAILGUN_API_URL: z
      .string()
      .url()
      .optional()
      .default("https://api.mailgun.net"),
  },
  extends: [sharedPreset],
} as const satisfies Preset;

export const env = defineEnv({
  ...envConfig,
  ...preset,
});
