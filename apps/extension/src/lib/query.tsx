import {
  QueryClient,
  QueryClientProvider as TanstackQueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

import { logger } from "@workspace/shared/logger";
import { toast } from "@workspace/ui-web/toast";

export function QueryClientProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
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
      }),
  );

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {props.children}
      <ReactQueryDevtools />
    </TanstackQueryClientProvider>
  );
}
