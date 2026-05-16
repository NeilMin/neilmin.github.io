// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:1313';

test.describe('TOC scroll-spy (EN)', () => {
  test('should highlight a TOC link on page load', async ({ page }) => {
    await page.goto(`${BASE}/posts/building-my-hugo-blog-with-github-pages/`);

    // TOC sidebar must exist
    const sidebar = page.locator('.post-toc-sidebar');
    await expect(sidebar).toBeVisible();

    // TOC links must exist
    const links = sidebar.locator('.toc a[href^="#"]');
    const linkCount = await links.count();
    expect(linkCount, 'should have ≥2 TOC links').toBeGreaterThanOrEqual(2);

    // Wait a tick for the deferred script to run
    await page.waitForTimeout(500);

    // At least ONE TOC link should be .is-active on page load
    const activeLinks = sidebar.locator('.toc a.is-active');
    const activeCount = await activeLinks.count();
    expect(activeCount, 'should have exactly 1 active TOC link on load').toBe(1);

    // Log which link is active for debugging
    const activeText = await activeLinks.first().textContent();
    console.log(`  → Active link on load: "${activeText}"`);
  });

  test('should change active link on scroll', async ({ page }) => {
    await page.goto(`${BASE}/posts/building-my-hugo-blog-with-github-pages/`);
    await page.waitForTimeout(500);

    const sidebar = page.locator('.post-toc-sidebar');
    const getActiveLinkText = async () => {
      const active = sidebar.locator('.toc a.is-active');
      const count = await active.count();
      if (count === 0) return null;
      return (await active.first().textContent()).trim();
    };

    const firstActive = await getActiveLinkText();
    expect(firstActive, 'should have an active link after load').not.toBeNull();
    console.log(`  → Initial active: "${firstActive}"`);

    // Scroll to a heading further down the page
    const allHeadings = page.locator('.post-content h2[id], .post-content h3[id]');
    const headingCount = await allHeadings.count();
    expect(headingCount).toBeGreaterThan(2);

    // Pick a heading near the middle
    const targetIndex = Math.min(Math.floor(headingCount / 2), headingCount - 1);
    const targetHeading = allHeadings.nth(targetIndex);
    await targetHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300); // wait for rAF + scroll handler

    const secondActive = await getActiveLinkText();
    expect(secondActive, 'should still have an active link after scroll').not.toBeNull();
    console.log(`  → After scroll to heading #${targetIndex}: "${secondActive}"`);

    // The active link should have changed
    expect(secondActive, 'active link should change after scrolling to a different heading')
      .not.toBe(firstActive);
  });

});

test.describe('TOC scroll-spy (ZH)', () => {
  test('should highlight a TOC link on page load (Chinese)', async ({ page }) => {
    await page.goto(`${BASE}/zh/posts/building-my-hugo-blog-with-github-pages/`);

    const sidebar = page.locator('.post-toc-sidebar');
    await expect(sidebar).toBeVisible();

    const links = sidebar.locator('.toc a[href^="#"]');
    const linkCount = await links.count();
    expect(linkCount, 'should have ≥2 TOC links').toBeGreaterThanOrEqual(2);

    await page.waitForTimeout(500);

    const activeLinks = sidebar.locator('.toc a.is-active');
    const activeCount = await activeLinks.count();
    expect(activeCount, 'should have exactly 1 active TOC link on load (ZH)').toBe(1);

    const activeText = await activeLinks.first().textContent();
    console.log(`  → Active link on load (ZH): "${activeText}"`);
  });

  test('should change active link on scroll (Chinese)', async ({ page }) => {
    await page.goto(`${BASE}/zh/posts/building-my-hugo-blog-with-github-pages/`);
    await page.waitForTimeout(500);

    const sidebar = page.locator('.post-toc-sidebar');
    const getActiveLinkText = async () => {
      const active = sidebar.locator('.toc a.is-active');
      const count = await active.count();
      if (count === 0) return null;
      return (await active.first().textContent()).trim();
    };

    const firstActive = await getActiveLinkText();
    expect(firstActive, 'should have an active link after load (ZH)').not.toBeNull();
    console.log(`  → Initial active (ZH): "${firstActive}"`);

    const allHeadings = page.locator('.post-content h2[id], .post-content h3[id]');
    const headingCount = await allHeadings.count();
    expect(headingCount).toBeGreaterThan(2);

    const targetIndex = Math.min(Math.floor(headingCount / 2), headingCount - 1);
    const targetHeading = allHeadings.nth(targetIndex);
    await targetHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const secondActive = await getActiveLinkText();
    expect(secondActive, 'should still have an active link after scroll (ZH)').not.toBeNull();
    console.log(`  → After scroll to heading #${targetIndex} (ZH): "${secondActive}"`);

    expect(secondActive, 'active link should change after scrolling (ZH)')
      .not.toBe(firstActive);
  });
});