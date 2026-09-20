---
name: alchemy-design-system-skill
description: "Design system reference for the Alchemy Creative Webflow project. Documents the seven brand colors, the Base (dark) and Light theme modes, the ITC Avant Garde Gothic Pro type ramp served from Adobe Fonts kit rnt3tbw, the measured spacing scales, component tokens, MAST class vocabulary, and the exact token-to-Webflow-Variable mapping. Source of truth: template/styles.css and template/style-guide.html. Use when building any page, component or UI for Alchemy Creative, when matching the brand, or when transferring to Webflow."
---

# Alchemy Creative — Design System

Source of truth: `template/styles.css` + `template/style-guide.html`.
Derived from Figma `87WtDnZvViuoMrc0JNpxl6` (Design page); evidence in `FIGMA-EXTRACT.md`.
Tokens **mirror the MAST variable structure** of the Webflow site `6aad7d4121d8828938eb64fd`
so transfer is a value-for-value mapping, not a reconciliation of two systems.

**Work only in `template/`** for build output.

## Prefix

None — unprefixed, MAST-style: `.button`, `.card`, `--color-lichen`. Never introduce a stem.

## Webflow-flat selectors (mandatory)

Webflow styles are per-element class lists; no descendant (`.a .b`), child (`.a > .b`) or
`:nth-child` representation exists. Style each element on its own class or a combo. Per-item
variation uses explicit `.cc-1` / `.cc-2` combos. **Only permitted descendant:** the mode
cascade (`.cc-light` / `.cc-dark`), which Webflow reproduces via variable modes. Runtime/JS
state (`[data-*]`, `[open]`, `.is-*`) goes in a custom-code embed.

Self-check: `grep -nE '\.[a-z][\w-]*(\.[\w-]+)*\s+\.[\w-]|\s>\s*\.|:nth-child' template/styles.css`

## Fonts

Adobe Fonts kit **`rnt3tbw`**, loaded via `@import` at the top of `styles.css` so every page
gets it without touching HTML. CSS family is **`itc-avant-garde-gothic-pro`** — NOT the Figma
style name "ITC Avant Garde Gothic Pro"; using the Figma name silently falls back.

Three weights, normal only — **no italic exists, never author one**:

| Figma | CSS | Token | Used by |
|---|---|---|---|
| Medium | 500 | `--font-weight-medium` | body, P, P-Sm |
| Demi | 600 | `--font-weight-semibold` | H5, H6, eyebrow, buttons, labels |
| Bold | 700 | `--font-weight-bold` | H1–H4 |

There is no mono face; `--font-mono` aliases the brand family.

Webflow pulls the family in via the connected Adobe Fonts account. **`Button/Font Weight` is
currently 400 in Webflow, which the kit does not serve** — it must be set to 600.

## Color — seven brand values

| Token | Hex | Name | Role |
|---|---|---|---|
| `--color-deep-forest` | `#17251c` | Deep Forest | Base background; Light text |
| `--color-charred-bark` | `#24231e` | Charred Bark | Base alt surface |
| `--color-moss` | `#667a3a` | Moss | Light accent + button fill; borders |
| `--color-lichen` | `#c6dc42` | Lichen | Base accent + button fill |
| `--color-clay` | `#a56f52` | Clay | Warm accent (sparing) |
| `--color-oat` | `#d8d0b8` | Oat | Light alt surface |
| `--color-bone` | `#f0ebdd` | Bone | Light background; Base text |

Derived tints follow MAST's pattern: `--color-bone-o10`, `--color-bone-o50`,
`--color-deep-forest-o20` via `color-mix`.

**These seven are independent base values, not a derived family.** MAST's starter derives
Brand Dark from Brand Primary via `color-mix`; Lichen is not a tint of Deep Forest, so that
derivation must be removed when the Color collection is rebuilt.

Two values in the comps are strays — normalize, do not tokenize: `#7e8c2c` → Moss,
`#111111` → Deep Forest.

## Theme — Base is dark

Seven `--primary-*` roles. **Base mode is the dark palette** (the site's primary look).
`.page-wrapper.cc-light` or `.section.cc-light` flips it; `.cc-dark` forces Base back inside
a light region.

| Role | Base (dark) | Light |
|---|---|---|
| `--primary-background` | Deep Forest | Bone |
| `--primary-surface` | Charred Bark | Oat |
| `--primary-text` | Bone | Deep Forest |
| `--primary-text-muted` | Oat | Charred Bark |
| `--primary-text-dim` | Moss | Moss |
| `--primary-border` | Moss | Moss |
| `--primary-accent` | Lichen | Moss |
| `--primary-button-text` | Deep Forest | Bone |

MAST ships four roles (Background, Text, Border, Accent); Surface, Text Muted and Text Dim
are our extensions — expected, since the template is a base each build extends.

**Button label has its own role.** Fill is `--primary-accent`, label is
`--primary-button-text`. An earlier version resolved the label to `--primary-background` on
the reasoning that the two always coincide — they do today, but that couples two unrelated
things, and in Webflow the button picked up the theme's main text colour instead. An
explicit role is less clever and more correct.

**Rule: any themed property must consume a `--primary-*` role.** Bind a brand color directly
and it will not flip — the most common way a theme silently breaks on transfer.

## Typography — per-level tokens

Each level carries its own six variables, as MAST does. Fluid sizes are Min/Max rem pairs
interpolated across **20rem → 90rem** (320–1440px), set by `--fluid-min` / `--fluid-max`.

| Level | Size min → max | Weight | Line height | Tracking | Bottom margin | Case |
|---|---|---|---|---|---|---|
| H1 | 40 → 80 | Bold | 1 | −0.025em | 0.2em | UPPER |
| H2 | 36 → 64 | Bold | 1 | 0 | 0.2em | — (`.cc-uppercase` variant) |
| H3 | 28 → 48 | Bold | 1 | −0.01em | 0.2em | UPPER |
| H4 | 24 → 32 | Bold | 1 | 0 | 0.25em | UPPER |
| H5 | 20 → 24 | Demi | 1.25 | 0 | 0.4em | — |
| H6 | 18 → 20 | Demi | 1.25 | 0 | 0.4em | — *(not in source)* |
| Body | 16 → 20 | Medium | 1.6 | 0 | 1em | — |
| Body SM | 16 fixed | Medium | 1.6 | 0 | — | — |
| Eyebrow | 14 fixed | Demi | 1.5 | +0.1em | 0.5em | UPPER |

Tokens: `--h1-font-size`, `--h1-font-weight`, `--h1-line-height`, `--h1-letter-spacing`,
`--h1-bottom-margin` … through H6, plus `--body-*`, `--body-sm-*`, `--lede-font-size`,
`--eyebrow-*`.

Webflow type levels map as: H1-H6 direct · `Paragraph (Body)` = `p` · `Paragraph LG` =
`.lede` · `Paragraph SM` = Figma `P-Sm` · `Eyebrow`. **There is no Paragraph XL** — it had
no Figma equivalent and was removed.

Max values are the Figma desktop sizes. **Minimums were derived, not specified** — flag them
if a designer reviews mobile.

`clamp()` rules carry **literals**, not `var()`. Webflow's style API coerces `var()` inside
`clamp()`/`calc()` to a bare binding. In Webflow these become Min/Max **number pairs** and the
clamp is computed — do not push clamp strings.

## Spacing — two scales, never crossed

**`--margin-*` (em)** — type rules only, so rhythm scales with font size.
MAST's four steps: `xs` 0.5em · `sm` 1em · `md` 2em · `lg` 3em.

**`--space-*` (rem)** — every `u-mt-*` / `u-mb-*` / `u-pt-*` / `u-pb-*` utility and layout
padding. A utility is applied deliberately, so it must give the same gap wherever it lands.
Twelve measured steps: `xs` 8 · `sm` 10 · `md` 16 · `lg` 20 · `xl` 24 · `2xl` 32 · `3xl` 40 ·
`4xl` 48 · `5xl` 64 · `6xl` 80 · `7xl` 100 · `8xl` 120 (px equivalents).

A utility bound to an em token would change size depending on what it is applied to, which
defeats the point of a utility.

**Grid gaps (px, MAST names):** `--gap-main` 40 · `--gap-md` 24 · `--gap-sm` 10 ·
`--gap-button` 16. `--grid-gutter` aliases `--gap-main`.

## Components

| Token | Value | Source |
|---|---|---|
| `--section-padding` | `clamp(3rem, 1.714rem + 6.429vw, 7.5rem)` | fluid 48 → 120 measured |
| `--container-max-width` | `75rem` | 1200px measured |
| `--container-wide-max-width` | `87.5rem` | 1400px measured |
| `--container-gutter` | `6vw` | MAST |
| `--measure` | `45.625rem` | 730px prose column |
| `--nav-height` | `5.5rem` | 88px, measured on the Nav component |
| `--card-border-radius` | `0.625rem` | 10px measured |
| `--card-padding` | `clamp(1rem, 0.857rem + 0.714vw, 1.5rem)` | fluid 16 → 24 |
| `--button-border-radius` | `0.25rem` | 4px measured |
| `--button-vertical-padding` | `1em` | 16px measured |
| `--button-horizontal-padding` | `2em` | 32px measured |
| `--button-font-weight` | 600 | Figma Demi |
| `--radius-full` | `100px` | pill, measured |

Section padding is a single fluid value — **there are no breakpoint overrides for it**.

## Components

### Nav (`.nav`)
Global navigation — logo, primary links, CTA button, and the "Our Work" dropdown panel.
Page chrome, so unprefixed. Elements: `.nav-logo_link` / `.nav-logo_mark` (inline SVG, inherits
`--primary-accent` via `currentColor`), `.nav-menu` / `.nav-menu_item` / `.nav-link` / `.nav-dropdown_arrow`,
`.nav-dropdown` / `.nav-dropdown_list` / `.nav-dropdown_item` / `.nav-dropdown_link`.
Variants: `cc-current` on the active link. The CTA uses `.button.cc-sm`.
Full-bleed: `.container.cc-nav` clears the base `max-width` and uses flat 32px side padding.
Behaviour: `site-scripts/nav-dropdown.js`, driven by `[data-nav-toggle]` / `[data-nav-panel]`.
The `[hidden]` and caret-rotation rules live in the CUSTOM CODE CSS EMBED block.

### Footer (`.footer`)
Global footer bar — primary links, centred brand mark, social icon links. Page chrome, so
unprefixed. Elements: `.footer-menu_list` / `.footer-menu_item` / `.footer-link`, `.footer-logo_link` /
`.footer-logo_mark` (mark-only lockup, inherits `--primary-accent`), `.footer-social_list` /
`.footer-social_item` / `.footer-social_link` / `.footer-social_icon` (inherit
`--primary-text`). No variants.
Full-bleed: `.container.cc-footer` clears the base `max-width`, 100px min-height, 48px side
padding. The mark centres because `.footer-menu_list` and `.footer-social_list` both `flex: 1` — no
absolute positioning. Stacks to a centred column below 767px.
Assets: `logo-alchemy-mark.svg`, `icon-vimeo.svg`, `icon-instagram.svg`, `icon-linkedin.svg`.

### Interior Hero (`.interior-hero`)
The standing page header on every interior page: eyebrow, H1, and a Rich Text copy block.
Elements: `.interior-hero_title` (zeroes the heading's own bottom margin, since the flex gap
owns the rhythm), `.interior-hero_accent` (inline accent words inside the heading),
`.interior-hero_copy` (constrains prose to `--measure` and tints it `--primary-text-muted`).
Variants: `cc-center` — centres both the blocks and the text. **Base is left aligned.**
Stack gap is `--space-2xl` (32px).

Background and vertical padding belong to the `.section` wrapper, never to the hero, so the
same component works on a dark section or a `.cc-light` one with no variant. For the same
reason `.interior-hero_accent` consumes `--primary-accent` rather than a brand colour: accent
words are Lichen on dark and Moss on light automatically.

Eyebrow and copy are both optional — About Us has no copy, the Home hero has no eyebrow.

The copy block **wraps the Rich Text component** rather than styling prose itself, so prose
size stays a Rich Text variant (`Paragraph SM` / `Inherit` / `Paragraph LG`) instead of
becoming a second, competing scale.

### Section Label (`.section-label`)
Accent label that opens each split section on About — H4-sized, uppercase, `--primary-accent`.
A plain **class, not a component**, because four components use it; they agree only on the
label, each owns its own body.

### Image Marquee (`.marquee-component`)
Full-bleed scrolling image strip. **Mirrors MAST's Marquee component 1:1** —
`.marquee-component` > `.marquee-wrapper` > `.marquee-content` > two `.marquee-group` — so the
class names match on transfer. The second group is a **duplicate of the first**: that is what
makes the `translateX(-50%)` loop seamless, and why MAST's component exposes two slots with
"add the same set in each". Item sizes are explicit `cc-a`/`cc-b`/`cc-c` combos rather than
`nth-child`, so the comp's varied tile heights survive.

Duration and gap are custom properties on the root (`--marquee-duration`, `--marquee-gap`),
matching MAST's Style-prop pattern. **In Webflow the animation lives in the Custom Code embed**
(the Marquee toggle on the Custom Code component) because the style API cannot write
`@keyframes`; it is in `styles.css` here so the static build actually moves. Honours
`prefers-reduced-motion` by stopping the animation and making the strip scrollable.

### Intro Split · Process Steps · Team Grid · Value List
The four labelled-split sections on About. Each is `.section` > `.container` > `.row` >
`.col-lg-4` (label) + `.col-lg-8` (body), with the body capped at `--measure` so it lands on
the comp's 730px column. Bodies: `.intro-split_body` (Rich Text), `.process-steps` /
`.process-step`, `.team-grid` / `.team-member`, `.value-list` / `.value-item`. Team Grid sits
on `.section.cc-surface`.

### Image Row (`.image-row`)
Static 3-up image row at mixed sizes (`cc-a`/`cc-b`/`cc-c`), space-between; stacks below 767px.

### Media Placeholder (`.media-placeholder`)
Stand-in for photography that does not exist yet — a `color-mix` tint of `--primary-text`, so
it reads correctly on both the background and the surface tone without a variant. Every
instance carries `data-figma-node` pointing at the frame the real asset belongs to.

### Featured Post (`.featured-post`) · Post Grid (`.post-grid` / `.post-card`)
The two journal lists, both **CMS-backed** by the `Blogs` collection (`6aad7d41...64ef`), which
already carries every field they need: `featured` (Switch), `date` (DateTime), `image`,
`summary`, `body`, `name`, `slug`.

| List | Filter | Sort | Limit |
|---|---|---|---|
| Featured A | `Featured?` is on | Date desc | 1 |
| Featured B | `Featured?` is on | Date desc | 1, **offset 1** |
| Post grid | `Featured?` is off | Date desc | — |

**The featured pair alternates, and that alternation is DOM order — not a variant.** A
Collection List renders every item from one template, so per-item alternation would need
`:nth-child`, which Webflow cannot represent and which we ban. Two lists sidestep it entirely:
list B's template simply puts `.featured-post_media` before `.featured-post_body`. No CSS, no
custom-code embed, nothing outside the Designer. **Trade-off: exactly two featured posts
render — a third will not appear.**

`.post-grid` is a CSS grid rather than `.row` / `.col` because the comp's gutter is 10px
(`--gap-sm`) where the grid gives 40px, and `.row-gap-sm` only sets the *row* gap. A grid is
also how a Collection List wrapper behaves anyway. Measured against the comp: 393px columns,
10px gutter, 64px row gap, featured media exactly 568x370.

### Video Reel (`.video-reel`)
Autoplay background video that opens full screen on click. Elements: `_video`, `_trigger` (the
Lichen pill, `--radius-full`), `_trigger-icon`, `_modal`, `_modal-video`, `_close`.

**The background needs no JS** — it autoplays muted and looping from markup attributes.
`site-scripts/video-reel.js` owns only the full-screen launch, because a native `<dialog>`
needs `showModal()`. The module holds the `play()` promise and pauses only once it settles:
pausing while play is still pending gets overridden, and audio keeps running behind a closed
dialog. Verified on all three close paths — button, backdrop and Escape.

Bleeds past `.container` to a 20px gutter, matching the comp's 1400 of 1440.

**In Webflow this is MAST's Inline Video** (`Play on scroll into view` = true) **inside MAST's
Modal**, whose Slot holds the full-screen player. The Slot is a Designer step.

### Work Grid (`.work-grid`, `.work-section`)
Uniform grid of Project Thumbnails, **CMS-backed** by Projects — filter Featured, sort Order.
Two up, one up below 767px, bleeding to a 20px gutter.

The comp's home instance is a five-card mosaic at five different sizes. That cannot come from
one Collection List without `:nth-child`, so this is the uniform grid chosen instead; it scales
to any number of featured projects. `AGENTS.md` records the same block on All Work and
Category, which is why it is a component rather than page CSS.

### Projects collection (`6aaf05795e9ec8aac7abb06f`)
`Name` (project title) · `Slug` · `Client` · `Thumbnail` (image) · `Vimeo ID` · `Aspect Ratio`
(option: 16:9 / 1:1 / 9:16) · `Featured` (switch) · `Order` · `Summary` · `Category` (option,
mirroring the Our Work nav taxonomy so Category pages can filter on it). **Created empty** — no
project content exists in the comps.

### Project Thumbnail (`.project-thumbnail`)
Work-grid card: an image that reveals client and project name on hover behind a Deep Forest
scrim. Elements: `_image`, `_overlay`, `_client` (eyebrow metrics), `_title` (H4). No variants —
Figma's Default/Hover pair is one element with a hover state, since no markup changes.

**The overlay carries the hover, not the card.** It covers the whole card, so hovering the card
is hovering the overlay. That keeps the reveal a plain per-element class state rather than a
Webflow Interaction or a `.card:hover .overlay` descendant selector, which Webflow cannot
represent. `:focus-within` mirrors it for keyboard users.

**Labels bind to `--color-bone`, not `--primary-text`** — a deliberate exception to the
themed-property rule. The scrim is always dark, so a themed text colour would flip to Deep
Forest on a light page and vanish into it. This is the fixed-surface case.

**Media is either an image or an autoplay Vimeo embed.** `_video` is an iframe on
`player.vimeo.com/video/<ID>?background=1&autoplay=1&loop=1&muted=1` — chromeless, looping,
muted. When a Vimeo ID is set the video shows and the image hides; in Webflow that is **CMS
conditional visibility** on the Vimeo ID field, which is a Designer-only setting. `pointer-events:
none` on the iframe is load-bearing: without it the embed swallows the mouse and the hover
overlay never fires.

**Aspect toggle:** base `16:9`, `cc-1x1`, `cc-9x16`. The toggle matches the *card* to the
*asset*, which is why the video fills rather than using a cover trick — pick the ratio your
source actually is and nothing letterboxes.

Scrim is `color-mix(in srgb, var(--color-deep-forest) 80%, transparent)`. **No tint token
exists**: the `-oNN` family this document describes was never actually defined in
`styles.css`. Worth closing that gap in a `/styleguide` pass.

Known gap: hover has no touch equivalent, so on a phone the labels never appear. The work grid
that holds these may want them permanently visible below 767px.

### FAQ Accordion (`.accordion-component`, `.faq-list`)
Flush accordion list, 800px centred, **CMS-backed** by the `FAQs` collection
(`6aaef5db7b6168269348044d`): `Name` is the question, `Answer` is **Rich Text**, `Order` is a
number for manual sorting. The list is a Collection List sorted by Order ascending.

**Mirrors MAST's Accordion component on class names** so the transfer is a rename-free swap:
`.accordion-component` (a real `<details>`) > `.accordion-trigger` (`<summary>`) >
`.accordion-title` + `.accordion-icon`, then `.accordion-content` >
`.accordion-content_spacer` > the answer.

**The styling deliberately differs from MAST's.** MAST draws a full 1px box with the card
radius and pads the trigger on all four sides; the comp is flush — a bottom rule only, no
radius, no horizontal padding. Our Figma file is the source of truth, so the base classes here
carry the comp's look. **On transfer that means combos, not a restyle**: MAST's Accordion has
9 instances elsewhere on the site and restyling its classes globally would change all of them.

The icon is a **plus** rather than a chevron because the open state rotates it 45 degrees into
a cross. That rule and the `::-webkit-details-marker` reset are runtime state, so they live in
the CUSTOM CODE CSS EMBED block — in Webflow they ship in the Custom Code embed (the Accordion
toggle on the Custom Code component).

**Answer must stay Rich Text.** One answer contains a bulleted list; PlainText would lose it.

### Logo Wall (`.logo-wall`)
Client logo grid — a heading plus a 4-up grid of marks (2-up below 767px). Elements:
`.logo-wall_title` (H4-sized, uppercase, `--primary-accent`), `.logo-wall_grid`,
`.logo-wall_item`, `.logo-wall_logo`. No variants.

**CMS-driven.** In Webflow the `<ul>` is a **Collection List** bound to a `Clients`
collection with `Name` (Text) and `Logo` (Image); the `img` binds to Logo and its `alt` to
Name. Nothing in the CSS assumes a count — the comp happens to show 16 marks in 4 rows, but
the grid renders whatever the collection holds.

Sits on a **light** section in the comps (Bone), because the client marks are dark. The
component sets no background itself, so the theme stays the section's job. The heading uses
`--primary-accent`, which is Moss on light and Lichen on dark.

The cell owns the proportion (300 x 169, measured) and the logo is **capped against the cell**
at 63% x 31% — the widest and tallest marks in the comp — rather than padded inside it. A mark
smaller than the cap renders at its own size, so logos keep their relative weight instead of
all stretching to one width.

**Logo colours are the brands' own and are deliberately NOT normalised** to the palette; the
usual "normalise strays to Moss / Deep Forest" rule does not apply to third-party marks. Four
sample marks ship in `template/assets/logos/`; the rest live in the CMS.

### Rich Text (`.rich-text-component` > `.rich-text`)
Prose region, mirroring the Webflow component of the same name (72 instances). The wrapper
carries the Size variant and Class prop; `.rich-text` only sets `text-wrap: pretty`. Prose
inherits the body scale. **Paragraph XL was removed** — it had no Figma equivalent.

### CTA band (`.cta`)
Full-bleed invitation band that sits above the footer on every page. Elements: `.cta-inner`
(centred column, 32px gap), `.cta-title` (h2-sized, sentence case, `text-wrap: balance`),
`.cta-email` (dashed outline link, not a filled `.button`). No variants.
The email deliberately uses the **card** radius (10px) and a 1px dashed `--primary-accent`
border rather than the button radius and fill, so it reads quieter than a primary action.
CSS cannot set dash length, so the comp's 8/8 pattern is approximated by `dashed` — which is
also all the Designer exposes.

## Webflow Variable mapping

Collections already exist on the site. Set values; create only what is missing.

| Collection | Maps from |
|---|---|
| **Color** | the 7 brand values + o10/o20/o50 tints. Remove the `color-mix` derivation from Brand Primary — these are independent. |
| **Theme** *(modes: Base = dark, Light)* | `Primary/Background`, `Primary/Surface`*, `Primary/Text`, `Primary/Text Muted`*, `Primary/Text Dim`*, `Primary/Border`, `Primary/Accent` (* = new) |
| **Typography** | `Primary Font`, then per level: Font, Font Size (Min/Max rem pair), Font Weight, Line Height, Letter Spacing, Bottom Margin |
| **Layout** | `Grid/Columns` 12, `Grid/Gap Main` 40, `Gap MD` 24, `Gap SM` **10**, `Gap Button` 16; `Spacing/Margin XS–LG` (em); `Fluid/Min` 20, `Fluid/Max` 90 |
| **Components** | Section Padding Min 3 / Max 7.5 · Container Max Width 75rem · Container Gutter 6vw · Card Border Radius / Padding Min 1 Max 1.5 · Button font, weight **600**, size, line height, radius, paddings · Input + Input Label |

Transfer notes that bite:
- Bind **longhand only** — each border-radius corner, each padding side.
- Gaps store as `grid-column-gap` / `grid-row-gap`; binding `gap`/`row-gap` errors.
- **`font-family` takes a literal, not a variable binding** — a bound family renders a
  fallback on canvas until the font control is nudged.
- Apply Light with `set_style_variable_mode` on the `.cc-light` combo.
- The site is reachable on the **Webflow Beta** connector only.

## Class vocabulary

Base: `section` `container` `row` `col` `button` `card` `tag` `form` `input` `select`
`checkbox` `radio` `toggle` `icon` `label` `eyebrow` `lede` `caption`
Chrome: `page-wrapper` `main-wrapper` `nav_*` `footer_*` `nav-skip-link`
Combos: `cc-light` `cc-dark` `cc-wide` `cc-narrow` `cc-nav` `cc-footer` `cc-sm` `cc-lg`
`cc-ghost` `cc-secondary` `cc-full` `cc-uppercase` `cc-featured` `cc-compact` `cc-accent`
Row/col modifiers are standalone, **not** combos: `row-align-center` `row-justify-between`
`row-gap-md` `col-shrink` `col-lg-offset-N` `col-lg-first/last`

## Usage rules

- Reference tokens via `var(--*)` — never hardcode a hex or px.
- Themed properties consume `--primary-*`, always.
- Max 4 utilities per element; never mix a utility with a custom class.
- Desktop-first; cascade down at 991 / 767 / 479 only.
- No `transition: all`. JS targets `data-*` or IDs, never classes.
- US spelling in copy Claude authors. **Never alter user-supplied copy** from Figma or the
  prompt — preserve spelling, casing and punctuation verbatim.
- New components via `/component`; it updates this skill, `components.html`, `styles.css`
  and the Components Index in `AGENTS.md`.
- Do not declare custom properties on `:root` once in Webflow — Webflow owns `:root`.
