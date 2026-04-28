const assert = require('assert');
const { resolveBlobLayout } = require('../assets/js/blob-layout-geometry.js');

const standard = resolveBlobLayout({
  viewport: { width: 1440, height: 900 },
  anchorRect: { left: 540, top: 250, width: 360, height: 220 }
});

assert.strictEqual(Math.round(standard.clusterCenter.x), 720);
assert.strictEqual(Math.round(standard.clusterCenter.y), 360);
assert.ok(standard.blobs[2].size > standard.blobs[0].size, 'bottom blob should be slightly larger');
assert.ok(
  Math.round(standard.blobs[1].centerX - standard.blobs[0].centerX) < 420,
  'resting spread should stay compact on standard desktop'
);

const ultrawide = resolveBlobLayout({
  viewport: { width: 2560, height: 1080 },
  anchorRect: { left: 1100, top: 290, width: 360, height: 220 }
});

assert.strictEqual(Math.round(ultrawide.clusterCenter.x), 1280);
assert.ok(
  ultrawide.blobs[0].size <= 288,
  'ultra-wide top blobs should stay slightly smaller than the first helper pass'
);
assert.ok(
  Math.round(ultrawide.blobs[1].centerX - ultrawide.blobs[0].centerX) < 460,
  'ultra-wide spread should remain clustered instead of scaling with full viewport width'
);
assert.ok(ultrawide.blobs[0].size > standard.blobs[0].size, 'wide screens may scale blobs slightly');
assert.ok(ultrawide.blobs[0].size < 320, 'blob size should stay clamped');

const standardInteraction = standard.interaction;
const ultrawideInteraction = ultrawide.interaction;

assert.ok(standardInteraction.radius >= 300, 'desktop radius should remain usable');
assert.ok(ultrawideInteraction.radius <= 470, 'ultra-wide radius should stay clamped');
assert.ok(ultrawideInteraction.maxPush >= standardInteraction.maxPush, 'larger blobs may push slightly more');
assert.ok(ultrawideInteraction.maxPush <= 132, 'push distance should stay bounded');

const fallback = resolveBlobLayout({
  viewport: { width: 1720, height: 980 },
  anchorRect: null
});

assert.strictEqual(Math.round(fallback.clusterCenter.x), 860);
assert.strictEqual(Math.round(fallback.clusterCenter.y), 490);
assert.ok(fallback.interaction.radius > fallback.blobs[0].size, 'interaction radius should exceed blob size');

const searchBeforeResults = resolveBlobLayout({
  viewport: { width: 1720, height: 980 },
  anchorRect: { left: 620, top: 140, width: 480, height: 72 },
  anchorMode: 'viewport'
});

const searchAfterResults = resolveBlobLayout({
  viewport: { width: 1720, height: 980 },
  anchorRect: { left: 620, top: 140, width: 480, height: 540 },
  anchorMode: 'viewport'
});

assert.strictEqual(Math.round(searchBeforeResults.clusterCenter.x), 860);
assert.strictEqual(Math.round(searchBeforeResults.clusterCenter.y), 490);
assert.strictEqual(Math.round(searchAfterResults.clusterCenter.x), 860);
assert.strictEqual(Math.round(searchAfterResults.clusterCenter.y), 490);
assert.strictEqual(
  Math.round(searchBeforeResults.blobs[2].centerY),
  Math.round(searchAfterResults.blobs[2].centerY),
  'search layout should not drift downward as results expand'
);

const narrow = resolveBlobLayout({
  viewport: { width: 430, height: 932 },
  anchorRect: { left: 55, top: 240, width: 320, height: 210 }
});

assert.ok(narrow.blobs[0].size >= 200, 'mobile blobs should not collapse');
assert.ok(
  Math.round(narrow.blobs[1].centerX - narrow.blobs[0].centerX) < 390,
  'mobile spread should stay compact enough to preserve the existing clustered feel'
);
assert.ok(narrow.interaction.radius <= 420, 'small screens should not get oversized interaction zones');
assert.ok(narrow.interaction.maxPush <= 96, 'small screens should keep a softer push distance');

console.log('blob layout geometry assertions passed');
