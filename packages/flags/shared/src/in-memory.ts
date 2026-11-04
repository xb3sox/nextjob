import { Flag } from "./keys";

export const inMemoryConfig = {
  [Flag.DEMO]: {
    disabled: false,
    variants: {
      on: true,
      off: false,
    },
    defaultVariant: "on",
  },
} as const;
