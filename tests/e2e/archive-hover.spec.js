// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:1313';
const PAGES = [
  { name: 'Archive (EN)', url: '/archives/' },
  { name: 'Archive (ZH)', url: '/zh/archives/' }
];

test.describe('Archive entry hover interaction', () => {
  for (const cfg of PAGES) {
    test(`${cfg.name}: should have hover card style and transition effects`, async ({ page }) => {
      await page.goto(`${BASE}${cfg.url}`, { waitUntil: 'domcontentloaded' });

      const entry = page.locator('.archive-entry').first();
      await expect(entry, 'should have at least one archive entry').toBeVisible({ timeout: 3000 });

      const title = entry.locator('.archive-entry-title');
      await expect(title, 'archive entry should contain a title').toBeVisible();

      // Get initial styling (before hover)
      const initialColor = await title.evaluate((el) => window.getComputedStyle(el).color);
      const initialTransform = await entry.evaluate((el) => window.getComputedStyle(el).transform);

      // Perform hover action
      await entry.hover();
      // Allow a brief moment for transition to kick in
      await page.waitForTimeout(300);

      // Check styles after hover
      const hoverColor = await title.evaluate((el) => window.getComputedStyle(el).color);
      const hoverTransform = await entry.evaluate((el) => window.getComputedStyle(el).transform);

      // 1. Color should transition (should not be the same as initial color, usually shifts to --accent)
      expect(hoverColor).not.toBe(initialColor);

      // 2. Archive entry should translate (transform matrix should reflect change, e.g. translateX(6px))
      expect(hoverTransform).not.toBe(initialTransform);
      expect(hoverTransform).toContain('matrix');

      // 3. Verify target hover line transition via ::after pseudo-element
      const afterTransform = await title.evaluate((el) => {
        return window.getComputedStyle(el, '::after').transform;
      });
      // In modern browsers, a non-zero scale transform will result in a matrix(...) instead of 'none' or matrix(0,...)
      expect(afterTransform).not.toBe('none');
      expect(afterTransform).not.toContain('matrix(0');

      console.log(`  ✓ ${cfg.name}: hover state verified (color shifted, translated, underline scaleX applied)`);
    });
  }
});
