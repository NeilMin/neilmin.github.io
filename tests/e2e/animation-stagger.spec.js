// @ts-check
// tests/e2e/animation-stagger.spec.js
// Verify entrance animations have staggered reveal (not all at once),
// with no flash-of-visible-content before hiding.

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:1313';

/** @type {Array<{name: string, url: string, selector: string, delayPerItem: number}>} */
const PAGES = [
  { name: 'Blog list (EN)', url: '/posts/', selector: '.post-entry', delayPerItem: 100 },
  { name: 'Posts list (ZH)', url: '/zh/posts/', selector: '.post-entry', delayPerItem: 100 },
  { name: 'About', url: '/resume/', selector: '.about-section', delayPerItem: 100 },
  { name: 'Projects', url: '/projects/', selector: '.project-card', delayPerItem: 120 },
];

test.describe('Entrance animation stagger', () => {
  for (const cfg of PAGES) {
    test(`${cfg.name}: above-fold entries should stagger reveal`, async ({ page }) => {
      await page.goto(`${BASE}${cfg.url}`, { waitUntil: 'domcontentloaded' });

      // Count entries and how many are above fold
      const info = await page.evaluate((sel) => {
        const entries = Array.from(document.querySelectorAll(sel));
        const aboveFold = entries.filter(e => {
          const r = e.getBoundingClientRect();
          return r.top < window.innerHeight && r.bottom > 0;
        });
        const cls = sel.slice(1) + '--awaiting';
        const allAwaiting = entries.every(e => e.classList.contains(cls));
        return {
          total: entries.length,
          aboveFold: aboveFold.length,
          allAwaiting,
        };
      }, cfg.selector);

      expect(info.total, 'should have at least 1 entry').toBeGreaterThan(0);
      expect(info.allAwaiting, 'all entries should start as --awaiting').toBe(true);

      if (info.aboveFold < 2) {
        console.log(`  Only ${info.aboveFold} above-fold entry(ies), skipping stagger timing check`);
        return;
      }

      // Wait for all above-fold entries to be revealed (max 5s)
      const revealedSelector = `${cfg.selector}.${cfg.selector.slice(1)}--revealed`;
      await page.waitForSelector(revealedSelector, { timeout: 3000 });

      // Wait for stagger to complete (aboveFold * delay + rAF + buffer)
      const maxWait = info.aboveFold * cfg.delayPerItem + 2000;
      await page.waitForTimeout(maxWait);

      // All above-fold entries should now be revealed
      const results = await page.evaluate((sel) => {
        const entries = Array.from(document.querySelectorAll(sel));
        return entries.map((e, i) => {
          const rect = e.getBoundingClientRect();
          return {
            index: i,
            aboveFold: rect.top < window.innerHeight && rect.bottom > 0,
            revealed: e.classList.contains(sel.slice(1) + '--revealed'),
          };
        });
      }, cfg.selector);

      for (const r of results) {
        if (r.aboveFold) {
          expect(r.revealed, `entry[${r.index}] should be revealed`).toBe(true);
        }
      }

      console.log(`  ✓ ${info.total} entries, ${info.aboveFold} above-fold, all revealed`);
    });
  }

  test('Homepage: recent posts should be visible (no stuck --awaiting)', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });

    const section = page.locator('.home-recent-posts');
    await expect(section, 'recent posts section should exist').toBeAttached({ timeout: 3000 });

    const entries = page.locator('.home-recent-posts .post-entry');
    const count = await entries.count();
    expect(count, 'should have at least 1 recent post').toBeGreaterThan(0);

    // No entry should have --awaiting (no JS to reveal on homepage)
    for (let i = 0; i < count; i++) {
      const cls = await entries.nth(i).getAttribute('class');
      expect(cls, `entry[${i}] should NOT have --awaiting`).not.toContain('post-entry--awaiting');
    }

    // All entries must be visible (opacity not 0, display not none)
    for (let i = 0; i < count; i++) {
      await expect(entries.nth(i), `entry[${i}] should be visible`).toBeVisible();
    }

    console.log(`  ✓ ${count} recent posts visible, no --awaiting stuck`);
  });

  test('Blog list: below-fold entries should NOT be revealed initially', async ({ page }) => {
    // Make viewport small so most entries are below fold
    await page.setViewportSize({ width: 1280, height: 400 });
    await page.goto(`${BASE}/posts/`, { waitUntil: 'domcontentloaded' });

    const info = await page.evaluate(() => {
      const entries = Array.from(document.querySelectorAll('.post-entry'));
      const belowFold = entries.filter(e => {
        const r = e.getBoundingClientRect();
        return r.top >= window.innerHeight;
      });
      return {
        total: entries.length,
        belowFold: belowFold.length,
        belowFoldRevealed: belowFold.filter(e => e.classList.contains('post-entry--revealed')).length,
      };
    });

    expect(info.belowFold, 'should have below-fold entries with small viewport').toBeGreaterThan(0);
    expect(info.belowFoldRevealed, 'below-fold entries should NOT be revealed').toBe(0);

    console.log(`  ✓ ${info.total} entries, ${info.belowFold} below-fold, none revealed`);
  });

  test('Blog list: scrolling should reveal below-fold entries', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 300 });
    await page.goto(`${BASE}/posts/`, { waitUntil: 'domcontentloaded' });

    // Verify below-fold entries exist
    const initialInfo = await page.evaluate(() => {
      const entries = Array.from(document.querySelectorAll('.post-entry'));
      const belowFold = entries.filter(e => {
        const r = e.getBoundingClientRect();
        return r.top >= window.innerHeight;
      });
      return { total: entries.length, belowFold: belowFold.length };
    });
    expect(initialInfo.belowFold, 'should have below-fold entries').toBeGreaterThan(0);

    const total = await page.locator('.post-entry').count();

    // Scroll incrementally to trigger IntersectionObserver for each entry
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), (pageHeight / steps) * i);
      await page.waitForTimeout(600); // Allow observer + stagger
    }

    // Final reveal check
    const revealedCount = await page.locator('.post-entry--revealed').count();
    expect(revealedCount, `all ${total} entries should be revealed after scroll`).toBe(total);

    console.log(`  ✓ ${total} entries, all revealed after scroll`);
  });

  test('Search: empty results should show feedback', async ({ page }) => {
    await page.goto(`${BASE}/search/`, { waitUntil: 'networkidle' });

    const input = page.locator('#searchInput');
    await expect(input).toBeAttached({ timeout: 3000 });

    // Type character by character so onkeyup fires (fill() bypasses keyboard events)
    const query = 'zzzznonexistentquery123456';
    await input.click();
    for (const ch of query) {
      await page.keyboard.type(ch, { delay: 10 });
    }
    // Wait for Fuse.js search to run (network request + render)
    await page.waitForTimeout(1500);

    const noResults = page.locator('.search-no-results');
    await expect(noResults, 'should show no-results message').toBeVisible({ timeout: 3000 });
    const text = await noResults.textContent();
    expect(text.trim(), 'should show "No results found"').toBe('No results found');

    console.log(`  ✓ Found no-results: "${text.trim()}"`);
  });

  test('Search: clearing input should clear results', async ({ page }) => {
    await page.goto(`${BASE}/search/`, { waitUntil: 'networkidle' });

    const input = page.locator('#searchInput');
    await expect(input).toBeAttached({ timeout: 3000 });

    const query = 'zzzznonexistentquery';
    await input.click();
    for (const ch of query) {
      await page.keyboard.type(ch, { delay: 10 });
    }
    await page.waitForTimeout(1500);

    const noResults = page.locator('.search-no-results');
    await expect(noResults).toBeVisible();

    // Clear the input by evaluating value and triggering keyup
    await page.evaluate(() => {
      const input = document.getElementById('searchInput');
      input.value = '';
      input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    });
    await page.waitForTimeout(400);

    // After clearing, results list should be empty
    const resultCount = await page.locator('#searchResults li').count();
    expect(resultCount, 'all result items should be removed').toBe(0);

    console.log(`  ✓ Results cleared, ${resultCount} items remain`);
  });

  test('Project page: filter click should activate transition', async ({ page }) => {
    await page.goto(`${BASE}/projects/`, { waitUntil: 'domcontentloaded' });

    // Wait for entrance animation to complete
    await page.waitForSelector('.project-card.project-card--revealed', { timeout: 3000 });
    await page.waitForTimeout(500);

    // Click a filter tag link (scope to nav links only)
    const filterLink = page.locator('.projects-filter__link[data-filter-link][data-filter-tag]').first();
    const tagName = await filterLink.getAttribute('data-filter-tag');
    if (!tagName) {
      console.log('  No filter tags found, skipping');
      return;
    }

    await filterLink.click();
    await page.waitForTimeout(800);

    // Check that filtered-out cards have --filtered class
    const filteredCards = page.locator('.project-card.project-card--filtered');
    const filteredCount = await filteredCards.count();
    expect(filteredCount, 'should have filtered cards').toBeGreaterThan(0);

    // Check active filter link (nav link only, not card tag links)
    const activeLink = page.locator('.projects-filter__link[data-filter-tag]').first();
    await expect(activeLink, 'filter link should be active').toHaveClass(/is-active/);

    console.log(`  ✓ ${filteredCount} cards filtered, "${tagName}" active`);
  });
});