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
  // TOC hrefs may be percent-encoded (e.g. Chinese), but heading ids are decoded.
  // decodeURIComponent normalizes them to the same representation.
  var headingMap = {};
  links.forEach(function (link) {
    var id = decodeURIComponent(link.getAttribute('href').slice(1));
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
      // Heading must have its bottom below viewport top (not scrolled past)
      // and its top not too far below the viewport (within viewport height below)
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        // Prefer the heading closest to the top
        if (rect.top < bestTop) {
          bestTop = rect.top;
          bestHeading = heading;
          bestLink = headingMap[heading.id];
        }
      }
    });

    // Fallback: if no heading is currently visible, find the closest one below the viewport
    if (!bestLink) {
      headings.forEach(function (heading) {
        var rect = heading.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < bestTop) {
          bestTop = rect.top;
          bestLink = headingMap[heading.id];
        }
      });
    }

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