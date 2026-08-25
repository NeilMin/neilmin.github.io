// @ts-check
// tests/e2e/scroll-shrink.spec.js
// Verify blog and project cards "breathe" while scrolling: they shrink
// while the page scrolls (.is-scrolling on the card grid) and spring
// back quickly once scrolling goes idle. Also guards against
// reduced-motion regressions and entrance-fade specificity regressions.

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:1313';
const IDLE_MS = 120; // must match card-scroll-shrink.js

const PAGES = [
  { name: 'Posts', url: '/posts/', grid: '.posts-grid', card: '.post-entry', entranceFade: '0.5' },
  { name: 'Projects', url: '/projects/', grid: '.projects-grid', card: '.project-card', entranceFade: '0.55' },
];

/** Reveal entrance animations, then let their transitions finish. */
async function revealSettled(page, cfg) {
  await page.waitForSelector(`${cfg.grid} ${cfg.card}--revealed`, { timeout: 5000 });
  await page.waitForTimeout(800);
}

/** Fire successive scrolls so the idle timer keeps resetting. */
async function scrollContinuously(page, steps) {
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((n) => window.scrollBy(0, n % 2 === 0 ? -120 : 150), i);
    await page.waitForTimeout(50);
  }
}

for (const cfg of PAGES) {
  test.describe(`${cfg.name}: card scroll breathing`, () => {
    test('scrolling adds is-scrolling, idle removes it', async ({ page }) => {
      await page.goto(`${BASE}${cfg.url}`, { waitUntil: 'domcontentloaded' });
      await revealSettled(page, cfg);

      await expect(page.locator(cfg.grid)).not.toHaveClass(/is-scrolling/);

      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForFunction(
        (sel) => document.querySelector(sel).classList.contains('is-scrolling'),
        cfg.grid,
        { timeout: 1000 },
      );

      // No further scrolls → after IDLE_MS the class must be removed again
      await page.waitForFunction(
        (sel) => !document.querySelector(sel).classList.contains('is-scrolling'),
        cfg.grid,
        { timeout: IDLE_MS + 1500 },
      );
    });

    test('cards shrink while scrolling and restore after idle', async ({ page }) => {
      await page.goto(`${BASE}${cfg.url}`, { waitUntil: 'domcontentloaded' });
      await revealSettled(page, cfg);

      await scrollContinuously(page, 6); // 300ms of scrolling > IDLE_MS

      const shrunkScale = await page.evaluate(({ grid, card }) => {
        const el = document.querySelector(`${grid} ${card}`);
        return parseFloat(getComputedStyle(el).scale);
      }, cfg);
      expect(shrunkScale, 'visible cards should be shrunk mid-scroll').toBeLessThan(0.99);

      // Stop scrolling → card must return to full size
      await page.waitForFunction(({ grid, card }) => {
        const s = getComputedStyle(document.querySelector(`${grid} ${card}`)).scale;
        return s === 'none' || Math.abs(parseFloat(s) - 1) < 0.005;
      }, cfg, { timeout: IDLE_MS + 1500 });
    });

    test('idle release is fast: class drops inside a 150ms scroll gap', async ({ page }) => {
      await page.goto(`${BASE}${cfg.url}`, { waitUntil: 'domcontentloaded' });
      await revealSettled(page, cfg);

      // Keep scrolling on a 150ms cadence and watch for any release
      // BETWEEN scrolls. A timer slower than 150ms never fires inside
      // the gaps, so this discriminates fast vs slow idle thresholds.
      // Must observe ON first — a drop only counts after we've seen
      // the class actually applied.
      const result = await page.evaluate(({ grid }) => {
        return new Promise((resolve) => {
          const el = document.querySelector(grid);
          let sawOn = false;
          let releasedAfterOn = false;
          const t0 = performance.now();
          window.scrollBy(0, 100);
          const cadence = setInterval(() => window.scrollBy(0, 100), 150);
          function tick() {
            const on = el.classList.contains('is-scrolling');
            if (on) sawOn = true;
            else if (sawOn) releasedAfterOn = true;
            if (performance.now() - t0 < 900) requestAnimationFrame(tick);
            else {
              clearInterval(cadence);
              resolve({ sawOn, releasedAfterOn });
            }
          }
          requestAnimationFrame(tick);
        });
      }, cfg);
      expect(result.sawOn, 'scrolling must engage is-scrolling').toBe(true);
      expect(result.releasedAfterOn, 'is-scrolling must release within the 150ms gaps').toBe(true);
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

  test.describe(`${cfg.name}: card scroll breathing (reduced motion)`, () => {
    // NOTE: test.use({ reducedMotion: 'reduce' }) silently fails to reach
    // the page in this setup, so emulate explicitly BEFORE navigating so
    // scripts load with reduce already active.
    test('no breathing effect under prefers-reduced-motion', async ({ page }) => {
      await page.goto('about:blank');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`${BASE}${cfg.url}`, { waitUntil: 'domcontentloaded' });
      await revealSettled(page, cfg);

      await scrollContinuously(page, 4);
      await page.waitForTimeout(100);

      const state = await page.evaluate(({ grid, card }) => ({
        hasClass: document.querySelector(grid).classList.contains('is-scrolling'),
        cardScale: getComputedStyle(document.querySelector(`${grid} ${card}`)).scale,
      }), cfg);
      expect(state.hasClass, 'is-scrolling must never appear under reduced motion').toBe(false);
      expect(
        state.cardScale === 'none' || Math.abs(parseFloat(state.cardScale) - 1) < 0.005,
        'cards must stay at full size under reduced motion',
      ).toBe(true);
    });
  });
}
