(function () {
  var showcase = document.querySelector('.projects-showcase');

  if (!showcase) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var activeTag = params.get('tag');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.project-card[data-project-tags]'));
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-filter-link]'));

  // ── Entrance animation ──
  cards.forEach(function (card) {
    card.classList.add('project-card--awaiting');
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      // stagger delay based on card index within the grid
      var idx = cards.indexOf(el);
      var delay = idx >= 0 ? idx * 120 : 0;
      setTimeout(function () {
        el.classList.add('project-card--revealed');
      }, delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12 });

  cards.forEach(function (card) {
    observer.observe(card);
  });

  links.forEach(function (link) {
    var linkTag = link.getAttribute('data-filter-tag');
    if ((!activeTag && !linkTag) || (activeTag && linkTag === activeTag)) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  if (!activeTag) {
    return;
  }

  cards.forEach(function (card) {
    var tags = (card.getAttribute('data-project-tags') || '').split(',');
    var shouldHide = tags.indexOf(activeTag) === -1;
    card.hidden = shouldHide;
  });
})();
