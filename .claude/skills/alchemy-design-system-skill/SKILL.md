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
