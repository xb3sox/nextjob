import { TypedInMemoryProvider } from "@openfeature/server-sdk";

import { inMemoryConfig, type FlagsServerStrategy } from "@workspace/flags";

export const strategy = {
  getProvider: () => new TypedInMemoryProvider(inMemoryConfig),
} satisfies FlagsServerStrategy;
