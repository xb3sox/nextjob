import { PostHogServerProvider } from "@posthog/openfeature-node-provider";
import { PostHog } from "posthog-node";

import { env } from "./env";

import type { FlagsServerStrategy } from "@workspace/flags";

let posthogInstance: PostHog | null = null;

const getPostHogServer = () => {
  posthogInstance ??= new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
  });

  return posthogInstance;
};

export const strategy = {
  getProvider: () => new PostHogServerProvider(getPostHogServer()),
} satisfies FlagsServerStrategy;
