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

  test('keeps narrow showroom controls and wide demos reachable', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/#date-range-picker');
    await expect(page.getByRole('heading', { name: 'Date range picker' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dark theme' })).toBeInViewport({ ratio: 1 });
    await expect(page.getByRole('button', { name: 'Search' })).toBeInViewport({ ratio: 1 });
    const sidebar = page.getByRole('button', { name: 'Expand sidebar' });
    await expect(sidebar).toHaveAttribute('aria-expanded', 'false');
    await sidebar.click();
    const menu = page.getByRole('navigation', { name: 'Navigation' });
    await expect(menu).toBeVisible();
    await menu.getByRole('button', { name: 'Date range picker' }).click();
    await expect(sidebar).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('heading', { name: 'Date range picker' })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    const main = page.getByRole('main');
    expect(await main.evaluate((el) => el.scrollWidth)).toBe(320);
    const nextMonth = page.getByRole('button', { name: 'Next month' });
    await nextMonth.scrollIntoViewIfNeeded();
    await expect(nextMonth).toBeInViewport({ ratio: 1 });
    expect(await main.evaluate((el) => el.scrollLeft)).toBe(0);
    await page.getByRole('link', { name: 'Docs', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: 'Getting started' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dark theme' })).toBeInViewport({ ratio: 1 });
  });

  test('restores the selected theme after a refresh and across sections', async ({ page }) => {
    await page.goto('/');
    const theme = page.getByRole('button', { name: 'Dark theme' });
    await expect(theme).toHaveAttribute('aria-pressed', 'false');
    await theme.click();
    await expect(theme).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(theme).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Docs' }).click();
    await expect(page.getByRole('heading', { name: 'Getting started' })).toBeVisible();
    await expect(theme).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    await theme.click();
    await page.reload();
    await expect(theme).toHaveAttribute('aria-pressed', 'false');
  });

  test('names the search dialog and supports its keyboard and empty states', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Search' });
    await trigger.focus();
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: 'Component search' });
    const query = dialog.getByRole('combobox', { name: 'Search components' });
    await expect(query).toBeFocused();
    await query.fill('not-a-component');
    await expect(dialog.getByText('No components found')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

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
