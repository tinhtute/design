import path from 'node:path';
import { expect, test } from '@playwright/test';
import ts from 'typescript';
import type { CatalogItem } from '../lib/agent-catalog-model';

const pilots = [
  'button',
  'badge',
  'field',
  'select',
  'dialog',
  'tabs',
  'toasty',
  'resource-list-page',
];

function validateExamples(items: CatalogItem[]) {
  const cwd = process.cwd();
  const config = ts.readConfigFile(path.join(cwd, 'tsconfig.json'), ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, cwd);
  const sources = new Map(
    items.flatMap(({ slug, example }) =>
      example === null ? [] : [[path.join(cwd, 'catalog-' + slug + '.tsx'), example] as const],
    ),
  );
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (file, ...args) => {
    const source = sources.get(file);
    return source === undefined
      ? getSourceFile(file, ...args)
      : ts.createSourceFile(file, source, args[0]);
  };
  const program = ts.createProgram([...sources.keys()], { ...options, incremental: false }, host);
  const errors = ts.getPreEmitDiagnostics(program);
  expect(ts.formatDiagnosticsWithColorAndContext(errors, host)).toBe('');
}

test('catalog matches registry items and links to executable pilot demos', async ({
  request,
  page,
}) => {
  const response = await request.get('/agent-catalog.json');
  expect(response.ok()).toBeTruthy();
  const { schemaVersion, items }: { schemaVersion: number; items: CatalogItem[] } =
    await response.json();
  expect(schemaVersion).toBe(1);
  expect(items).toHaveLength(new Set(items.map(({ slug }) => slug)).size);
  expect(
    items
      .filter(({ example }) => example)
      .map(({ slug }) => slug)
      .sort(),
  ).toEqual([...pilots].sort());

  const registry = await request.get('/r/registry.json');
  expect(registry.ok()).toBeTruthy();
  const published: { items: { name: string; type: string; description?: string }[] } =
    await registry.json();
  for (const item of items) {
    const entry = published.items.find(({ name }) => name === item.slug);
    expect(item.type).toBe(entry?.type);
    expect(item.description).toBe(entry?.description ?? '');
  }
  validateExamples(items);

  const buttonProp = items
    .find(({ slug }) => slug === 'button')
    ?.props.find(({ displayName }) => displayName === 'Button')
    ?.props.find(({ name }) => name === 'variant');
  expect(buttonProp?.defaultValue).toBe('secondary');

  const resource = items.find(({ slug }) => slug === 'resource-list-page')!;
  expect(resource.props.flatMap(({ props }) => props)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'title', required: false }),
      expect.objectContaining({ name: 'children', required: true }),
    ]),
  );
  expect(resource.install).toContain('@therealtinhtute/filter-bar');
  const registryItem = await request.get(new URL(resource.links.registry).pathname);
  expect(registryItem.ok()).toBeTruthy();
  await page.goto('/' + new URL(resource.links.demo).hash);
  await expect(page.getByRole('heading', { name: 'Resource list page' })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'api-gateway' })).toBeVisible();
});

test('preserves constant, array and object defaults in the catalog and Props tab', async ({
  page,
  request,
}) => {
  const response = await request.get('/agent-catalog.json');
  expect(response.ok()).toBeTruthy();
  const { items }: { items: CatalogItem[] } = await response.json();
  for (const [slug, name, defaultValue] of [
    ['sidebar', 'defaultWidth', '256'],
    ['tag-input', 'defaultValue', '[]'],
    ['clipboard-text', 'labels', '{}'],
  ]) {
    const item = items.find((entry) => entry.slug === slug);
    expect(item?.props.flatMap(({ props }) => props)).toEqual(
      expect.arrayContaining([expect.objectContaining({ name, defaultValue })]),
    );

    await page.goto('/#' + slug);
    await page.getByRole('tab', { name: 'Props' }).click();
    const panel = page.getByRole('tabpanel', { name: 'Props' });
    const row = panel
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name, exact: true }) });
    await expect(row.getByRole('cell', { name: defaultValue, exact: true })).toBeVisible();
  }
});

test('finds a pilot by alias and copies the catalog example and documented props', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Search' }).click();
  const search = page.getByRole('dialog', { name: 'Component search' });
  await search.getByRole('combobox').fill('cta');
  await search.getByRole('option', { name: /Button/ }).click();

  await page.getByRole('tab', { name: 'Code' }).click();
  const panel = page.getByRole('tabpanel', { name: 'Code' });
  await expect(panel.getByRole('link', { name: 'Agent catalog (JSON)' })).toHaveAttribute(
    'href',
    '/agent-catalog.json',
  );
  await panel.getByRole('button', { name: 'Copy for agent' }).click();
  await expect(panel.getByText('Copied agent context.')).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('pnpm dlx shadcn add @therealtinhtute/button');
  expect(copied).toContain('Default: secondary.');
  expect(copied).toContain('Default: ghost.');
  expect(copied).toContain("import { Button } from '@/components/ui/button';");
  expect(copied).toContain('Use when:');
});

test('offers selectable agent context if clipboard access is denied', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')) },
    });
  });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#toasty');
  await page.getByRole('tab', { name: 'Code' }).click();
  await page.getByRole('button', { name: 'Copy for agent' }).click();
  await expect(page.getByText('Could not copy.', { exact: false })).toBeVisible();
  const manual = page.getByRole('textbox', { name: 'Agent context' });
  await expect(manual).toHaveJSProperty('readOnly', true);
  await expect(manual).toHaveValue(/<Toasty><Demo \/><\/Toasty>/);
  expect(await page.getByRole('main').evaluate((el) => el.scrollWidth)).toBe(320);
});
