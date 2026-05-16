(function () {
  'use strict';

  var sidebar = document.querySelector('.post-toc-sidebar');
  if (!sidebar) return;

  // Force sidebar TOC to stay open — collapsed sidebar is useless
  var detailsEl = sidebar.querySelector('.toc details');
  if (detailsEl) detailsEl.setAttribute('open', '');

  var links = sidebar.querySelectorAll('.toc a[href^="#"]');
  if (links.length < 2) return;

  // Build heading-id → link mapping
  var headingMap = {};
  links.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    headingMap[id] = link;
  });

  var headings = Array.from(document.querySelectorAll('.post-content h2[id], .post-content h3[id]'));
  if (!headings.length) return;

  var activeLink = null;

  // Narrow intersection band at top of viewport: when a heading crosses
  // into the top 25% of the screen, it becomes the active TOC link.
  // Using rootMargin instead of scroll events for performance.
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = headingMap[entry.target.id];
      if (!link) return;

      if (entry.isIntersecting) {
        if (activeLink) activeLink.classList.remove('is-active');
        link.classList.add('is-active');
        activeLink = link;
      }
    });
  }, {
    rootMargin: '0px 0px -75% 0px',
    threshold: 0
  });

  headings.forEach(function (h) { observer.observe(h); });
})();