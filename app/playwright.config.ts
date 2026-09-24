import { defineConfig, devices } from '@playwright/test';

/**
 * Visual regression config. Snapshots are captured from a production build on
 * port 3101 so the dev overlay never lands in a baseline; `pnpm --filter app
 * visual` assumes that build exists (`pnpm --filter app build`).
 */
export default defineConfig({
  testDir: './visual',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    baseURL: process.env.VISUAL_BASE_URL ?? 'http://127.0.0.1:3101',
    colorScheme: 'light',
  },
  expect: {
    toHaveScreenshot: {
      // Per-pixel colour tolerance absorbs anti-aliasing and font-hinting
      // differences; the pixel budget stays small enough that a shifted line
      // of text or a recoloured control still fails the check.
      threshold: 0.2,
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  webServer: process.env.VISUAL_BASE_URL
    ? undefined
    : {
        command: 'pnpm exec next start --port 3101',
        url: 'http://127.0.0.1:3101',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
