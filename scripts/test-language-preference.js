const assert = require('assert');
const preferences = require('../assets/js/site-preferences.js');

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test('prefers zh when browser language is Chinese on first visit', () => {
  const result = preferences.resolveInitialLanguage({
    pathname: '/',
    rootPath: '/',
    currentLanguage: 'en',
    storedLanguage: null,
    browserLanguages: ['zh-CN', 'en-US'],
    supportedLanguages: ['en', 'zh'],
    fallbackLanguage: 'en',
    languagePaths: { en: '/', zh: '/zh/' },
  });

  assert.strictEqual(result.preferredLanguage, 'zh');
  assert.strictEqual(result.redirectPath, '/zh/');
  assert.strictEqual(result.shouldStore, true);
});

test('falls back to English when browser language is unsupported', () => {
  const result = preferences.resolveInitialLanguage({
    pathname: '/',
    rootPath: '/',
    currentLanguage: 'en',
    storedLanguage: null,
    browserLanguages: ['fr-FR'],
    supportedLanguages: ['en', 'zh'],
    fallbackLanguage: 'en',
    languagePaths: { en: '/', zh: '/zh/' },
  });

  assert.strictEqual(result.preferredLanguage, 'en');
  assert.strictEqual(result.redirectPath, null);
  assert.strictEqual(result.shouldStore, true);
});

test('stored language overrides browser detection on later visits', () => {
  const result = preferences.resolveInitialLanguage({
    pathname: '/',
    rootPath: '/',
    currentLanguage: 'en',
    storedLanguage: 'zh',
    browserLanguages: ['en-US'],
    supportedLanguages: ['en', 'zh'],
    fallbackLanguage: 'en',
    languagePaths: { en: '/', zh: '/zh/' },
  });

  assert.strictEqual(result.preferredLanguage, 'zh');
  assert.strictEqual(result.redirectPath, '/zh/');
  assert.strictEqual(result.shouldStore, false);
});

test('does not redirect away from non-root pages', () => {
  const result = preferences.resolveInitialLanguage({
    pathname: '/resume/',
    rootPath: '/',
    currentLanguage: 'en',
    storedLanguage: 'zh',
    browserLanguages: ['zh-CN'],
    supportedLanguages: ['en', 'zh'],
    fallbackLanguage: 'en',
    languagePaths: { en: '/', zh: '/zh/' },
  });

  assert.strictEqual(result.preferredLanguage, 'zh');
  assert.strictEqual(result.redirectPath, null);
  assert.strictEqual(result.shouldStore, false);
});

test('stores the manual language switch selection', () => {
  let clickListener = null;
  let storedValue = null;

  const fakeDocument = {
    addEventListener(name, listener) {
      assert.strictEqual(name, 'click');
      clickListener = listener;
    },
  };

  preferences.init({
    pathname: '/zh/resume/',
    rootPath: '/',
    currentLanguage: 'zh',
    browserLanguages: ['zh-CN'],
    supportedLanguages: ['en', 'zh'],
    fallbackLanguage: 'en',
    languagePaths: { en: '/', zh: '/zh/' },
    storageKey: 'preferred-language',
    storage: {
      getItem() {
        return 'zh';
      },
      setItem(key, value) {
        assert.strictEqual(key, 'preferred-language');
        storedValue = value;
      },
    },
    location: {
      replace() {
        throw new Error('unexpected redirect');
      },
    },
    document: fakeDocument,
  });

  clickListener({
    target: {
      tagName: 'A',
      getAttribute(name) {
        return name === 'data-language-switch' ? 'en' : null;
      },
      parentNode: fakeDocument,
    },
  });

  assert.strictEqual(storedValue, 'en');
});
