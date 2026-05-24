const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('http://127.0.0.1:1313/posts/', { waitUntil: 'networkidle' });
  
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await page.waitForTimeout(500);
  
  // Hover the first card
  const card = await page.locator('.posts-grid .post-entry').first();
  await card.hover();
  await page.waitForTimeout(300);
  
  const shadow = await page.evaluate(() => {
    const card = document.querySelector('.posts-grid .post-entry');
    const cs = getComputedStyle(card);
    return {
      boxShadow: cs.boxShadow,
      borderColor: cs.borderColor,
    };
  });
  
  console.log('=== Hover Computed Style ===');
  console.log(JSON.stringify(shadow, null, 2));
  
  await page.screenshot({ path: '/tmp/blog-list-dark-hover.png', fullPage: false });
  console.log('Screenshot: /tmp/blog-list-dark-hover.png');
  
  await browser.close();
})();