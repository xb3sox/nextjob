import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";

import { logger } from "@workspace/shared/logger";
import { toast } from "@workspace/ui-web/toast";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      mutations: {
        onError: (error: Error | { error: Error }) => {
          if ("error" in error) {
            error = error.error;
          }

          logger.error(error);
          toast.add({ title: error.message, type: "error" });
        },
      },
    },
  });
