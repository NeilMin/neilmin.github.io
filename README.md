# Neil's Blog Site

Personal bilingual blog built with Hugo and the PaperMod theme.

This README is primarily for future coding agents or maintainers who need to get oriented quickly.

## Overview

- Framework: Hugo
- Theme: PaperMod (git submodule under `themes/PaperMod`)
- Default language: English at `/`
- Secondary language: Chinese at `/zh/`
- Production URL: `https://neilmin.com/`
- Hosting: GitHub Pages via GitHub Actions

## Project Structure

- `hugo.toml`
  Main site configuration, menus, bilingual settings, analytics, and global PaperMod params.
- `content/`
  Site content.
- `content/posts/`
  Blog posts.
- `content/resume.md` and `content/resume.zh.md`
  Resume pages.
- `content/search.md` and `content/search.zh.md`
  Search pages.
- `layouts/`
  Local Hugo overrides for PaperMod behavior.
- `assets/css/extended/custom.css`
  Custom site styling, including the animated homepage/search background.
- `static/`
  Static assets copied directly into the output.
- `.github/workflows/gh-pages.yml`
  GitHub Pages deployment workflow.

## Bilingual Conventions

This site uses Hugo multilingual support with English as the root language and Chinese under `/zh/`.

- English lives at `/`
- Chinese lives at `/zh/`
- English files are unsuffixed:
  - `content/posts/my-post.md`
  - `content/resume.md`
  - `content/search.md`
- Chinese translations use `.zh.md`:
  - `content/posts/my-post.zh.md`
  - `content/resume.zh.md`
  - `content/search.zh.md`

For translated posts, keep the same basename when possible. If filenames ever diverge, use the same `translationKey` in both files.

## Content Rules

- Posts should live in `content/posts/`.
- Resume and search pages already exist in both languages.
- Drafts do not publish in production unless Hugo is explicitly run with drafts enabled.
- Reading time is intentionally enabled and localized:
  - English: `Estimated reading time: X minutes`
  - Chinese: `预计阅读 X 分钟`

## Theme Override Philosophy

Prefer local overrides in `layouts/`, `assets/`, and `i18n/` instead of editing files inside `themes/PaperMod`.

Current local overrides:

- `layouts/_default/baseof.html`
  Local copy of PaperMod base template.
  Important: this removes cached footer rendering so footer-level per-page logic can vary by page and language.
- `layouts/partials/header.html`
  Language switcher prefers the current page's translation instead of always jumping to the other language homepage.
- `layouts/partials/extend_head.html`
  Extra head tags for site-specific behavior.
- `layouts/partials/extend_footer.html`
  Homepage/search animated background plus post view counter placement.
- `layouts/partials/comments.html`
  Giscus comments integration, with language chosen by page locale.
- `assets/css/extended/custom.css`
  Custom visual styling beyond stock PaperMod.
- `i18n/en.yaml` and `i18n/zh.yaml`
  Localized overrides for reading-time wording.

Avoid modifying `themes/PaperMod/...` directly unless there is no reasonable local override.

## Homepage and Search Background

The animated glow background is intentionally limited to:

- homepage
- search page

It should not appear on:

- resume pages
- blog post pages
- other content pages

The effect lives in:

- `layouts/partials/extend_footer.html`
- `assets/css/extended/custom.css`

Mouse interaction is implemented in JavaScript and designed to feel soft and viscous rather than snappy.

## Analytics, Counters, and Comments

- Google Analytics 4 is enabled in `hugo.toml`:
  - `googleAnalytics = 'G-EWCKPKZT8L'`
- Public post view counter uses Vercount:
  - script injected from `https://vercount.one/js`
  - rendered only on single post pages
  - still uses `busuanzi_*` DOM IDs for compatibility
- Comments use Giscus:
  - configured in `layouts/partials/comments.html`
  - English pages use `data-lang="en"`
  - Chinese pages use `data-lang="zh-CN"`

## Deployment

Deployment is handled by GitHub Pages Actions in `.github/workflows/gh-pages.yml`.

Workflow behavior:

- triggers on pushes to `main` and `master`
- checks out submodules
- builds with Hugo `0.160.0` extended
- runs `hugo --gc --minify`
- uploads `./public`
- deploys via `actions/deploy-pages`

Custom domain configuration:

- `baseURL` is `https://neilmin.com/`
- `static/CNAME` contains `neilmin.com`

## Local Development

Typical commands:

```bash
hugo server
```

Production-style local build:

```bash
hugo --gc --minify
```

When verifying generated output without polluting the repo, a temporary destination is useful:

```bash
hugo --gc --minify --destination /tmp/my-blog-site-preview
```

## Repo Hygiene

Generated output is not tracked.

Ignored artifacts include:

- `public/`
- `.DS_Store`
- `.hugo_build.lock`

Do not reintroduce generated `public/` output into git unless there is a very explicit reason.

## Important Implementation Notes

- The site is intentionally bilingual from the config layer down through content and UI.
- The root English site and `/zh/` Chinese site should both remain functional when adding pages.
- Footer behavior depends on the local `layouts/_default/baseof.html` override. If that file is removed, page-specific footer logic may regress.
- Comments and view counter are post-only features. They should not bleed onto the homepage or resume pages.
- Search depends on Hugo JSON home output being enabled.

## If You Add New Posts

Recommended workflow:

1. Create the English file in `content/posts/`.
2. Create the Chinese translation beside it as `.zh.md`.
3. Keep metadata aligned across both versions.
4. Publish both when ready by ensuring they are not drafts.

## If You Need To Change UI Text

Check these places first:

- `hugo.toml` for menus and profile text
- `i18n/` for localized reusable strings
- `layouts/partials/` for structural or conditional UI behavior

## Current Major Custom Features

- bilingual English/Chinese site structure
- translation-aware language switcher
- homepage/search animated mesh glow background
- localized reading-time labels
- Vercount post view counter
- Giscus comments
- GitHub Pages deployment with custom domain
