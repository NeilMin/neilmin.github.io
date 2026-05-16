(function () {
  var entries = document.querySelectorAll('.post-entry');

  if (!entries.length) return;

  var observer = new IntersectionObserver(function (observed) {
    observed.forEach(function (obs) {
      if (!obs.isIntersecting) return;
      var el = obs.target;
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
    var rect = entry.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      // Above fold — ensure --awaiting is committed, then stagger reveal
      var idx = Array.prototype.indexOf.call(entries, entry);
      var delay = idx >= 0 ? idx * 100 : 0;
      requestAnimationFrame(function () {
        setTimeout(function () {
          entry.classList.add('post-entry--revealed');
        }, delay);
      });
    } else {
      // Below fold — Observer handles reveal on scroll
      observer.observe(entry);
    }
  });
})();