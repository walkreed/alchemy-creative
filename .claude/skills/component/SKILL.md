---
name: component
description: Create a new reusable HTML component for a Webflow static HTML/CSS project that uses the `template/` scaffold. Use whenever the user asks to "create a component", "add a new component", "build a [card/hero/cta/etc.] component", or scaffold any reusable block intended for Webflow Designer. Always prompts the user for a design reference (Figma link, image, or URL) before building. Pulls foundations (color, typography, spacing) from the project's design-system skill or `template/style-guide.html`, registers the component in `template/components.html`, adds base CSS to `template/styles.css`, updates the project's design-system skill, and maintains a Components Index in `AGENTS.md`.
---

# Component

Create a new reusable HTML component for a Webflow project and register it everywhere it needs to exist — including the project's design-system skill.

## Prerequisites

This skill expects the working directory to be a Webflow static HTML/CSS project with the `template/` scaffold:

- `AGENTS.md` (project guide; conventions to follow — may be symlinked to `CLAUDE.md`)
- `template/style-guide.html` (foundations — colors, type, spacing, tokens)
- `template/components.html` (live instances of every component)
- `template/styles.css` (base + custom classes, variables, utilities)

If any are missing, stop and tell the user — do not invent structure. Suggest running `/styleguide` first if the project hasn't been initialised.

## Conventions (apply throughout)

- **Never alter user-supplied copy** sourced from Figma, screenshots, reference URLs, or the prompt — preserve spelling, casing, punctuation and whitespace verbatim.
- **Name by structure, never by page context.** Component names must describe *what the component is* (its layout pattern, role, or visual structure), not *where it appears*. Never use page-specific terms like `-about-`, `-home-`, `-contact-`, `-services-` in a component's base class. A full-viewport hero with an editorial headline is `.acme-editorial-hero`, not `.acme-about-hero`. If the name you're considering only makes sense on one page, it's a page-scoped name — find a structural or pattern-based alternative.
- Lowercase, dash-separated class names; underscore separates component scope from element (`feature-card_title`)
- Custom class is the base; variants are `cc-*` combo classes; never mix utility classes with a custom class on the same element
- **Webflow-flat selectors (mandatory — this is a Webflow project).** Webflow styles are per-element class lists; it cannot represent a descendant (`.a .b`), child (`.a > .b`), or `:nth-child` selector. So **never style a child through its parent.** Put styling on the element's own class or a combo:
  - `.card > .card_title {…}` → style `.card_title`, or `.card_title.cc-featured` for a variant
  - per-item fans/positions (deck rotations, staggered grids) → explicit `.cc-1/.cc-2/.cc-3` combos on each child in the markup, **never** `:nth-child`
  - a variant that changes a child's layout → a combo on the child (`.card_media.cc-row`), not `.card.cc-row .card_media`
  - **Only exception:** a color/mode cascade (`.parent.cc-light .child`) is allowed, because Webflow reproduces it via variable modes.
  - Self-check before finishing: `grep -nE '\.[a-z][\w-]*(\.[\w-]+)*\s+\.[\w-]|\s>\s*\.|:nth-child' <your new rules>` should return nothing but mode cascades.
- Reuse existing CSS variables — never declare on `:root`
- Desktop-first; cascade down via `@media (max-width: 991px|767px|479px)`
- Never use `transition: all` — target specific properties
- Include `@media (prefers-reduced-motion: reduce)` if the component animates

## Workflow

Follow these steps in order.

### 1. Resolve project prefix

Brand bases and brand variables may be namespaced with a `<prefix>-` (e.g. `.acme-button`, `--acme-color-primary`) or unprefixed, MAST-style (`.button`, `--color-primary`). **The baseline template ships unprefixed** — match whatever the project already uses; never introduce a prefix into an unprefixed stylesheet or vice versa.

Resolve in this order:

1. Grep `template/styles.css` for the existing convention. `--color-primary` / `.button {` with no stem means **unprefixed** — stop here and use no prefix. `--<word>-color-primary` / `.<word>-button {` means `<prefix>` is that common stem.
2. Look for `~/.claude/skills/*-design-system-skill/SKILL.md` matching this project — the slug before `-design-system-skill` is `<prefix>`.
3. Read `AGENTS.md` for a `Project Name` heading or `Project name: <Name>` line; lowercase + kebab-case it.
4. If the stylesheet is empty and none of the above resolve, ask the user via AskUserQuestion: "Should brand classes and variables be prefixed, and with what? (unprefixed / a prefix such as `acme`)"

Use `<prefix>` for **all new brand custom classes and variables** in this skill. Do NOT prefix layout (`.section`, `.container`, `.row`, `.col-*`), utilities (`u-*`), combo modifiers (`cc-*`), or page chrome (`.page-wrapper`, `.nav`, `.footer`, `.skip-link`).

### 2. Request a design reference

**Always** prompt the user for a design source before building — never invent a layout from imagination. Ask for one of:

- A **Figma link** (figma.com URL — file or specific node/frame)
- An **image / screenshot** path (PNG, JPG, WebP) attached or on disk
- A **reference URL** to an existing site/page
- An explicit **"no design, build from description"** confirmation — only proceed without a visual if the user says so

If the user provides a Figma URL, use the Figma MCP (`mcp__Figma__get_design_context`, `mcp__Figma__get_screenshot`, `mcp__Figma__get_variable_defs`) to pull layout, tokens, and a screenshot. Load the `/figma-use` skill first if calling `use_figma`.

If they provide an image, use the Read tool to view it.

### 3. Read existing context (in parallel)

- If `~/.claude/skills/<prefix>-design-system-skill/SKILL.md` exists, **read it first** — this is the curated source of truth for tokens, type, spacing, mode handling, and existing components. Fall back to `template/style-guide.html` only if the skill is missing or outdated.
- `AGENTS.md` — confirm conventions and locate the Components Index. **Check for an existing row** with the proposed component name; if present, switch to an edit flow (Step 7) rather than creating a duplicate.
- `template/components.html` — see how other components are documented; confirm the new component doesn't already have a section.
- `template/styles.css` — find the section where the new component's CSS should live.

**Build inventories from the design-system skill** before writing anything:

- **Known tokens**: every `--<prefix>-*` variable name documented in the design-system skill
- **Known components**: every base class in the design-system skill's Components section

**Deviation check** — as you map the Figma design to CSS, flag any of the following:

| Flag | Condition |
|---|---|
| ⚠ MISSING TOKEN | A `var(--<prefix>-*)` you plan to write is not in the known tokens list |
| ⚠ VALUE MISMATCH | The Figma value for a token differs from the value in the design-system skill (show both) |
| ⚠ UNKNOWN COMPONENT | A component referenced as a building block has no matching base class in the known components list |

Collect every deviation — **do not silently resolve or invent values**. All deviations must be surfaced in the Step 9 report and confirmed by the user before any write proceeds.

### 4. Confirm scope with the user

Once design reference + context are in hand, confirm (concisely) anything still ambiguous:

- Component name (kebab-case, will be saved as `.<prefix>-<name>`, e.g. `.acme-feature-card`)
- Purpose / what content it holds
- Variants needed (e.g. `cc-featured`, `cc-compact`)
- Slots needed (regions where children go)

Skip questions whose answers are clear from the prompt or the design.

### 5. Write the component CSS

Append the custom class (and any element scopes) to `template/styles.css` in the components section.

- Base: `.<prefix>-<name>` (e.g. `.acme-feature-card`)
- Scoped children with underscore: `.<prefix>-<name>_title`, `.<prefix>-<name>_body`
- Variants as `cc-*` combo classes: `.<prefix>-<name>.cc-featured`
- Use `var(--<prefix>-*)` for every token reference

### 6. Add the live instance to `template/components.html`

Insert a new `<section class="components__item">` block, matching the format of existing entries. Include a props/slots/variants comment block above the markup:

```html
<!-- ===================== FEATURE CARD ===================== -->
<section class="components__item">
  <div class="container">
    <h2>Feature Card</h2>
    <pre class="components__props">Component: FeatureCard
Props:
  - title (Text)
  - description (RichText)
  - icon (Image)
  - link (Link)
Variants:
  - cc-featured
  - cc-compact
Slots:
  - footer-slot</pre>

    <!--
      Feature Card
      Base: .<prefix>-feature-card
      Props: title (Text), description (RichText), icon (Image), link (Link)
      Variants: cc-featured, cc-compact
      Slots: footer-slot
    -->
    <div class="<prefix>-feature-card">
      <!-- markup -->
    </div>
  </div>
</section>
```

Place the new section in a sensible order (group related components together).

### 7. Update the Components Index in `AGENTS.md`

`AGENTS.md` must contain a **Components Index** section. After creating a new component, add (or edit) a row.

To locate the index:

1. Search for an existing `## Components Index` heading. If present, append/edit the row there.
2. If absent, append a new top-level section at the end of `AGENTS.md` with this exact format:

```markdown
---

## Components Index

The canonical list of every reusable component in this project. Each entry must have a live instance in `template/components.html` and base styles in `template/styles.css`. Keep this table in sync — append a row whenever a new component is created, edit when props/variants change, remove when a component is retired.

| Component | Base Class | Variants | Slots | Purpose |
|-----------|------------|----------|-------|---------|
| Nav | `.nav` | — | — | Global site navigation |
| Footer | `.footer` | — | — | Global site footer |
```

Then append a row for the new component:

- **Component**: Title Case display name
- **Base Class**: leading dot + prefix, e.g. `.acme-feature-card`
- **Variants**: comma-separated `cc-*` classes, or `—` if none
- **Slots**: comma-separated slot names, or `—` if none
- **Purpose**: one short sentence

If the component already has a row (rename/update), edit in place.

### 8. Sync the design-system skill

If `~/.claude/skills/<prefix>-design-system-skill/SKILL.md` exists, update its `## Components` section to include the new component. Format:

```markdown
### Feature Card (`.<prefix>-feature-card`)
One-sentence purpose. Variants: `cc-featured`, `cc-compact`. Slots: footer-slot.
```

If the skill does not exist, surface this to the user: "No design-system skill found at `~/.claude/skills/<prefix>-design-system-skill/` — consider running `/styleguide` to generate one so future sessions inherit this component."

### 9. Verify and report

Briefly confirm to the user:

- Files touched (`styles.css`, `components.html`, `AGENTS.md`, `<prefix>-design-system-skill/SKILL.md`)
- The component's base class, variants, slots

**⚠ Design system deviations** — report every flag collected in Step 3, using this format:

```
⚠ Design system deviations:
  MISSING TOKEN:       --acme-radius-xl used in CSS — not in design-system skill.
                       Run /styleguide to sync, or the user accepts this token as new.
  VALUE MISMATCH:      --acme-color-primary: design-system skill says #3D5A80,
                       Figma shows #2F4763 — used design-system skill value; flag for designer review.
  UNKNOWN COMPONENT:   .acme-feature-hero referenced but not in design-system skill —
                       run /component to register it, or treat as one-off custom class.
```

If there are no deviations, write: `✓ All tokens and components align with the design-system skill.`

- **Missing tokens** (if any): values the design needs that don't map to any existing variable; suggest a name+value and note the user should add them via `/styleguide` re-sync
- Anything else that needs the user's eyes (e.g. an asset placeholder, an unresolved interaction)

Do not start a dev server or run build tools — this is a static Webflow scaffold.

## Conventions checklist

Before reporting done, verify the component follows AGENTS.md:

- [ ] Base class is `.<prefix>-<name>` (kebab-case)
- [ ] Underscore separates component scope from element (`<prefix>-<name>_title`)
- [ ] Custom class is the base; variants are `cc-*`; no utility classes mixed in
- [ ] Reuses existing CSS variables — no new `:root` declarations
- [ ] Semantic HTML (`<article>`, `<section>`, `<h2>`–`<h6>`, etc.)
- [ ] Images have `alt`, explicit `width`; SVGs use `viewBox` + `currentColor`
- [ ] Form inputs have associated `<label>` (if applicable)
- [ ] Props/slots/variants documented in HTML comment above markup
- [ ] Listed in the Components Index in `AGENTS.md`
- [ ] Listed in `<prefix>-design-system-skill` (if it exists)
- [ ] Missing tokens reported to the user (not silently invented)
- [ ] All design system deviations flagged (MISSING TOKEN / VALUE MISMATCH / UNKNOWN COMPONENT) and confirmed by user before any write
- [ ] User-supplied copy from designs/prompts left verbatim — never re-spell or re-case it

## Notes

- This skill applies to **static HTML/CSS** components for Webflow import. It does NOT create React Code Components — for that, use the `component-scaffold` skill instead.
- If the user asks for a component already present in the index, offer to edit/extend rather than duplicate.
- Some projects symlink `CLAUDE.md` to `AGENTS.md`. Edit `AGENTS.md` (the real file) so both stay in sync.
- If the design-system skill is renamed or located elsewhere, ask the user once and remember to look in that path for the rest of the session.
