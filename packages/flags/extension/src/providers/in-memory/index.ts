import { TypedInMemoryProvider } from "@openfeature/web-sdk";

import { inMemoryConfig, type FlagsClientStrategy } from "@workspace/flags";

export const strategy = {
  getProvider: () => new TypedInMemoryProvider(inMemoryConfig),
} satisfies FlagsClientStrategy;
