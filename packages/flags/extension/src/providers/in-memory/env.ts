import { defineEnv } from "envin";

import { envConfig } from "@workspace/shared/constants";

import type { Preset } from "envin/types";

export const preset = {
  id: "in-memory",
} as const satisfies Preset;

export const env = defineEnv({
  ...envConfig,
  ...preset,
  env: {},
  skip:
    (!!import.meta.env.SKIP_ENV_VALIDATION &&
      ["1", "true"].includes(import.meta.env.SKIP_ENV_VALIDATION)) ||
    ["lint", "postinstall"].includes(import.meta.env.npm_lifecycle_event),
});
