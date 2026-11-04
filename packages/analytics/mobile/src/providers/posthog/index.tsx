import { useGlobalSearchParams, usePathname } from "expo-router";
import PostHog, { PostHogProvider } from "posthog-react-native";
import { useEffect } from "react";

import { useTrackingPermissions } from "../../hooks";
import { env } from "./env";

import type { AnalyticsProviderClientStrategy } from "@workspace/analytics";

let client: PostHog | null = null;

const getClient = () => {
  if (client) {
    return client;
  }

  client = new PostHog(env.EXPO_PUBLIC_POSTHOG_KEY, {
    host: env.EXPO_PUBLIC_POSTHOG_HOST,
    defaultOptIn: false,
  });

  return client;
};

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const client = getClient();

  return (
    <PostHogProvider
      client={client}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
      }}
    >
      {children}
    </PostHogProvider>
  );
};

const Setup = ({ enabled }: { enabled: boolean }) => {
  const client = getClient();
  const granted = useTrackingPermissions();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const isActive = enabled && granted;

  useEffect(() => {
    if (isActive) {
      void client.optIn();
    } else {
      void client.optOut();
    }
  }, [isActive, client]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    void client.screen(pathname, params as Record<string, string>);
  }, [pathname, params, client, isActive]);

  return null;
};

const ProviderComponent = ({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) => {
  return (
    <Wrapper>
      <Setup enabled={enabled} />
      {children}
    </Wrapper>
  );
};

export const strategy = {
  Provider: ProviderComponent,
  track: (name, params) => {
    const client = getClient();
    client.capture(name, params);
  },
  identify: (userId, traits) => {
    const client = getClient();
    client.identify(userId, traits);
  },
  reset: () => {
    const client = getClient();
    client.reset();
  },
} satisfies AnalyticsProviderClientStrategy;
