(function () {
  var sections = document.querySelectorAll('.about-section');

  if (!sections.length) return;

  sections.forEach(function (s) {
    var rect = s.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      // Already in viewport — reveal without animation
      s.classList.add('about-section--revealed');
    } else {
      // Below the fold — hold for scroll animation
      s.classList.add('about-section--awaiting');
    }
  });

  var observer = new IntersectionObserver(function (observed) {
    observed.forEach(function (obs) {
      if (!obs.isIntersecting) return;
      var el = obs.target;
      if (el.classList.contains('about-section--revealed')) {
        observer.unobserve(el);
        return;
      }
      var idx = Array.prototype.indexOf.call(sections, el);
      var delay = idx >= 0 ? idx * 100 : 0;
      setTimeout(function () {
        el.classList.add('about-section--revealed');
      }, delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.10 });

  sections.forEach(function (s) {
    if (!s.classList.contains('about-section--revealed')) {
      observer.observe(s);
    }
  });
})();