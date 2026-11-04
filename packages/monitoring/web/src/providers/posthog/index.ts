import { posthog } from "posthog-js";

import { env } from "./env";

import type { MonitoringProviderClientStrategy } from "../types";

const exceptionAutocapture = {
  capture_unhandled_errors: true,
  capture_unhandled_rejections: true,
} as const;

const reset = () => {
  if (!posthog.__loaded) {
    return;
  }

  const hasOptedOut = posthog.has_opted_out_capturing();
  const hasOptedIn = posthog.has_opted_in_capturing();

  posthog.reset();

  if (hasOptedOut) {
    posthog.opt_out_capturing();
  } else if (hasOptedIn) {
    posthog.opt_in_capturing({ captureEventName: false });
  }
};

export const strategy = {
  captureException: (exception) => {
    posthog.captureException(exception);
  },
  identify: <T extends { id: string }>(user: T | null) => {
    if (user) {
      posthog.identify(user.id);
    } else {
      reset();
    }
  },
  initialize: () => {
    if (posthog.__loaded) {
      posthog.startExceptionAutocapture(exceptionAutocapture);
      return;
    }

    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_exceptions: exceptionAutocapture,
    });
  },
  onRouterTransitionStart: () => {
    /* PostHog does not provide a way to capture router transitions yet */
  },
} satisfies MonitoringProviderClientStrategy;
