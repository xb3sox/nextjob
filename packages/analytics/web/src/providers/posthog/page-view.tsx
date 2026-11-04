"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

import { onPostHogReady } from "./client";

export const PageView = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    let url = window.origin + pathname;
    if (searchParams.toString()) {
      url = url + `?${searchParams.toString()}`;
    }

    onPostHogReady(() => {
      posthog.capture("$pageview", {
        $current_url: url,
      });
    });
  }, [pathname, searchParams, posthog]);

  return null;
};
