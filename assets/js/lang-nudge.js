(function () {
  'use strict';

  var STORAGE_KEY = 'lang-nudge-seen';
  var TOOLTIP_TEXT = '站点也有中文版 · Click to switch';
  var DISMISS_DELAY_MS = 4000;
  var REMOVE_DELAY_MS = 800;

  function init() {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch (e) {
      return;
    }

    if (document.documentElement.lang !== 'en') return;

    var langLink = document.querySelector('.lang-switch a');
    if (!langLink) return;

    // Write immediately — subsequent page views must not re-trigger,
    // even if the user navigates away before the 4s auto-dismiss fires.
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {}

    langLink.classList.add('lang-btn--nudge');

    // Tooltip must be positioned relative to the <li> wrapper
    var parentLi = langLink.parentNode;
    parentLi.style.position = 'relative';

    var tooltip = document.createElement('div');
    tooltip.className = 'lang-nudge-tooltip';
    tooltip.textContent = TOOLTIP_TEXT;
    parentLi.insertBefore(tooltip, langLink.nextSibling);

    var removeTimer;
    var dismissTimer = setTimeout(function () {
      tooltip.classList.add('lang-nudge-tooltip--fading');
      removeTimer = setTimeout(function () {
        langLink.classList.remove('lang-btn--nudge');
        parentLi.style.position = '';
        if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
      }, REMOVE_DELAY_MS);
    }, DISMISS_DELAY_MS);

    function onLangClick() {
      clearTimeout(dismissTimer);
      clearTimeout(removeTimer);
      langLink.classList.remove('lang-btn--nudge');
      parentLi.style.position = '';
      if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
    }
    langLink.addEventListener('click', onLangClick, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
