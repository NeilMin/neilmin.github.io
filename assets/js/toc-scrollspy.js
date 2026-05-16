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

  // IntersectionObserver for scroll tracking
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = headingMap[entry.target.id];
      if (!link) return;

      if (entry.isIntersecting) {
        // Remove active from all links
        links.forEach(function (l) { l.classList.remove('is-active'); });
        // Add to current + parents
        link.classList.add('is-active');
      }
    });
  }, {
    rootMargin: '-80px 0px -70% 0px',
    threshold: 0
  });

  headings.forEach(function (h) { observer.observe(h); });
})();