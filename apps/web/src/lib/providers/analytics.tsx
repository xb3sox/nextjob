"use client";

import { useConsent } from "@c15t/nextjs";
import { useEffect } from "react";

import { identify, Provider, reset } from "@workspace/analytics-web";

import { authClient } from "~/lib/auth/client";

export const AnalyticsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = authClient.useSession();
  const enabled = useConsent("measurement");

  useEffect(() => {
    if (session.isPending) {
      return;
    }

    if (!enabled) {
      return reset();
    }

    if (session.data?.user) {
      const { id, email, name } = session.data.user;
      identify(id, { email, name });
    } else {
      reset();
    }
  }, [session, enabled]);

  return <Provider enabled={enabled}>{children}</Provider>;
};
