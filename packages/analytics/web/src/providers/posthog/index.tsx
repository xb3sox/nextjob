"use client";

import dynamic from "next/dynamic";
import { posthog } from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

import {
  initPostHog,
  onPostHogReady,
  resetPostHog,
  schedulePostHogInit,
} from "./client";

import type { AnalyticsProviderClientStrategy } from "@workspace/analytics";

const PageView = dynamic(
  () => import("./page-view").then((mod) => mod.PageView),
  {
    ssr: false,
  },
);

export const strategy = {
  Provider: ({ children, enabled = true }) => {
    useEffect(() => {
      if (!enabled) {
        if (posthog.__loaded && !posthog.has_opted_out_capturing()) {
          posthog.opt_out_capturing();
        }
        return;
      }

      schedulePostHogInit();
      onPostHogReady(() => {
        if (!posthog.has_opted_in_capturing()) {
          posthog.opt_in_capturing();
        }
      });
    }, [enabled]);

    return (
      <PostHogProvider client={posthog}>
        {children}
        {enabled ? <PageView /> : null}
      </PostHogProvider>
    );
  },
  track: (event, properties) => {
    if (typeof window === "undefined") {
      return;
    }

    initPostHog();
    posthog.capture(event, properties);
  },
  identify: (userId, traits) => {
    if (typeof window === "undefined") {
      return;
    }

    initPostHog();
    posthog.identify(userId, traits);
  },
  reset: () => {
    if (typeof window === "undefined") {
      return;
    }

    initPostHog();
    resetPostHog();
  },
} satisfies AnalyticsProviderClientStrategy;
