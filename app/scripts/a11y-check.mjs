#!/usr/bin/env node
/**
 * a11y-check.mjs — axe sweep over every showroom demo, light and dark, plus
 * the ⌘K palette. Exits non-zero on any WCAG A/AA violation.
 *
 * Scans `A11Y_BASE_URL` when set (CI runs `next start`); otherwise starts a
 * dev server on `A11Y_PORT` (default 3100) for the duration of the run.
 *
 * Usage: pnpm --filter app a11y
 */
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AxeBuilder } from '@axe-core/playwright';
import { chromium } from 'playwright';

const appRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = process.env.A11Y_PORT ?? '3100';
const baseUrl = process.env.A11Y_BASE_URL ?? `http://localhost:${port}`;
const concurrency = Number(process.env.A11Y_CONCURRENCY ?? 4);
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const slugs = readdirSync(path.join(appRoot, 'demos'))
  .filter((file) => file.endsWith('.tsx'))
  .map((file) => file.slice(0, -'.tsx'.length))
  .sort();

if (slugs.length < 40) {
  console.error(`a11y-check: found only ${slugs.length} demos — did the demos layout change?`);
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function isReachable() {
  try {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
}

let server;
// `detached` puts the dev server in its own process group so the whole tree
// (pnpm → next → workers) dies with one signal instead of leaving a server.
const stopServer = () => {
  if (!server?.pid) return;
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    server.kill();
  }
};

if (!(await isReachable())) {
  console.log(`a11y-check: no server at ${baseUrl}, starting next dev…`);
  server = spawn('pnpm', ['exec', 'next', 'dev', '--port', port], {
    cwd: appRoot,
    stdio: 'ignore',
    detached: true,
  });
  const deadline = Date.now() + 90_000;
  while (!(await isReachable())) {
    if (Date.now() > deadline) {
      stopServer();
      console.error(`a11y-check: server at ${baseUrl} did not come up within 90s`);
      process.exit(1);
    }
    await sleep(1000);
  }
}

const browser = await chromium.launch();
const failures = [];
let scans = 0;

async function scan(page, label) {
  scans += 1;
  const results = await new AxeBuilder({ page }).withTags(tags).analyze();
  if (results.violations.length === 0) {
    console.log(`PASS  ${label}`);
    return;
  }
  failures.push(label);
  console.log(`FAIL  ${label}`);
  for (const violation of results.violations) {
    for (const node of violation.nodes) {
      console.log(`        [${violation.id}] ${node.target.join(' ')}`);
    }
  }
}

async function worker(queue) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    for (;;) {
      const job = queue.pop();
      if (!job) return;
      const { slug, dark } = job;
      await page.goto(`${baseUrl}/#${slug}`, { waitUntil: 'networkidle', timeout: 60_000 });
      await page.waitForTimeout(1500);
      if (dark) {
        await page.evaluate(() => {
          document.documentElement.setAttribute('data-mode', 'dark');
          document.documentElement.classList.add('dark');
        });
        await page.waitForTimeout(800);
      }
      await scan(page, `${dark ? 'dark ' : 'light'} #${slug}`);
    }
  } finally {
    await page.close();
    await context.close();
  }
}

const queue = [];
for (const dark of [false, true]) for (const slug of slugs) queue.push({ slug, dark });
await Promise.all(Array.from({ length: concurrency }, () => worker(queue)));

// Docs routes are discovered from the docs nav so the list cannot drift.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/docs`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(1000);
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll('nav[aria-label="Docs"] a[href^="/docs"]')].map((link) =>
      link.getAttribute('href'),
    ),
  );
  const routes = [...new Set(['/docs', ...hrefs])];
  for (const route of routes) {
    for (const dark of [false, true]) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 60_000 });
      await page.waitForTimeout(1200);
      await page.evaluate((isDark) => {
        document.documentElement.setAttribute('data-mode', isDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', isDark);
      }, dark);
      await page.waitForTimeout(700);
      await scan(page, `${dark ? 'dark ' : 'light'} ${route}`);
    }
  }
  await page.close();
  await context.close();
}

// The palette is a dialog that only exists once opened.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(1500);
  await page.keyboard.press('Meta+k');
  await page.waitForTimeout(900);
  await scan(page, 'light #component-search (palette open)');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.close();
  await context.close();
}

async function scanInteractiveStates(dark) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    colorScheme: dark ? 'dark' : 'light',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const main = page.getByRole('main');
  const theme = dark ? 'dark ' : 'light';

  async function open(route, heading) {
    await page.goto(`${baseUrl}${route}`);
    await main.getByRole('heading', { name: heading, exact: true }).waitFor();
    await page.locator(`html[data-mode="${dark ? 'dark' : 'light'}"]`).waitFor();
  }

  try {
    await open('/#invalid-component', 'Component not found');
    await scan(page, `${theme} 390px invalid component`);
    await main.getByRole('button', { name: 'Find a component' }).tap();
    const palette = page.getByRole('dialog', { name: 'Component search' });
    await palette.getByRole('combobox', { name: 'Search components' }).fill('not-found');
    await palette.getByText('No components found').waitFor();
    await scan(page, `${theme} 390px search with no results`);
    await page.keyboard.press('Escape');

    await open('/#dialog', 'Dialog');
    await main.getByRole('button', { name: 'Open dialog' }).tap();
    const dialog = page.getByRole('dialog', { name: 'Confirm' });
    await page.waitForFunction(
      (popup) => popup.ownerDocument.defaultView.getComputedStyle(popup).opacity === '1',
      await dialog.elementHandle(),
    );
    await scan(page, `${theme} 390px Dialog open`);
    await page.keyboard.press('Escape');

    await open('/#layer-dialog', 'Layer dialog');
    await main.getByRole('button', { name: 'Edit Worker' }).tap();
    await page.getByRole('dialog', { name: 'Edit Worker' }).waitFor();
    await scan(page, `${theme} 390px LayerDialog open`);
    await page.keyboard.press('Escape');

    await open('/#select', 'Select');
    await main.getByRole('combobox', { name: 'Fruit' }).tap();
    await page.getByRole('listbox').waitFor();
    await scan(page, `${theme} 390px Select open`);
    await page.keyboard.press('Escape');

    await open('/#tooltip', 'Tooltip');
    await main.getByRole('button', { name: 'Edge requests' }).focus();
    await page.keyboard.press('Tab');
    await page.getByRole('tooltip').getByText('Deploy a new version').waitFor();
    await scan(page, `${theme} 390px Tooltip open`);
    await page.keyboard.press('Escape');

    await open('/#toasty', 'Toasty');
    await main.getByRole('button', { name: 'Error toast' }).tap();
    await page.getByText('Deployment failed', { exact: true }).waitFor();
    await scan(page, `${theme} 390px error toast`);

    await open('/docs/does-not-exist', 'Page not found');
    await scan(page, `${theme} 390px docs 404`);
  } finally {
    await context.close();
  }
}

await Promise.all([scanInteractiveStates(false), scanInteractiveStates(true)]);

await browser.close();
stopServer();

console.log(`\na11y-check: ${scans} scans, ${failures.length} failing`);
process.exit(failures.length === 0 ? 0 : 1);
