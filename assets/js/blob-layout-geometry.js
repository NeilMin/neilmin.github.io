(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.BlobLayoutGeometry = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function createFallbackAnchor(viewport) {
    var width = clamp(viewport.width * 0.24, 280, 420);
    var height = clamp(viewport.height * 0.22, 180, 260);

    return {
      left: (viewport.width - width) / 2,
      top: (viewport.height - height) / 2,
      width: width,
      height: height
    };
  }

  function buildBlobs(clusterCenter, topSize, bottomSize, horizontalSpread, topLift, bottomDrop) {
    return [
      { size: topSize, offsetX: -horizontalSpread, offsetY: -topLift },
      { size: topSize * 0.96, offsetX: horizontalSpread, offsetY: -topLift * 0.92 },
      { size: bottomSize, offsetX: 0, offsetY: bottomDrop }
    ].map(function (blob) {
      var centerX = clusterCenter.x + blob.offsetX;
      var centerY = clusterCenter.y + blob.offsetY;

      return {
        size: blob.size,
        centerX: centerX,
        centerY: centerY,
        left: centerX - blob.size / 2,
        top: centerY - blob.size / 2
      };
    });
  }

  function resolveBlobLayout(options) {
    var viewport = options.viewport;
    var anchorRect = options.anchorRect || createFallbackAnchor(viewport);
    var shortEdge = Math.min(viewport.width, viewport.height);
    var clusterCenter = {
      x: anchorRect.left + anchorRect.width / 2,
      y: anchorRect.top + anchorRect.height / 2
    };

    var baseSize = clamp(anchorRect.width * 0.58 + shortEdge * 0.08, 200, 288);
    var topSize = clamp(baseSize, 200, 288);
    var bottomSize = clamp(baseSize * 1.08, 214, 312);
    var horizontalSpread = clamp(anchorRect.width * 0.30 + shortEdge * 0.06, 118, 174);
    var topLift = clamp(anchorRect.height * 0.30 + shortEdge * 0.02, 78, 114);
    var bottomDrop = clamp(anchorRect.height * 0.32 + shortEdge * 0.04, 108, 158);

    return {
      anchorRect: anchorRect,
      clusterCenter: clusterCenter,
      blobs: buildBlobs(clusterCenter, topSize, bottomSize, horizontalSpread, topLift, bottomDrop),
      interaction: {
        radius: clamp(horizontalSpread * 2.1, 300, 470),
        maxPush: clamp(baseSize * 0.46, 90, 132)
      }
    };
  }

  return {
    clamp: clamp,
    resolveBlobLayout: resolveBlobLayout
  };
});
