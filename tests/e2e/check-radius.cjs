const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:1313/posts/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Full page screenshot
  await page.screenshot({ path: '/tmp/blog-full.png', fullPage: true });
  console.log('Full: /tmp/blog-full.png');

  // Close-up of first card
  const box = await page.evaluate(() => {
    const card = document.querySelector('.posts-grid .post-entry');
    if (!card) return null;
    const r = card.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });

  if (box) {
    await page.screenshot({
      path: '/tmp/blog-card-closeup.png',
      clip: { x: Math.max(0, box.x - 20), y: Math.max(0, box.y - 20),
              width: box.width + 40, height: box.height + 40 }
    });
    console.log('Card closeup: /tmp/blog-card-closeup.png');
  }

  // Also check the single post page
  await page.goto('http://127.0.0.1:1313/posts/why-i-built-this-blog/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/blog-single.png', fullPage: true });

  await browser.close();
})();