---
name: styleguide
description: "Imports a design system from Figma (or manual input) into template/style-guide.html and template/styles.css for a Webflow project. Faithfully mirrors whatever variables and components the source defines — does not prescribe a schema. Prefixes all brand classes and variables with the project name, handles font hosting explicitly, validates extraction with a reconciliation report, and generates a follow-up [project-name]-design-system-skill. Use when the user runs /styleguide, wants to scaffold a new style guide, or wants to sync the style guide with a Figma design."
---

# Styleguide Skill

Imports a design system into `template/style-guide.html` + `template/styles.css`, faithfully mirroring whatever the source defines. Then generates a project-local design-system skill so future sessions can reference the tokens without re-importing.

## Core Principle: Discover, Don't Prescribe

The skill must not assume a fixed token schema (e.g. "every design system has `body-lg`/`body-md`"). It enumerates **whatever** the source defines and writes that — faithfully kebab-cased and prefixed. If Figma returns `text-base`, you get `--<prefix>-text-base`. If Figma returns 11 colors, you write 11 colors. The Webflow layer this skill imposes is *only* the unprefixed scaffold (layout grid, utility classes, `cc-*` modifiers, page chrome) — never the brand tokens.

## Step 1 — Resolve Project Prefix

Resolve `<prefix>` in this order:

1. Look for an existing `./.claude/skills/*-design-system-skill/SKILL.md` (project-local). The slug before `-design-system-skill` is `<prefix>`. Fall back to `~/.claude/skills/*-design-system-skill/SKILL.md` only if no project-local copy exists.
2. Read `AGENTS.md` (or `CLAUDE.md` if `AGENTS.md` is missing) for a `Project Name` heading or `Project name: <Name>` line. Lowercase + kebab-case it.
3. Grep `template/styles.css` for an existing brand stem (`--<word>-color-` or `.<word>-button {`).
4. If still unresolved, ask via AskUserQuestion. Persist as `<prefix>`.

All brand class names and CSS variables use this prefix. Layout primitives, utilities, `cc-*` modifiers, and page chrome do not.

## Step 2 — Determine Mode

Check the current state of `template/styles.css`:

- **First run** — no prefixed variables exist. Run Steps 3–9 in full.
- **Re-sync from source** — user wants to re-import. Run Steps 3–8, preserving any `.<prefix>-*` rules in `styles.css` that are *components* (not tokens). Regenerate the design-system skill in Step 9.
- **Re-sync from code only** — no source round-trip; regenerate the design-system skill from current `styles.css` + `components.html`. Skip to Step 9.

Ask via AskUserQuestion if not obvious.

## Step 3 — Gather Design Source

Ask via AskUserQuestion:

1. **Figma frame URL** (recommended)
2. **Manual input** — user describes tokens

### 3A — Figma URL Validation (critical)

Before extraction:

1. Parse the URL. It MUST contain a `node-id` query param. **A file-only URL (no node-id) returns only variables in the current canvas viewport, not the full library** — this is the single biggest cause of partial extraction.
2. If no node-id: stop and ask the user to right-click the style-guide frame in Figma → "Copy link to selection" → paste the new URL.
3. Convert `node-id` from URL format (`1234-5678`) to API format (`1234:5678`).

### 3B — Figma Extraction

Load the Figma tools via ToolSearch:
```
select:mcp__Figma__get_variable_defs,mcp__Figma__get_design_context,mcp__Figma__get_screenshot,mcp__Figma__get_metadata
```

Call:
- `get_variable_defs` — enumerate every variable in the frame's scope
- `get_design_context` — inspect components, their variants, and their visual properties
- `get_screenshot` — capture the frame for later visual verification
- `get_metadata` — page/file context

Cache all outputs. Do NOT yet write anything.

### 3C — Manual Input Fallback

If the user picked manual, ask in this order, one at a time:
- Brand color list (any number, with names)
- Neutral scale (any number of stops, with names)
- Font families per role (heading, body, mono, display-accent — any subset)
- Type scale (each size's name + rem value — any number)
- Spacing scale (each step's name + rem value)
- Border radii (per use: button, card, tag, etc.)

Record exactly what the user provides. Do not infer extra tokens.

## Step 4 — Font Hosting (explicit step — do not skip)

For every font family detected in Step 3, ask via AskUserQuestion how it is hosted. Options:

1. **Webflow Designer upload** — generate commented `@font-face` block with placeholder paths and a TODO note pointing to Webflow → Project Settings → Fonts
2. **Adobe Fonts (Typekit)** — ask for the kit ID, write `<link>` tag into `style-guide.html` `<head>` (and note for `index.html`)
3. **Google Fonts** — auto-generate `<link href="https://fonts.googleapis.com/css2?...">` with the requested weights
4. **Self-hosted (.woff2 URL)** — ask for URL(s), write full `@font-face` block(s)
5. **System fallback only** — write a clear `/* TODO: <Font Name> not hosted — using system fallback */` comment

Never silently leave a commented placeholder. The user must make a hosting decision per family.

Build the font stack with appropriate fallbacks (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` for sans; `ui-monospace, "SF Mono", Menlo, Consolas, monospace` for mono; `"Times New Roman", serif` for serif).

## Step 5 — Plan & Confirm (Phase A → Phase B gate)

Before writing files, present the extraction plan to the user. This is the safety gate.

Report:
- Prefix to be used
- Source (Figma frame name + URL, or "manual input")
- Counts: `N colors`, `M typography tokens`, `K spacing tokens`, `R radii`, `C components`
- Full enumerated variable list (name → value), grouped by category
- Font hosting decisions from Step 4
- Component list (name + detected variants) — for Figma sources
- Anything ambiguous or skipped, with a reason

End with: *"Approve and write files? (yes / change X / abort)"*

Wait for explicit approval. Do not proceed on silence.

## Step 6 — Write `template/styles.css`

Rewrite the file. Order:

1. **Header comment** — project name + source + date
2. **@font-face / `<link>` notes** — per Step 4 decisions (links go in HTML head; @font-face goes here)
3. **`:root` variables** — every extracted token, kebab-cased, prefixed. Group with comments: `/* Color */`, `/* Typography — families */`, `/* Typography — sizes */`, `/* Spacing */`, `/* Radii */`, `/* Component-specific */`, etc. Mirror the source's grouping where possible.
4. **Reset / canvas / body** — minimal reset
5. **Page wrapper / skip link** — unprefixed scaffold
6. **Light/dark mode** — only if source defines mode-aware variables. Implement via `.page-wrapper.cc-light` (or whatever the inverse of the detected default is) overriding the mode-* tokens.
7. **Typography rules** — `h1`–`h6` + `.h1`–`.h6` mapped to whichever type tokens semantically fit (largest → h1). If the source has more sizes than 6 headings, expose the extras as `.<prefix>-text-<name>` utility classes. If fewer, only define what exists. Body `p` uses the body token. `.alt-display`, `.<prefix>-eyebrow`, `.<prefix>-caption` only if the source has equivalent.
8. **Layout primitives (unprefixed)** — `.section`, `.container`, `.row`, `.col`, `.col-lg-1..12`, `.col-md-*`, `.col-sm-*`, `.col-xs-*`, row/col modifiers. These are framework-provided; identical across projects.
9. **Component base classes (prefixed)** — for each component detected from Figma `get_design_context` (or asked manually), emit `.<prefix>-<name>` + a `.<prefix>-<name>.cc-<variant>` rule per variant. Visual properties (padding, radius, fill, stroke, font, transitions) come from Figma — do not fall back to invented defaults.
10. **Utilities (unprefixed)** — `u-text-*`, `u-mt-*`, `u-mb-*`, `u-bg-*`, `u-d-*`. Background and text-color utilities reference *the prefixed brand variables* (e.g. `.u-bg-primary { background: var(--<prefix>-color-primary); }`). Only emit utilities for tokens that exist.
11. **Breakpoints** — desktop-first cascade at `991px`, `767px`, `479px`. Cascade column widths and reduce `--<prefix>-section-padding` / `--<prefix>-gap-main` if the source defines breakpoint-specific values.
12. **`prefers-reduced-motion`** — standard block

### Naming rules

**First decide whether this project uses a prefix at all.** Grep `template/styles.css`: `--color-primary` / `.button {` with no stem means the project is **unprefixed, MAST-style** — which is what the baseline template ships. In that case treat every `<prefix>-` below as empty (`--color-primary`, `.button`, `.card_title`) and skip the "never declare a brand variable without the prefix" constraint. Only use a prefix when the project already has one, or when the user asks for one (multi-brand sites, or a design system shared across Webflow projects).

- Brand variables: `--<prefix>-<category>-<name>` (kebab-case; preserve source naming where reasonable)
- Brand base classes: `.<prefix>-<name>` (e.g. `.acme-button`, `.acme-card`)
- Component element classes: `.<prefix>-<component>_<element>` (e.g. `.acme-card_title`)
- Component variants: `.cc-<variant>` (applied alongside base)
- Utilities: `.u-<purpose>`
- Layout: unprefixed

### Constraints

- Never declare a brand variable without the prefix
- Never declare a layout/utility/cc class with the prefix
- Never invent visual values not present in the source — if Figma doesn't specify a button border-radius, ask
- Use `var(--<prefix>-*)` for every color/size/spacing reference inside component rules — no hardcoded hex/px

## Step 7 — Write `template/style-guide.html`

Rewrite (do not patch). Keep `page-wrapper` / `nav` / `footer` structure. Reference `styles.css`. Sections, in order:

1. **Hero** — H1 with one accent treatment (if `.alt-display` defined), intro paragraph
2. **Palette** — one swatch per `--<prefix>-color-*` variable (every one — count must match Step 5)
3. **Typography** — show every heading + body + accent + eyebrow + caption that exists, then a Tokens sub-list of every type-size variable
4. **Rhythm / Spacing** — visual bar per `--<prefix>-space-*` token (every one), with its alias
5. **Imagery** (only if Figma source has imagery treatment) — mirror the layout
6. **Primitives** — one section per discovered component (buttons, tags, forms, cards, stats, etc.), showing every variant + size
7. **Grid** — 12-col reference, common splits (halves/thirds/sidebar), breakpoint cascade
8. **Tokens index** — every defined `--<prefix>-*` variable, grouped, with value column

### Section header pattern (Figma convention)

```html
<div class="styles__head">
  <div class="styles__head-text">
    <h2 class="u-mb-0">Section heading</h2>
    <p class="u-mt-sm">Optional intro.</p>
  </div>
  <p class="caption u-text-primary-light">section-label</p>
</div>
```

`.styles__*` classes live in a page-local `<style>` block — they're scaffold only.

## Step 8 — Reconciliation Report (safety net)

After writing both files, before declaring done, perform a structured diff:

1. **Variables**
   - List every variable from `get_variable_defs` (or manual input)
   - Grep `:root` in the new `styles.css` for `--<prefix>-*`
   - Output a table: Source / Written / Status (✓ matched, ⚠ missing, ➕ extra)
   - Counts must match: `imported N/N colors`, etc.

2. **Components**
   - List every component from `get_design_context` (or manual input)
   - Grep new `styles.css` for `.<prefix>-*` base rules
   - Same matched/missing/extra table

3. **Fonts**
   - List font families detected
   - Confirm hosting decision applied (either `@font-face` block, `<link>`, or explicit TODO comment)

4. **Hardcoded values check**
   - Grep new `styles.css` for hex literals (`#[0-9a-fA-F]{3,6}`) outside the `:root` block — should be empty
   - Grep for `px` units outside breakpoint queries — flag any

5. **Optional visual diff**
   - If a screenshot tool is available, render `style-guide.html` headlessly and place side-by-side with the cached Figma `get_screenshot`. Ask the user to confirm or list deltas.

Report all results to the user. **Do not skip to Step 9 if any ⚠ rows exist** — surface them and ask whether to accept, fix, or re-extract.

## Step 9 — Generate Follow-Up Design System Skill

Create `./.claude/skills/<prefix>-design-system-skill/SKILL.md` (project-local).

### 9.1 — Initialize

```bash
mkdir -p ./.claude/skills/<prefix>-design-system-skill
```

Write `SKILL.md` directly (do not use `init_skill.py`).

If an older copy exists at `~/.claude/skills/<prefix>-design-system-skill/`, remove it after writing the project-local version.

### 9.2 — Populate from actual values

Read the **actual values** from the newly written `styles.css` and `components.html`. Do not leave bracket placeholders. The skill must:

1. Grep `:root` (and `.cc-light` / `[data-theme]` blocks) in `styles.css` to enumerate every `--<prefix>-*` variable with its value
2. List every `.<prefix>-*` base class that has a rule
3. Read `template/components.html` (if it exists) and enumerate each component's base class + variants + slots
4. Mirror the Components Index from `AGENTS.md` if present

Verify: every variable in `styles.css` appears in the skill. Flag gaps to the user.

### 9.3 — Template

```markdown
---
name: <prefix>-design-system-skill
description: "Design system reference for the <Project Name> Webflow project. Documents prefixed CSS variables, class names, typography scale, color palette, spacing tokens, component variants, mode handling, and patterns sourced from <Figma file name or 'manual import'>. Source of truth: template/style-guide.html and template/styles.css. Use when building new pages, components, or UI for <Project Name>; when matching the brand; when the user asks about <Project Name> tokens, variables, or styling conventions."
---

# <Project Name> Design System

Reference for the <Project Name> Webflow project. Source of truth: `template/style-guide.html` and `template/styles.css`. Original design source: <Figma URL or "manual import">.

## Prefix

All brand classes and variables use `<prefix>-` / `--<prefix>-`. Layout primitives (`.section`, `.container`, `.row`, `.col-*`, row/col modifiers), utilities (`u-*`), combo modifiers (`cc-*`), and page chrome (`.page-wrapper`, `.main-wrapper`, `.nav*`, `.footer*`, `.skip-link`) are NOT prefixed.

## Webflow-flat selectors (mandatory)

This is a Webflow project, and Webflow styles are per-element class lists — it has **no representation** for a descendant (`.a .b`), child (`.a > .b`), or `:nth-child` selector. Author `styles.css` flat so it maps 1:1 onto Webflow:

- Style each element on its own class or a combo chain (`.base.cc-x`). Never style a child through its parent.
- Per-item fans/positions → explicit `.cc-1/.cc-2/…` combos on the child in markup, **not** `:nth-child`.
- A variant that changes a child's layout → a combo on the child (`.container.cc-nav`), not `.nav > .container`.
- **Only allowed descendant:** the color/mode cascade (`.parent.cc-light .child`) — Webflow reproduces it via variable modes.
- Runtime/JS-state rules (`.is-*`, `[data-*]`, `[open]`, `.<prefix>-js …`) belong in a custom-code embed, not the class set.

Self-check before finishing: `grep -nE '\.[a-z][\w-]*(\.[\w-]+)*\s+\.[\w-]|\s>\s*\.|:nth-child' template/styles.css` should surface only mode cascades + flagged embeds. (Full rationale: `AGENTS.md` → CSS Architecture → Selector rules, and the `/webflow-transfer` Phase 0.)

## Mode

State the default mode and any opt-in toggle. If single-mode, write: "Single-mode project — no light/dark toggle."

## Color Tokens

Table of every `--<prefix>-color-*` variable with hex value.

## Typography

### Font families
List every `--<prefix>-font-*` variable with its full stack and how it's hosted (Webflow upload / Adobe Fonts / Google Fonts / self-hosted / system fallback).

### Size scale
Enumerate every `--<prefix>-font-size-*` (or `--<prefix>-text-*`) variable with rem value and which selector(s) use it.

### Type utility classes
List every type-related class that exists in `styles.css`.

## Spacing

Enumerate every `--<prefix>-space-*` token with px equivalent, then aliases (`gap-sm`, `gap-md`, `gap-main`, `section-padding`, `container-max-width`).

## Radii & Component Tokens

Table of `--<prefix>-radius-*`, `--<prefix>-input-height`, `--<prefix>-shadow-*`, etc.

## Layout

12-col flexbox grid (unprefixed). Breakpoint cascade: `lg ≥ 992px` · `md ≤ 991px` · `sm ≤ 767px` · `xs ≤ 479px`.

## Components

For each component in `template/components.html`: base class, variants, slots, one-line purpose.

## Usage Rules

- Reference variables via `var(--<prefix>-*)` — never hardcode
- Default mode is <X>; use `.cc-light` (or equivalent) only when an entire section needs the inverse
- Mono font is for eyebrows/captions/tags/labels — never body
- Layout uses unprefixed `.row` / `.col-lg-*`
- **Never alter user-supplied copy** from Figma, designs, references, or the prompt; preserve spelling, casing, punctuation and whitespace verbatim
- New components via the `/component` skill — it updates this skill, `components.html`, `styles.css`, and the Components Index in `AGENTS.md`
- Do not declare new variables on `:root` once in Webflow — Webflow owns `:root`
- Re-sync via `/styleguide` (Re-sync from code mode) after manual `styles.css` edits
```

Make the description field a single-line double-quoted YAML string.

### 9.4 — If the skill already exists

1. Read existing SKILL.md (project-local preferred)
2. Preserve manual sections (anything beyond the template structure)
3. Regenerate auto-populated sections from current `styles.css` + `components.html`
4. Write to project-local path; remove any old global copy
5. Diff against the prior version; report changes

### 9.5 — Final report

Tell the user:
- Skill file path
- Created vs updated
- Any tokens/components in `styles.css` that didn't fit a section
- Suggest `/reload-plugins` if they want it active in this session
- **Next step (optional):** to push this design system into Webflow, run `/webflow-transfer` — it uploads/maps fonts → Variables → classes → style-guide → components via the Webflow MCP, in that order, handling the builder's constraints. (Local `template/` build stays the source of truth.)

## Hard Constraints

- **File scope: this skill writes only `template/styles.css` and `template/style-guide.html`.** It must not create, modify, or pre-populate `template/components.html`, `template/index.html`, or any other file in `template/`. `components.html` is managed solely by the `/component` skill (created on first component invocation). `index.html` is created by the user. If either file exists already, leave it alone.
- Never invent a token not present in the source
- Never declare unprefixed brand variables on `:root`
- Never prefix layout / utility / `cc-*` / page-chrome classes
- Never silently leave commented `@font-face` placeholders — Step 4 must complete with an explicit hosting decision per family
- Never skip the reconciliation report (Step 8)
- Never proceed past Step 5 without user approval
- Keep the mandatory `page-wrapper` / `nav` / `footer` structure intact within `style-guide.html`
- **Never alter user-supplied copy** from Figma, designs, references, or the prompt; preserve spelling, casing, punctuation and whitespace verbatim
