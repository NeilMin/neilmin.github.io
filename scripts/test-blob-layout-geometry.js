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
  Math.round(ultrawide.blobs[1].centerX - ultrawide.blobs[0].centerX) < 460,
  'ultra-wide spread should remain clustered instead of scaling with full viewport width'
);
assert.ok(ultrawide.blobs[0].size > standard.blobs[0].size, 'wide screens may scale blobs slightly');
assert.ok(ultrawide.blobs[0].size < 320, 'blob size should stay clamped');

const fallback = resolveBlobLayout({
  viewport: { width: 1720, height: 980 },
  anchorRect: null
});

assert.strictEqual(Math.round(fallback.clusterCenter.x), 860);
assert.strictEqual(Math.round(fallback.clusterCenter.y), 490);
assert.ok(fallback.interaction.radius > fallback.blobs[0].size, 'interaction radius should exceed blob size');

console.log('blob layout geometry assertions passed');
