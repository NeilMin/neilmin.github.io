(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.NeilSitePreferences = api;
})(typeof window !== 'undefined' ? window : global, function () {
  function normalizePath(path) {
    if (!path) return '/';
    var normalized = path.charAt(0) === '/' ? path : '/' + path;
    return normalized.charAt(normalized.length - 1) === '/' ? normalized : normalized + '/';
  }

  function normalizeLanguage(language, supportedLanguages) {
    if (!language) return null;

    var primary = String(language).toLowerCase().split('-')[0];
    for (var i = 0; i < supportedLanguages.length; i += 1) {
      if (supportedLanguages[i] === primary) return primary;
    }

    return null;
  }

  function pickPreferredLanguage(browserLanguages, supportedLanguages, fallbackLanguage) {
    var candidates = browserLanguages || [];

    for (var i = 0; i < candidates.length; i += 1) {
      var language = normalizeLanguage(candidates[i], supportedLanguages);
      if (language) return language;
    }

    return fallbackLanguage;
  }

  function resolveInitialLanguage(options) {
    var supportedLanguages = options.supportedLanguages || [];
    var fallbackLanguage =
      normalizeLanguage(options.fallbackLanguage, supportedLanguages) ||
      supportedLanguages[0] ||
      'en';
    var storedLanguage = normalizeLanguage(options.storedLanguage, supportedLanguages);
    var pathname = normalizePath(options.pathname);
    var rootPath = normalizePath(options.rootPath || '/');

    if (pathname !== rootPath) {
      return {
        preferredLanguage: storedLanguage,
        redirectPath: null,
        shouldStore: false,
      };
    }

    var preferredLanguage =
      storedLanguage ||
      pickPreferredLanguage(options.browserLanguages, supportedLanguages, fallbackLanguage);
    var currentLanguage =
      normalizeLanguage(options.currentLanguage, supportedLanguages) || fallbackLanguage;
    var redirectPath = preferredLanguage !== currentLanguage
      ? options.languagePaths[preferredLanguage]
      : null;

    return {
      preferredLanguage: preferredLanguage,
      redirectPath: redirectPath,
      shouldStore: !storedLanguage,
    };
  }

  function bindLanguageSwitches(options) {
    if (!options.document) return;

    options.document.addEventListener('click', function (event) {
      var node = event.target;

      while (node && node !== options.document) {
        if (node.tagName === 'A' && node.getAttribute('data-language-switch')) {
          options.setStoredLanguage(node.getAttribute('data-language-switch'));
          return;
        }
        node = node.parentNode;
      }
    });
  }

  function init(options) {
    var storageKey = options.storageKey || 'preferred-language';
    var storage = options.storage || null;

    function getStoredLanguage() {
      if (!storage) return null;
      try {
        return storage.getItem(storageKey);
      } catch (error) {
        return null;
      }
    }

    function setStoredLanguage(language) {
      if (!storage) return;
      try {
        storage.setItem(storageKey, language);
      } catch (error) {
        return;
      }
    }

    var result = resolveInitialLanguage({
      pathname: options.pathname,
      rootPath: options.rootPath,
      currentLanguage: options.currentLanguage,
      storedLanguage: getStoredLanguage(),
      browserLanguages: options.browserLanguages,
      supportedLanguages: options.supportedLanguages,
      fallbackLanguage: options.fallbackLanguage,
      languagePaths: options.languagePaths,
    });

    if (result.preferredLanguage && result.shouldStore) {
      setStoredLanguage(result.preferredLanguage);
    }

    bindLanguageSwitches({
      document: options.document,
      setStoredLanguage: setStoredLanguage,
    });

    if (result.redirectPath && options.location) {
      options.location.replace(result.redirectPath);
    }

    return result;
  }

  return {
    init: init,
    resolveInitialLanguage: resolveInitialLanguage,
  };
});
