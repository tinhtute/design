import { expect, test } from '@playwright/test';

for (const { slug, triggerName, title } of [
  { slug: 'dialog', triggerName: 'Open dialog', title: 'Confirm' },
  { slug: 'layer-dialog', triggerName: 'Edit Worker', title: 'Edit Worker' },
]) {
  test(`${slug} contains keyboard focus and restores it on Escape`, async ({ page }) => {
    await page.goto(`/#${slug}`);
    const trigger = page.getByRole('main').getByRole('button', { name: triggerName });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: title });
    await expect(dialog).toBeVisible();

    for (const key of ['Tab', 'Tab', 'Shift+Tab']) {
      await page.keyboard.press(key);
      await expect(dialog.locator(':focus').or(dialog.and(page.locator(':focus')))).toHaveCount(1);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test('reads field help and errors and fits enlarged text', async ({ page }) => {
  await page.goto('/#field');
  const main = page.getByRole('main');
  const email = main.getByRole('textbox', { name: 'Email' });
  const name = main.getByRole('textbox', { name: 'Worker name' });
  await expect(email).toHaveAccessibleDescription("We'll only use this for account recovery.");
  await expect(name).toHaveAccessibleDescription('api-gateway is already taken.');
  const longEmail = 'nguyen-thi-minh-anh+deployment-notifications@operations.example.com';
  await email.fill(longEmail);
  await expect(email).toHaveValue(longEmail);
  await page.locator('html').evaluate(async (root) => {
    await document.fonts.ready;
    root.style.fontSize = '200%';
  });
  await expect(main.getByText('api-gateway is already taken.')).toBeVisible();
  await expect(email).toBeInViewport();
  await expect
    .poll(() => main.evaluate((element) => element.scrollWidth - element.clientWidth))
    .toBe(0);

  await page.goto('/#input');
  await expect(main.getByRole('textbox', { name: 'Worker name' })).toHaveAccessibleDescription(
    'Names can only contain lowercase letters, numbers, and hyphens.',
  );
});

test('operates checkboxes, radios and select by keyboard', async ({ page }) => {
  const main = page.getByRole('main');
  await page.goto('/#checkbox');
  const check = main.getByRole('checkbox', { name: 'Enable health checks' });
  await expect(check).toBeChecked();
  await check.focus();
  await page.keyboard.press('Space');
  await expect(check).not.toBeChecked();
  await expect(main.getByRole('checkbox', { name: 'PagerDuty' })).toBeDisabled();

  await page.goto('/#radio');
  const group = main.getByRole('group', { name: 'Notification preference' });
  await group.getByRole('radio', { name: 'Email' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(group.getByRole('radio', { name: 'SMS' })).toBeChecked();

  await page.goto('/#select');
  const select = main.getByRole('combobox', { name: 'Fruit' });
  await select.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('b');
  await page.keyboard.press('Enter');
  await expect(select).toHaveText('Banana');
  await expect(select).toBeFocused();
});

test('reaches the catalog from an inline link by keyboard', async ({ page }) => {
  await page.goto('/#link');
  const main = page.getByRole('main');
  const catalog = main.getByRole('link', { name: 'component catalog' });
  await catalog.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/$/);
  await expect(main.getByRole('heading', { name: 'Button', exact: true })).toBeVisible();
});

test('opens and dismisses a tooltip by keyboard', async ({ page }) => {
  await page.goto('/#tooltip');
  const main = page.getByRole('main');
  const trigger = main.getByRole('button', { name: 'Deploy' });
  await main.getByRole('button', { name: 'Edge requests' }).focus();
  await page.keyboard.press('Tab');
  await expect(trigger).toBeFocused();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveText('Deploy a new version');
  await expect(trigger).toHaveAccessibleDescription('Deploy a new version');
  await page.keyboard.press('Escape');
  await expect(tooltip).toBeHidden();
  await expect(trigger).toBeFocused();
});

test.describe('touch states', () => {
  test.use({
    colorScheme: 'dark',
    hasTouch: true,
    isMobile: true,
    viewport: { width: 320, height: 800 },
  });

  test('opens and saves the layer dialog without a swipe', async ({ page }) => {
    await page.goto('/#layer-dialog');
    const trigger = page.getByRole('button', { name: 'Edit Worker' });
    await trigger.tap();
    const dialog = page.getByRole('dialog', { name: 'Edit Worker' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Save', exact: true }).tap();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeInViewport();
  });

  test('selects a date and keeps the next month reachable', async ({ page }) => {
    await page.goto('/#date-picker');
    const main = page.getByRole('main');
    const day = main.getByRole('grid').getByRole('button', { name: /^15,/ }).first();
    await day.tap();
    await expect(day).toHaveAccessibleName(/, selected$/);
    await expect(main.getByRole('button', { name: 'Next month' })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  });

  test('opens a select and acknowledges an actionable toast on touch', async ({ page }) => {
    await page.goto('/#select');
    const select = page.getByRole('combobox', { name: 'Fruit' });
    await select.tap();
    await page.getByRole('option', { name: 'Cherry' }).tap();
    await expect(select).toHaveText('Cherry');

    await page.goto('/#toasty');
    await page.getByRole('button', { name: 'Toast with action' }).tap();
    await expect(page.getByText('Worker deleted', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Undo' }).tap();
    await expect(page.getByText('Worker restored', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  });
});
