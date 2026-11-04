import { GrowthbookProvider } from "@openfeature/growthbook-provider";

import { env } from "./env";

import type { FlagsServerStrategy } from "@workspace/flags";

export const strategy = {
  getProvider: () =>
    new GrowthbookProvider({
      apiHost: env.NEXT_PUBLIC_GROWTHBOOK_API_HOST,
      clientKey: env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY,
    }),
} satisfies FlagsServerStrategy;
