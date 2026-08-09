---
name: distinctive-frontend
description: Use this whenever generating or reviewing frontend UI — pages, components, layouts, design systems — to block specific overused patterns before they ship. Trigger any time the user asks for a UI, page, or component, even without them saying "make it distinctive." Especially load this for landing/marketing home pages, where the first-scroll composition and layout asymmetry rules below apply.
---

# Frontend anti-slop checklist

## Banned by default (specific, checkable)

- Hero = centered h1 + subhead + two buttons side by side. Don't build this shape unless the brief specifically calls for it.
- Everything center-aligned in a single column — headline, subhead, buttons, cards, feature list — with no asymmetry anywhere on the page. Centered-single-column is the laziest default a model reaches for. Reserve true centering for narrow, single-focus contexts (a confirmation screen, a modal, an auth form). A real product or marketing page should have an actual layout: unequal columns, offset elements, content anchored left or right, elements that bleed off one edge.
- Feature section = 3 columns, icon on top, heading, one sentence, no real image. Banned.
- Feature/metric grid where every tile is the same size — a strict 3×1 or 2×2 of identical boxes. Content has unequal importance; let tile size say so (see Bento grids below).
- Palette = cream/off-white bg (#F4F1EA-ish) + orange/terracotta accent (#D97757-ish). Banned.
- Palette = near-black bg (#0A0A0A/#111) + one neon accent. Banned unless the brief actually wants dark mode.
- Font = Inter (or Roboto/Open Sans) for both headings and body with no other reason than "it's normal." Pick a pairing and state why.
- Motion = fade + translateY(20px) on scroll, applied to every section identically. Banned as a blanket default.
- Card = white bg, 12–16px radius, soft box-shadow, used as the container for literally everything — pricing, features, testimonials, blog posts. Don't make card-for-everything the only container type in the system.
- Copy containing: "seamlessly," "effortlessly," "unlock," "empower," "revolutionize," "take X to the next level." Don't write these.
- Steps numbered 01/02/03 when the content isn't actually sequential. Don't.

## Required before writing any code

1. State plainly: what is the product, who uses it, what do they do first.
2. Name one layout decision that follows from #1 specifically — not the safest generic option.
3. Name one typographic pairing and the reason for it.
4. Name one thing in the build that would look wrong if pasted onto a different product's page.

If you can't answer #4, the build isn't done yet.

## Layout: earn asymmetry, don't default to centered

Before laying out any section, pick where the visual weight sits and why — don't let it default to the middle because that's the neutral choice. A split screen (unequal columns), a pinned element with content flowing around it, a diagonal or off-axis grid, content that starts flush against one edge — any of these read as designed. Dead center reads as unstyled.

Exception: centering is correct when the content itself is symmetric or singular by nature (a single stat, a logo lockup, a modal with one decision to make). If you're centering because you didn't decide on anything else, that's the tell to redo it.

## Bento grids — when and how to use them

A bento grid is a mosaic of tiles at 2–3 different sizes (not one uniform size, not infinite chaos) where a tile's size and shape are driven by what it holds. Reach for this on feature overviews, dashboards, pricing/plan comparisons, portfolio or proof sections, or anywhere you have a mix of content types (a number, a screenshot, a short quote, a longer explanation) that would otherwise get flattened into identical boxes.

Rules:
- 1–2 tiles max act as the "hero" of the grid (roughly 2× the others). Everything else in the same grid should be one of 2 remaining sizes — three total sizes is plenty; more reads as noise.
- Tile shape should match its content: a single stat or icon wants a small square; a screenshot or chart wants a wide rectangle; a quote or short story wants a tall one. Don't force content to fit a size grid picked before the content existed.
- Vary content type across tiles, not just size — if every tile is "icon + heading + sentence" just resized, it's decorative, not a real bento. Mix text-only, image-forward, and data-forward tiles.
- Keep the gutter and corner radius consistent across all tiles even as size varies — the grid, not the ornamentation, is what should feel structured.

## First scroll: the initial viewport has to do its job before anyone scrolls

For a home/landing/marketing page, treat everything visible on load (no scrolling) as one composition with a checklist, not a headline plus decoration:

1. **Say what it is, literally, fast.** A visitor should know if they're in the right place within a second or two. Save cleverness for the subhead, not the identity of the product.
2. **Show the product, not just describe it, when the product has something visual to show** — a real screenshot, a live demo, a terminal/code snippet, an actual UI. Headline + subhead + two buttons with nothing concrete on screen is the weakest version of a hero.
3. **One primary action, visually dominant. One secondary action, visually quieter.** Never two CTAs with equal visual weight — that forces the visitor to do the deciding you should have done.
4. **Surface one proof signal if you have one** (user count, logos, a live status indicator, an execution/uptime number) — small and near the fold's edge, not competing with the headline for attention.
5. **Split the viewport unevenly.** Prefer something like 40/60 or 45/55 over a dead 50/50, and prefer an off-center focal point over dead middle — see Layout section above. The full-bleed two-panel split (distinct background treatment per side, product artifact anchoring one side) is a strong default *when the brief supports it* — better than centered-stack, but still check it's not becoming its own new default reached for regardless of subject.
6. **Put the signature element above the fold.** If the design plan (per the design-brainstorm process) names one memorable, subject-specific element, it has to live in the first scroll — don't design one great thing and then bury it in section four.

Self-check on a hero screenshot: cover the bottom two-thirds of the screen. Can you tell what the product is, what it wants you to do, and see one piece of real evidence it works? If not, the first scroll isn't done.

## Component-library review checks (not stylistic — these are bugs)

- Prop shape copy-pasted (`variant`/`size`/`disabled`) onto a component that doesn't actually need all three.
- `@keyframes` names collide across independently-built components (two different `fadeIn` definitions).
- Duplicate SVG `id`s when the same component renders more than once on a page.
- CSS custom properties set from JS with `style.propertyName` instead of `style.setProperty('--x', ...)`.
- Class naming mixes utility classes, BEM, and ad hoc names in the same system with no rule for which is used where.

## Accessibility checks — every component, every time

- Icon-only control has `aria-label` (not just `title`).
- Hover-only reveal also works on keyboard focus and touch.
- Toasts / async status regions have `aria-live` set.
- Focus ring is never removed without a visible replacement.
- `prefers-reduced-motion` is respected.
- State (error/success/selected) is never signaled by color alone.