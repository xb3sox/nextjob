export const Flag = {
  DEMO: "demo",
} as const;

export type Flag = (typeof Flag)[keyof typeof Flag];
