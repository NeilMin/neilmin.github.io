# Favorite Personal Websites Post Design

## Summary

Create a one-off Chinese blog post that showcases a curated list of personal websites. Each entry should render as a clickable card with a desktop homepage screenshot, the website domain as the title, and a short Chinese description. The implementation should fit naturally into the existing Hugo + PaperMod blog without introducing a heavyweight new page template.

## Goals

- Publish one Chinese article first, with English translation deferred until the Chinese version is finalized.
- Make each website entry visually consistent and easy to browse.
- Keep the author workflow lightweight: the user only needs to provide URLs in the desired order.
- Allow the full card to open the target website directly.
- Keep screenshots organized in a dedicated folder for this post.
- Ensure any added CSS is scoped so it does not affect unrelated pages.

## Non-Goals

- Building a reusable site-wide content type or data-driven section for future lists.
- Creating a fully custom standalone layout outside the normal blog system.
- Automating the English translation during this phase.

## Confirmed Decisions

- This is a one-off post, not a reusable Hugo component.
- The first version is Chinese only.
- The assistant will draft short Chinese descriptions based on each site.
- Screenshots should use a unified desktop homepage style.
- The final presentation should use compact cards.
- The card title should use the domain or site name only; the URL should not be repeated as visible body text.
- The entire card should be clickable.
- Screenshots should live in a dedicated folder for easier management.
- CSS changes must be isolated to this article.

## Recommended Approach

Use a standard post Markdown file plus a narrowly scoped article-specific presentation layer.

This keeps the content in the normal Hugo post workflow while still allowing a polished visual layout. The page will remain a regular blog post in terms of content storage and routing, but the website entries inside it will be rendered with a dedicated structure and scoped CSS rules.

## Content Structure

The article should be organized into three parts:

1. A short Chinese introduction explaining why these personal websites are worth sharing.
2. A sequence of website cards, ordered exactly as the user provides the URLs.
3. A short closing paragraph summarizing what stands out across the collection.

Each website card should contain:

- Desktop homepage screenshot
- Domain or site title
- Short Chinese description
- Click target to the external website

Visible URL text should be omitted from the card body because the title already communicates the destination.

## Card Design

The chosen card direction is the compact second mockup reviewed with the user.

Visual behavior:

- Screenshot sits at the top of the card with a consistent aspect ratio.
- Title sits below the screenshot.
- Description sits below the title.
- The full card acts as a single clickable area.

Interaction behavior:

- Hover and focus states should make the card feel interactive.
- Clicking anywhere on the card should open the website.
- External links should open safely with appropriate attributes.

Accessibility behavior:

- Cards should remain readable on mobile and desktop.
- Focus styling must remain visible for keyboard users.
- Screenshot alt text should identify the referenced site.

## Styling Strategy

All new CSS must be scoped to this article only.

Preferred pattern:

- Add a wrapper class on the article content such as `website-showcase`.
- Prefix all related selectors with that wrapper.

Examples of intended selector shape:

- `.website-showcase .site-card`
- `.website-showcase .site-card-title`
- `.website-showcase .site-card-image`

This avoids accidental styling changes on other posts or list pages.

## File and Asset Organization

Planned content file:

- `content/posts/favorite-personal-websites.zh.md`

Planned screenshot directory:

- `static/images/favorite-personal-websites/`

Planned styling touchpoint:

- `assets/css/extended/custom.css`

If needed, a small article-specific shortcode or partial can be introduced, but only if plain Markdown plus inline HTML becomes too awkward. The default should remain minimal complexity.

## Content Production Workflow

The workflow for assembling the post is:

1. User provides the ordered list of website URLs.
2. Assistant attempts to capture a desktop homepage screenshot for each site.
3. Assistant drafts a short Chinese description for each site.
4. Assistant assembles the post in the chosen card layout.
5. User reviews and edits the descriptions.
6. After the Chinese version is approved, the post can later be translated into English.

## Screenshot Acquisition Plan

Primary approach:

- Use the provided URLs to capture consistent desktop homepage screenshots.

Fallback behavior:

- If a website blocks automation, loads unreliably, or produces a poor first-screen capture, flag it explicitly for manual handling.
- The rest of the article should continue normally even if a small number of sites need special handling.

## Error Handling and Edge Cases

- Some websites may redirect to localized or mobile variants; screenshots should be checked for consistency.
- Some sites may have loading animations, cookie banners, or popups that reduce screenshot quality.
- Some domains may display poorly if the homepage is unusually long or sparse above the fold.
- Descriptions generated from homepage content should be treated as first drafts and reviewed by the user.

## Testing and Verification

Before considering implementation complete, verify:

- The post renders correctly in Hugo.
- The new styles only affect this article.
- Cards are clickable and lead to the correct websites.
- The layout works on desktop and mobile widths.
- Screenshot paths resolve correctly from Hugo.
- No existing posts show unintended spacing, card styling, or hover changes.

## Alternatives Considered

### Pure Markdown Only

Pros:

- Simplest possible implementation

Cons:

- Weaker visual consistency
- Harder to make the full card clickable
- More awkward to maintain polished spacing and responsive behavior

### Dedicated Custom Page Template

Pros:

- Maximum design freedom

Cons:

- Too heavy for a one-off post
- More custom structure than the current need justifies

## Final Recommendation

Implement this as a normal Chinese blog post with a compact, article-scoped card layout and a dedicated screenshot folder. This gives the post a polished curated look while keeping the implementation simple, maintainable, and safely isolated from the rest of the site.
