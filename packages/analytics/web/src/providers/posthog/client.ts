import { posthog } from "posthog-js";

import { env } from "./env";

let initScheduled = false;
const pendingReadyCallbacks: Array<() => void> = [];

const getInitOptions = () => ({
  api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
  person_profiles: "always" as const,
  capture_pageview: false,
  autocapture: false,
  disable_external_dependency_loading: true,
  disable_session_recording: true,
  opt_out_capturing_by_default: true,
  opt_out_persistence_by_default: true,
  loaded: () => {
    for (const callback of pendingReadyCallbacks) {
      callback();
    }
    pendingReadyCallbacks.length = 0;
  },
});

export const initPostHog = () => {
  if (typeof window === "undefined" || posthog.__loaded) {
    return;
  }

  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, getInitOptions());
};

export const resetPostHog = () => {
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

export const schedulePostHogInit = () => {
  if (typeof window === "undefined" || initScheduled || posthog.__loaded) {
    return;
  }

  initScheduled = true;

  const run = () => initPostHog();

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 4000 });
  } else {
    setTimeout(run, 2000);
  }
};

export const onPostHogReady = (callback: () => void) => {
  if (typeof window === "undefined") {
    return;
  }

  if (posthog.__loaded) {
    callback();
    return;
  }

  pendingReadyCallbacks.push(callback);
  schedulePostHogInit();
};
