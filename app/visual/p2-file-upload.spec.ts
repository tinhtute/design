import { expect, test } from '@playwright/test';

test.describe('File upload block (P2.1)', () => {
  test('supports native file selection, progress semantics, retry, cancel, and non-retryable validation errors', async ({
    page,
  }) => {
    await page.goto('/#file-upload');
    const main = page.getByRole('main');

    await expect(main.getByRole('heading', { name: 'File upload', exact: true })).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Upload queue', exact: true })).toBeVisible();

    // Native <progress> elements carry accessible names
    await expect(main.getByRole('progressbar', { name: /Overall upload progress/ })).toBeVisible();
    await expect(
      main.getByRole('progressbar', {
        name: /Uploading design-tokens-bundle-production-release-v2\.15\.0\.json/,
      }),
    ).toBeVisible();

    // Validation error is NOT retryable; network error IS retryable
    await expect(
      main.getByRole('button', {
        name: 'Retry raw-production-database-dump-very-long-filename-for-overflow-check.sql',
      }),
    ).toHaveCount(0);

    const retryNetwork = main.getByRole('button', {
      name: 'Retry edge-telemetry-snapshot-2026-11-28.csv',
    });
    await expect(retryNetwork).toBeVisible();

    // Retrying one item does NOT clear other items in the queue
    await retryNetwork.click();
    await expect(main.getByText('quarterly-report-q4-2026.pdf')).toBeVisible();
    await expect(
      main.getByText('raw-production-database-dump-very-long-filename-for-overflow-check.sql'),
    ).toBeVisible();
    await expect(retryNetwork).toHaveCount(0, { timeout: 5000 });

    // Canceling an uploading item transitions it to Canceled and enables Retry
    const cancelUploading = main.getByRole('button', {
      name: 'Cancel design-tokens-bundle-production-release-v2.15.0.json',
    });
    await cancelUploading.click();
    await expect(
      main.getByRole('button', {
        name: 'Retry design-tokens-bundle-production-release-v2.15.0.json',
      }),
    ).toBeVisible();

    // Native file picker adds valid + invalid files without drag-and-drop
    const fileInput = main.locator('input[type="file"]');
    await fileInput.setInputFiles([
      {
        name: 'deploy-manifest.json',
        mimeType: 'application/json',
        buffer: Buffer.from('{"ok":true}'),
      },
      {
        name: 'unsupported-binary.exe',
        mimeType: 'application/octet-stream',
        buffer: Buffer.from('MZ'),
      },
    ]);

    await expect(main.getByText('deploy-manifest.json')).toBeVisible();
    await expect(main.getByText('unsupported-binary.exe')).toBeVisible();
    await expect(main.getByRole('button', { name: 'Retry unsupported-binary.exe' })).toHaveCount(0);

    // Clearing all shows the Empty dropzone state with keyboard-focusable Choose files button
    await main.getByRole('button', { name: 'Clear all' }).click();
    await expect(main.getByRole('heading', { name: 'Upload files', exact: true })).toBeVisible();
    const chooseFiles = main.getByRole('button', { name: 'Choose files' });
    await chooseFiles.focus();
    await expect(chooseFiles).toBeFocused();
  });

  test('stays within 320px viewport with long filenames in dark mode and reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/#file-upload');

    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { name: 'File upload', exact: true })).toBeVisible();
    await expect(
      main.getByText('raw-production-database-dump-very-long-filename-for-overflow-check.sql'),
    ).toBeVisible();

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    expect(await main.evaluate((el) => el.scrollWidth)).toBe(320);
  });
});
