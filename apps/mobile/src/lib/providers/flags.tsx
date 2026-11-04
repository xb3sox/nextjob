import { useEffect } from "react";

import {
  clearContext,
  FlagsProvider as Provider,
  setContext,
} from "@workspace/flags-mobile";

import { authClient } from "~/lib/auth";

export const FlagsProvider = ({ children }: { children: React.ReactNode }) => {
  const session = authClient.useSession();

  useEffect(() => {
    if (session.isPending) {
      return;
    }

    if (session.data?.user) {
      const { id, email, name } = session.data.user;
      void setContext({ targetingKey: id, email, name });
      return;
    }

    void clearContext();
  }, [session]);

  return <Provider>{children}</Provider>;
};
