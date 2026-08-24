// @ts-check
// tests/e2e/motto.spec.js
// Verify the personal motto renders in all three placements
// (homepage profile, About page, site-wide footer) on EN and ZH pages.

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:1313';
const MOTTO = 'Learn by Doing. Grow by Sharing.';

test.describe('Motto placements', () => {
  for (const lang of ['en', 'zh']) {
    const root = lang === 'en' ? '' : '/zh';

    test(`${lang}: homepage profile shows motto under subtitle`, async ({ page }) => {
      await page.goto(`${BASE}${root}/`);
      await expect(page.locator('.profile-motto')).toHaveText(MOTTO);
    });

    test(`${lang}: about page shows motto after intro`, async ({ page }) => {
      await page.goto(`${BASE}${root}/resume/`);
      await expect(page.locator('.about-motto')).toHaveText(MOTTO);
    });

    test(`${lang}: footer on a post page contains motto`, async ({ page }) => {
      await page.goto(`${BASE}${root}/posts/`);
      const href = await page
        .locator('.posts-grid .post-entry .entry-link')
        .first()
        .getAttribute('href');
      // Permalinks can be absolute (production domain) — always stay local.
      const { pathname } = new URL(href, BASE);
      await page.goto(`${BASE}${pathname}`);
      await expect(page.locator('footer.footer')).toContainText(MOTTO);
    });
  }
});
