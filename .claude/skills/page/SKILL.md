---
name: page
description: "Builds a complete HTML page for a Webflow project from a Figma frame (or other design reference), reusing the project's existing design tokens and component library. Maps Figma sections to existing components where possible, asks per-pattern whether to pause for `/component` or inline CSS for gaps, downloads images to `template/assets/`, and updates the Pages Index in AGENTS.md. Portable across projects — resolves prefix, design-system skill, and component inventory at runtime. Use when the user runs /page, asks to build a new page from Figma, scaffold a [home/about/pricing/etc.] page, or convert a Figma frame into HTML."
---

# Page Skill

Builds a full HTML page in `template/<filename>.html` from a Figma frame (or image / URL / description). Reuses the project's existing design system: prefixed CSS variables, prefixed component bases, layout primitives, and combo variants.

## Step 1 — Resolve project prefix

Find the project prefix using the same algorithm as `/component`:

0. Grep `template/styles.css` first. `--color-primary` / `.button {` with **no** stem means the project is unprefixed, MAST-style — which is what the baseline template ships. Treat `<prefix>` as empty everywhere below (`var(--color-primary)`, `.card`, `.card_title`) and skip to Step 2.
1. Glob `.claude/skills/*-design-system-skill/` — the directory name gives `<prefix>-design-system-skill`. Strip the suffix → `<prefix>`.
2. Fallback: read `AGENTS.md` (or `CLAUDE.md` if `AGENTS.md` is missing) for a `Project Name:` line or `# Project Name` heading. Lowercase + kebab-case → `<prefix>`.
3. Fallback: grep `template/styles.css` for `--([a-z][a-z0-9-]+)-color-primary` and take the captured group.

Store `<prefix>`. Used throughout.

## Step 2 — Load the design system

1. **Read `AGENTS.md` Components Index** (the table under `## Components Index`). This is the canonical inventory of every reusable component in the project — base class, variants, slots, purpose. Treat it as the authoritative list of what's available to reuse.
2. Read `.claude/skills/<prefix>-design-system-skill/SKILL.md` (or wherever it lives). Extract:
   - **Known tokens**: every `--<prefix>-*` variable name
   - **Known components**: each component's base class, variants, slots, purpose
   - Mode handling (dark/light flip rules)
3. Reconcile the two sources. If a component appears in `AGENTS.md` but is missing from the design-system skill (or vice versa), flag it — but treat the union as the **known components** set for the rest of this skill. AGENTS.md is the source of truth for the inventory; the design-system skill carries the styling detail.
4. Read `template/components.html`. For every component listed in the Components Index, capture its markup template (the `<div class="<prefix>-card">…</div>` block) into an in-memory map: `{ component_name: markup_template }`. If a component is listed in AGENTS.md but its markup is missing from `template/components.html`, flag it to the user before continuing.
5. Read `template/styles.css` (just the top — `:root` and selector list) to confirm prefixed classes and variables resolve.

Build an "available primitives" inventory: tokens + components (from AGENTS.md Components Index) + utility classes (`u-*`) + layout primitives (`.section`, `.container`, `.row`, `.col-lg-*` etc.).

Store the **known tokens** set and **known components** set — they are used for deviation checking in Step 6B.

If the design-system skill is missing, halt and tell the user to run `/styleguide` first.

## Step 3 — Get design reference (mandatory gate)

Ask via AskUserQuestion which design reference the user is providing:
1. **Figma URL** (must include `node-id` query parameter — frame-specific URL, not a file-only URL)
2. **Reference image** (path to a screenshot or mockup)
3. **Reference URL** (a live page to mimic)
4. **No design — describe the page in text**

**Refuse to proceed** without one of these. Pages built blind drift from the brand.

## Step 4 — Confirm page scope

Ask the user (one AskUserQuestion or a short conversation):
- **Filename** — e.g. `about.html`, `pricing.html`, `careers.html`. Saved to `template/<filename>`.
- **Purpose** — one sentence. Recorded in the Pages Index.
- **Section list** — high-level outline (e.g. "Hero, 3-up stats, Team grid, Newsletter CTA"). User can paste a list or confirm a draft you extract from the Figma frame names in Step 5.

## Step 5 — Extract Figma design context

If the design reference is a Figma URL:

1. Load Figma MCP tools via ToolSearch: `select:mcp__Figma__get_metadata,mcp__Figma__get_design_context,mcp__Figma__get_screenshot`
2. **Validate the URL contains `node-id`.** If not, ask for a frame-specific URL.
3. Call `mcp__Figma__get_metadata` on the page nodeId to list direct child frames — these are typically the sections.
4. Call `mcp__Figma__get_screenshot` on the page nodeId once — for visual reference in your reasoning.
5. For each section frame nodeId, call `mcp__Figma__get_design_context` **on that section individually** (never the whole page — the response will exceed context limits).
6. If any response is saved to a file due to size, extract data with the script:
   ```bash
   python3 .claude/skills/page/scripts/extract_figma_page.py <saved-file> --mode sections
   python3 .claude/skills/page/scripts/extract_figma_page.py <saved-file> --mode images
   python3 .claude/skills/page/scripts/extract_figma_page.py <saved-file> --mode text
   ```

For non-Figma references, gather as much detail as possible from the image/URL/description and skip Figma-specific steps.

See `references/page-extraction.md` for full details on handling large responses, image identification, and grid hints.

## Step 6 — Map sections to components

**Reuse before rebuild.** Walk the AGENTS.md Components Index row-by-row and, for each section identified in Step 5, attempt to match it against an existing component first. Only fall back to ⚠ PARTIAL or ✗ NO MATCH after exhausting the index. The goal is maximum reuse — the user maintains the Components Index precisely so pages stay consistent.

Classify each section against the inventory built in Step 2:

| Marker | Meaning |
|---|---|
| ✓ MATCH | An existing component renders this section as-is (e.g. Hero → existing hero component) |
| ⚠ PARTIAL | An existing component fits with a small tweak — usually a new `cc-*` variant or modifier |
| ✗ NO MATCH | No existing component fits. Needs either a new component (`/component`) or inline CSS |

Look at `references/section-patterns.md` for a vocabulary of common layout shapes and the grid patterns they translate to.

## Step 6B — Align against design system (deviation check)

Cross-reference the entire section mapping from Step 6 against the inventories built in Step 2 before asking the user anything about gaps.

**Token deviations**: for every `var(--<prefix>-*)` token you plan to write (in page markup or CSS additions):

| Flag | Condition |
|---|---|
| ⚠ MISSING TOKEN | Token name is not in the known tokens set from the design-system skill |
| ⚠ VALUE MISMATCH | The token exists but the value from Figma differs from the design-system skill's documented value (show both) |

**Component deviations**: for every ✓ MATCH or ⚠ PARTIAL section:

| Flag | Condition |
|---|---|
| ⚠ UNKNOWN COMPONENT | The mapped base class is not in the design-system skill's known components set |
| ⚠ UNDOCUMENTED VARIANT | The planned `cc-*` variant is not listed under that component in the design-system skill |

Collect every deviation. **Do not silently resolve, invent values, or proceed past deviations.** All flags must appear in the Step 8 build plan confirmation — the user must acknowledge them before any write proceeds.

## Step 7 — Resolve gaps (per-pattern question)

For each ✗ NO MATCH section, ask the user **per pattern** via AskUserQuestion:

> Section "Newsletter strip" has no matching component. How should I build it?
> - **Pause for `/component`** — I stop, you build it with `/component`, then re-run `/page` to continue
> - **Inline custom CSS** — I write a section-scoped `.<prefix>-newsletter-strip` class into `styles.css` using only existing variables. Flagged as candidate-for-extraction.
> - **Skip section** — I leave a TODO placeholder in the HTML.

For each ⚠ PARTIAL, confirm the variant name with the user before writing:

> Section "Team grid" needs `.<prefix>-card.cc-team`. Confirm or override the variant name.

## Step 8 — Confirm the build plan

Present a complete summary before any write. **Always include the deviations block** from Step 6B — even if empty:

```
Page: about.html
Purpose: Company background and team

Sections:
  ✓ Hero          → existing .<prefix>-hero component
  ✓ Stats (3-up)  → existing .<prefix>-stat component × 3
  ⚠ Team grid     → .<prefix>-card with new cc-team variant
  ✗ Newsletter    → chosen: inline custom CSS (.<prefix>-newsletter-strip)

Images: 4 to download (1 hero, 3 team avatars)
CSS additions: ~50 lines (cc-team variant + newsletter section)
Pages Index: will add row in AGENTS.md

⚠ Design system deviations:
  MISSING TOKEN:         --acme-radius-xl (used in hero) — not in design-system skill.
                         Nearest existing token: --acme-radius-card (8px). Use it, or sync via /styleguide.
  UNDOCUMENTED VARIANT:  .acme-card.cc-team — not listed in design-system skill.
                         Will write CSS and update design-system skill after confirmation.
  VALUE MISMATCH:        --acme-color-primary: design-system skill = #3D5A80, Figma = #2F4763.
                         Using design-system skill value; flag for designer review.
```

If there are no deviations: `✓ All tokens and components align with the design-system skill.`

Wait for explicit confirmation ("yes", "go", "ship it") before any write. Do not proceed on silence.

## Step 9 — Download images

For each image identified in Step 5:

1. Use `mcp__Figma__get_screenshot` or Figma asset endpoints to fetch the image at 2× display size
2. Convert to WebP via `cwebp` (check it's installed with `which cwebp`; if missing, fall back to placeholder + warn user)
3. Save to `template/assets/<page-slug>/<image-name>.webp`
4. Record explicit width and height from the Figma node

If download fails for an image, emit a placeholder element:
```html
<img src="placeholder.jpg"
     data-figma-node="123:456"
     data-figma-name="Hero image"
     width="1920" height="1080"
     alt="" loading="lazy">
```
And report it in Step 14.

## Step 10 — Scaffold the page file

Create `template/<filename>` by:

1. **Copy the wrapper structure** from `template/index.html` if it exists, otherwise from `template/style-guide.html`. The `page-wrapper`, `<nav>`, and `<footer>` are unchanged.
2. **Replace `<main class="main-wrapper" id="main">` contents** with the new sections:
   - For each ✓ MATCH section: copy markup from `template/components.html` and fill content from extracted Figma text
   - For each ⚠ PARTIAL section: copy component markup + add the confirmed `cc-*` variant class
   - For each ✗ NO MATCH (inline) section: emit base section markup using `.section > .container > .row > .col-lg-* > .<prefix>-<section-name>`
   - For each ✗ NO MATCH (skip) section: emit `<!-- TODO: section "<name>" — design ref node <nodeId> -->` and a placeholder block

3. Enforce CSS conventions:
   - Use only `var(--<prefix>-*)` — never hardcoded hex/px/rem
   - Respect the 4-class rule (base + combo + utility max 4; never mix utility with custom)
   - Layout uses unprefixed primitives (`.section`, `.container`, `.row`, `.col-lg-*`)
   - **Webflow-flat selectors (mandatory).** No descendant (`.a .b`), child (`.a > .b`), or `:nth-child` selectors for styling — Webflow can't represent them and the section imports unstyled. Style each element on its own class or a combo; use explicit `.cc-1/.cc-2/…` combos for per-item fans/positions instead of `:nth-child`; a variant that changes a child goes on a combo on that child (`.container.cc-nav`), not `.nav > .container`. Only the color/mode cascade (`.parent.cc-light .child`) may stay a descendant. Self-check: `grep -nE '\.[a-z][\w-]*(\.[\w-]+)*\s+\.[\w-]|\s>\s*\.|:nth-child'` your new rules → only mode cascades allowed.
   - Every `<img>` has explicit `width` and `height` attributes

## Step 11 — Write CSS additions

Append to `template/styles.css`:

1. For each new `cc-*` variant: add to the existing component's CSS section
2. For each inline custom section: add under a new banner:
   ```css
   /* ---------- Page: <filename> ---------- */
   .<prefix>-<section-name> { … }
   ```
3. All new rules use `var(--<prefix>-*)` only — never raw values
4. Mark candidate-for-extraction sections with a comment:
   ```css
   /* TODO: extract to component if reused on another page */
   ```

## Step 12 — Update Pages Index in AGENTS.md

Find a `## Pages Index` heading (create one above `## Components Index` if missing). Append a row:

```markdown
| Page | File | Purpose | Sections | Status |
|------|------|---------|----------|--------|
| About | template/about.html | Company background and team | Hero, Stats, Team grid, Newsletter | Built 2026-05-27 |
```

If the table doesn't exist yet, create it with this header structure.

## Step 13 — Verify

1. **Class resolution**: grep every `class="..."` token in the new page against `template/styles.css`. Report any class with no rule (often a typo).
2. **No hardcoded values**: grep the new page and CSS additions for `#[0-9a-fA-F]{3,8}` and `[0-9]+px`. There should be none in the page; CSS may only use them inside `var(...)` fallbacks.
3. **Wrapper intact**: confirm the page contains exactly one `<div class="page-wrapper">` wrapping `<nav>` + `<main class="main-wrapper" id="main">` + `<footer>`.
4. **Image attrs**: every `<img>` has `width`, `height`, and `alt` attributes.
5. **Design system alignment re-check**: re-scan every `var(--<prefix>-*)` call in the written HTML and CSS against the known tokens set. Confirm every component base class exists in the known components set. Any new deviation not already acknowledged in Step 8 must be flagged to the user now — do not silently leave misaligned variables in the output.
6. **Browser check**: tell the user the dev-server command (`bun run dev` / `npx serve template` / whatever the project uses — check `package.json` / `AGENTS.md`) and ask them to open the page in a browser.

## Step 14 — Report

A concise summary:

```
✓ Built template/about.html (4 sections)
✓ Reused components: hero, stat (×3)
✓ Added variant: .<prefix>-card.cc-team
✓ Added inline section: .<prefix>-newsletter-strip (~25 lines CSS)
✓ Images: 3 downloaded, 1 placeholder (figma node 123:456 — download failed)
✓ Pages Index updated in AGENTS.md
⚠ Candidate for /component: newsletter-strip (used inline this page, extract if reused)
```

---

## Constraints

- **Never invent tokens** — if a Figma color/spacing/radius doesn't match an existing token, ask the user (resync via `/styleguide` or accept the nearest existing token)
- **Never prefix layout/utility/cc classes** — only brand component bases get the project prefix
- **Never modify `page-wrapper` / `nav` / `footer` structure** — they're global
- **Never add inline `style=""`** — use existing variables and combo classes
- **Never alter user-supplied copy** sourced from Figma, screenshots, reference URLs, or the prompt — preserve spelling, casing, punctuation and whitespace verbatim.
- **No silent proceeds** — Steps 3, 7, 8 are mandatory user gates
- **No silent deviations** — every token, variant, or component that doesn't align with the design-system skill must be flagged with ⚠ and confirmed by the user before writing. Never resolve a deviation silently by picking the nearest value, renaming, or omitting it.

## Portability rules

- Resolve the project prefix dynamically — never hardcode any project name
- Discover the design-system skill via glob — never hardcode a specific skill name
- Build the components inventory at runtime from `template/components.html`
- Use only project-relative paths (`template/...`, `AGENTS.md`, `.claude/skills/...`)
- Make no assumptions about specific section names — Figma layouts vary wildly per project
