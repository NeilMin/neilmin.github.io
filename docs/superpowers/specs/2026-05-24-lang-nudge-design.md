# Language Nudge — Design Spec

**Date:** 2026-05-24  
**Status:** Approved

## Problem

The site is bilingual (EN at `/`, ZH at `/zh/`). The existing `site-preferences.js` already auto-redirects users whose browser language is Chinese to `/zh/` on the root path. However, users whose browser is set to English but who prefer Chinese (e.g., friends shared a homepage link) never discover the Chinese version because the language switcher in the nav is visually subtle and easy to miss.

## Goal

On first visit to any English-language page, subtly draw attention to the existing "中文" nav link so first-time visitors notice the Chinese version exists. After the nudge is dismissed or acted upon, never show it again.

## Out of Scope

- Full-screen language selection modal
- Top banner (option B considered and rejected — too app-like for a personal blog)
- Any changes to the Chinese version (`/zh/` pages)
- Any changes to `site-preferences.js` or `header.html`

## Behavior

### Trigger conditions (all must be true)

1. `localStorage.getItem('lang-nudge-seen')` is falsy (first visit)
2. Current page language is English (`<html lang="en">`)
3. A `.lang-switch a` element exists in the DOM (bilingual page, lang switcher rendered)

### Visual effect

When triggered:

1. Find the `.lang-switch a` element (the "中文" link in the nav)
2. Add class `lang-btn--nudge` to it → applies warm copper highlight + pulsing glow ring via CSS
3. Dynamically insert a tooltip `<div class="lang-nudge-tooltip">` as a sibling after the link, absolutely positioned below it, with text: **"站点也有中文版 · Click to switch"** and an upward-pointing CSS arrow

### Auto-dismiss sequence

| Time | Action |
|------|--------|
| 0s | Nudge appears with `fadeIn` animation (0.25s); `lang-nudge-seen=1` written to localStorage immediately |
| 4s | Tooltip fades out (`fadeOut` 0.4s) |
| 4.8s | `lang-btn--nudge` class removed, button returns to normal |

### User-click dismiss

If the user clicks the "中文" link at any point during the nudge:
- All nudge classes and tooltip node removed immediately
- `lang-nudge-seen=1` written to localStorage
- Normal `site-preferences.js` click handler runs as usual (writes `preferred-language=zh`)

## Implementation

### New file: `assets/js/lang-nudge.js`

Standalone IIFE. Runs after DOM is ready (`DOMContentLoaded`). No dependencies on other JS files. Logic:

```
1. Check localStorage for 'lang-nudge-seen' → exit if set
2. Check document.documentElement.lang === 'en' → exit if not
3. Query .lang-switch a → exit if not found
4. Add lang-btn--nudge class to the link
5. Insert .lang-nudge-tooltip div after the link
6. Write localStorage 'lang-nudge-seen=1' immediately
7. Set timeout (4000ms): start tooltip fade-out; after 800ms more, remove lang-btn--nudge class
8. Add one-time click listener on the link: clear timers, remove nudge immediately
```

### CSS additions: `assets/css/extended/custom.css`

Added in the `3.4 Language switcher` section:

- `.lang-btn--nudge` — warm copper background tint + border
- `.lang-btn--nudge::before` — absolutely positioned glow ring, `@keyframes langNudgePulse` (scale + opacity, 1.6s infinite)
- `.lang-nudge-tooltip` — dark rounded tooltip, absolute, below the button, CSS upward arrow
- `@keyframes langNudgeFadeIn` / `langNudgeFadeOut` — tooltip entrance and exit animations
- Dark mode variants for tooltip background

### Template change: `layouts/partials/extend_head.html`

Load `lang-nudge.js` with `defer`, only on English pages:

```html
{{- if eq site.Language.Lang "en" -}}
  {{- $langNudge := resources.Get "js/lang-nudge.js" | resources.Minify | fingerprint -}}
  <script defer crossorigin="anonymous" src="{{ $langNudge.RelPermalink }}" integrity="{{ $langNudge.Data.Integrity }}"></script>
{{- end -}}
```

## What Does Not Change

- `site-preferences.js` — untouched
- `layouts/partials/header.html` — untouched
- Chinese version pages — no nudge, no changes
- No new Hugo templates or shortcodes

## localStorage Keys

| Key | Written by | Value | Meaning |
|-----|-----------|-------|---------|
| `preferred-language` | `site-preferences.js` (existing) | `"zh"` / `"en"` | User's language preference for auto-redirect |
| `lang-nudge-seen` | `lang-nudge.js` (new) | `"1"` | Nudge has been shown; never show again |

The two keys are independent. A user can have `preferred-language=en` (auto-redirect off) but still have `lang-nudge-seen=1` (nudge dismissed).
