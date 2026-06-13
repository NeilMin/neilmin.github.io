# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
hugo server                                               # local dev at http://localhost:1313
hugo --gc --minify                                        # production build
hugo --gc --minify --destination /tmp/blog-preview        # preview build without polluting repo

# Tests (requires hugo server running first)
npx playwright test                                       # run all E2E tests
npx playwright test tests/e2e/animation-stagger.spec.js  # run a single spec
npx playwright test --headed                              # run with browser visible
```

Do not use `hugo --contentDir` — shortcode changes silently won't take effect.  
macOS `grep` doesn't support `-P`; use `egrep` instead.

## Tech Stack

- **Hugo** (v0.160.0 extended) + **PaperMod** theme (git submodule at `themes/PaperMod`)
- Bilingual: English at `/`, Chinese at `/zh/` — configured in `hugo.toml` via `[languages.en]` and `[languages.zh]`
- Deployment: GitHub Pages via `.github/workflows/gh-pages.yml` → `https://neilmin.com/`
- E2E tests: Playwright (`tests/e2e/`), targeting `localhost:1313`
- No build system for CSS/JS — Hugo pipelines assets directly via `resources.Get | resources.Minify | fingerprint`

## Directory Structure

```
hugo.toml                          # all site config: menus, bilingual, GA4, PaperMod params
content/posts/                     # blog posts  (EN: foo.md  /  ZH: foo.zh.md)
content/projects/_index.md         # projects section index (content is empty; data comes from data/)
content/resume.md / resume.zh.md   # About page
content/search.md / search.zh.md   # Search page (layout: search)
content/archives.md / archives.zh.md
data/projects.yml                  # single source of truth for all projects
data/tech_icons.yml                # slug → emoji map for tech stack tags
assets/css/extended/custom.css     # ALL custom CSS — the only CSS file to touch
assets/js/                         # custom JS files (loaded via Hugo asset pipeline)
i18n/en.yaml / zh.yaml             # custom i18n strings (currently: archiveTimelineView, viewAllPosts)
layouts/                           # Hugo template overrides (never touch themes/PaperMod/)
layouts/_default/                  # baseof, list, single, archives, search, rss, index.json
layouts/partials/                  # header, comments, extend_head, extend_footer
layouts/projects/list.html         # custom projects section template
layouts/shortcodes/                # about_* shortcodes + site-card shortcode
static/                            # copied as-is: favicon, images, CNAME
scripts/                           # standalone Node test scripts (not Hugo scripts)
tests/e2e/                         # Playwright specs
```

## Architecture: How the Pages Work

### Homepage (`list.html` with profileMode)
When `profileMode.enabled = true` and `.IsHome`, `list.html` renders the profile block, then a hardcoded "Recent Posts" section (last 3 posts from `mainSections`). The regular post list loop is skipped. Recent post entries intentionally have **no** `post-entry--awaiting` class — there's no JS to reveal them on the homepage.

### Blog list (`/posts/`, `list.html`)
Wraps `.post-entry` articles in `.posts-grid`. Every `post-entry` in the posts section gets `post-entry--awaiting` (opacity 0). `post-entries-animation.js` reveals them via IntersectionObserver with stagger. **Critical:** `post-entry--awaiting` is ONLY added when `.Section == "posts"`; adding it globally would permanently hide entries on other pages.

### Projects page (`layouts/projects/list.html`)
Data-driven: reads `data/projects.yml` sorted by `weight`. Builds tag filter pills from all unique `tech_stack` values. Each card gets `project-card--awaiting`; `projects-showcase-filters.js` handles both entrance animation and tag filtering (via `?tag=slug` URL param). Tag icons come from `data/tech_icons.yml` keyed by urlized tag slug.

### Post detail (`single.html`)
TOC sidebar is shown only when `ShowToc = true` AND the post has ≥ 2 headings (`ge (len (findRE "<h[1-6].*?>" .Content)) 2`). `toc-scrollspy.js` is loaded only when TOC is rendered. Footer auto-injects a "Related Project" backlink by scanning `hugo.Data.projects` for any project whose `secondary_btn_url` matches the current page's permalink.

### Search (`layouts/_default/search.html`)
Depends on `home = ["HTML", "RSS", "JSON"]` in `hugo.toml`. `fastsearch.js` fetches `../index.json` (Fuse.js), searches on keyup, and shows a `.search-no-results` item when nothing matches.

### Language auto-redirect (`site-preferences.js`)
Runs synchronously on every page load (loaded in `extend_head.html`). On the root path only, checks localStorage for `preferred-language`; if absent, picks from `navigator.languages`. Redirects to the preferred language's root if it differs from the current language. Language switcher clicks update localStorage via `data-language-switch` attribute.

### First-visit language nudge (`lang-nudge.js`)
Loads deferred on every EN and ZH page. Checks `localStorage['lang-nudge-seen']`; if absent, adds `lang-btn--nudge` class to `.lang-switch a` (CSS pulse ring) and inserts a `.lang-nudge-tooltip` div. Writes the key immediately on display so the nudge never re-fires. Auto-dismisses after 4 s; clicking the button dismisses immediately. Tooltip text comes from `window.LangNudgeConfig.tooltipText`, injected by `extend_head.html` via Hugo's `cond`: EN pages get `站点也有中文版`, ZH pages get `This site is also in English`.

## Layout Overrides Reference

| File | What it does |
|------|-------------|
| `layouts/_default/baseof.html` | Removes cached footer rendering so per-page footer logic varies correctly |
| `layouts/_default/list.html` | Homepage (profileMode + recent posts) + blog card grid + posts entrance animation |
| `layouts/_default/single.html` | Post: conditional TOC sidebar, project backlink, archive link, Giscus comments |
| `layouts/_default/archives.html` | Timeline archive page with breadcrumbs |
| `layouts/partials/extend_head.html` | Loads `site-preferences.js` (sync), `blob-layout-geometry.js` (deferred, home/search only), `lang-nudge.js` (deferred, EN+ZH pages) |
| `layouts/partials/extend_footer.html` | Blob HTML + WAAPI entrance + rAF mouse loop (home/search only); Vercount counter (posts only) |
| `layouts/partials/header.html` | Language switcher links to current page's translation (not the other language homepage) |
| `layouts/partials/comments.html` | Giscus with `data-lang` set by `.Lang` |
| `layouts/projects/list.html` | Projects: reads `hugo.Data.projects`, tag filter pills, two-column cards |

## Custom JS Reference

| File | When loaded | What it does |
|------|-------------|-------------|
| `site-preferences.js` | Every page (sync) | Language detect → redirect + localStorage binding |
| `blob-layout-geometry.js` | Home + search (deferred) | Pure math: computes blob positions from anchor rect |
| `post-entries-animation.js` | Posts list (deferred) | `post-entry--awaiting` → `post-entry--revealed` with stagger |
| `projects-showcase-filters.js` | Projects page (deferred) | Entrance stagger + tag filter via URL `?tag=` param |
| `about-entrance-animation.js` | About page (inline via shortcode) | `.about-section--awaiting` → `--revealed` with stagger |
| `toc-scrollspy.js` | Single post w/ TOC (deferred) | Adds `is-active` to the TOC link whose heading is nearest top |
| `fastsearch.js` | Search page | Fuse.js search over `index.json`; keyboard nav (↑↓→ Esc) |
| `lang-nudge.js` | EN + ZH pages (deferred) | First-visit nudge: pulses `.lang-switch a`, shows tooltip from `window.LangNudgeConfig.tooltipText`, writes `lang-nudge-seen` to localStorage immediately so it never re-triggers |

## Shortcodes

All live in `layouts/shortcodes/`. Used in `content/resume.md` and `content/resume.zh.md`:

| Shortcode | Purpose |
|-----------|---------|
| `about_avatar` | Profile photo |
| `about_intro` | Intro paragraph block with `.about-page__intro` styling |
| `about_tags` | Renders skill pills; splits on `,` (EN) **and** `、` (ZH) — both separators must always work |
| `about_card` | Experience/education card with title, meta, eyebrow, body |
| `about_socials` | Social icon row |
| `about_entrance_js` | Injects `about-entrance-animation.js` inline |
| `site-card` | Clickable image+description card used in the "favorite personal websites" post |

## Data Schema: `data/projects.yml`

Each project entry supports:

```yaml
name: string              # EN name (also used as slug via anchorize)
name_zh: string           # ZH name (optional)
description: string       # EN description
description_zh: string    # ZH description (optional)
image: /images/...        # cover image path
tech_stack: [list]        # tags shown as pills; must match keys in tech_icons.yml (urlized)
weight: int               # sort order (ascending)
primary_btn_text/_zh:     # primary CTA label
primary_btn_url:          # if not "://", treated as internal (ZH version gets /zh prefix auto-added)
secondary_btn_text/_zh:   # secondary CTA label (also used for post backlink matching)
secondary_btn_url:        # internal path; single.html matches this against current page permalink
github_url:               # optional GitHub link
```

## CSS Architecture

`assets/css/extended/custom.css` is the **only** CSS file. Never create new CSS files.

Design tokens (CSS variables) are defined in `:root` (light) and `:root[data-theme="dark"]` (dark):
- `--theme`, `--entry`, `--primary`, `--secondary`, `--tertiary`, `--content` — backgrounds and text
- `--accent` — muted mauve (`rgb(112,82,104)` light) / dusty rose (`rgb(168,138,160)` dark)
- `--border`, `--radius` — borders and rounding
- `--blob-opacity`, `--blob-blur` — tunable blob parameters

Dark mode selector used in the file: `html[data-theme="dark"]` and `:root[data-theme="dark"]` — both are valid and both are used in different places.

Page-scoped styles use body class selectors: `body.about-page`, `body.home`, `body.favorite-websites-page`.

Entrance animation state classes:
- `.post-entry--awaiting` / `.post-entry--revealed`
- `.project-card--awaiting` / `.project-card--revealed` / `.project-card--filtered`
- `.about-section--awaiting` / `.about-section--revealed`

## Blob Background Animation

Only renders on homepage and search page (`extend_footer.html` guards with `if or .IsHome (eq .Layout "search")`).

**Architecture:** `.blob-shell` (outer, moved by WAAPI entrance + rAF mouse loop) → `.blob` (inner, CSS `slowDriftBloom*` keyframe animation always running).

**Rules that must not be broken:**
1. CSS drift animation starts from page load — never suppress with `animation: none` on `.blob`
2. WAAPI entrance animates only `transform` on `.blob-shell` (translate from viewport center + scale from 0.12 to 1)
3. After entrance `anim.finished`, cancel WAAPI and clear transform — CSS drift takes over seamlessly
4. Mouse rAF loop writes `translate3d` to `.blob-shell.style.transform` after entrance is done (`entranceDone[i]` flag)
5. `blob-layout-geometry.js` (`BlobLayoutGeometry.resolveBlobLayout`) computes positions from the anchor element rect (`.profile_inner` on homepage, `#searchbox` on search), with fallback to viewport center
6. If drift freezes or jumps, check for anything suppressing `.blob`'s CSS animation

## Bilingual Rules

Every change must stay in sync across EN and ZH:

- English pages: `/posts/foo/`, `/resume/`, `/projects/`
- Chinese pages: `/zh/posts/foo/`, `/zh/resume/`, `/zh/projects/`
- Internal links in ZH pages must have `/zh/` prefix
- `hugo.toml` menus are defined separately for `languages.en` and `languages.zh`
- `i18n/` keys must be added to **both** `en.yaml` and `zh.yaml`
- Shortcode content used in resume pages must handle both `,` and `、` separators (see `about_tags.html`)
- CSS and JS selectors must not assume a single language

## Adding New Content

**New post:**
1. `content/posts/foo.md` (EN)
2. `content/posts/foo.zh.md` (ZH)
3. Keep frontmatter aligned: `title`, `date`, `tags`, `draft`
4. Set `draft: false` before pushing

**New project:**
1. Add entry to `data/projects.yml` with all required fields
2. Add cover image to `static/images/projects/`
3. Add any new tech stack tags to `data/tech_icons.yml`
4. If it links to a post via `secondary_btn_url`, the backlink appears automatically in that post's footer

**New i18n string:**
1. Add key to `i18n/en.yaml`
2. Add same key to `i18n/zh.yaml`
3. Use `{{ i18n "keyName" }}` in templates

## Navigation & Pages

- **Navbar:** Blog | Projects | About | Search
- Archive page exists at `/archives/` (linked from blog list header and post footer) — not in navbar
- `/tags/` index page has been deleted — do not recreate it. Individual tag pages (`/tags/hugo/`) are kept for SEO

## Known Gotchas

- After CSS changes, confirm the content hash changed in `public/` output to verify the pipeline re-processed the file
- The theme partial `themes/PaperMod/layouts/partials/templates/opengraph.html` uses the deprecated `.Language.LanguageCode`, emitting one WARN per build — safe to ignore unless you override that partial (don't edit the theme directly). Our own layouts use the current `.Language.Direction`, `.Language.Locale`, and `hugo.Data` — keep them that way.
- `tags/_index.md` and `zh/tags/_index.md` are intentionally deleted — do not recreate them
- `AGENTS.local.md` is gitignored (local preferences); `AGENTS.md` is committed (project context for AI agents)

## Deployment

Push to `main` → GitHub Actions builds with Hugo 0.160.0 extended → deploys to GitHub Pages at `https://neilmin.com/`. Custom domain configured via `static/CNAME`.
