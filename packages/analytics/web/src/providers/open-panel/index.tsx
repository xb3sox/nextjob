import { OpenPanelComponent } from "@openpanel/nextjs";

import { env } from "./env";

import type { AnalyticsProviderClientStrategy } from "@workspace/analytics";

export const strategy = {
  Provider: ({ children, enabled = true }) => {
    return (
      <>
        {children}
        {enabled ? (
          <OpenPanelComponent
            clientId={env.NEXT_PUBLIC_OPEN_PANEL_CLIENT_ID}
            trackScreenViews
            trackAttributes
            trackOutgoingLinks
          />
        ) : null}
      </>
    );
  },
  track: (event, data) => {
    if (typeof window === "undefined") {
      return;
    }

    window.op("track", event, data);
  },
  identify: (userId, traits) => {
    if (typeof window === "undefined") {
      return;
    }

    window.op("identify", {
      profileId: userId,
      ...traits,
    });
  },
  reset: () => {
    if (typeof window === "undefined") {
      return;
    }

    window.op("clear");
  },
} satisfies AnalyticsProviderClientStrategy;
