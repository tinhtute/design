import { expect, test } from '@playwright/test';

test('opens the worker inventory and filters and retires a worker with the keyboard at 320px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#dashboard');
  const inventoryLink = page.getByRole('link', { name: 'Open worker inventory' });
  await expect(inventoryLink).toBeInViewport({ ratio: 1 });
  await inventoryLink.press('Enter');
  await expect(page).toHaveURL(/#resource-list-page$/);
  const demo = page.getByRole('tabpanel', { name: 'Demo' });
  const query = demo.getByRole('textbox', { name: 'Filter workers…' });
  await query.fill('missing-deployment');
  await expect(demo.getByText('Showing 3 of 3 workers.')).toBeVisible();
  await query.press('Enter');
  await expect(demo.getByText('No matching workers')).toBeVisible();
  const reset = demo.getByRole('button', { name: 'Reset filter' });
  await reset.scrollIntoViewIfNeeded();
  await expect(reset).toBeInViewport({ ratio: 1 });
  await reset.press('Enter');
  const results = demo.getByRole('heading', { name: 'Deployments' });
  await expect(results).toBeFocused();
  await expect(query).toHaveValue('');

  const details = demo.getByRole('button', { name: 'About worker states' });
  await details.press('Space');
  await expect(details).toHaveAttribute('aria-expanded', 'true');
  await expect(demo.getByText('Receives traffic.', { exact: true })).toBeVisible();
  await details.press('Space');
  await expect(details).toHaveAttribute('aria-expanded', 'false');

  const deleteWorker = demo.getByRole('button', { name: 'Delete cache-purger' });
  await deleteWorker.scrollIntoViewIfNeeded();
  await expect(deleteWorker).toBeInViewport({ ratio: 1 });
  await deleteWorker.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Delete cache-purger' });
  await expect(dialog).toBeInViewport({ ratio: 1 });
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(deleteWorker).toBeFocused();
  await deleteWorker.press('Enter');
  const confirm = dialog.getByRole('textbox', { name: 'Type cache-purger to confirm deletion' });
  const submit = dialog.getByRole('button', { name: 'Delete worker' });
  await expect(submit).toBeDisabled();
  await confirm.fill('cache-purger');
  await confirm.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(submit).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(deleteWorker).toHaveCount(0);
  await expect(results).toBeFocused();
  await expect(demo.getByText('Deleted cache-purger. Showing 2 of 2 workers.')).toBeVisible();

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  const main = page.getByRole('main');
  expect(await main.evaluate((element) => element.scrollWidth)).toBe(320);
});

test('keeps loaded rows during refresh and offers keyboard retry after an error', async ({
  page,
}) => {
  const now = new Date('2026-11-27T12:00:00Z');
  await page.clock.install({ time: now });
  await page.goto('/#resource-list-page');
  const demo = page.getByRole('tabpanel', { name: 'Demo' });
  const refresh = demo.getByRole('button', { name: 'Refresh inventory' });
  await expect(refresh).toBeVisible();
  await page.clock.pauseAt(new Date(now.getTime() + 15_000));
  await refresh.press('Enter');
  await expect(refresh).toBeDisabled();
  await expect(demo.getByRole('status', { name: 'Refreshing inventory' })).toBeVisible();
  await expect(demo.getByText('api-gateway', { exact: true })).toBeVisible();
  await page.clock.fastForward(600);
  const error = demo.getByRole('alert').filter({ hasText: 'Inventory could not refresh' });
  await expect(error).toBeVisible();
  await expect(demo.getByText('api-gateway', { exact: true })).toBeVisible();
  const retry = demo.getByRole('button', { name: 'Retry refresh' });
  await expect(retry).toBeFocused();
  await retry.press('Enter');
  await page.clock.fastForward(600);
  await expect(error).toBeHidden();
  await expect(demo.getByText('Inventory is up to date.')).toBeAttached();
  await expect(refresh).toBeFocused();
});

test('keeps the delete confirmation available after a failed request', async ({ page }) => {
  await page.goto('/#delete-resource');
  const demo = page.getByRole('tabpanel', { name: 'Demo' });
  const trigger = demo.getByRole('button', { name: 'Delete worker' });
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Delete api-gateway' });
  const confirm = dialog.getByRole('textbox', { name: 'Type api-gateway to confirm deletion' });
  const submit = dialog.getByRole('button', { name: 'Delete worker' });
  await expect(submit).toBeDisabled();
  await confirm.fill('api-gateway');
  const alert = dialog.getByRole('alert');
  await expect(alert).toBeAttached();
  await expect(alert).toHaveText('');
  await submit.press('Enter');
  await expect(alert).toHaveText('Could not delete the worker. Try again.');
  await expect(dialog.getByText('Could not delete the worker. Try again.')).toBeVisible();
  await expect(confirm).toHaveValue('api-gateway');
  await submit.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(demo.getByRole('status')).toHaveText('Deleted api-gateway.');
});

test('clears a draft without resetting the applied filter', async ({ page }) => {
  await page.goto('/#filter-bar');
  const demo = page.getByRole('tabpanel', { name: 'Demo' });
  const query = demo.getByRole('textbox', { name: 'Filter workers…' });
  await query.fill('cache');
  await demo.getByRole('button', { name: 'Apply filter' }).press('Enter');
  const count = demo.getByRole('status');
  await expect(count).toHaveText('Showing 1 of 6 workers.');
  await demo.getByRole('button', { name: 'Clear search' }).press('Enter');
  await expect(query).toHaveValue('');
  await expect(count).toHaveText('Showing 1 of 6 workers.');
  await query.press('Enter');
  await expect(count).toHaveText('Showing 6 of 6 workers.');
});
