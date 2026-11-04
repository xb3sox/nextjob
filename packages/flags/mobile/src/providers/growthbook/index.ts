import { GrowthbookClientProvider } from "@openfeature/growthbook-client-provider";

import { env } from "./env";

import type { FlagsClientStrategy } from "@workspace/flags";

export const strategy = {
  getProvider: () =>
    new GrowthbookClientProvider({
      apiHost: env.EXPO_PUBLIC_GROWTHBOOK_API_HOST,
      clientKey: env.EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY,
    }),
} satisfies FlagsClientStrategy;
