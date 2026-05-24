# Language Nudge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On first visit to any English-language page, subtly pulse the existing "中文" nav link and show a small tooltip, so first-time visitors discover the Chinese version exists. Never show it again after the first view.

**Architecture:** A new standalone JS module (`lang-nudge.js`) loads deferred on English pages only (Hugo template condition). It checks localStorage for `lang-nudge-seen`, then adds a CSS class and a tooltip DOM node to the existing `.lang-switch a` element. The localStorage key is written immediately on display so subsequent pages (and page navigations mid-nudge) never re-trigger. CSS animations handle the pulse ring, fade-in, and fade-out entirely — no JS timers drive visual frames.

**Tech Stack:** Vanilla JS (IIFE, no dependencies), Hugo asset pipeline (fingerprinted + minified), CSS animations, Playwright E2E tests.

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `assets/js/lang-nudge.js` | Nudge logic — detects first visit, injects class + tooltip, handles dismiss |
| Create | `tests/e2e/lang-nudge.spec.js` | Playwright E2E tests for nudge behaviour |
| Modify | `assets/css/extended/custom.css` | Pulse + tooltip styles (added after existing lang-switch block, ~line 1405) |
| Modify | `layouts/partials/extend_head.html` | Load `lang-nudge.js` deferred on English pages only |

---

### Task 1: Write failing E2E tests

**Files:**
- Create: `tests/e2e/lang-nudge.spec.js`

- [ ] **Step 1: Create the test file**

```javascript
// @ts-check
// tests/e2e/lang-nudge.spec.js
// Verify first-visit language nudge behaviour.

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:1313';

test.describe('Language nudge', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate first so localStorage is accessible, then clear the nudge key
    // to simulate a genuine first visit regardless of prior browser state.
    await page.goto(`${BASE}/`);
    await page.evaluate(() => localStorage.removeItem('lang-nudge-seen'));
    await page.reload({ waitUntil: 'domcontentloaded' });
  });

  test('appears on first visit to an English page', async ({ page }) => {
    await expect(page.locator('.lang-switch a')).toHaveClass(/lang-btn--nudge/);
    await expect(page.locator('.lang-nudge-tooltip')).toBeVisible();
    await expect(page.locator('.lang-nudge-tooltip')).toContainText('站点也有中文版');
  });

  test('writes lang-nudge-seen to localStorage immediately on appearance', async ({ page }) => {
    const seen = await page.evaluate(() => localStorage.getItem('lang-nudge-seen'));
    expect(seen).toBe('1');
  });

  test('does not appear when lang-nudge-seen is already set', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('lang-nudge-seen', '1'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.lang-nudge-tooltip')).not.toBeAttached();
    await expect(page.locator('.lang-switch a')).not.toHaveClass(/lang-btn--nudge/);
  });

  test('does not appear on Chinese-language pages', async ({ page }) => {
    await page.goto(`${BASE}/zh/`);
    await page.evaluate(() => localStorage.removeItem('lang-nudge-seen'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.lang-nudge-tooltip')).not.toBeAttached();
  });
});
```

- [ ] **Step 2: Run tests to confirm they all fail**

Run: `npx playwright test tests/e2e/lang-nudge.spec.js`

Expected: 4 failures. Typical error: `Expected to have class matching /lang-btn--nudge/` or `not attached`.  
If Hugo server isn't running, start it first: `hugo server`

- [ ] **Step 3: Commit the failing tests**

```bash
git add tests/e2e/lang-nudge.spec.js
git commit -m "test: add failing E2E tests for language nudge"
```

---

### Task 2: Add CSS nudge styles

**Files:**
- Modify: `assets/css/extended/custom.css` (after the `html[data-theme="dark"] .lang-switch a:focus-visible` block, ~line 1405)

- [ ] **Step 1: Insert CSS block after the existing dark-mode lang-switch rules**

Find this exact block near the end of the `3.4 Language switcher` section:

```css
html[data-theme="dark"] .lang-switch a:hover,
html[data-theme="dark"] .lang-switch a:focus-visible {
  background: rgba(255, 255, 255, 0.08);
}
```

Add the following immediately after it (before `/* ===== 3.4 Adjustable blob parameters =====`):

```css

/* Language nudge — first-visit highlight */
.lang-switch a.lang-btn--nudge {
  color: var(--accent);
  background: rgba(172, 100, 44, 0.08);
  border: 1px solid rgba(172, 100, 44, 0.25);
  position: relative;
}

.lang-switch a.lang-btn--nudge::before {
  content: '';
  position: absolute;
  inset: -5px;
  border-radius: 9px;
  background: rgba(172, 100, 44, 0.15);
  animation: langNudgePulse 1.6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes langNudgePulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.2); }
}

.lang-nudge-tooltip {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: #2a2a2a;
  color: #fff;
  font-size: 0.76rem;
  white-space: nowrap;
  padding: 6px 11px;
  border-radius: 7px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
  animation: langNudgeFadeIn 0.25s ease both;
  pointer-events: none;
  z-index: 100;
}

.lang-nudge-tooltip::before {
  content: '';
  position: absolute;
  top: -5px;
  right: 14px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #2a2a2a;
}

.lang-nudge-tooltip--fading {
  animation: langNudgeFadeOut 0.4s ease forwards;
}

@keyframes langNudgeFadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes langNudgeFadeOut {
  to { opacity: 0; transform: translateY(-4px); }
}

html[data-theme="dark"] .lang-nudge-tooltip {
  background: #e8e0d8;
  color: #1a1a1a;
}

html[data-theme="dark"] .lang-nudge-tooltip::before {
  border-bottom-color: #e8e0d8;
}
```

- [ ] **Step 2: Run tests — still expect failures (JS not wired up yet)**

Run: `npx playwright test tests/e2e/lang-nudge.spec.js`

Expected: still 4 failures. CSS alone adds no classes or DOM nodes.

- [ ] **Step 3: Commit CSS**

```bash
git add assets/css/extended/custom.css
git commit -m "style: add language nudge pulse and tooltip styles"
```

---

### Task 3: Implement `lang-nudge.js`

**Files:**
- Create: `assets/js/lang-nudge.js`

- [ ] **Step 1: Create the module**

```javascript
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
```

- [ ] **Step 2: Commit the JS file**

```bash
git add assets/js/lang-nudge.js
git commit -m "feat: implement lang-nudge.js module"
```

---

### Task 4: Wire up script in `extend_head.html` and verify tests pass

**Files:**
- Modify: `layouts/partials/extend_head.html`
- Test: `tests/e2e/lang-nudge.spec.js`

- [ ] **Step 1: Add the script tag at the end of `extend_head.html`**

Find the end of the file (currently ends after the blob geometry block). Append:

```html
{{- if eq site.Language.Lang "en" -}}
  {{- $langNudge := resources.Get "js/lang-nudge.js" | resources.Minify | fingerprint -}}
  <script defer crossorigin="anonymous" src="{{ $langNudge.RelPermalink }}" integrity="{{ $langNudge.Data.Integrity }}"></script>
{{- end -}}
```

The full file should now look like:

```html
<meta name="referrer" content="no-referrer-when-downgrade">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&display=swap" rel="stylesheet">
<link rel="manifest" href="/site.webmanifest">
{{- $sitePreferences := resources.Get "js/site-preferences.js" | resources.Minify | fingerprint -}}
{{- $languagePaths := dict -}}
{{- range site.Home.AllTranslations -}}
  {{- $languagePaths = merge $languagePaths (dict .Lang .RelPermalink) -}}
{{- end -}}
<script crossorigin="anonymous" src="{{ $sitePreferences.RelPermalink }}" integrity="{{ $sitePreferences.Data.Integrity }}"></script>
<script>
  NeilSitePreferences.init({
    pathname: window.location.pathname,
    rootPath: {{ (urls.Parse ("" | absURL)).Path | jsonify | safeJS }},
    currentLanguage: {{ site.Language.Lang | jsonify | safeJS }},
    browserLanguages: (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]),
    supportedLanguages: {{ (slice "en" "zh") | jsonify | safeJS }},
    fallbackLanguage: "en",
    languagePaths: {{ $languagePaths | jsonify | safeJS }},
    storageKey: "preferred-language",
    storage: window.localStorage,
    location: window.location,
    document: document
  });
</script>
{{- if or .IsHome (eq .Layout "search") -}}
  {{- $blobGeometry := resources.Get "js/blob-layout-geometry.js" | resources.Minify | fingerprint -}}
  <script defer crossorigin="anonymous" src="{{ $blobGeometry.RelPermalink }}" integrity="{{ $blobGeometry.Data.Integrity }}"></script>
{{- end -}}
{{- if eq site.Language.Lang "en" -}}
  {{- $langNudge := resources.Get "js/lang-nudge.js" | resources.Minify | fingerprint -}}
  <script defer crossorigin="anonymous" src="{{ $langNudge.RelPermalink }}" integrity="{{ $langNudge.Data.Integrity }}"></script>
{{- end -}}
```

- [ ] **Step 2: Run the full E2E test suite**

Run: `npx playwright test tests/e2e/lang-nudge.spec.js`

Expected output:
```
  ✓ Language nudge › appears on first visit to an English page
  ✓ Language nudge › writes lang-nudge-seen to localStorage immediately on appearance
  ✓ Language nudge › does not appear when lang-nudge-seen is already set
  ✓ Language nudge › does not appear on Chinese-language pages

  4 passed
```

If any test fails, check:
- Hugo server is running (`hugo server`)
- CSS class name matches exactly: `.lang-btn--nudge` (no typo)
- `lang-nudge-tooltip` is the correct class name in the JS
- `document.documentElement.lang` is `'en'` on English pages (check the `<html>` tag in browser DevTools)

- [ ] **Step 3: Run the full test suite to check for regressions**

Run: `npx playwright test`

Expected: all existing tests pass, 4 new tests pass.

- [ ] **Step 4: Manual verification in browser**

Open `http://localhost:1313/` in a browser where `lang-nudge-seen` is NOT in localStorage (open DevTools → Application → Storage → localStorage → delete the key if present).

Verify:
- "中文" button has a warm copper tint and pulsing glow ring
- Tooltip "站点也有中文版 · Click to switch" appears below the button
- After ~4 seconds: tooltip fades out, pulse stops
- Refresh: nudge does not reappear (localStorage key is set)
- Open `http://localhost:1313/zh/` in the same tab: no nudge (script not loaded on ZH pages)
- Click "中文" during nudge: nudge disappears immediately, navigates to `/zh/`

- [ ] **Step 5: Commit**

```bash
git add layouts/partials/extend_head.html
git commit -m "feat: show first-visit language nudge on English pages"
```
