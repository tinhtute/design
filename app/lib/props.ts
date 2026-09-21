import { readdirSync } from 'node:fs';
import path from 'node:path';
import { withCustomConfig, type PropItem } from 'react-docgen-typescript';

/**
 * Build-time props extraction for the showroom.
 *
 * Runs inside the server component during prerender: a single TypeScript
 * program parses every `packages/registry/src/components/ui/*.tsx` (the
 * canonical component source — app copies are mirrors) with
 * `react-docgen-typescript`, and the result is memoized per process.
 * Only plain serializable DTOs cross the server→client boundary.
 */

export interface PropRow {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
}

export interface ComponentPropsDoc {
  displayName: string;
  /** True when DOM/HTML-inherited props were filtered out. */
  inheritsDomProps: boolean;
  props: PropRow[];
}

export type PropsBySlug = Record<string, ComponentPropsDoc[]>;

const REGISTRY_UI_DIR = path.resolve(process.cwd(), '../packages/registry/src/components/ui');
const REGISTRY_TSCONFIG = path.resolve(process.cwd(), '../packages/registry/tsconfig.json');

const MAX_TYPE_TEXT = 80;

/** Names of components that had props inherited from node_modules types. */
const domPropParents = new Set<string>();

function isOwnProp(prop: PropItem, component: { name: string }): boolean {
  const fileName = prop.parent?.fileName;
  if (fileName && fileName.includes('node_modules')) {
    domPropParents.add(component.name);
    return false;
  }
  return true;
}

/** Render a docgen type as compact, readable union/intersection text. */
function typeText(type: PropItem['type']): string {
  let text = type.name;
  if ((type.name === 'enum' || type.name === 'union') && Array.isArray(type.value)) {
    text = type.value.map((v: { value?: string; name?: string }) => v.value ?? v.name).join(' | ');
  }
  if (text.length <= MAX_TYPE_TEXT) return text;
  const cut = text.slice(0, MAX_TYPE_TEXT);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' | '), 0) || MAX_TYPE_TEXT)} | …`;
}

function toRows(props: Record<string, PropItem>): PropRow[] {
  return Object.values(props)
    .map((prop) => ({
      name: prop.name,
      type: typeText(prop.type),
      required: prop.required,
      defaultValue: prop.defaultValue?.value != null ? String(prop.defaultValue.value) : null,
      description: prop.description ?? '',
    }))
    .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));
}

let cache: PropsBySlug | null = null;

/**
 * Map each registry component slug to its exported component docs.
 * Files without exported props yield an empty array — callers render
 * no table for them.
 */
export function getPropsBySlug(): PropsBySlug {
  if (cache) return cache;
  domPropParents.clear();
  const parser = withCustomConfig(REGISTRY_TSCONFIG, {
    propFilter: isOwnProp,
    shouldExtractLiteralValuesFromEnum: true,
    shouldExtractValuesFromUnion: true,
    shouldRemoveUndefinedFromOptional: true,
    savePropValueAsString: true,
    skipChildrenPropWithoutDoc: true,
  });
  const files = readdirSync(REGISTRY_UI_DIR)
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => path.join(REGISTRY_UI_DIR, f));
  const docs = parser.parse(files);
  cache = {};
  for (const doc of docs) {
    // Skip non-component exports docgen picks up (e.g. `buttonVariants`).
    if (!/^[A-Z]/.test(doc.displayName)) continue;
    const slug = path.basename(doc.filePath, '.tsx');
    const rows = toRows(doc.props);
    if (rows.length === 0) continue;
    (cache[slug] ??= []).push({
      displayName: doc.displayName,
      inheritsDomProps: domPropParents.has(doc.displayName),
      props: rows,
    });
  }
  return cache;
}
