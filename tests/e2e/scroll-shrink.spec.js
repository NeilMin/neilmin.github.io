// @ts-check
// tests/e2e/scroll-shrink.spec.js
// Verify blog and project cards remain visually stable during scroll
// (no jittery scroll-shrink / breathing) while entrance fade transitions
// remain preserved.

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:1313';

const PAGES = [
  { name: 'Posts', url: '/posts/', grid: '.posts-grid', card: '.post-entry', entranceFade: '0.5' },
  { name: 'Projects', url: '/projects/', grid: '.projects-grid', card: '.project-card', entranceFade: '0.55' },
];

/** Reveal entrance animations, then let their transitions finish. */
async function revealSettled(page, cfg) {
  await page.waitForSelector(`${cfg.grid} ${cfg.card}--revealed`, { timeout: 5000 });
  await page.waitForTimeout(800);
}

/** Fire successive scrolls. */
async function scrollContinuously(page, steps) {
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((n) => window.scrollBy(0, n % 2 === 0 ? -120 : 150), i);
    await page.waitForTimeout(50);
  }
}

for (const cfg of PAGES) {
  test.describe(`${cfg.name}: card scroll stability`, () => {
    test('cards maintain full size without shrinking while scrolling', async ({ page }) => {
      await page.goto(`${BASE}${cfg.url}`, { waitUntil: 'domcontentloaded' });
      await revealSettled(page, cfg);

      await expect(page.locator(cfg.grid)).not.toHaveClass(/is-scrolling/);

      await scrollContinuously(page, 6);

      const state = await page.evaluate(({ grid, card }) => {
        const el = document.querySelector(`${grid} ${card}`);
        const computed = getComputedStyle(el);
        return {
          hasClass: document.querySelector(grid).classList.contains('is-scrolling'),
          scale: computed.scale,
        };
      }, cfg);

      expect(state.hasClass, 'grid should never have is-scrolling class').toBe(false);
      expect(
        state.scale === 'none' || Math.abs(parseFloat(state.scale) - 1) < 0.005,
        'cards should not shrink during scroll',
      ).toBe(true);
    });

    test(`entrance reveal keeps its fade transition on ${cfg.card}`, async ({ page }) => {
      await page.goto(`${BASE}${cfg.url}`, { waitUntil: 'domcontentloaded' });
      await revealSettled(page, cfg);

      const durations = await page.evaluate(({ grid, card }) => {
        const el = document.querySelector(`${grid} ${card}--revealed`);
        return getComputedStyle(el).transitionDuration;
      }, cfg);
      expect(durations, 'revealed card must keep its entrance fade').toContain(cfg.entranceFade);
    });
  });
}
