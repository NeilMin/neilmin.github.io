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
  
  const shadow = await page.evaluate(() => {
    const card = document.querySelector('.posts-grid .post-entry');
    if (!card) return { error: 'No card found' };
    const cs = getComputedStyle(card);
    return {
      boxShadow: cs.boxShadow,
      borderColor: cs.borderColor,
      theme: document.documentElement.getAttribute('data-theme'),
      classList: card.className
    };
  });
  
  console.log('=== Computed Style ===');
  console.log(JSON.stringify(shadow, null, 2));
  
  await page.screenshot({ path: '/tmp/blog-list-dark.png', fullPage: false });
  console.log('Screenshot: /tmp/blog-list-dark.png');
  
  await browser.close();
})();
