#!/usr/bin/env node
/**
 * migrate-icons.mjs — codemod: @phosphor-icons/react -> Hugeicons.
 *
 * Per file:
 *  - `import { A, B as C, type Icon } from '@phosphor-icons/react'`
 *      -> `import { HugeiconsIcon, type IconSvgElement as Icon } from '@hugeicons/react'`
 *         `import { MA as A, MB as C } from '@hugeicons/core-free-icons'`
 *    Local binding names are preserved via `as` so every value usage
 *    (`icon={X}`, config arrays, `const`s) keeps working unchanged.
 *  - JSX `<LocalName ...>` (incl. `<Icon ...>`) ->
 *    `<HugeiconsIcon icon={LocalName} ...>`
 *  - prop rules: `weight="bold"` -> `strokeWidth={2}`; `weight="regular"|"fill"`
 *    dropped; `fill-current` stripped from className strings.
 *
 * Usage: node scripts/migrate-icons.mjs [--dry-run] <file|dir> [...]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import console from 'node:console';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(readFileSync(join(root, 'scripts/icon-map.json'), 'utf8'));
delete map.$comment;

const dry = process.argv.includes('--dry-run');
const targets = process.argv.slice(2).filter((a) => a !== '--dry-run');

const IMPORT_RE = /import\s+(type\s+)?\{([^}]*)\}\s*from\s*['"]@phosphor-icons\/react[^'"]*['"];?/g;

function* walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const e of readdirSync(p)) {
      if (e === 'node_modules' || e.startsWith('.')) continue;
      yield* walk(join(p, e));
    }
  } else if (/\.(tsx|ts)$/.test(p)) yield p;
}

function migrate(src) {
  if (!IMPORT_RE.test(src)) return null;
  IMPORT_RE.lastIndex = 0;

  const iconLocals = new Set(); // local names bound to icon data
  let hasIconType = false;
  const iconSpecifiers = [];

  const replaced = src.replace(IMPORT_RE, (_m, typeOnly, inner) => {
    for (let part of inner.split(',')) {
      part = part.trim();
      if (!part) continue;
      const isType = part.startsWith('type ');
      if (isType) part = part.slice(5).trim();
      const [orig, alias] = part.split(/\s+as\s+/).map((s) => s.trim());
      const local = alias || orig;
      if (orig === 'Icon') {
        hasIconType = true;
        iconLocals.add(local); // <Icon ...> JSX -> HugeiconsIcon too
        continue;
      }
      const target = map[orig];
      if (!target) throw new Error(`unmapped phosphor name: ${orig}`);
      iconSpecifiers.push(`${target} as ${local}`);
      iconLocals.add(local);
    }
    return '\0ICON_IMPORTS\0';
  });

  let jsxCount = 0;
  let out = replaced;
  for (const local of iconLocals) {
    const tagRe = new RegExp(`<${local}(?=[\\s/>])`, 'g');
    out = out.replace(tagRe, () => {
      jsxCount++;
      return `<HugeiconsIcon icon={${local}}`;
    });
  }

  // prop rewrites (only meaningful on former phosphor JSX)
  out = out
    .replace(/\s*weight="bold"/g, ' strokeWidth={2}')
    .replace(/\s*weight="regular"/g, '')
    .replace(/\s*weight="fill"/g, '')
    .replace(/className="([^"]*)"/g, (m, cls) => {
      if (!cls.includes('fill-current')) return m;
      const c = cls
        .replace(/\bfill-current\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      return c ? `className="${c}"` : '';
    });

  const imports = [];
  const reactParts = [];
  if (jsxCount > 0) reactParts.push('HugeiconsIcon');
  if (hasIconType) reactParts.push('type IconSvgElement as Icon');
  if (reactParts.length)
    imports.push(`import { ${reactParts.join(', ')} } from '@hugeicons/react';`);
  if (iconSpecifiers.length)
    imports.push(`import { ${iconSpecifiers.join(', ')} } from '@hugeicons/core-free-icons';`);
  let firstImport = true;
  out = out.replace(/\0ICON_IMPORTS\0/g, () =>
    firstImport ? ((firstImport = false), imports.join('\n')) : '',
  );
  return { out, jsxCount, icons: iconSpecifiers.length };
}

let files = 0;
for (const t of targets) {
  for (const f of walk(t)) {
    const src = readFileSync(f, 'utf8');
    const r = migrate(src);
    if (!r) continue;
    files++;
    console.log(`${dry ? '[dry] ' : ''}${f}: ${r.icons} icons, ${r.jsxCount} JSX wraps`);
    if (!dry) writeFileSync(f, r.out);
  }
}
console.log(`${files} file(s) migrated`);
