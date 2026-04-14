# Homepage Blob Layout Design

## Goal

Preserve the existing "three glowing blobs that drift slowly and react to the mouse" effect on the homepage and search page, while fixing the composition on ultra-wide displays.

The current implementation anchors blob shells directly to viewport edges using fixed desktop percentages. That works on common laptop and desktop ratios, but on 21:9 displays the blobs spread apart too much, look too small relative to the screen, and lose the intended interaction contrast. The desired behavior is:

- blobs stay visually clustered around the center content area
- the resting state already feels cohesive, with only small gaps between blobs
- mouse movement near the central interactive area pushes the blobs apart
- when the pointer leaves, the blobs settle back into a clustered state

## Scope

In scope:

- homepage and search page blob layout
- blob sizing across desktop viewport ratios
- mouse-interaction geometry and falloff behavior
- responsive behavior for wide and ultra-wide screens

Out of scope:

- changing the color palette
- changing the number of blobs
- redesigning the homepage content itself
- introducing canvas/WebGL or replacing the CSS animation system

## Current State

The current effect is implemented in:

- `layouts/partials/extend_footer.html`
- `assets/css/extended/custom.css`

Key characteristics of the current implementation:

- three blob shells are positioned with fixed `top/left/right/bottom` percentages
- shell sizes are fixed pixel values
- the internal blob animation is CSS-driven and already acceptable
- mouse repulsion uses shell center points derived from `getBoundingClientRect()`

Primary failure mode:

- the blobs are positioned relative to the full viewport rather than the center content region, so wider viewports increase the perceived spacing even before interaction

## Approach Options Considered

### Option 1: Viewport percentages plus more breakpoints

Continue using viewport-relative CSS positioning and add special rules for ultra-wide layouts.

Pros:

- low implementation cost
- minimal JavaScript changes

Cons:

- remains fundamentally tied to viewport width rather than content
- likely to require iterative breakpoint patching
- more fragile as display ratios vary

### Option 2: Content-anchored layout model

Define a central cluster region and compute blob positions from that region instead of the full viewport.

Pros:

- directly matches the design intent
- stable across wide desktop ratios
- keeps interaction focused near the content area

Cons:

- requires coordinated CSS and JavaScript changes
- needs careful tuning of size and offset formulas

### Option 3: Fully measured runtime layout from live content bounds

Measure the actual content block on every relevant layout change and derive all blob geometry from its live rectangle.

Pros:

- most accurate alignment with real content
- adapts to content shifts automatically

Cons:

- more implementation complexity
- more moving parts than needed for this effect

## Recommended Design

Use a hybrid of Option 2 and Option 3:

- anchor the blob cluster to the center content area, not the viewport edges
- size blobs with a mixed formula that primarily follows content width, with viewport-aware clamps
- compute interaction geometry from the same cluster anchor so the repulsion remains strongest where the user actually hovers links and buttons

This keeps the effect visually centered on the interactive content while avoiding overfitting to any single screen ratio.

## Layout Model

### Anchor target

The layout system should identify the main homepage/search content container and treat it as the anchor. The blob cluster center should align with that content block, not the browser window center unless both happen to coincide.

Preferred target behavior:

- homepage profile layout: anchor to the `.profile_inner` block or nearest stable equivalent
- search layout: anchor to the main search content container
- fallback: if no target container is found, use the viewport center

### Cluster geometry

Define a virtual cluster region centered on the anchor target. Blob positions should be expressed as offsets from this cluster center rather than percentages from viewport edges.

Resting composition target:

- top-left blob slightly left and above center
- top-right blob slightly right and above center
- bottom blob centered slightly below
- default spacing should match the approved "B" direction: cohesive cluster with small but visible resting gaps

The cluster spread should grow only modestly as space increases. Wider screens must not cause the blobs to drift outward proportionally to the full viewport width.

### Blob size model

Blob diameters should use a mixed formula:

- primary driver: anchor content width
- secondary driver: viewport short edge
- bounded by explicit min/max clamps

This avoids two failure modes:

- content-only sizing can become too conservative on some displays
- viewport-only sizing can make ultra-wide screens feel oversized or detached from the content

Initial tuning targets:

- blob size should scale smoothly within a bounded desktop range rather than jump at breakpoints
- the bottom blob should remain slightly larger than the top pair
- ultra-wide screens may increase blob size somewhat, but less aggressively than raw viewport width would imply
- implementation should start with clamp-based sizing and tune only from observed layouts, not from viewport-ratio-specific special cases

## Interaction Model

### Pointer influence area

The pointer-repulsion effect should be centered on the same content-anchored cluster region.

Changes from current behavior:

- the effect should feel strongest when the pointer moves through the central content zone
- blob centers should be recomputed from their anchored resting positions
- influence radius and maximum push should scale from cluster size rather than remain fully fixed

### Motion behavior

Keep the current qualitative feel:

- soft, viscous response
- smooth easing back to rest
- no sharp snaps

The current falloff and lerp approach is directionally correct and should be preserved unless testing shows instability after the geometry change.

## Component Changes

### `layouts/partials/extend_footer.html`

Refactor the script so it:

- locates the anchor content element for the current page
- computes a cluster center and derived blob geometry
- writes blob shell positions and sizes dynamically
- recalculates geometry on resize and on relevant layout changes
- continues running the repulsion animation loop

Likely data shape per blob:

- resting offset from cluster center
- size
- current displacement
- target displacement
- live center point

### `assets/css/extended/custom.css`

Refactor CSS so it:

- treats blob shells as JS-positioned elements
- preserves visual styling, blur, opacity, and internal drift animation
- removes reliance on hard-coded viewport placement percentages for desktop layout

CSS should remain responsible for:

- color
- blur
- internal breathing/drift animation
- reduced-motion behavior

JavaScript should become responsible for:

- anchored placement
- responsive size calculation
- cluster spread calculation
- interaction radius scaling

## Error Handling and Fallbacks

- If the anchor element is missing, fall back to viewport-centered cluster placement.
- If layout measurements fail or return invalid values, skip that frame's geometry update and retain the previous valid layout.
- If `prefers-reduced-motion: reduce` is active, preserve the current reduced-motion behavior and avoid interaction animation.
- If JavaScript does not run, the CSS should still render a reasonable static clustered layout rather than a broken spread.

## Testing Strategy

Manual verification is required because the change is highly visual.

Minimum checks:

- homepage on standard laptop ratio
- homepage on wide desktop ratio
- homepage on simulated 21:9 ratio
- search page on standard and ultra-wide ratios
- mouse movement through central links/buttons
- pointer leaving the window and blobs settling back together
- reduced-motion behavior
- both light and dark themes

Visual acceptance criteria:

- at rest, blobs remain clustered around the content area
- on ultra-wide screens, there is no large default gap between blobs
- the hover interaction clearly creates separation that was not already present
- leaving the interaction area restores the clustered state

## Implementation Notes

- Prefer deriving all placement values from a single geometry calculation function to avoid split logic across CSS and JS.
- Keep the existing blob markup unless there is a clear simplification from adding per-blob data attributes.
- Avoid special-case breakpoint branches unless they are clearly justified by measured behavior.

## Open Decisions Resolved In This Design

- layout anchor: center content area
- resting composition: closer to "B" than "A" or "C"
- size model: mixed, with content-driven sizing plus bounded viewport influence
- interaction intent: emphasize movement around the central interactive area

## Success Criteria

This design is successful if:

- the homepage/search background feels materially the same on normal desktop screens
- 21:9 screens preserve a cohesive clustered resting state
- the mouse repulsion regains its before/after contrast on ultra-wide displays
- the implementation remains simple enough to maintain inside the current Hugo + CSS + small-JS setup
