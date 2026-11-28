import {
  colorNames,
  cssTreeToString,
  KUMO_UTILITY_CSS,
  kumoModeVars,
  kumoThemeInlineVars,
  textKumoColorAliasVars,
  textKumoModeVars,
  textKumoThemeInlineVars,
} from './shared';
import type { Theme } from './types';

/** `@theme inline` block: bridges runtime vars into Tailwind theme tokens. */
function themeInlineVars(theme: Theme): string[] {
  const vars: string[] = [];
  for (const name of colorNames(theme)) {
    vars.push(`--color-${name}: var(--${name});`);
  }
  for (const [name, value] of kumoThemeInlineVars()) {
    vars.push(`${name}: ${value};`);
  }
  for (const [name, value] of textKumoThemeInlineVars()) {
    vars.push(`${name}: ${value};`);
  }
  for (const [name, value] of textKumoColorAliasVars()) {
    vars.push(`${name}: ${value};`);
  }
  vars.push('--animate-refresh: refresh 0.5s ease-in-out infinite;');
  for (const [key, mult] of Object.entries(theme.radiusScale ?? {})) {
    vars.push(`--radius-${key}: calc(var(--radius) * ${mult});`);
  }
  vars.push('--radius: var(--radius);');
  for (const [key, value] of Object.entries(theme.typography?.fontFamily ?? {})) {
    if (value.startsWith('var(')) {
      vars.push(`--font-${key}: ${value};`);
    } else {
      vars.push(`--font-${key}: var(--font-${key});`);
    }
  }
  if (theme.spacing?.base) {
    vars.push(`--spacing: ${theme.spacing.base};`);
  }
  for (const [key, value] of Object.entries(theme.shadows ?? {})) {
    vars.push(`--shadow-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(theme.motion?.durations ?? {})) {
    vars.push(`--duration-${key}: ${value};`);
    vars.push(`--transition-duration-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(theme.motion?.easings ?? {})) {
    vars.push(`--ease-${key}: ${value};`);
  }
  return vars;
}

function lightVars(theme: Theme): string[] {
  const vars: string[] = [];
  for (const [key, value] of Object.entries(theme.colors.light)) {
    vars.push(`--${key}: ${value};`);
  }
  for (const [name, value] of kumoModeVars('light')) {
    vars.push(`${name}: ${value};`);
  }
  for (const [name, value] of textKumoModeVars('light')) {
    vars.push(`${name}: ${value};`);
  }
  vars.push(`--radius: ${theme.radius};`);
  for (const [key, value] of Object.entries(theme.typography?.fontFamily ?? {})) {
    vars.push(`--font-${key}: ${value};`);
  }
  return vars;
}

function darkVars(theme: Theme): string[] {
  const vars: string[] = [];
  for (const [key, value] of Object.entries(theme.colors.dark)) {
    vars.push(`--${key}: ${value};`);
  }
  for (const [name, value] of kumoModeVars('dark')) {
    vars.push(`${name}: ${value};`);
  }
  for (const [name, value] of textKumoModeVars('dark')) {
    vars.push(`${name}: ${value};`);
  }
  return vars;
}

/** Consumer-ready Tailwind v4 globals.css (styles.css) for one theme. */
export function buildThemeCss(theme: Theme): string {
  const lines: string[] = [];
  lines.push('@theme inline {');
  for (const v of themeInlineVars(theme)) lines.push(`  ${v}`);
  lines.push('}');
  lines.push('');
  lines.push(':root {');
  for (const v of lightVars(theme)) lines.push(`  ${v}`);
  lines.push('}');
  lines.push('');
  lines.push('.dark {');
  for (const v of darkVars(theme)) lines.push(`  ${v}`);
  lines.push('}');
  lines.push('');
  lines.push(cssTreeToString(KUMO_UTILITY_CSS));
  return lines.join('\n');
}
