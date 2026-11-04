import { GrowthbookClientProvider } from "@openfeature/growthbook-client-provider";

import { env } from "./env";

import type { FlagsClientStrategy } from "@workspace/flags";

export const strategy = {
  getProvider: () =>
    new GrowthbookClientProvider({
      apiHost: env.VITE_GROWTHBOOK_API_HOST,
      clientKey: env.VITE_GROWTHBOOK_CLIENT_KEY,
    }),
} satisfies FlagsClientStrategy;
