import { expect, test, type Page } from '@playwright/test';

const demoTabs = (page: Page) =>
  page
    .getByRole('main')
    .getByRole('tablist')
    .filter({ has: page.getByRole('tab', { name: 'Overview' }) })
    .first();

const indicator = (page: Page) => demoTabs(page).locator('[class*="active-tab-left"]');

test.describe('motion with default preferences', () => {
  test('tabs indicator transitions only geometry on the duration token', async ({ page }) => {
    await page.goto('/#tabs');
    const style = await indicator(page).evaluate((el) => {
      const s = getComputedStyle(el);
      return { property: s.transitionProperty, duration: s.transitionDuration };
    });
    expect(style.property).not.toContain('all');
    expect(style.property).toContain('translate');
    expect(style.duration.split(',')[0].trim()).toBe('0.2s');
  });

  test('tabs indicator settles on the last tab after rapid switching', async ({ page }) => {
    await page.goto('/#tabs');
    const tabs = demoTabs(page).getByRole('tab');
    const count = await tabs.count();
    for (let round = 0; round < 3; round += 1) {
      for (let i = 0; i < count; i += 1) await tabs.nth(i).click({ delay: 0 });
    }
    const last = tabs.nth(count - 1);
    await expect(last).toHaveAttribute('aria-selected', 'true');
    await expect
      .poll(async () => {
        const [tab, bar] = await Promise.all([last.boundingBox(), indicator(page).boundingBox()]);
        return tab && bar ? Math.abs(tab.x - bar.x) + Math.abs(tab.width - bar.width) : Infinity;
      })
      .toBeLessThan(1);
  });

  test('loader spinner runs', async ({ page }) => {
    await page.goto('/#loader');
    const paused = await page
      .getByRole('main')
      .locator('svg[role="status"]')
      .first()
      .evaluate((svg) => (svg as SVGSVGElement).animationsPaused());
    expect(paused).toBe(false);
  });
});

test.describe('motion with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('tabs indicator does not transition', async ({ page }) => {
    await page.goto('/#tabs');
    await expect
      .poll(() => indicator(page).evaluate((el) => getComputedStyle(el).transitionProperty))
      .toBe('none');
  });

  test('loader spinner pauses on a visible arc', async ({ page }) => {
    await page.goto('/#loader');
    const svg = page.getByRole('main').locator('svg[role="status"]').first();
    await expect
      .poll(() => svg.evaluate((el) => (el as SVGSVGElement).animationsPaused()))
      .toBe(true);
    const dash = await svg
      .locator('circle')
      .first()
      .evaluate((el) => getComputedStyle(el).strokeDasharray);
    expect(dash).not.toMatch(/^0(px)?[ ,]/);
  });

  test('skeleton shimmer is static', async ({ page }) => {
    await page.goto('/#loader');
    const name = await page.evaluate(() => {
      const line = document.createElement('div');
      line.className = 'skeleton-line';
      document.body.append(line);
      return getComputedStyle(line, '::after').animationName;
    });
    expect(name).toBe('none');
  });

  test('meter and switch drop their transitions', async ({ page }) => {
    await page.goto('/#meter');
    const meter = page.getByRole('main').getByRole('meter').first();
    const fill = meter.locator('div div').last();
    expect(await fill.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe('none');
    await page.goto('/#switch');
    const toggle = page.getByRole('main').getByRole('switch').first();
    expect(await toggle.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe('none');
  });
});
