import { readdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

// `pnpm --filter app visual` runs with the app package as cwd; deriving the
// page list from the demos keeps the snapshots in step with the showroom.
const demosDir = path.join(process.cwd(), 'demos');
const slugs = readdirSync(demosDir)
  .filter((file) => file.endsWith('.tsx'))
  .map((file) => file.slice(0, -'.tsx'.length))
  .sort();

test.describe('showroom demos', () => {
  for (const slug of slugs) {
    test(`${slug} (light)`, async ({ page }) => {
      await capture(page, `/#${slug}`, `${slug}-light`);
    });

    test(`${slug} (dark)`, async ({ page }) => {
      await capture(page, `/#${slug}`, `${slug}-dark`, { dark: true });
    });
  }

  test('docs pages', async ({ page }) => {
    await page.goto('/docs', { waitUntil: 'networkidle' });
    const hrefs = await page.$$eval('nav[aria-label="Docs"] a[href^="/docs"]', (links) =>
      links.map((link) => link.getAttribute('href') ?? ''),
    );
    const routes = [...new Set(['/docs', ...hrefs])];
    for (const route of routes) {
      const name = route.replace(/^\//, '').replace(/\//g, '-');
      await capture(page, route, `${name}-light`);
      await capture(page, route, `${name}-dark`, { dark: true });
    }
  });
});

async function capture(
  page: Page,
  url: string,
  name: string,
  { dark = false }: { dark?: boolean } = {},
) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  if (dark) {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-mode', 'dark');
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(800);
  }
  await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: false });
}
