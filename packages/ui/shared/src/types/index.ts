export const ThemeMode = {
  SYSTEM: "system",
  LIGHT: "light",
  DARK: "dark",
} as const;

export const ThemeRadius = {
  NONE: "none",
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
  FULL: "full",
} as const;

export const THEME_RADIUS_VALUES = {
  [ThemeRadius.NONE]: "0",
  [ThemeRadius.SMALL]: "0.25rem",
  [ThemeRadius.MEDIUM]: "0.65rem",
  [ThemeRadius.LARGE]: "1rem",
  [ThemeRadius.FULL]: "2rem",
} satisfies Record<ThemeRadius, string>;

export const ThemeFont = {
  SANS: "sans",
  SERIF: "serif",
  MONO: "mono",
} as const;

export const ThemeColor = {
  ORANGE: "orange",
  ROSE: "rose",
  RED: "red",
  YELLOW: "yellow",
  GRAY: "gray",
  STONE: "stone",
  GREEN: "green",
  BLUE: "blue",
  VIOLET: "violet",
} as const;

export const DEFAULT_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type ThemeColor = (typeof ThemeColor)[keyof typeof ThemeColor];
export type ThemeFont = (typeof ThemeFont)[keyof typeof ThemeFont];
export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];
export type ThemeRadius = (typeof ThemeRadius)[keyof typeof ThemeRadius];

// OKLCH color variable (with optional opacity)
export type ColorVariable =
  | readonly [number, number, number]
  | readonly [number, number, number, number];

export interface ThemeConfig {
  mode: ThemeMode;
  color: ThemeColor;
  radius: ThemeRadius;
  font: ThemeFont;
}

export interface ThemeColorsVariables {
  background: ColorVariable;
  foreground: ColorVariable;
  card: ColorVariable;
  "card-foreground": ColorVariable;
  popover: ColorVariable;
  "popover-foreground": ColorVariable;
  primary: ColorVariable;
  "primary-foreground": ColorVariable;
  secondary: ColorVariable;
  "secondary-foreground": ColorVariable;
  muted: ColorVariable;
  "muted-foreground": ColorVariable;
  accent: ColorVariable;
  "accent-foreground": ColorVariable;
  success: ColorVariable;
  "success-foreground": ColorVariable;
  destructive: ColorVariable;
  "destructive-foreground": ColorVariable;
  border: ColorVariable;
  input: ColorVariable;
  ring: ColorVariable;
  "chart-1": ColorVariable;
  "chart-2": ColorVariable;
  "chart-3": ColorVariable;
  "chart-4": ColorVariable;
  "chart-5": ColorVariable;
  sidebar: ColorVariable;
  "sidebar-foreground": ColorVariable;
  "sidebar-primary": ColorVariable;
  "sidebar-primary-foreground": ColorVariable;
  "sidebar-accent": ColorVariable;
  "sidebar-accent-foreground": ColorVariable;
  "sidebar-border": ColorVariable;
  "sidebar-ring": ColorVariable;
}

export interface ThemeColors {
  [ThemeMode.LIGHT]: ThemeColorsVariables;
  [ThemeMode.DARK]: ThemeColorsVariables;
}
