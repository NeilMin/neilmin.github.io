(function () {
  var showcase = document.querySelector('.projects-showcase');

  if (!showcase) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var activeTag = params.get('tag');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.project-card[data-project-tags]'));
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-filter-link]'));

  // ── Entrance animation (above-fold immediate, below-fold scroll-driven) ──
  cards.forEach(function (card) {
    var rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      card.classList.add('project-card--revealed');
    } else {
      card.classList.add('project-card--awaiting');
    }
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      if (el.classList.contains('project-card--revealed')) {
        observer.unobserve(el);
        return;
      }
      var idx = cards.indexOf(el);
      var delay = idx >= 0 ? idx * 120 : 0;
      setTimeout(function () {
        el.classList.add('project-card--revealed');
      }, delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12 });

  cards.forEach(function (card) {
    if (!card.classList.contains('project-card--revealed')) {
      observer.observe(card);
    }
  });

  // ── Filter activation ──
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

  // ── Filter transition (fade out instead of hiding) ──
  cards.forEach(function (card) {
    var tags = (card.getAttribute('data-project-tags') || '').split(',');
    var shouldHide = tags.indexOf(activeTag) === -1;
    if (shouldHide) {
      card.classList.add('project-card--filtered');
    } else {
      card.classList.remove('project-card--filtered');
    }
  });
})();