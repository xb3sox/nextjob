import { useCallback, useSyncExternalStore } from "react";

import { DEFAULT_BREAKPOINTS } from "@workspace/ui";

export const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
};

export const useBreakpoint = (
  breakpoint: keyof typeof DEFAULT_BREAKPOINTS,
  type: "min" | "max" = "min",
) => {
  return useMediaQuery(`(${type}-width: ${DEFAULT_BREAKPOINTS[breakpoint]}px)`);
};
