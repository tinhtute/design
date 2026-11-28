import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { withCustomConfig, type PropItem } from 'react-docgen-typescript';
import ts from 'typescript';

/**
 * Build-time props extraction for the showroom.
 *
 * Runs inside the server component during prerender: a single TypeScript
 * program parses the UI and block files in `packages/registry/src/components` (the
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
const REGISTRY_BLOCK_DIR = path.dirname(REGISTRY_UI_DIR);
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

function toRows(props: Record<string, PropItem>, defaults?: Map<string, string>): PropRow[] {
  return Object.values(props)
    .map((prop) => ({
      name: prop.name,
      type: typeText(prop.type),
      required: prop.required,
      defaultValue: defaults?.get(prop.name) ?? null,
      description: prop.description ?? '',
    }))
    .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));
}

function sourceDefaults(file: string): Map<string, Map<string, string>> {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const defaults = new Map<string, Map<string, string>>();
  const bindings = new Map<string, ts.Expression>();

  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        bindings.set(declaration.name.text, declaration.initializer);
      }
    }
  }

  function unwrap(expression: ts.Expression): ts.Expression {
    return ts.isAsExpression(expression) || ts.isParenthesizedExpression(expression)
      ? unwrap(expression.expression)
      : expression;
  }

  function literal(expression: ts.Expression): string | undefined {
    const value = unwrap(expression);
    if (ts.isStringLiteralLike(value) || ts.isNumericLiteral(value)) return value.text;
    if (
      value.kind === ts.SyntaxKind.TrueKeyword ||
      value.kind === ts.SyntaxKind.FalseKeyword ||
      value.kind === ts.SyntaxKind.NullKeyword
    )
      return value.getText(source);
    if (ts.isPropertyAccessExpression(value) && ts.isIdentifier(value.expression)) {
      const binding = bindings.get(value.expression.text);
      const object = binding && unwrap(binding);
      if (object && ts.isObjectLiteralExpression(object)) {
        const property = object.properties.find(
          (part) => ts.isPropertyAssignment(part) && part.name.getText(source) === value.name.text,
        );
        if (property && ts.isPropertyAssignment(property)) {
          const member = unwrap(property.initializer);
          if (ts.isStringLiteralLike(member) || ts.isNumericLiteral(member)) return member.text;
        }
      }
    }
  }

  function collect(name: string, parameters: readonly ts.ParameterDeclaration[]) {
    const first = parameters[0]?.name;
    if (!first || !ts.isObjectBindingPattern(first)) return;
    const values = new Map<string, string>();
    for (const element of first.elements) {
      const key = element.propertyName ?? element.name;
      if ((!ts.isIdentifier(key) && !ts.isStringLiteral(key)) || !element.initializer) continue;
      const value = literal(element.initializer);
      if (value !== undefined) values.set(key.text, value);
    }
    defaults.set(name, values);
  }

  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      collect(statement.name.text, statement.parameters);
    }
  }
  for (const [name, binding] of bindings) {
    const value = unwrap(binding);
    const expression =
      ts.isCallExpression(value) && /(?:^|\.)forwardRef$/.test(value.expression.getText(source))
        ? value.arguments[0]
        : value;
    if (expression && (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression))) {
      collect(name, expression.parameters);
    }
  }

  return defaults;
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
  const files = [REGISTRY_UI_DIR, REGISTRY_BLOCK_DIR].flatMap((dir) =>
    readdirSync(dir)
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => path.join(dir, f)),
  );
  const docs = parser.parse(files);
  const defaults = new Map(files.map((file) => [file, sourceDefaults(file)]));
  cache = {};
  for (const doc of docs) {
    // Skip non-component exports docgen picks up (e.g. `buttonVariants`).
    if (!/^[A-Z]/.test(doc.displayName)) continue;
    const slug = path.basename(doc.filePath, '.tsx');
    const rows = toRows(doc.props, defaults.get(doc.filePath)?.get(doc.displayName));
    if (rows.length === 0) continue;
    (cache[slug] ??= []).push({
      displayName: doc.displayName,
      inheritsDomProps: domPropParents.has(doc.displayName),
      props: rows,
    });
  }
  return cache;
}
