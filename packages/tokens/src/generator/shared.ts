import type { Theme } from "./types";

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
