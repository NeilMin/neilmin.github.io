(function () {
  var sections = document.querySelectorAll('.about-section');

  if (!sections.length) return;

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
    var rect = s.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      // Above fold — ensure --awaiting is committed, then stagger reveal
      var idx = Array.prototype.indexOf.call(sections, s);
      var delay = idx >= 0 ? idx * 100 : 0;
      requestAnimationFrame(function () {
        setTimeout(function () {
          s.classList.add('about-section--revealed');
        }, delay);
      });
    } else {
      // Below fold — Observer handles reveal on scroll
      observer.observe(s);
    }
  });
})();