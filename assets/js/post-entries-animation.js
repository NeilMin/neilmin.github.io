(function () {
  var entries = document.querySelectorAll('.post-entry');

  if (!entries.length) return;

  entries.forEach(function (entry) {
    entry.classList.add('post-entry--awaiting');
  });

  var observer = new IntersectionObserver(function (observed) {
    observed.forEach(function (obs) {
      if (!obs.isIntersecting) return;
      var el = obs.target;
      var idx = Array.prototype.indexOf.call(entries, el);
      var delay = idx >= 0 ? idx * 100 : 0;
      setTimeout(function () {
        el.classList.add('post-entry--revealed');
      }, delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.10 });

  entries.forEach(function (entry) {
    observer.observe(entry);
  });
})();
