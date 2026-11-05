import { hc } from "hono/client";

import { Platform } from "@workspace/shared/constants";

import { getApiBaseUrl } from "~/config/app";

import type { AppRouter } from "@workspace/api";

export { getApiBaseUrl };

export const getBaseUrl = () => {
  return getApiBaseUrl();
};

export const { api } = hc<AppRouter>(getBaseUrl(), {
  headers: {
    "x-client-platform": Platform.EXTENSION,
  },
});
