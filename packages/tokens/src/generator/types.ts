export type Mode = "light" | "dark";

export interface ThemeColors {
  light: Record<string, string>;
  dark: Record<string, string>;
}

/**
 * Data-driven design-token source for one theme.
 * A generator turns this into Tailwind-v4 globals.css variables and a
 * shadcn `registry:theme` item (cssVars { theme, light, dark }).
 */
export interface Theme {
  /** Short kebab name; emitted as `theme-{name}` in the registry. */
  name: string;
  description?: string;
  /** Semantic color tokens per mode (oklch values). */
  colors: ThemeColors;
  /** Single source radius (e.g. "0.625rem"); derived scale uses this. */
  radius: string;
  /** Radius scale multipliers -> --radius-{key}: calc(var(--radius) * {mult}). */
  radiusScale?: Record<string, number>;
  typography?: {
    /** Font stacks -> --font-{key} runtime vars + @theme inline bridges. */
    fontFamily?: Record<string, string>;
  };
  spacing?: {
    /** Tailwind v4 base spacing unit -> --spacing. */
    base?: string;
  };
  shadows?: Record<string, string>;
  motion?: {
    durations?: Record<string, string>;
    easings?: Record<string, string>;
  };
}
