import { defineEnv } from "envin";
import * as z from "zod";

import { envConfig } from "@workspace/shared/constants";

import type { Preset } from "envin/types";

export const preset = {
  id: "growthbook",
  clientPrefix: "VITE_",
  client: {
    VITE_GROWTHBOOK_CLIENT_KEY: z.string(),
    VITE_GROWTHBOOK_API_HOST: z
      .string()
      .optional()
      .default("https://cdn.growthbook.io"),
  },
} as const satisfies Preset;

export const env = defineEnv({
  ...envConfig,
  ...preset,
  env: {
    VITE_GROWTHBOOK_CLIENT_KEY: import.meta.env.VITE_GROWTHBOOK_CLIENT_KEY,
    VITE_GROWTHBOOK_API_HOST: import.meta.env.VITE_GROWTHBOOK_API_HOST,
  },
  skip:
    (!!import.meta.env.SKIP_ENV_VALIDATION &&
      ["1", "true"].includes(import.meta.env.SKIP_ENV_VALIDATION)) ||
    ["lint", "postinstall"].includes(import.meta.env.npm_lifecycle_event),
});
