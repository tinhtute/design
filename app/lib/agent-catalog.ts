import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import registry from '../../packages/registry/registry.json';
import type { CatalogItem } from './agent-catalog-model';
import { AGENT_GUIDES } from './agent-guides';
import { getPropsBySlug } from './props';
import { GROUPS } from './showroom-groups';

const origin = 'https://design.tinhtute.me';
const namespace = '@therealtinhtute';
const registryItems = new Map(registry.items.map((item) => [item.name, item]));

export function readDemoSources(): Record<string, string> {
  const dir = path.join(process.cwd(), 'demos');
  return Object.fromEntries(
    readdirSync(dir)
      .filter((file) => file.endsWith('.tsx'))
      .map((file) => [path.basename(file, '.tsx'), readFileSync(path.join(dir, file), 'utf8')]),
  );
}

function demoExample(slug: string, source: string): { imports: string[]; example: string } {
  const tree = ts.createSourceFile(
    slug + '.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const imports = tree.statements.flatMap((node) => {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) return [];
    const match = /^@\/components\/(?:ui\/)?([^/]+)$/.exec(node.moduleSpecifier.text);
    return match ? [match[1]] : [];
  });
  const statements = tree.statements
    .filter(
      (node) =>
        !ts.isVariableStatement(node) ||
        !node.declarationList.declarations.some(({ name }) =>
          ['notes', 'deps'].includes(name.getText(tree)),
        ),
    )
    .map((node) => node.getText(tree));

  if (slug === 'toasty') {
    const directive = statements[0];
    return {
      imports,
      example: [
        directive + "\nimport { Toasty } from '@/components/ui/toasty';",
        ...statements.slice(1),
        'export default function Example() {\n  return <Toasty><Demo /></Toasty>;\n}',
      ].join('\n\n'),
    };
  }

  return {
    imports,
    example: statements
      .map((statement) =>
        statement.replace(/^export function Demo\(/, 'export default function Demo('),
      )
      .join('\n\n'),
  };
}

export function getCatalog(sources = readDemoSources()): CatalogItem[] {
  const props = getPropsBySlug();
  const items = GROUPS.flatMap(({ title: group, items }) =>
    items.map(([slug, title]) => {
      const registryItem = registryItems.get(slug);
      const source = sources[slug];
      if (!registryItem || !source)
        throw new Error('Catalog item lacks a registry entry or demo: ' + slug);
      const advice = AGENT_GUIDES[slug] ?? null;
      const demo = advice ? demoExample(slug, source) : null;
      const specs = [...new Set([slug, ...(demo?.imports ?? [])])];
      for (const spec of specs) {
        if (!registryItems.has(spec)) throw new Error('Unknown example dependency: ' + spec);
      }
      return {
        slug,
        title,
        group,
        type: registryItem.type,
        description: registryItem.description ?? '',
        aliases: advice?.aliases ?? [],
        links: { demo: origin + '/#' + slug, registry: origin + '/r/' + slug + '.json' },
        install: 'pnpm dlx shadcn add ' + specs.map((name) => namespace + '/' + name).join(' '),
        props: props[slug] ?? [],
        example: demo?.example ?? null,
        guide: advice && {
          useWhen: advice.useWhen,
          avoidWhen: advice.avoidWhen,
          anatomy: advice.anatomy,
          states: advice.states,
          rules: advice.rules,
        },
      };
    }),
  );
  if (
    new Set(items.map(({ slug }) => slug)).size !== items.length ||
    items.length !== Object.keys(sources).length
  ) {
    throw new Error('Catalog slugs do not match the showroom demos');
  }
  return items;
}
