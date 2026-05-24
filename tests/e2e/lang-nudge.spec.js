// @ts-check
// tests/e2e/lang-nudge.spec.js
// Verify first-visit language nudge behaviour.

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:1313';

test.describe('Language nudge', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate first so localStorage is accessible, then clear the nudge key
    // to simulate a genuine first visit regardless of prior browser state.
    await page.goto(`${BASE}/`);
    await page.evaluate(() => localStorage.removeItem('lang-nudge-seen'));
    await page.reload({ waitUntil: 'domcontentloaded' });
  });

  test('appears on first visit to an English page', async ({ page }) => {
    await expect(page.locator('.lang-switch a')).toHaveClass(/lang-btn--nudge/);
    await expect(page.locator('.lang-nudge-tooltip')).toBeVisible();
    await expect(page.locator('.lang-nudge-tooltip')).toContainText('站点也有中文版');
  });

  test('writes lang-nudge-seen to localStorage immediately on appearance', async ({ page }) => {
    const seen = await page.evaluate(() => localStorage.getItem('lang-nudge-seen'));
    expect(seen).toBe('1');
  });

  test('does not appear when lang-nudge-seen is already set', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('lang-nudge-seen', '1'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.lang-nudge-tooltip')).not.toBeAttached();
    await expect(page.locator('.lang-switch a')).not.toHaveClass(/lang-btn--nudge/);
  });

  test('does not appear on Chinese-language pages', async ({ page }) => {
    await page.goto(`${BASE}/zh/`);
    await page.evaluate(() => localStorage.removeItem('lang-nudge-seen'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.lang-nudge-tooltip')).not.toBeAttached();
  });
});
