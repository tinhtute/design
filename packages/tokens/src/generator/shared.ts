import type { KumoCompatToken, Mode, Theme } from "./types";

const BRAND_LIGHT = "oklch(0.3917 0.0748 236.055)";
const BRAND_DARK = "oklch(0.72 0.0748 236.055)";
const TEXT_BRAND = "#f6821f";

/**
 * Kumo-compat color bridge: maps `--color-kumo-*` semantic tokens used by
 * ported components onto the consumer palette. Tokens with a shadcn equivalent
 * route to its variable; remaining surfaces/fills keep upstream cloudflare/kumo
 * values per mode (pinned commit a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf,
 * packages/kumo/src/styles/theme-kumo.css). Brand and link are explicit
 * `#124b68` oklch — not `mapsTo: var(--primary)` — so they cannot collapse to
 * near-black if primary is left at the shadcn default.
 */
export const KUMO_COMPAT: Record<string, KumoCompatToken> = {
  canvas: { light: "oklch(98.75% 0 0)", dark: "oklch(10% 0 0)" },
  elevated: { light: "oklch(98% 0 0)", dark: "oklch(12% 0 0)" },
  recessed: { light: "oklch(96% 0 0)", dark: "oklch(15% 0 0)" },
  base: { mapsTo: "var(--background)" },
  tint: { mapsTo: "var(--muted)" },
  contrast: { light: "oklch(8.5% 0 0)", dark: "oklch(98.5% 0 0)" },
  overlay: { light: "oklch(97.5% 0 0)", dark: "oklch(26.9% 0 0)" },
  control: { light: "#fff", dark: "oklch(21% 0.006 285.885)" },
  interact: { light: "oklch(87% 0 0)", dark: "oklch(37.1% 0 0)" },
  fill: { light: "oklch(92.2% 0 0)", dark: "oklch(26.9% 0 0)" },
  "fill-hover": { light: "oklch(96.5% 0 0)", dark: "oklch(37.1% 0 0)" },
  brand: { light: BRAND_LIGHT, dark: BRAND_DARK },
  "brand-hover": {
    light: "oklch(0.32 0.0748 236.055)",
    dark: "oklch(0.80 0.0748 236.055)",
  },
  link: { light: BRAND_LIGHT, dark: BRAND_DARK },
  line: { mapsTo: "var(--border)" },
  hairline: { mapsTo: "var(--border)" },
  focus: { light: "oklch(15% 0 0)", dark: "oklch(93.5% 0 0)" },
  "shadow-edge": { light: "oklch(0% 0 0 / 0.12)", dark: "oklch(100% 0 0 / 0.1)" },
  "shadow-drop": { light: "oklch(0% 0 0 / 0.08)", dark: "oklch(0% 0 0 / 0.3)" },
  "arrow-edge": { light: "oklch(14.5% 0 0 / 0.1)", dark: "transparent" },
  "arrow-stroke": { light: "transparent", dark: "oklch(32% 0 0)" },
  info: {
    light: "oklch(68.5% 0.169 237.323)",
    dark: "oklch(68.5% 0.169 237.323)",
  },
  "info-tint": {
    light: "oklch(93.2% 0.032 255.6 / 0.45)",
    dark: "oklch(38% 0.145 265.5 / 0.22)",
  },
  warning: { light: "oklch(73.9% 0.177 58.2)", dark: "oklch(64.5% 0.168 50)" },
  "warning-tint": {
    light: "oklch(93.1% 0.107 94.6 / 0.2)",
    dark: "oklch(35.3% 0.079 65 / 0.37)",
  },
  danger: { mapsTo: "var(--destructive)" },
  "danger-tint": {
    light: "oklch(93.6% 0.032 17.7 / 0.42)",
    dark: "oklch(42.9% 0.176 28.7 / 0.17)",
  },
  success: {
    light: "oklch(59.6% 0.145 163.225)",
    dark: "oklch(76.5% 0.177 163.223)",
  },
  "success-tint": {
    light: "oklch(96.2% 0.043 156.7 / 0.57)",
    dark: "oklch(39.3% 0.096 152.3 / 0.2)",
  },
  "banner-info": {
    light: "oklch(93.2% 0.032 255.585 / 0.7)",
    dark: "oklch(37.9% 0.146 265.522 / 0.5)",
  },
  "banner-warning": {
    light: "oklch(97.3% 0.071 103.193)",
    dark: "oklch(55.4% 0.135 66.442 / 0.5)",
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

/**
 * Kumo-compat text bridge: `--text-color-kumo-*` so `text-kumo-brand` stays
 * orange `#f6821f` while `bg-kumo-brand` uses the fill brand. Text link matches
 * fill brand `#124b68` oklch per mode.
 */
export const TEXT_KUMO_COMPAT: Record<string, KumoCompatToken> = {
  default: { mapsTo: "var(--foreground)" },
  inverse: { light: "oklch(97% 0 0)", dark: "oklch(20.5% 0 0)" },
  strong: { mapsTo: "var(--foreground)" },
  subtle: { mapsTo: "var(--muted-foreground)" },
  inactive: { light: "oklch(87% 0 0)", dark: "oklch(43.9% 0 0)" },
  placeholder: { light: "oklch(70.8% 0 0)", dark: "oklch(55.6% 0 0)" },
  brand: { light: TEXT_BRAND, dark: TEXT_BRAND },
  link: { light: BRAND_LIGHT, dark: BRAND_DARK },
  info: {
    light: "oklch(42.4% 0.199 265.638)",
    dark: "oklch(70.7% 0.165 254.624)",
  },
  success: {
    light: "oklch(43.2% 0.095 166.913)",
    dark: "oklch(90.5% 0.093 164.15)",
  },
  danger: {
    light: "oklch(50.5% 0.213 27.518)",
    dark: "oklch(70.4% 0.191 22.216)",
  },
  warning: { light: "oklch(59.7% 0.144 57.5)", dark: "oklch(75% 0.183 55.934)" },
  "badge-orange-subtle": {
    light: "oklch(47% 0.157 37.304)",
    dark: "oklch(90.1% 0.076 70.697)",
  },
  "badge-teal-subtle": {
    light: "oklch(43.7% 0.078 188.216)",
    dark: "oklch(91% 0.096 180.426)",
  },
  "badge-neutral-subtle": {
    light: "oklch(26.9% 0 0)",
    dark: "oklch(92.2% 0 0)",
  },
  "badge-inverted": { light: "#fff", dark: "#000" },
};

function resolveCompat(
  table: string,
  name: string,
  token: KumoCompatToken,
  mode: Mode,
): string {
  const value = token.mapsTo ?? (mode === "light" ? token.light : token.dark);
  if (value === undefined) {
    throw new Error(`${table} token "${name}" missing ${mode} value`);
  }
  return value;
}

/** `@theme inline` bridges -> `--color-kumo-*` Tailwind v4 utility namespace. */
export function kumoThemeInlineVars(): [string, string][] {
  return Object.keys(KUMO_COMPAT).map((name) => [
    `--color-kumo-${name}`,
    `var(--kumo-${name})`,
  ]);
}

/** `@theme inline` bridges -> `--text-color-kumo-*` (text-* utilities). */
export function textKumoThemeInlineVars(): [string, string][] {
  return Object.keys(TEXT_KUMO_COMPAT).map((name) => [
    `--text-color-kumo-${name}`,
    `var(--text-color-kumo-${name})`,
  ]);
}

/** Runtime `--kumo-*` definitions for one mode. */
export function kumoModeVars(mode: Mode): [string, string][] {
  return Object.entries(KUMO_COMPAT).map(
    ([name, token]) =>
      [`--kumo-${name}`, resolveCompat("KUMO_COMPAT", name, token, mode)] as [
        string,
        string,
      ],
  );
}

/** Runtime `--text-color-kumo-*` definitions for one mode. */
export function textKumoModeVars(mode: Mode): [string, string][] {
  return Object.entries(TEXT_KUMO_COMPAT).map(
    ([name, token]) =>
      [
        `--text-color-kumo-${name}`,
        resolveCompat("TEXT_KUMO_COMPAT", name, token, mode),
      ] as [string, string],
  );
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
