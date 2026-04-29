(function () {
  var showcase = document.querySelector('.projects-showcase');

  if (!showcase) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var activeTag = params.get('tag');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.project-card[data-project-tags]'));
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-filter-link]'));

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
    card.hidden = tags.indexOf(activeTag) === -1;
  });
})();
