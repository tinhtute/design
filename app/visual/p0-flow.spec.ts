import { expect, test } from '@playwright/test';

test('skips the component rail without changing the demo link', async ({ page }) => {
  await page.goto('/#badge');
  await expect(page.getByRole('heading', { name: 'Badge', exact: true })).toBeVisible();

  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to demo' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page).toHaveURL(/\/#badge$/);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('tab', { name: 'Demo' })).toBeFocused();
});

test('restores the demo and its default view when using browser history', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Badge', exact: true }).click();
  await expect(page).toHaveURL(/\/#badge$/);
  await page.getByRole('tab', { name: 'Code' }).click();
  await expect(page.getByRole('tab', { name: 'Code' })).toHaveAttribute('aria-selected', 'true');

  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Button', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Demo' })).toHaveAttribute('aria-selected', 'true');
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Badge', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Demo' })).toHaveAttribute('aria-selected', 'true');
});

test('keeps the table of contents demo when its section links change the hash', async ({ page }) => {
  await page.goto('/#table-of-contents');
  const demo = page.getByRole('tabpanel', { name: 'Demo' });
  const overview = demo.getByRole('link', { name: 'Overview' });
  await overview.click();
  await expect(page).toHaveURL(/\/#overview$/);
  await expect(overview).toHaveAttribute('aria-current', 'true');
  await expect(page.getByRole('heading', { name: 'Table of contents', exact: true })).toBeVisible();

  const installation = demo.getByRole('link', { name: 'Installation' });
  await installation.click();
  await expect(page).toHaveURL(/\/#installation$/);
  await expect(installation).toHaveAttribute('aria-current', 'true');
});

test('recovers an unknown component with keyboard search', async ({ page }) => {
  await page.goto('/#does-not-exist');
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { name: 'Component not found' })).toBeVisible();
  await expect(main.getByRole('tablist')).toHaveCount(0);
  const recovery = main.getByRole('button', { name: 'Find a component' });
  await recovery.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Component search' });
  const query = dialog.getByRole('combobox', { name: 'Search components' });
  await expect(query).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(recovery).toBeFocused();

  await page.keyboard.press('Enter');
  await query.fill('badge');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/#badge$/);
  await expect(main.getByRole('heading', { name: 'Badge', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search' })).toBeFocused();
});

test('invalid docs URLs return 404 and provide routes back', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const response = await page.goto('/docs/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
  await expect(page.getByRole('link', { name: 'Go to showroom' })).toHaveAttribute('href', '/');
  await page.getByRole('link', { name: 'Go to docs' }).click();
  await expect(page.getByRole('heading', { name: 'Getting started' })).toBeVisible();
});

test('copies the install command and opens registry setup from the Button example', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/#button');
  await page.getByRole('tab', { name: 'Code' }).click();
  await page
    .getByRole('tabpanel', { name: 'Code' })
    .getByRole('button', { name: 'Copy to clipboard' })
    .first()
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe('pnpm dlx shadcn add @therealtinhtute/button');
  await page.getByRole('link', { name: 'Configure the registry' }).click();
  await expect(page).toHaveURL(/\/docs#configuration$/);
  await expect(
    page.getByText('https://design.tinhtute.me/r/{name}.json', { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Install your first component' })).toBeVisible();
  await page.getByRole('link', { name: 'Button demo' }).first().click();
  await expect(page).toHaveURL(/\/#button$/);
  await expect(page.getByRole('tab', { name: 'Demo' })).toHaveAttribute('aria-selected', 'true');
});

test('shows the full install heading in the desktop contents', async ({ page }) => {
  await page.goto('/docs');
  const contents = page.getByRole('navigation', { name: 'Table of contents' });
  const install = contents.getByRole('link', { name: 'Install your first component' });
  await expect(install).toBeVisible();
  await expect(install).toHaveCSS('white-space', 'normal');
  await install.click();
  await expect(page).toHaveURL(/\/docs#install-your-first-component$/);
});

test.describe('compact docs', () => {
  test.use({ hasTouch: true, isMobile: true });

  for (const width of [320, 390]) {
    test(`opens the docs contents with touch at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/docs');
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name: 'Skip to documentation' })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('main')).toBeFocused();

      const toc = page.getByRole('navigation', { name: 'Table of contents' });
      await expect(toc).toHaveCount(0);
      await page.locator('summary').tap();
      await expect(toc).toBeVisible();
      await toc.getByRole('link', { name: 'Install your first component' }).tap();
      await expect(page).toHaveURL(/#install-your-first-component$/);
      await expect(
        page.getByRole('heading', { name: 'Install your first component' }),
      ).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
});
