import { defineEnv } from "envin";
import * as z from "zod";

import { envConfig } from "@workspace/shared/constants";

import type { Preset } from "envin/types";

export const preset = {
  id: "growthbook",
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY: z.string(),
    NEXT_PUBLIC_GROWTHBOOK_API_HOST: z
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
    NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY:
      process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY,
    NEXT_PUBLIC_GROWTHBOOK_API_HOST:
      process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST,
  },
});
