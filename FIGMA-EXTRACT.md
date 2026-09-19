# Alchemy Creative — extracted from Figma (file 87WtDnZvViuoMrc0JNpxl6)

Pages: Sitemap (0:1) · Cover (415:621) · Design (243:1336) · Font Explore (243:2191)

## Paint styles (7)
| Name | Hex |
|---|---|
| Lichen | #c6dc42 |
| Moss | #667a3a |
| Clay | #a56f52 |
| Oat | #d8d0b8 |
| Bone | #f0ebdd |
| Deep Forest | #17251c |
| Charred Bark | #24231e |

## Text styles (9) — all ITC Avant Garde Gothic Pro
| Name | Weight | Size | Line height | Tracking | Case |
|---|---|---|---|---|---|
| H1 | Bold | 80 | 100% | -2.5% | UPPER |
| H2 | Bold | 64 | 100% | 0 | — |
| H2 - Uppercase | Bold | 64 | 100% | 0 | UPPER |
| H3 | Bold | 48 | 100% | -1% | UPPER |
| H4 | Bold | 32 | 100% | 0 | UPPER |
| H5 | Demi | 24 | 125% | 0 | — |
| P | Medium | 20 | 160% | 0 | — |
| P-Sm | Medium | 16 | 160% | 0 | — |
| Eyebrow | Demi | 14 | 150% | 10% | UPPER |

## Variables (1 collection, 4 floats, single mode)
| Name | Value |
|---|---|
| Border Radius | 10 |
| Button Corners | 4 |
| Grid Gap | 10 |
| Global Padding | 20 |

## Gaps to resolve
- No spacing scale (only Global Padding 20 / Grid Gap 10)
- No semantic color roles (bg/surface/text/accent) — only named brand colors
- No documented button/form/card specs
- Font resolved: Adobe Fonts / Typekit kit `rnt3tbw` (see Font hosting below)

## Page frames on the "Design" page (243:1336)
| Page | Node ID |
|---|---|
| Home | 243:1337 |
| All Work | 243:1365 |
| Category | 499:1083 |
| Project | 243:1470 |
| About Us | 243:1556 |
| Contact | 243:1651 |
| Journal | 243:1682 |
| Article | 243:1746 |
| FAQs | 424:1649 |

Supporting nodes: Nav Dropdown 423:1379 · Project Thumbnail 423:1386 · Question 425:958
Notes/annotations: Rectangle 1 243:1785 · Vector 1 424:1580 · two "Sort order" notes (499:1167, 499:1168)
Child index 6 is an annotation block that crashes the MCP bridge on any property read — skip it.

## MCP transport gotcha (important, reusable)
The Figma desktop bridge truncates responses at ~19.5KB and the failure is triggered by
*how many nodes a script touches*, not by the size of the returned value.
- `get_metadata` on a whole busy page always fails. Use `use_figma` instead.
- NEVER call `setCurrentPageAsync` on a large page — the switch alone blows the limit.
  `await figma.getNodeByIdAsync('<pageId>')` loads the page fine and sets it current.
- Touch at most ~3-5 nodes per call. Fan out across parallel `use_figma` calls.

## Derived spacing scale (measured across all 9 page frames)
Frequency of auto-layout itemSpacing / padding values, aggregated:

| Value | Role | Evidence |
|---|---|---|
| 8 | hairline gap | occasional, 3 pages |
| 10 | tight gap (= existing "Grid Gap" token) | dominant gap on 7/9 pages |
| 16 | small gap | Project, Contact (form rows) |
| 20 | base unit (= existing "Global Padding" token) | dominant on Journal/Article |
| 24 | card padding / list gap | strong on 8/9 pages |
| 32 | block gap | consistent on all 9 pages |
| 40 | block gap (large) | 7 pages |
| 48 | stack gap | FAQ padV x22 (accordion rows) |
| 64 | section-internal gap | About x11, strong |
| 80 | section padding (small) | all 9 pages |
| 100 | wide gutter | Project padH x18 |
| 120 | section padding (large) / container gutter | About padH x12, 7 pages |

Recurring specials (not scale steps):
- 142 / 179 -> the fixed nav block (height / side padding) on Home, All Work, Category, Project
- 524 -> a centerd content column width, appears twice per page
- 382 -> one per page, an outlier offset
- 60, 65 -> one-off (Project, About)

## Radii (confirms the existing variables)
| Value | Role | Evidence |
|---|---|---|
| 4 | buttons (= "Button Corners") | Journal x8, Article x3, Contact, Home |
| 10 | cards / media (= "Border Radius") | dominant: Project x23, Category x11, All Work x9 |
| 100 | pill | Home x2 |

---

# Theme model (measured, not assumed)

Derived by mapping every text fill to its nearest filled ancestor background across
Home, About Us, Journal, Article and Contact, plus every button-like node on those pages.

## The two themes

| Role | Dark (primary) | Light |
|---|---|---|
| Background | Deep Forest `#17251c` | Bone `#f0ebdd` |
| Alt surface | Charred Bark `#24231e` | Oat `#d8d0b8` |
| Heading | Bone `#f0ebdd` | Deep Forest `#17251c` |
| Body text | Bone `#f0ebdd` | Deep Forest `#17251c` |
| Text accent | Lichen `#c6dc42` | Moss `#667a3a` |
| Button fill | Lichen `#c6dc42` | Moss `#667a3a` |
| Button label | Deep Forest `#17251c` | Bone `#f0ebdd` |
| Button radius | 4 | 4 |

Evidence: light-theme buttons `#667a3a` on Bone ×10 and on Oat ×3; dark-theme buttons
`#c6dc42` with `#111111` label ×2, plus a pill (r100) variant with the same pair.
Light-theme body/heading `#17251c` on Bone ×26 and on Oat ×12.

## Resolved (confirmed by Walker, 2026-09-18)

1. **Light-theme text accent is Moss `#667a3a`.** `#7e8c2c` (3 uses) is a stray — normalise
   it to Moss wherever it appears. Do not create a token for it.
2. **Button label snaps to Deep Forest `#17251c`.** `#111111` is not tokenised; treat it as a
   stray and use Deep Forest. The palette stays at seven colors.
3. **The Lichen button on Oat is a slip.** Oat is a light-theme surface, so buttons on it
   follow the light theme: Moss fill, Bone label.

Net effect: both themes are expressible with the seven existing paint styles. No new color
tokens are required.

## Webflow mapping

Build as a variable collection **Mode** with two modes, `Dark` (default) and `Light`.
Bind every themed property to these, never to a literal or a brand color directly.

| Webflow variable | Dark | Light |
|---|---|---|
| `Mode Background` | Deep Forest | Bone |
| `Mode Surface` | Charred Bark | Oat |
| `Mode Heading` | Bone | Deep Forest |
| `Mode Text` | Bone | Deep Forest |
| `Mode Accent` | Lichen | Moss |
| `Mode Button Background` | Lichen | Moss |
| `Mode Button Label` | Deep Forest | Bone |

In the static build this is the **one permitted descendant selector**:
`.page-wrapper.cc-light .heading { color: var(--mode-heading) }`. In Webflow it becomes
`set_style_variable_mode` on the `.cc-light` combo, which cascades to descendants.
For that to survive transfer, every themed child must consume a **Mode** variable —
if a child is bound to `Color Bone` directly it will not flip.

## Figma components found (Sitemap page)

| Component | Node | Variants |
|---|---|---|
| Button | 200:568 | Default ; small |
| Sitemap Item | 11:84 | Parent ; Secondary ; Tertiary |
| Nav | 11:334 | Overlay |
| CTA | 228:843 | — |
| Footer | 200:407 | — |

Note: the Button component has size variants (Default/small) but **no theme variant** —
theming is applied ad hoc per instance. In Webflow this should become a `cc-light`
combo driven by the Mode collection rather than duplicated button styles.


---

# Font hosting — RESOLVED

Adobe Fonts (Typekit) kit **`rnt3tbw`**.

```html
<link rel="stylesheet" href="https://use.typekit.net/rnt3tbw.css">
```

**The CSS family name is `itc-avant-garde-gothic-pro`** — note it does NOT match the Figma
style name "ITC Avant Garde Gothic Pro". Using the Figma name in CSS silently falls back.

Kit serves three weights, normal style only, which maps exactly onto the Figma text styles:

| Figma weight | CSS weight | Used by |
|---|---|---|
| Medium | 500 | P, P-Sm |
| Demi | 600 | H5, Eyebrow |
| Bold | 700 | H1, H2, H2-Uppercase, H3, H4 |

No italic is served — do not author any.

Stack: `"itc-avant-garde-gothic-pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`

**Webflow:** Walker is connecting the Adobe Fonts account to the Webflow project directly, so
the family will be pulled in by Webflow rather than uploaded. `data_fonts_tool` manages
*custom uploads only* and plays no part here. At transfer time, match the family name Webflow
registers (check `list_fonts`) rather than assuming either the Figma name or the CSS slug.

---

# Webflow target: actual MAST variable structure (read 2026-09-18)

Site **Alchemy Creative** `6aad7d4121d8828938eb64fd` (shortName `alchemytv`), reachable only
on the **Webflow Beta** connector, not the standard one. It is a MAST starter copy — Home is
titled "Mast - Style Guide"; there are Components, Styles, Basic/Inspired Layouts pages.
The design-system skill Walker supplied was generated from THIS site (its page ids match).

Key page ids: Home `…64ce` · Components `…64d2` · Styles `…64cf` · Blog template `…64d7`

## Color (base values, tints derived via color-mix)
| Name | cssName | Value |
|---|---|---|
| Base/Brand Primary | `--_color---base--brand-primary` | `#006acc` |
| Base/Brand Primary - o10 | …`-o10` | `color-mix(… white 90%)` |
| Base/Brand Secondary | …`brand-secondary` | `#6b5d3f` |
| Base/Brand Neutral | …`brand-neutral` | `#dfe6d1` |
| Base/Brand Dark | …`brand-dark` | `color-mix(primary, black 80%)` |
| Base/Dark - o20, Base/White, White - o10, White - o50 | | derived / `white` |

Note: Brand Dark and every tint are **derived from Brand Primary**, not independent hexes.

## Theme — 4 roles x 3 modes (Base · Accent · Dark)
| Role | Base | Accent | Dark |
|---|---|---|---|
| Primary/Background | white | brand-primary-o10 | brand-dark |
| Primary/Text | brand-dark | brand-dark | white |
| Primary/Border | dark-o20 | dark-o20 | white-o10 |
| Primary/Accent | brand-primary | brand-primary | brand-primary |

There is **no surface, button-background or button-label role**.

## Layout
Grid: Columns 12 · Gap Main **40px** · Gap MD **24px** · Gap SM **8px** · Gap Button **16px**
Spacing (em): Margin XS **0.5** · SM **1** · MD **2** · LG **3**
Fluid: Min **20** · Max **90** (rem viewport bounds = 320px–1440px)

## Components
Section Padding = fluid clamp, Min **3rem** / Max **6rem**
Container Max Width = `fluid-max * 1rem` = **90rem (1440px)** · Container Gutter **6vw**
Card: Border Radius **0.5rem** · Padding fluid Min **1rem** / Max **1.5rem**
Button: Font Weight **400** · Size **1rem** · Line Height **1.3em** · Letter Spacing **0**
        Radius **0.5rem** · Vertical Padding **0.7em** · Horizontal Padding **1em**
Input + Input Label: font, weight, size, line-height, tracking, radius, bottom margin

**The fluid formula** is generic: every fluid value is a Min(rem)/Max(rem) number pair, and
the clamp is computed against Fluid Min/Max. Do not hand-write clamps — set the number pairs.

## Gap analysis vs our static build

| Concern | MAST / Webflow | Our build | Action |
|---|---|---|---|
| Em margins | 4 steps (0.5/1/2/3em) | 8 steps (0.25–4em) | collapse to MAST's 4 |
| Grid gaps | px: 40/24/8/16 | rem 12-step ramp | adopt Gap Main/MD/SM/Button |
| Fluid bounds | 20rem–90rem | 480–1440px | adopt 20/90 |
| Type sizes | Min/Max rem number pairs | hand-written clamp literals | switch to number pairs |
| Heading bottom margin | per level (H1 Bottom Margin…) | one `--margin-heading` | make per level |
| Container | 90rem + 6vw gutter | 1200px + 120px | set Max to 75rem (1200) |
| Section padding | fluid 3–6rem | 120px fixed + breakpoints | set Min 3rem / Max 7.5rem |
| Theme modes | Base · Accent · Dark | cc-light / cc-dark | decide mapping |
| Button colors | **not in Theme** | `--mode-button-bg/-label` | see below |

## Button colors — no new variables needed

Alchemy's buttons resolve exactly onto the existing roles:

| | Dark theme | Light theme |
|---|---|---|
| Button fill | Lichen = **Primary/Accent** | Moss = **Primary/Accent** |
| Button label | Deep Forest = **Primary/Background** | Bone = **Primary/Background** |

So `button { background: Primary/Accent; color: Primary/Background }` is correct in both
themes, provided Accent is mode-aware (Lichen in dark, Moss in light). MAST currently holds
Accent constant across modes — that one change makes the whole button treatment work.


---

# RESOLVED: Theme modes (2026-09-18)

Walker is deleting the `Accent` and `Dark` modes, leaving **Base** (cannot be renamed) and
**Light**. Base = the dark green primary palette. This matches the static build exactly:
`:root` carries Base, `.cc-light` flips it, `.cc-dark` forces Base back inside a light region.

Theme roles extended from MAST's four to seven (added Surface, Text Muted, Text Dim).
Buttons need no color roles: fill = `Primary/Accent`, label = `Primary/Background`.

Static build restructured to mirror the MAST token shape — see the design-system skill for
the full mapping table. Verified: no undefined variables, all classes resolve, selectors flat.
