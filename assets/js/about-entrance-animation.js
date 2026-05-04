(function () {
  var sections = document.querySelectorAll('.about-section');

  if (!sections.length) return;

  sections.forEach(function (s) {
    s.classList.add('about-section--awaiting');
  });

  var observer = new IntersectionObserver(function (observed) {
    observed.forEach(function (obs) {
      if (!obs.isIntersecting) return;
      var el = obs.target;
      var idx = Array.prototype.indexOf.call(sections, el);
      var delay = idx >= 0 ? idx * 100 : 0;
      setTimeout(function () {
        el.classList.add('about-section--revealed');
      }, delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.10 });

  sections.forEach(function (s) {
    observer.observe(s);
  });
})();
