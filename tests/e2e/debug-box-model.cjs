const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:1313/posts/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const info = await page.evaluate(() => {
    const card = document.querySelector('.posts-grid .post-entry');
    if (!card) return { error: 'no card' };

    const cardStyle = window.getComputedStyle(card);
    const cardRect = card.getBoundingClientRect();

    // Find entry-cover inside this card
    const cover = card.querySelector('.entry-cover');
    let coverInfo = null;
    if (cover) {
      const coverStyle = window.getComputedStyle(cover);
      const coverRect = cover.getBoundingClientRect();
      coverInfo = {
        rect: { x: coverRect.x, y: coverRect.y, w: coverRect.width, h: coverRect.height },
        borderRadius: coverStyle.borderRadius,
        marginTop: coverStyle.marginTop,
        marginRight: coverStyle.marginRight,
        marginBottom: coverStyle.marginBottom,
        marginLeft: coverStyle.marginLeft,
        overflow: coverStyle.overflow,
      };
    }

    return {
      card: {
        rect: { x: cardRect.x, y: cardRect.y, w: cardRect.width, h: cardRect.height },
        borderRadius: cardStyle.borderRadius,
        borderTop: cardStyle.borderTop,
        borderBottom: cardStyle.borderBottom,
        borderLeft: cardStyle.borderLeft,
        borderRight: cardStyle.borderRight,
        paddingTop: cardStyle.paddingTop,
        paddingBottom: cardStyle.paddingBottom,
        paddingLeft: cardStyle.paddingLeft,
        paddingRight: cardStyle.paddingRight,
        overflow: cardStyle.overflow,
        boxSizing: cardStyle.boxSizing,
      },
      cover: coverInfo,
      hasCover: !!cover,
      html: card.outerHTML.slice(0, 500),
    };
  });

  console.log(JSON.stringify(info, null, 2));

  // Also check if there's a border-color issue - is the top border visible?
  const borderCheck = await page.evaluate(() => {
    const card = document.querySelector('.posts-grid .post-entry');
    if (!card) return null;
    const s = window.getComputedStyle(card);
    return {
      borderTopWidth: s.borderTopWidth,
      borderTopColor: s.borderTopColor,
      borderTopStyle: s.borderTopStyle,
      // Is the top border in a different layer?
      boxShadow: s.boxShadow,
    };
  });
  console.log('\nBorder check:', JSON.stringify(borderCheck, null, 2));

  await browser.close();
})();