"use client";

import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import { NodeEnv } from "@workspace/shared/constants";

import env from "../../../env.config";
import { createQueryClient } from "./utils";

import type { QueryClient } from "@tanstack/react-query";

const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (mod) => mod.ReactQueryDevtools,
    ),
  { ssr: false },
);

let clientQueryClientSingleton: QueryClient | undefined = undefined;
export const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    return (clientQueryClientSingleton ??= createQueryClient());
  }
};

export function QueryClientProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {props.children}
      {env.NODE_ENV === NodeEnv.DEVELOPMENT ? <ReactQueryDevtools /> : null}
    </TanstackQueryClientProvider>
  );
}
