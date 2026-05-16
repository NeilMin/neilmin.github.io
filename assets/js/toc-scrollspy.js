(function () {
  'use strict';

  var sidebar = document.querySelector('.post-toc-sidebar');
  if (!sidebar) return;

  // Force sidebar TOC to stay open
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
  var ticking = false;

  function updateActiveHeading() {
    var bestHeading = null;
    var bestLink = null;
    var bestTop = Infinity;

    headings.forEach(function (heading) {
      var rect = heading.getBoundingClientRect();
      // Heading whose top is between -10px and 40% of viewport → candidate
      if (rect.top >= -10 && rect.top < window.innerHeight * 0.4) {
        if (rect.top < bestTop) {
          bestTop = rect.top;
          bestHeading = heading;
          bestLink = headingMap[heading.id];
        }
      }
    });

    if (bestLink && bestLink !== activeLink) {
      if (activeLink) activeLink.classList.remove('is-active');
      bestLink.classList.add('is-active');
      activeLink = bestLink;
    }
  }

  // Initial activation on load
  updateActiveHeading();

  // Throttled scroll listener
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateActiveHeading();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();