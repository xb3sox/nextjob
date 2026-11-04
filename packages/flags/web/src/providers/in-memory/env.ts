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
});
