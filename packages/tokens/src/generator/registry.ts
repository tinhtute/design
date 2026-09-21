import {
  colorNames,
  KUMO_UTILITY_CSS,
  kumoModeVars,
  kumoThemeInlineVars,
  textKumoColorAliasVars,
  textKumoModeVars,
  textKumoThemeInlineVars,
  type CssTree,
} from './shared';
import type { Theme } from './types';

export interface RegistryThemeItem {
  $schema: string;
  name: string;
  type: 'registry:theme';
  title: string;
  description?: string;
  cssVars: {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  css?: CssTree;
  files: never[];
}

function titleCase(name: string): string {
  return name.replace(/-./g, (m) => m[1].toUpperCase()).replace(/^./, (c) => c.toUpperCase());
}

/** Emit a shadcn `registry:theme` item with cssVars { theme, light, dark }. */
export function buildThemeRegistryItem(theme: Theme): RegistryThemeItem {
  const themeBlock: Record<string, string> = {};
  for (const name of colorNames(theme)) {
    themeBlock[`--color-${name}`] = `var(--${name})`;
  }
  for (const [name, value] of kumoThemeInlineVars()) {
    themeBlock[name] = value;
  }
  for (const [name, value] of textKumoThemeInlineVars()) {
    themeBlock[name] = value;
  }
  for (const [name, value] of textKumoColorAliasVars()) {
    themeBlock[name] = value;
  }
  themeBlock['--animate-refresh'] = 'refresh 0.5s ease-in-out infinite';
  for (const [key, mult] of Object.entries(theme.radiusScale ?? {})) {
    themeBlock[`--radius-${key}`] = `calc(var(--radius) * ${mult})`;
  }
  themeBlock['--radius'] = 'var(--radius)';
  for (const [key, value] of Object.entries(theme.typography?.fontFamily ?? {})) {
    if (value.startsWith('var(')) {
      themeBlock[`--font-${key}`] = value;
    } else {
      themeBlock[`--font-${key}`] = `var(--font-${key})`;
    }
  }
  if (theme.spacing?.base) {
    themeBlock['--spacing'] = theme.spacing.base;
  }
  for (const [key, value] of Object.entries(theme.shadows ?? {})) {
    themeBlock[`--shadow-${key}`] = value;
  }
  for (const [key, value] of Object.entries(theme.motion?.durations ?? {})) {
    themeBlock[`--duration-${key}`] = value;
  }
  for (const [key, value] of Object.entries(theme.motion?.easings ?? {})) {
    themeBlock[`--ease-${key}`] = value;
  }

  const light: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme.colors.light)) {
    light[`--${key}`] = value;
  }
  for (const [name, value] of kumoModeVars('light')) {
    light[name] = value;
  }
  for (const [name, value] of textKumoModeVars('light')) {
    light[name] = value;
  }
  light['--radius'] = theme.radius;
  for (const [key, value] of Object.entries(theme.typography?.fontFamily ?? {})) {
    light[`--font-${key}`] = value;
  }

  const dark: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme.colors.dark)) {
    dark[`--${key}`] = value;
  }
  for (const [name, value] of kumoModeVars('dark')) {
    dark[name] = value;
  }
  for (const [name, value] of textKumoModeVars('dark')) {
    dark[name] = value;
  }

  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: `theme-${theme.name}`,
    type: 'registry:theme',
    title: titleCase(theme.name),
    description: theme.description,
    cssVars: { theme: themeBlock, light, dark },
    css: KUMO_UTILITY_CSS,
    files: [],
  };
}
