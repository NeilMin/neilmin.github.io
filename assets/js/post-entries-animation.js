(function () {
  var entries = document.querySelectorAll('.post-entry');

  if (!entries.length) return;

  // Reveal above-fold entries immediately; hide below-fold for scroll animation
  entries.forEach(function (entry) {
    var rect = entry.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      // Already in viewport — reveal without animation
      entry.classList.add('post-entry--revealed');
    } else {
      // Below the fold — hold for scroll animation
      entry.classList.add('post-entry--awaiting');
    }
  });

  var observer = new IntersectionObserver(function (observed) {
    observed.forEach(function (obs) {
      if (!obs.isIntersecting) return;
      var el = obs.target;
      // Already has --revealed from above-fold check, skip
      if (el.classList.contains('post-entry--revealed')) {
        observer.unobserve(el);
        return;
      }
      var idx = Array.prototype.indexOf.call(entries, el);
      var delay = idx >= 0 ? idx * 100 : 0;
      setTimeout(function () {
        el.classList.add('post-entry--revealed');
      }, delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.10 });

  entries.forEach(function (entry) {
    if (!entry.classList.contains('post-entry--revealed')) {
      observer.observe(entry);
    }
  });
})();