import { defineEnv } from "envin";
import * as z from "zod";

import { envConfig } from "@workspace/shared/constants";

import type { Preset } from "envin/types";

export const preset = {
  id: "growthbook",
  clientPrefix: "EXPO_PUBLIC_",
  client: {
    EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY: z.string(),
    EXPO_PUBLIC_GROWTHBOOK_API_HOST: z
      .string()
      .optional()
      .default("https://cdn.growthbook.io"),
  },
} as const satisfies Preset;

export const env = defineEnv({
  ...envConfig,
  ...preset,
  env: {
    ...process.env,
    EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY:
      process.env.EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY,
    EXPO_PUBLIC_GROWTHBOOK_API_HOST:
      process.env.EXPO_PUBLIC_GROWTHBOOK_API_HOST,
  },
});
