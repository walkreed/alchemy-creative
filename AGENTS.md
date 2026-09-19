# Webflow Project Agent Guide

A reference for AI agents building static HTML/CSS projects intended for Webflow. Follow these conventions precisely — they encode Webflow's idiosyncrasies and ensure the output can be imported, extended, or maintained in Webflow Designer without friction.

## Project Name

Project name: Alchemy Creative

---

## Project Rules

- This is a Webflow project
- Do not use Webflow MCP unless explicitly told
- Keep styleguide and component pages up to date with reusable standards
- **Never alter user-supplied copy** from Figma, designs, screenshots, references, or the prompt — preserve spelling, casing, punctuation, and whitespace verbatim

---

## Build Process

Full pipeline: **`PROCESS.md`** (repo root). Read it before starting a new stage.

**`WEBFLOW-MAP.md`** - every Webflow variable ID with its live value and its target,
plus the two font-weight bugs already live on the site. Read it before any transfer;
it saves re-reading the whole variable system.

**`FIGMA-EXTRACT.md`** - the derivation record: every token with the evidence behind it, the
measured spacing scale, the theme table, the Webflow variable mapping, and **the node ID of
every page frame in the Figma file**. Read it before any Figma work; it saves re-deriving
node IDs from scratch.

Stage order: `/figma-styleguide` -> `/styleguide` -> `/component` -> `/page` -> `/webflow-transfer`

Stage 0 (`/figma-styleguide`) is our addition to the upstream template. It builds a Style
Guide page *inside* the Figma file by deriving the system from the page comps - reading
existing paint/text styles and variables, and measuring real auto-layout spacing and radii.
Run it when a design file has finished comps but no style-guide artifact, which is the norm.

---

## Figma MCP Gotchas

Hard-won during the Alchemy extraction. The desktop bridge fails in reproducible ways.

| Gotcha | What to do |
|--------|-----------|
| `Failed to parse SSE message ... EOF while parsing a string` at col ~19500 | Response cap ~19.5KB, triggered by **how many nodes a script touches**, not by return size. Keep calls narrow; fan out in parallel. |
| `get_metadata` on a real page always fails | Don't use it on busy files. Use `use_figma` with a targeted script. |
| Any call running `setCurrentPageAsync` on a large page fails | **Never call it.** `await figma.getNodeByIdAsync('<pageId>')` loads the page and makes it current. |
| A single node crashes every call touching it | Usually an annotation TEXT node whose layer *name* is a full paragraph. Find its index and skip it. |
| A file URL's `node-id` is often a **page**, not a frame | Check against the page list before assuming. |
| `figma.createAutoLayout()` frames default to opaque **white** | Clear `fills = []` on every container, or light text vanishes on a dark page. |
| Layout writes fail after applying a brand text style | Applying a style leaves the font *unloaded*. Set `textAutoResize` / `layoutSizing*` **before** `setTextStyleIdAsync`. Fills and `resize()` still work after. |
| A licensed font won't `loadFontAsync` | `setTextStyleIdAsync` still binds `fontSize`/`fontName` correctly, but the node can't re-layout - it keeps a stale ~15px height and renders substituted glyphs. Diagnose by reading `height`, not from a screenshot. Real fix: the user activates the font. |

---

## Starter Template

The `template/` directory holds the project's foundation files. Three files ship with the baseline; the rest are created on demand by the relevant skill.

| File | Created by | Purpose |
|------|------------|---------|
| `template/styles.css` | Baseline; rewritten by `/styleguide` | All variables, base classes, utilities, breakpoint cascades. Ships neutral: greyscale palette, system fonts, one placeholder accent. |
| `template/style-guide.html` | Baseline; rewritten by `/styleguide` | Typography, color, spacing, buttons, forms, icons, cards, grid — source of truth for foundations |
| `template/index.html` | Baseline | Home page using the mandatory `page-wrapper` structure. Copy it to start any new page. |
| `template/components.html` | `/component` (on first component) | One live instance of every reusable component, each annotated with props/slots/variants. **Does not exist until the first component is built.** |

**Starting a client project**: run `/styleguide` first to replace the placeholder tokens with the client's design system, then find/replace `[BRAND-NAME]` across `template/` and this file.

**When starting a new page**: copy `template/index.html`, rename it, and replace the `<main>` contents. Do not modify the `page-wrapper`/`nav`/`footer` structure.

**When adding a new component**: use the `/component` skill. It creates `template/components.html` on first invocation, appends subsequent components, adds base CSS to `template/styles.css`, and updates the Components Index below.

**Do not**: hand-create `template/components.html` or pre-populate it with components that haven't been explicitly requested. Components are added one at a time, on demand.

---

## Philosophy

- **80/20 rule**: framework defaults handle ~80% of builds; custom code handles the rest
- **Reduce cognitive load**: consistent naming, structure, and patterns throughout
- **Already-styled defaults**: headings carry EM-based bottom margins, grid columns carry gap — do not remove these without reason
- Before building a new component, check the `/components` page first

---

## Mandatory Page Structure

Every page must use this exact wrapper structure:

```html
<div class="page-wrapper">
  <nav><!-- Global Navigation --></nav>
  <main class="main-wrapper" id="main">
    <!-- All page sections -->
  </main>
  <footer><!-- Global Footer --></footer>
</div>
```

- `page-wrapper` — enables global color mode control and wraps all content
- `main-wrapper` — semantic `<main>` landmark; required for SEO and accessibility; target of skip link
- Nav and footer are global components — never duplicate their markup per page

---

## CSS Architecture

### Four Class Types

| Type | Prefix | Purpose | Rules |
|------|--------|---------|-------|
| Base | *(none)* | Foundational elements (`section`, `container`, `row`, `col`, `button`, `card`, `tag`, `form`, `input`, `icon`) | Always the first class on an element |
| Combo | `cc-` | Variants and modifiers applied alongside a base class | Only used with a base class, never alone |
| Utility | `u-` | Single-purpose overrides | Max 4 per element; use `!important`; never mix with custom classes |
| Custom | *(none)* | Project-specific components (`blog-card`, `services-header`) | Never mix with utility classes on the same element |

**Rule**: if an element needs more than 4 utility classes, create a custom class instead.

### Selector rules (Webflow-flat — author this way from the start)

Webflow styles are **per-element class lists**: a class or a combo chain (`.base.cc-x`) applied to *one* element. Webflow has **no representation** for a descendant (`.a .b`) or child (`.a > .b`) selector, nor for `:nth-child`. Any rule that styles a child *through* its parent has nowhere to live in Webflow — the child imports **unstyled**, which reads as "the section looks broken" even though every element has a class. So `styles.css` must stay flat:

- **Never style structurally through a parent.** Instead of `.card > .card_title { … }`, put the styling on the element's own class (`.card_title`) or a combo (`.card_title.cc-featured`). Instead of `.nav > .container { … }`, create `.container.cc-nav` and add that combo to the element.
- **Never use `:nth-child` for per-item styling.** Give each item an explicit `.cc-1` / `.cc-2` / `.cc-3` combo in the markup and style those. (Applies to fanned card decks, staggered grids, etc.)
- **The ONE allowed descendant pattern is the mode cascade.** `.parent.cc-light .child` / `.cc-dark .child` is permitted, because Webflow reproduces it natively with **variable modes** (`set_style_variable_mode` on the `.cc-light`/`.cc-dark` combo cascades to descendants). For this to translate, the child's flipped properties (text/bg/border) must consume **Mode variables**, not literals.
- **Runtime / JS-state selectors are not Designer classes.** Anything keyed on a JS-toggled flag or attribute — `html.brand-name-js …`, `[data-*]`, `[open]`, `.is-armed`, `.is-scrollspy` — is an interaction/animation concern. Keep it in a **Custom Code CSS embed** (Webflow → custom code), not in the transferable class set.

Quick self-check before committing CSS (should return only mode-cascade + runtime-state lines):
```bash
grep -nE '^\s*\.[a-z][a-zA-Z0-9_-]*(\.[a-zA-Z0-9_-]+)*\s+(\.[a-zA-Z_-]|>|\[)|\s>\s*\.|:nth-child' template/styles.css | grep -vE '^\s*/\*'
```

### Naming Conventions

- **Lowercase only** — consistency between Designer and live HTML
- **Dash (`-`)** — separates words: `card-tag`, `hero-heading`, `u-bg-primary`
- **Underscore (`_`)** — separates component scope from element: `blog_card-title`, `nav_dropdown-link`
- **Breakpoint infix**: `-lg-` (desktop), `-md-` (tablet), `-sm-` (mobile landscape), `-xs-` (mobile portrait)
- **Size postfix**: `-sm`, `-md`, `-lg`, `-xl`

### Examples

```css
/* Base class */
.button {
  appearance: none;
  background: var(--color-primary);
  padding: 0.75em 1.5em;
}

/* Combo class variants */
.button.cc-secondary {
  background: transparent;
  border: 1px solid var(--color-primary);
}

.button.cc-lg {
  font-size: 1.6rem;
}

.button.cc-ghost {
  background: transparent;
  border: none;
  color: var(--color-primary);
}

/* Utility class */
.u-text-center {
  text-align: center !important;
}

.u-mt-lg {
  margin-top: 3em !important;
}

/* Custom class */
.pricing-card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
}
```

```html
<!-- Base -->
<button class="button">Click me</button>

<!-- Base + combo -->
<button class="button cc-secondary">Click me</button>
<button class="button cc-lg">Click me</button>

<!-- Base + combo + utility -->
<button class="button cc-secondary u-mt-md">Click me</button>

<!-- Custom (no utilities) -->
<div class="pricing-card">...</div>
```

---

## Typography

### Strategy

- All type uses CSS `clamp()` with REM units for fluid scaling
- **Semantic element vs visual class**: use the correct HTML tag for document hierarchy, apply a `.h*` class for visual size

```html
<!-- h3 in DOM, looks like h2 visually -->
<h3 class="h2">Section Title</h3>
```

- Heading classes `.h1`–`.h6` are always available and map to the same fluid sizes as their element counterparts
- **Do not remove** default EM-based bottom margins on headings

### Text Utilities

| Class | Effect |
|-------|--------|
| `u-text-center` | `text-align: center` |
| `u-text-right` | `text-align: right` |
| `u-text-balance` | `text-wrap: balance` |
| `u-text-pretty` | `text-wrap: pretty` |
| `u-text-clamp-1` | Single-line truncation |
| `u-text-clamp-2` | Two-line truncation |
| `u-text-clamp-3` | Three-line truncation |
| `u-text-indent` | Editorial first-line indent (2.5rem; collapses to 1.5rem at ≤479px) |
| `u-text-indent-lg` | Larger first-line indent (3rem; collapses to 1.5rem at ≤479px) |

---

## Grid System

12-column flexbox. All layouts use `row` > `col` structure.

```html
<div class="row">
  <div class="col col-lg-8 col-md-12">Main content</div>
  <div class="col col-lg-4 col-md-12">Sidebar</div>
</div>
```

### Column Classes

- Desktop: `col-lg-1` through `col-lg-12`
- Tablet: `col-md-1` through `col-md-12`
- Mobile landscape: `col-sm-1` through `col-sm-12`
- Mobile portrait: `col-xs-1` through `col-xs-12`

### Row Modifiers

| Class | Effect |
|-------|--------|
| `row-align-center` | Vertical center |
| `row-align-end` | Vertical bottom |
| `row-content-between` | Distribute children |
| `row-justify-center` | Horizontal center |
| `row-justify-between` | Space between |
| `row-gap-md` | Medium gap |
| `row-gap-sm` | Small gap |
| `row-gap-0` | No gap |

### Column Modifiers

| Class | Effect |
|-------|--------|
| `col-shrink` | Width fits content |
| `col-lg-offset-1` to `col-lg-offset-6` | Horizontal offset |
| `col-lg-first` / `col-lg-last` | Reorder at breakpoint |

---

## CSS Variables (Webflow Variables)

Webflow variables use **Title Case with spaces** in the Designer — Webflow auto-converts them to CSS custom properties. Reference them in CSS with kebab-case.

### Five Variable Collections

| Collection | Examples |
|------------|---------|
| **Theme** | `Color Primary`, `Color Surface`, `Mode Background`, `Mode Text` |
| **Typography** | `Font Body`, `Font Heading`, `Font Size Body Min`, `Font Size Body Max` |
| **Layout** | `Gap Main`, `Gap MD`, `Gap SM`, `Section Padding`, `Container Max Width` |
| **Component** | `Radius Card`, `Radius Button`, `Shadow Card`, `Input Height` |
| **Color** | `Color Primary`, `Color Secondary`, `Color Neutral 100`–`900` |

```css
/* In CSS */
.section {
  padding: var(--section-padding) 0;
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
}

.button {
  border-radius: var(--radius-button);
}
```

**Never declare custom properties on `:root`** — Webflow manages `:root`. Use Webflow's variable system exclusively.

---

## Breakpoints (Desktop-First)

Cascade downwards only. Style for desktop first, then override at each breakpoint.

```css
/* Base styles — desktop */
.hero-heading {
  font-size: clamp(2.8rem, 5vw, 5.5rem);
}

/* Tablet portrait */
@media (max-width: 991px) {
  .col-md-12 { width: 100%; }
}

/* Mobile landscape */
@media (max-width: 767px) {
  .col-sm-12 { width: 100%; }
}

/* Mobile portrait */
@media (max-width: 479px) {
  .col-xs-12 { width: 100%; }
}
```

**Rule**: max 1 additional utility class per element per breakpoint.

---

## Component Patterns

Webflow components expose **Props**, **Slots**, and **Variants**.

### Props Reference

| Prop Type | Use For |
|-----------|---------|
| `Text` | Single-line editable text (max 256 chars) |
| `RichText` | Formatted HTML content |
| `TextNode` | Canvas-editable inline text |
| `Image` | Image upload |
| `Link` | URL / href |
| `Number` | Numeric values |
| `Boolean` | Toggle on/off |
| `Variant` | Dropdown selection (maps to combo classes) |
| `Slot` | Nested content region |
| `Id` | HTML ID for accessibility |

### Conventions

- Use the `Slot` preset for any region where child components should be placed
- Variants map to `cc-` combo classes on the component root: a `Variant` prop with value `"secondary"` applies `cc-secondary`
- Always document which props and slots a component exposes in a comment above its markup

```html
<!--
  Card Component
  Props: title (Text), description (Text), image (Image), link (Link)
  Variants: cc-featured, cc-compact
  Slots: footer-slot
-->
<div class="card">
  <img class="card_image" src="" alt="">
  <div class="card_body">
    <h3 class="card_title h4"></h3>
    <p class="card_description"></p>
    <div class="card_footer"><!-- slot --></div>
  </div>
</div>
```

---

## Custom Code Guidelines

### SVGs

- Remove fixed `height` and `width` attributes — keep `viewBox`
- Control size via a wrapper class, never inline attributes
- Add `<title>` element for screen reader support
- Use `currentColor` for `fill` and `stroke` to inherit color from CSS

```html
<!-- Do this -->
<div class="icon-wrapper">
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Search</title>
    <path stroke="currentColor" stroke-width="2" d="..."/>
  </svg>
</div>

<!-- Not this -->
<svg width="24" height="24" fill="#333">...</svg>
```

### CSS

- All styles go in a separate `.css` file — never inline `style=""` unless absolutely necessary
- Follow DRY: one selector rule for related elements rather than duplicated declarations
- A "Canvas CSS" Custom Code component at the top of the Navigator holds global reset and polish styles — this keeps them visible during design

### JavaScript

- Target `data-*` attributes or IDs, **never classes** — classes belong to styling, not JS hooks
- Load scripts in `<body>` (before `</body>`) unless using `async` or `defer`
- External scripts: host on CDN (jsDelivr from GitHub) — do not paste large scripts inline
- Write with "early exit" pattern — bail out immediately if required elements are not found
- Always respect `prefers-reduced-motion`

```js
// Good — targets data attribute, early exit
const sliders = document.querySelectorAll('[data-component="slider"]');
if (!sliders.length) return;
```

---

## Interactions & Animations

- Use `data-animate` attributes as Webflow Interaction triggers

```html
<div data-animate="stagger-children">
  <div class="card">...</div>
  <div class="card">...</div>
  <div class="card">...</div>
</div>
```

- **Never use** `transition: all` — target specific properties (`opacity`, `transform`, `background-color`)
- Always include `@media (prefers-reduced-motion: reduce)` overrides
- Target classes in Webflow Interactions, not element types — ensures interactions reuse across instances

```css
@media (prefers-reduced-motion: reduce) {
  [data-animate] * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## Accessibility

- Use semantic HTML: `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`, `<aside>`, `<header>`
- Nav must include a skip link as the first child:

```html
<a class="skip-link" href="#main">Skip to content</a>
```

- All images require `alt` text; purely decorative images use `alt=""`
- All form inputs require an associated `<label>`
- Modals: use native `<dialog>` element
- Accordions: use `<details>` / `<summary>` HTML
- Heading hierarchy must be logical — never skip levels (no `<h1>` then `<h3>`)
- Color contrast: minimum 4.5:1 for body text, 3:1 for large text and UI components

---

## Asset Standards

| Asset Type | Standard |
|------------|---------|
| Raster images | Export at 2× final display size (JPG/PNG), convert to WebP |
| Vector images | SVG preferred; embed inline for color control |
| Fonts | `.woff2` primary, `.woff` fallback only |
| Video | Third-party hosting only (YouTube, Vimeo, Wistia) — no self-hosted background video |
| Images in Webflow | Always set explicit `width` attribute to prevent CLS |

---

## Style Guide Page (`/style-guide`)

Every reusable style lives here first. The rest of the site only uses classes that already exist on this page.

Required sections:

1. **Typography scale** — H1–H6, body, eyebrow, caption, label (with `.h1`–`.h6` classes demonstrated)
2. **Color palette** — swatches for all `Color` variables
3. **Spacing scale** — visual reference for all spacing variable values
4. **Buttons** — primary, secondary, ghost, destructive, disabled states; all `cc-` variants
5. **Forms** — text input, select, textarea, checkbox, radio, toggle; `cc-light` variant
6. **Icons** — icon usage examples
7. **Cards** — all card variants
8. **Grid** — row/column layout examples at each breakpoint

---

## Section Architecture

**Sections are components by default.** Almost every page section in this project should be
built as a reusable component, not as page-scoped CSS — even where it currently appears on
one page, and even though the Figma file only formally componentises Nav, Footer, CTA,
Button, Project Thumbnail and Question.

Why: the client owns the Webflow site. A component library means they can assemble new pages
in the Designer from blocks that already match the brand, rather than copying markup and
drifting. A section that exists only as page markup cannot be reused without detaching.

Consequences for `/page`:

- Do **not** ask per section whether to build a component or write inline CSS. Default to a
  component. Only use page-scoped CSS when the block is genuinely singular *and* structurally
  trivial (a one-off spacer, a page-specific utility wrapper).
- Check the Components Index first and reuse. The Figma frame names are auto-numbered
  (`Frame 22` appears on four pages at unrelated sizes), so **never treat a matching frame
  name as evidence of reuse** — compare structure and dimensions.
- Name by structure, never by page. `.work-grid`, not `.all-work-grid` — the same block is
  reused on Category, and a page-scoped name would be wrong the moment it moved.

Known repeats across the comps, confirmed by matching dimensions:

| Block | Pages | Evidence |
|---|---|---|
| Work grid | All Work, Category | `Frame 11`, 2613 / 2811 tall |
| Logo wall | Home, About Us | `Frame 25`, both exactly 907 tall |
| Callout | Project ×2 | named `Callout`, 351 and 526 — one block, two variants |
| Page header | every page | `Frame 10` / `Frame 28` at y=88, heights 219-1039 |

Roughly 33 page sections exist across the nine pages, about 29 distinct after those repeats.

---

## Components Page (`/components`)

`template/components.html` holds one live instance of every reusable component. **It is created by the `/component` skill on the first component build — it does not exist beforehand.**

- Check here before building a new component (if the file exists)
- Components are added one at a time, on demand — never bulk-scaffolded
- Use a "Prevent delete" hidden section to list classes referenced in custom code (prevents Webflow from purging them)
- Document each component with its props and slots in a comment

---

## Pages Index

The canonical list of every page built in this project. Each entry maps to a file in `template/`; per-page styles live in `template/styles.css` under a `/* Page: <filename> */` banner and are intentionally local (not reusable components).

**Full per-page build history lives in `PAGE-LOG.md`** (repo root) — read a page's section there before working on that page, and append new build narratives there, not here. Publish state is deliberately not tracked in the repo — check Webflow.

| Page | File | Webflow page (id · path) | Outstanding |
|------|------|--------------------------|-------------|
| Home | `template/index.html` | — (not yet in Webflow) | Baseline scaffold — replace the placeholder hero and feature cards with the client's content |
| Style Guide | `template/style-guide.html` | — (not yet in Webflow) | Foundations: color, themes, typography, spacing, radii |
| Components | `template/components.html` | — (not yet in Webflow) | One live instance of every reusable component |

Add a row per page as it is built. Record the Webflow page id and path once the page has been transferred.

---

## Components Index

IMPORTANT: We are using Pinegrow which has the concept of a component library. Confirm if we only need to update the components.html or across the site.

The component docs are split into two tables below. **Both are empty on a fresh project** — components are added one at a time by the `/component` skill, never bulk-scaffolded.

Every entry must have a live instance in `template/components.html` and base styles in `template/styles.css`. Keep both tables in sync — append a row whenever a new component is created, edit when props/variants change, remove when a component is retired, and move a row between tables if its Webflow status changes.

### Webflow components (registered in the Designer)

Blocks that exist as real components in Webflow. Record the site-wide page-level instance count and the date it was audited via MCP.

| Component | Base Class | Instances | Variants | Slots | Purpose |
|-----------|------------|-----------|----------|-------|---------|
| Nav | `.nav` | — (not yet transferred) | `cc-current` on `.nav_link` | `nav_menu`, `nav_dropdown` | Global navigation: logo, primary links, CTA, and the "Our Work" dropdown panel |
| Footer | `.footer` | — (not yet transferred) | — | `footer_menu`, `footer_social` | Global footer bar: primary links, centred brand mark, social icons |
| CTA band | `.cta` | — (not yet transferred) | — | — | Full-bleed invitation band above the footer: heading plus a dashed email link |


### Class patterns & global behaviours (not Webflow components)

Reusable class families and site-wide behaviours that deliberately have **no** Webflow component — style-guide primitives applied ad hoc (button, tag, card, form, icon), class families used inside page sections, and behaviours that are pure JS with no authored markup. Record them here so they are not mistaken for missing components.

| Component | Base Class | Variants | Slots | Purpose |
|-----------|------------|----------|-------|---------|
| Nav dropdown behaviour | — | — | — | `site-scripts/nav-dropdown.js` toggles `[data-nav-panel]` from `[data-nav-toggle]`; Escape and outside-click close it. No authored markup of its own. |

---

## Libraries

### Project Scripts

> **Status:** the bundle currently ships **no behaviour any page uses** — `page-init.js` is
> scaffolding and `example-module.js` is an unused demo (no page has a `data-reveal` hook).
> At 7KB it also fits inside Webflow's 10,000-character footer field, so the jsDelivr pin is
> not yet earning its keep. **Do not add the `<script>` tag to Webflow until a module does
> something.** The nav dropdown is deliberately NOT in the bundle — in Webflow it is a native
> Dropdown element, so the client owns that behaviour in the Designer.


Site JavaScript lives in `site-scripts/` — source modules concatenated by `./build.sh` into `site-core.js`, served to the live site from a pinned jsDelivr tag. Never paste real JS into Webflow's footer (10,000-character limit, no build step, not version-controlled).

- **Module contract**: `window.SitePage.register({ init(scope), destroy() })`, defined by `site-scripts/page-init.js`. `init` must query inside `scope`, never `document`; `destroy` must release every listener, rAF loop, observer, GSAP tween/ScrollTrigger and WebGL context, or a re-init double-binds.
- **Adding a module**: copy `site-scripts/example-module.js`, add its basename to the `core` array in `build.sh`, run `./build.sh`, commit the module **and** the regenerated bundle.
- **Releasing**: bump `site-scripts/VERSION` → `./build.sh` (re-stamps every pinned tag) → commit → `git tag vX.Y.Z` → push → update the Webflow footer pin from `site-scripts/webflow-snippet.html` → publish. Pin a **tag**, never a branch.
- **Local dev**: `node scripts/dev-server.mjs` serves `template/` with the pinned URL rewritten to the local bundle, rebuilding it when a module is newer.
- **CSS pre-hides** must be gated on `.site-js` (added by `page-init.js`) so no-JS visitors still see the content, and carry a bounded animation fallback so content appears even if the bundle fails.

Full details: `site-scripts/README.md`.

### GSAP

- **Prefer GSAP for advanced animations** — use it over CSS transitions / Webflow Interactions whenever the motion involves timelines, scroll-driven sequences, easing beyond cubic-bezier, SVG morphing, or anything that needs to coordinate multiple elements.
- **Version**: 3.15.0 (latest as of 2026-05-28 — verified via `registry.npmjs.org/gsap/latest` and `gsap.com/docs/v3/Installation`)
- **Delivery**: CDN via jsDelivr — no npm install required
- **Script tag**: `<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>`
- **Placement**: not loaded on the baseline pages — add the tag before `</body>` on each page in `template/` that needs it, above any project JS that depends on it. Load synchronously (no `defer`) so `gsap` is defined when consumer scripts execute.
- **Plugins**: GSAP core only. Add plugins on demand by appending another CDN tag at the same version, e.g. ScrollTrigger:
  `<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>`
- **Usage**: target `data-*` attributes (never classes) per the JS conventions above, write with the early-exit pattern, and always wrap animations in a `prefers-reduced-motion` guard.
- **In Webflow Designer**: paste the same `<script>` tag(s) into Site Settings → Custom Code → Footer Code so the production site mirrors the local build.

---

## Webflow-Specific Gotchas

| Gotcha | What to do |
|--------|-----------|
| **Combo class type-ahead** | Only the first class in a selector shows suggestions; subsequent combo classes must be typed exactly — spell carefully |
| **Per-page CSS bundling** | Wrap utility classes used in custom code in a hidden `<div>` inside a Custom Code component — forces Webflow to include them in the CSS bundle |
| **Class purging** | Clear unused classes after completing each page; use the "Prevent delete" section on `/components` for classes used only in JS/custom code |
| **Variable naming** | Use Title Case with spaces in Designer (`Gap Main`); Webflow converts to `--gap-main` automatically |
| **No `:root` declarations** | Webflow owns `:root`; use Webflow's variable system — never declare `--custom-var` in a `:root {}` block |
| **Image layout shift** | Always set a `width` attribute on images — Webflow needs it to reserve space |
| **Custom code placement** | CSS embeds go at the **top of the Navigator**; JS goes in Page Settings → "Before `</body>`" |
| **Class cascade order** | Webflow cascade: element defaults → tag styles → class styles. Base classes override tag styles; combo classes override base classes |
| **Combo class on nested elements** | Webflow only applies combo class styles when the element has the base class present — always ensure base class is set first |

---

## Transferring the Static Build into Webflow (via Webflow MCP)

Hard-won constraints from importing `template/style-guide.html` into Webflow with the MCP. **Read this before pushing any `template/*.html` page into Webflow** — it will save hours.

### Tooling model
- **`data_whtml_builder`** turns an HTML+CSS string into **native Webflow elements** and styles. It's the fastest way to get structure in, but its class handling is lossy (see caps/limits below).
- **`data_style_tool` `create_style` / `update_style`** create/edit classes **deterministically** (the reliable fallback). `set_style` applies an existing class list to an element (it **replaces the element's full class list** — always pass base **and** every combo, e.g. `["ramp__sample","brand-name-text-display-xl"]`).
- **`data_variable_tool`** for design tokens. Reference a variable on a property via `variable_as_value: "<variable_id>"` (single-value props only). A variable's CSS name looks like `--_<collection>---<name>` (e.g. `--_mode---mode-text`) and can be used raw inside the `css` string.
- **`element_snapshot_tool`** needs a live Designer session open on the page — it fails headless.

### `css`-param rules (the builder rejects these — they'll fail the whole insert)
- **No `!important`.** Utilities lose their `!important`; rely on combo-class cascade order instead.
- **Class selectors only.** No bare element/tag selectors (`h1`, `p`, `table`) and no descendant selectors (`.a .b`) — they're rejected or silently dropped. Combos (`.brand-name-button.cc-lg`) are fine.
- **No `@keyframes`, `@import`, `@font-face`, `:root`, or `<style>` tags.**
- **Only Webflow breakpoint media queries:** `@media screen and (max-width:991px|767px|479px)`. No `min-width`, no custom queries.
- Shorthand **is** accepted and auto-expanded to longhand (`padding:1rem` → four props; `gap` → `grid-column-gap`/`grid-row-gap`). `aspect-ratio`, `grid-template-columns`, `border-radius` work as-is.

### The builder's class-creation behaviour (the big traps)
- **Whole-`css`-block silent rejection on certain values (the worst trap).** If the `css` string contains *any* of the following, the builder silently discards the **entire** css block — the HTML still inserts, the call still returns `success`, but **ZERO classes are created or attached**: `border` / `padding` / `margin` / `gap` / `flex` / `border-radius` **shorthand**; `background:` with multiple gradients; `aspect-ratio`; `mask` / data-URI values; multi-value `transition`; and **any pseudo selector** (`:hover`, `::after`, `:nth-child`, `:has`, `:first-of-type`). This contradicts the optimistic "shorthand is auto-expanded" note above — in practice, **author the `css` fully longhand, single-value, and pseudo-free**: expand every shorthand by hand (4 `border-*-radius` corners, 4 `padding-*`/`margin-*` sides, `border-*-width`/`-style`/`-color`), one value per property, no `:hover`/`::after`/`:nth-child`. Convert `:nth-child(n)` styling to explicit **`.cc-N` combo classes** in the markup. Apply pseudo states (`:hover`, `::after`) afterwards via `update_style` with the `pseudo:` parameter. **Always verify the element tree after each insert** (`get_all_elements`/`query_styles` — check `styleNames` populated) — never trust the `success` status.
- **Per-insert class-creation cap (~50 new classes).** A large page silently drops a *different* random subset of classes each run. **Split big pages into chunks** (≈≤40 new classes per insert), or pre-create classes and apply with `set_style`.
- **It reuses classes it created itself, but NOT classes you made with `create_style`** — it spawns suffixed duplicates (`swatches` → `swatches-1`). If an authored name already exists, you get `-1`/`-1-2-3` suffixes. ⇒ **Start from a clean stylesheet**, or accept a later rename pass.
- **`h1`–`h6` are reserved** — Webflow rejects them as class names (both builder and `create_style`). Use a visual class instead (here `.brand-name-text-display-*` on the real heading element).

### Native elements vs DOM (prioritise native!)
- Tags Webflow can't map (notably **`<table>`/`<thead>`/`<tr>`/`<td>`, `<article>` sometimes, raw `<span>`**) import as **DOM nodes**: the class becomes a plain HTML attribute (not a Webflow style) and the whole subtree is opaque raw HTML you can't style with classes. **Rebuild these as `div` structures** (e.g. table → CSS-grid `div` rows/cells) so they take real classes.
- **Inline `style="…"`** makes the builder mint an auto class (`inline-div-N`) and may drop the authored class on that element. **Avoid inline styles**; put everything in classes. (Swatch chips here kept a unique color via `inline-div-N` — acceptable for one-off values, but don't rely on it for layout the class must provide.)

### Theming / modes
- Recreate dark/light as a **variable collection with two modes** (e.g. `Mode`: Dark default + Light). Bind text/bg props to the mode variables, then `data_style_tool > set_style_variable_mode` on the `.cc-light` combo — it **cascades to descendants**, reproducing the `--mode-*` swap natively.
- Watch combo targeting: set the mode on the combo the element actually uses (e.g. `cc-light` under `section`, not an orphaned `section-1.cc-light`).
- **Webflow's style API does NOT support raw CSS custom-property declarations** (`property_name: "--my-token"` on `create_style`/`update_style` fails with a generic "internal error"). Any source pattern that declares a custom property on a parent (e.g. `--brand-name-nav-fg`) and lets it cascade to descendants via `var()`, with a JS script flipping a `.cc-light` class on the *parent only* to swap the value, **cannot be reproduced as-is**. Fix: bind each consuming element directly to the variable/literal for its default state (skip the custom-property indirection entirely), and treat the reactive light/dark flip as a known gap — it needs either (a) the JS updated to toggle a combo class on every consuming element instead of just the root, or (b) a Designer-side custom-code/global-CSS embed that declares the custom properties old-school. Don't silently ship a static, non-reactive version without flagging it.

### Descendant AND child-combinator selectors don't translate — sweep the whole stylesheet before building
- The static source uses `.component.cc-variant .sub-element { ... }` (descendant) and `.component > .container { ... }` (direct child) selectors **extensively** — not just for nav/footer. A sitewide grep (`grep -nE '^\.[a-zA-Z_-]+(\.cc-[a-zA-Z0-9-]+)? *> *\.[a-zA-Z_-]+|^\.[a-zA-Z_-]+\.cc-[a-zA-Z-]+ \.[a-zA-Z_-]'`) found **74 such rules** across ~20 components. Most do not translate to Webflow's per-element combo-class model — but **they are not all the same problem.** Triage into four buckets (full table in the `/webflow-transfer` skill → Phase 0):
  - **A. Mode cascade** (`.footer.cc-dark .footer_link`, `.cc-light .card`) → **don't flatten**; reproduce via **variable modes** (`set_style_variable_mode` on the `.cc-*` combo cascades to descendants, so long as the child consumes Mode variables). This is the majority of the 74.
  - **B. Structural child/descendant** (`.brand-name-nav > .container`, `.brand-name-form-hero_form .brand-name-input`, `.brand-name-editorial-split.cc-stacked .*`) → **flatten** to a combo on the child (see Fix pattern below).
  - **C. `:nth-child` fans** (`.brand-name-unique_grid > .brand-name-glass-card:nth-child(1)`) → **flatten** to explicit `.cc-1/2/3` combos in the markup.
  - **D. Runtime/JS state** (`.brand-name-js …[data-*]`, `.brand-name-portfolio-item[open] > …`, `.is-armed`) → **don't classify**; ship as a Webflow **Custom Code CSS embed**.
  - **Best fix is upstream:** author `styles.css` Webflow-flat so B and C never occur (see CSS Architecture → Selector rules). The buckets below only matter for legacy rules already in the source.
- **The child-combinator case is the more dangerous one.** `.brand-name-nav > .container { display:flex; justify-content:space-between; max-width:none; }` and `.footer > .container { display:flex; flex-direction:column; gap:... }` are *layout-defining*, not cosmetic — without them, the nav's logo/menu chip never get laid out side-by-side at all (default block stacking), and the footer's sections have no gap. This produces a "looks structurally broken/unstyled" result even after every individual element has its own classes and colors correctly bound — it's easy to fix the visible color bugs and still miss this, because the container div still has a real (just wrong) class on it (`container`), so nothing looks obviously *missing*.
- **Fix pattern**: create a new combo scoped to the actual class being overridden (e.g. `.container.cc-nav`, `.container.cc-footer` — combo of the generic class, not a new standalone class), carrying every property the source's scoped selector declared (not just the diff from the base — Webflow does still cascade the base `.container` class normally, so only genuinely *overridden* properties need to be in the combo). Apply the combo directly to the specific element instance.
- **Before building/fixing any component or page, grep the source CSS for this pattern first** and treat every match as a todo item — don't wait for a visual "doesn't look right" report to discover them one at a time, since the most damaging ones often look fine in a quick glance and only show up as "subtly off" until specifically diffed against source.

### Parallel-agent stylesheet collisions
- Multiple agents writing to the **same global stylesheet** concurrently is a real hazard, not a theoretical one. In this project, a "components" agent rebuilding the Portfolio Item *component* and a "home page" agent building the Home *page* both independently needed `brand-name-portfolio-item*` classes at the same time — Webflow gave the second writer suffixed names (`brand-name-portfolio-item-1`, etc.), so the component definition ended up pointing at the `-1` set while the live page used the clean set. Nothing errored; both agents self-reported success.
- Reconciliation requires: querying the actual class list (`get_styles`/`query_styles` with `include_properties`) to find which set is canonical, re-pointing every element via `set_style` to the canonical names, then `remove_style` on the orphans **one at a time** (a batched remove on this API errored — go one by one and stop on first failure rather than risk a half-broken stylesheet).
- Mitigation: have ONE agent own creation of any shared/global class family (e.g. component base classes); other agents should only `set_style` onto classes that already exist, never `create_style` a name that might be claimed elsewhere. When in doubt, `query_styles` immediately before creating.

### Trust but verify — agent self-reports are not ground truth
- Agents reported components "fully verified" / "15/19 attached" based on the WHTML builder returning `success`, or based on `query_styles` showing a class *exists* — neither confirms the class is *attached to the right element* or that the element actually renders correctly. The only reliable check is `get_all_elements`/`query_elements` on the actual page or component scope, inspecting `styleNames` on every individual element.
- Concretely in this project: the Nav component's logo link, menu-toggle button, and scrim div all had **zero classes attached** (not even a wrong/orphaned one) — a gap the agent's "components fixed" report never caught, because it checked that *some* `brand-name-nav_*` classes existed in the stylesheet, not that every element under the component root actually referenced one.
- Practical rule: after any "component/page complete" report, independently re-query the element tree before treating it as done — especially for nav/footer/global chrome, since they're reused everywhere and a gap there is maximally visible.

### Fonts & design tokens (build variables FIRST, then bind)
- **Custom fonts must be matched by their EXACT Webflow family name.** Uploaded fonts get Webflow-normalised names that rarely equal the design's CSS name — e.g. `Sharp Grotesk` (Medium 25) is registered as **`Sharpgrotesk 25 Trial`**, and `Gestura Display TRIAL` as **`Gesturadisplaytrial`**. A class saying `font-family:"Sharp Grotesk"` silently falls back. Always `data_fonts_tool > list_fonts` and copy the real `fontFamily` string.
- **Google fonts (Inter, Lekton, etc.) do NOT transfer.** They were `<link>`s in the static build; on Webflow they must be added in the Designer (Site Settings → Fonts → Google Fonts) or uploaded as custom fonts. `data_fonts_tool` only manages *custom* uploads.
- **Recreate the whole token system as Webflow Variables up front, then bind.** Don't resolve tokens to literals (it renders but the design system "isn't there"). Create collections mirroring the `:root` groups (Color, Typography incl. font-family + size vars, Spacing, Radius, plus the Mode collection), then bind every style property to a variable with `update_style` / `create_style` `variable_as_value: "<variable_id>"`.
  - One variable per property value; longhand only (bind each of the 4 `border-*-radius` corners, 4 `border-*-color` sides, each `padding-*` side individually).
  - `gap`/`row-gap` are stored by Webflow as **`grid-column-gap` / `grid-row-gap`** — bind those names, not `gap`/`row-gap` (binding `row-gap` throws an internal error).
  - Font-family variables hold a single family name (no fallback stack) — set them to the exact uploaded family name.
  - Generate the (often 200+) bind operations with a script and batch them through `update_style`; do it on a clean stylesheet to avoid duplicate-name ambiguity.

### Variable-mode writes

- **`mode_id: "base"` is rejected** by `update_color_variable` with a bare "An internal
  error occurred". Write the base/default value by **omitting `mode_id`**; pass it only for
  named modes. Batched calls return per-action results, so half a batch can fail while the
  call itself looks fine — read the per-action results, not just the outcome.

### Cleanup caveat
- `remove_style`/`rename_style` are **name-based** and can't disambiguate duplicate names (global vs combo, or used vs orphan sharing a name). Once duplicates exist they're hard to purge safely. **Best defence: keep the stylesheet clean from the start** (one clean builder pass, or fully deterministic `create_style`+`set_style`). To rename a used canonical to a clean name that's taken, re-point the *minority* user of the clean name onto the suffixed name, delete the freed clean name, then `rename_style` (rename auto-propagates to combos + their variable modes).

### Recurring gotchas from the page transfers (consolidated from PAGE-LOG.md)

- **`var()` inside `calc()`/`clamp()` is silently coerced to a bare variable binding** by the style API. Author composite values as var-free literals (`clamp(2.5rem, 6.5vw, 4.5rem)`, `margin-top: -5.5rem`) and note the literal wherever the underlying token might change.
- **`data_element_builder` resolves ambiguous combo names by grafting the WRONG parent's combo** when a `cc-*` name exists under multiple bases (e.g. `cc-featured` under both `brand-name-article-card` and `brand-name-stat_value`), and can inject sibling combo bases into chains. After any builder pass that touches a shared `cc-*` name, re-`set_style` each element with its exact full class list and re-verify `styleNames`.
- **Native List element quirks**: builder `BY_CUSTOM_TAG` "ul" maps to a native List that auto-spawns 3 default unstyled ListItems (remove them after) and appends authored `li` children after the defaults. **ListItem rejects `set_text`** — write its copy via `set_settings` key `text` with `static_text.value` (plain string; `rich_text_inner_text` is rejected).
- **A Heading built with children keeps its default "Heading" String child** — remove it after; use `set_text` only where there are no child spans.
- **`-webkit-backdrop-filter` is rejected** by the style API (Webflow auto-prefixes on publish); `variable_as_value` must carry the `variable-` prefix.
- **Some style blocks reject ALL breakpoint/pseudo/remove writes** (`[Conflict] style block store`). Ship those rules in the head freeform CSS bucket under a clearly-marked comment and retry the Designer class in a later session (past conflicts have cleared).
- **`set_visibility` cannot set CMS conditional visibility** on collection template pages ("Element is not inside a CMS context") — it is a manual Designer step; call it out in the report.
- **Image elements expose no `loading` setting** via MCP — Load: Eager is a manual Designer step.
- **Unrepresentable tags (`<details>`/`<summary>`, etc.) re-import as plain `<div>`s** — drive JS off attributes (`[open]`) rather than element APIs, and supply the lost native behaviours (collapse, indicator toggle) via the head freeform CSS.
- **A Collection List cannot hold loose elements between items** — put dividers/borders on the Collection Item class itself (`border-top` + `:first-child` reset).
- **Multi-value fallback stacks don't survive** (`min-height: 100vh; min-height: 100svh` stores only one value); `object-position` keywords are stored as percentages (`50% 0%`).
- **CMS dates render in Webflow's date formats** — custom patterns like "apr / 12 / 26" have no representation.
- **`container-type: size`, `min(100%, …cqh)` container-query values, and fraction `aspect-ratio` (`593 / 477`) ARE accepted verbatim by `update_style`** (verified 2026-07-17 on the pillars art classes) — don't route them to the head freeform bucket preemptively. But note the same session found a past transfer had silently stored `aspect-ratio: 1/1`/`auto` where the log claimed real ratios — always re-query stored values after writing them.


### Recommended workflow
1. Resolve the page to the classes it actually uses; resolve `var(--token)` to literals **except** mode-driven colors (keep those on Mode variables).
2. Create the Mode variable collection + modes first.
3. Insert **per-section** (under the cap) via the builder with a class-only, `!important`-free, Webflow-breakpoint CSS string; rebuild any `<table>`/DOM-mapped block as `div` grids.
4. Apply the Light mode to `.cc-light`.
5. Verify with `query_styles`/`query_elements` (not `element_snapshot` unless Designer is open); fill any cap-dropped classes with `create_style` + `set_style`.

IMPORTANT: WORK ONLY IN /TEMPLATES FOLDER