import type { KumoCompatToken, Mode, Theme } from "./types";

/**
 * Kumo-compat color bridge (R1): maps the Kumo semantic tokens used by ported
 * components onto the consumer palette. Tokens with a shadcn equivalent route
 * to its variable; status hues keep upstream cloudflare/kumo values per mode
 * (pinned commit e6d17c6ffc566009277447dc213d72638a0b78ad, styles/theme-kumo.css).
 */
export const KUMO_COMPAT: Record<string, KumoCompatToken> = {
  // Palette-mapped semantic tokens.
  brand: { mapsTo: "var(--primary)" },
  danger: { mapsTo: "var(--destructive)" },
  base: { mapsTo: "var(--background)" },
  tint: { mapsTo: "var(--muted)" },
  line: { mapsTo: "var(--border)" },
  hairline: { mapsTo: "var(--border)" },
  default: { mapsTo: "var(--foreground)" },
  strong: { mapsTo: "var(--foreground)" },
  subtle: { mapsTo: "var(--muted-foreground)" },
  // Upstream-owned status hues (no shadcn equivalent).
  success: {
    light: "oklch(59.6% 0.145 163.225)",
    dark: "oklch(76.5% 0.177 163.223)",
  },
  warning: { light: "oklch(73.9% 0.177 58.2)", dark: "oklch(64.5% 0.168 50)" },
  info: {
    light: "oklch(68.5% 0.169 237.323)",
    dark: "oklch(68.5% 0.169 237.323)",
  },
  fill: { light: "oklch(92.2% 0 0)", dark: "oklch(26.9% 0 0)" },
  link: {
    light: "oklch(42.4% 0.199 265.638)",
    dark: "oklch(70.7% 0.165 254.624)",
  },
  "info-tint": {
    light: "oklch(93.2% 0.032 255.6 / 0.45)",
    dark: "oklch(38% 0.145 265.5 / 0.22)",
  },
  "warning-tint": {
    light: "oklch(93.1% 0.107 94.6 / 0.2)",
    dark: "oklch(35.3% 0.079 65 / 0.37)",
  },
  "danger-tint": {
    light: "oklch(93.6% 0.032 17.7 / 0.42)",
    dark: "oklch(42.9% 0.176 28.7 / 0.17)",
  },
  "success-tint": {
    light: "oklch(96.2% 0.043 156.7 / 0.57)",
    dark: "oklch(39.3% 0.096 152.3 / 0.2)",
  },
  "badge-red": {
    light: "oklch(57.7% 0.245 27.325)",
    dark: "oklch(50.5% 0.213 27.518)",
  },
  "badge-green": {
    light: "oklch(59.6% 0.145 163.225)",
    dark: "oklch(50.8% 0.118 165.612)",
  },
  "badge-orange": {
    light: "oklch(81.5% 0.197 76)",
    dark: "oklch(81.5% 0.197 76)",
  },
  "badge-purple": {
    light: "oklch(55.8% 0.288 302.321)",
    dark: "oklch(49.6% 0.265 301.924)",
  },
  "badge-teal": {
    light: "oklch(54.9% 0.096 184.565)",
    dark: "oklch(51.1% 0.096 186.391)",
  },
  "badge-blue": {
    light: "oklch(54.6% 0.245 262.881)",
    dark: "oklch(48.8% 0.243 264.376)",
  },
  "badge-neutral": { light: "oklch(55.6% 0 0)", dark: "oklch(43.9% 0 0)" },
  "badge-inverted": { light: "oklch(14.5% 0 0)", dark: "#fff" },
  "badge-teal-subtle": {
    light: "oklch(43.7% 0.078 188.216)",
    dark: "oklch(91% 0.096 180.426)",
  },
  "badge-neutral-subtle": {
    light: "oklch(26.9% 0 0)",
    dark: "oklch(92.2% 0 0)",
  },
};

/** `@theme inline` bridges -> `--color-kumo-*` Tailwind v4 utility namespace. */
export function kumoThemeInlineVars(): [string, string][] {
  return Object.keys(KUMO_COMPAT).map((name) => [
    `--color-kumo-${name}`,
    `var(--kumo-${name})`,
  ]);
}

/** Runtime `--kumo-*` definitions for one mode. */
export function kumoModeVars(mode: Mode): [string, string][] {
  return Object.entries(KUMO_COMPAT).map(([name, token]) => {
    const value = token.mapsTo ?? (mode === "light" ? token.light : token.dark);
    if (value === undefined) {
      throw new Error(`KUMO_COMPAT token "${name}" missing ${mode} value`);
    }
    return [`--kumo-${name}`, value] as [string, string];
  });
}

/** Runtime color variable names from both modes, deduped, order-preserving. */
export function colorNames(theme: Theme): string[] {
  const names = new Set<string>();
  for (const mode of ["light", "dark"] as const) {
    for (const key of Object.keys(theme.colors[mode])) {
      names.add(key);
    }
  }
  return [...names];
}
