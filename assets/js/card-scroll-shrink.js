(function () {
  var GRIDS = ['.posts-grid', '.projects-grid'];

  var grids = [];
  GRIDS.forEach(function (selector) {
    var grid = document.querySelector(selector);
    if (grid) grids.push(grid);
  });
  if (!grids.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var IDLE_DELAY_MS = 120;
  var idleTimer = null;

  function markScrolling() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      grids.forEach(function (grid) {
        grid.classList.remove('is-scrolling');
      });
    }, IDLE_DELAY_MS);
    grids.forEach(function (grid) {
      grid.classList.add('is-scrolling');
    });
  }

  window.addEventListener('scroll', markScrolling, { passive: true });
})();
