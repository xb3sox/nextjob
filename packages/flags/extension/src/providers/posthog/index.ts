import { PostHogWebProvider } from "@posthog/openfeature-web-provider";
import { posthog } from "posthog-js";
import * as z from "zod";

import { env } from "./env";

import type { FlagsClientStrategy } from "@workspace/flags";

const ensurePostHog = () => {
  if (posthog.__loaded) {
    return posthog;
  }

  posthog.init(env.VITE_POSTHOG_KEY, {
    api_host: env.VITE_POSTHOG_HOST,
    autocapture: false,
    capture_pageleave: false,
    capture_pageview: false,
    disable_external_dependency_loading: true,
    persistence: "localStorage",
  });

  return posthog;
};

export const strategy = {
  getProvider: () => new PostHogWebProvider(ensurePostHog()),
  syncContext: (context) => {
    const client = ensurePostHog();

    if (context?.targetingKey) {
      const traits: Record<string, string> = {};
      const email = z.string().safeParse(context.email);
      const name = z.string().safeParse(context.name);

      if (email.success) {
        traits.email = email.data;
      }
      if (name.success) {
        traits.name = name.data;
      }

      client.identify(context.targetingKey, traits);
      return;
    }

    client.reset();
  },
} satisfies FlagsClientStrategy;
