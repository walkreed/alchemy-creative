---
name: webflow-transfer
description: "Transfer a static template/ design system + page(s) into Webflow via the Webflow MCP, in the correct order: flatten selectors → fonts → variables → classes → style-guide → components. Deterministic-first (create_style/set_style/update_style over the lossy WHTML builder). Flattens descendant/child/nth-child selectors Webflow can't represent, routes mode cascades to variable modes and runtime-state rules to custom-code embeds, matches uploaded custom-font family names, and binds every style property to Webflow Variables instead of literals. Use when the user wants to push/upload/import/sync a template/ build (style guide, page, or components) into Webflow, or runs /webflow-transfer."
---

# Webflow Transfer

Push a static `template/` build (the `/styleguide`, `/page`, `/component` output) into Webflow as **native elements + reusable classes + real Variables**, using the Webflow MCP.

This skill exists because the WHTML builder is lossy and order-sensitive. Doing the phases out of order (e.g. classes before fonts/variables) produces fallback fonts, literal values instead of tokens, and duplicate suffixed classes that are painful to clean. **Follow the order.**

## Golden order (do NOT reorder)

0. **Stylesheet pre-flight** — flatten selectors Webflow's per-element class model can't represent (descendant/child/`nth-child`). Do this in `template/styles.css` **before** transferring, not ad-hoc during it. See Phase 0.
1. **Fonts** — must exist on the site *first* so classes can reference the exact uploaded family name.
2. **Variables** — create all design tokens as Webflow Variables before any class, so classes bind to them (not literals).
3. **Classes** — create reusable styles and attach them to native elements; bind every property to a variable.
4. **Style-guide page** — populate the style-guide if the project has one.
5. **Components** — extract repeated patterns into Webflow components last, once their classes/variables exist.

## Deterministic-first (read this before Phase 3)

Webflow has **two** ways to create classes: the `data_whtml_builder` (`css` param) and the deterministic `data_style_tool` (`create_style` + `set_style` + `update_style`). The builder is fast but **lossy** — it silently drops whole `css` blocks on `!important`/shorthand/pseudos/gradients, caps at ~50 new classes per insert, and mints `inline-*` junk from inline styles. **Prefer the deterministic path for all styling.** Use the builder *only* to lay down structure (markup → native elements), with **no `css` param and no inline `style=""`**, or skip it entirely and build elements with `data_element_builder`. Every visible bug class — "missing styles", "section looks unstyled", suffixed duplicates — comes from styling *through* the builder. Don't.

## Prerequisites & setup

- Webflow MCP connected. Call `webflow_guide_tool` once, then `data_sites_tool > list_sites` to resolve `site_id` (never assume it). Resolve the target page via `data_pages_tool > list_pages` / `create_page`.
- A `template/` build to transfer (`template/styles.css`, `template/style-guide.html`, `template/components.html`, page files). Read `AGENTS.md` for the project prefix and conventions.
- Read `template/styles.css` `:root` block — it is the source of truth for the tokens (colors, fonts, sizes, spacing, radii, modes).

---

## Phase 0 — Stylesheet pre-flight (flatten selectors)

Webflow styles are **per-element class lists** — a class or a combo chain (`.base.cc-x`) applied to *one* element. It has **no representation** for a descendant (`.a .b`) or child (`.a > .b`) selector, and no `:nth-child`. If `styles.css` styles a child *through* its parent, that rule has nowhere to live in Webflow and the child renders **unstyled** — this is the #1 cause of "the section doesn't look right" even when every element has a class attached. Fix it in the source stylesheet first.

**Find every offending selector:**
```bash
grep -nE '^\s*\.[a-zA-Z_-][a-zA-Z0-9_-]*(\.[a-zA-Z0-9_-]+)*\s+(\.[a-zA-Z_-]|>|\[)|\s>\s*\.|:nth-child' template/styles.css | grep -vE '^\s*/\*'
```

Then triage each match into one of four buckets — **only B and C require editing `styles.css`:**

| Bucket | Looks like | Webflow translation | Edit styles.css? |
|--------|-----------|---------------------|------------------|
| **A. Mode cascade** | `.footer.cc-dark .footer_link`, `.cc-light .card`, `.section.cc-light .heading` | **Keep the selector.** This is exactly what **variable modes** are for: bind the child's flipped props to **Mode** vars, then `set_style_variable_mode` (Light/Dark) on the `.cc-*` combo — it cascades to descendants (Phase 3d). | **No** |
| **B. Structural child/descendant** | `.nav > .container`, `.form_form .input`, `.split.cc-stacked .media` | **Flatten** to a combo on the *child*: `.container.cc-nav`, `.input.cc-form`, `.media.cc-stacked`. Move the overridden props onto that combo (base class still cascades, so only put the genuine overrides there). Add the combo class to the child in **every** HTML page that uses it. | **Yes** + markup |
| **C. nth-child fans** | `.grid > .card:nth-child(1)`, `.grid .item:nth-child(2)` | **Flatten** to explicit `.cc-1/2/3…` combos on each child in the markup; move the per-position props onto `.card.cc-1` etc. | **Yes** + markup |
| **D. Runtime / JS state** | `.js-flag …[data-x]`, `.item[open] > …`, `.is-armed`, `.is-scrollspy` | **Don't classify.** These are interaction/animation guards keyed on JS-toggled classes/attributes. Ship them as a Webflow **Custom Code CSS embed** (Designer → page/site custom code), and keep them out of the transferable Designer class set. Flag them in the hand-off. | **No** (embed) |

Rules of thumb: a `.cc-*` in the selector + color/bg/border props → almost always **A** (mode). A bare structural class chain or `> .container` → **B**. `:nth-child` → **C**. A `.is-*` / `[data-*]` / `[open]` / a JS-only flag class (`.js-*`) → **D**.

After flattening B and C, re-run the grep: the only descendant selectors left should be bucket A (mode) and bucket D (which you'll list as embeds). Now the stylesheet maps 1:1 onto Webflow's model and Phase 3 is deterministic.

> **Authoring going forward:** new pages/components should be **Webflow-flat from the start** — no descendant/child/`nth-child` for structural styling; use combos and `.cc-N`. The only allowed descendant pattern is the mode cascade (bucket A). See `AGENTS.md` → CSS Architecture.

---

## Phase 1 — Fonts (FIRST)

Custom fonts must be on the site and you must reference their **exact Webflow family name**, which is normalised and rarely matches the design's CSS name.

1. `data_fonts_tool > list_fonts` (paginate; sites can have 100+ faces). Record each distinct `fontFamily`.
2. Map each font referenced in `styles.css` (the `--<prefix>-font-*` vars / `@font-face` names) to a real uploaded family. **Webflow normalises uploaded family names** — it condenses casing/spacing and often appends a cut/style descriptor, so the registered name rarely equals the design's CSS name. Always copy the exact `fontFamily` string from `list_fonts`, and match the **cut/weight the design actually used** (read the `@font-face` filenames in `styles.css`).
   - *Illustrative only:* a design family `"Foo Bar"` (cut 25) might register as `Foobar 25 Trial`; `"Baz Display TRIAL"` as `Bazdisplaytrial`. Never assume — look it up per site.
3. **Missing fonts:**
   - Google / externally-hosted fonts (the ones loaded via a `<link>` in the static build) do **not** transfer. `data_fonts_tool` only manages *custom* uploads. Tell the user to add them in **Designer → Site Settings → Fonts → Google Fonts**, or upload `.woff2`/`.otf` as custom fonts (two-step: `create_font` → POST bytes to the presigned upload; see `webflow://guides/font-upload`). Do not proceed assuming they exist — flag them by name.
   - If the user has font files locally (`template/assets/fonts/`), offer to upload them via `create_font`.
4. Output a font-name map (`design name → Webflow family`) to use in Phase 2.

**Do not skip this.** If you create classes first, every `font-family` silently falls back to a system font.

---

## Phase 2 — Variables (before any class)

Recreate the `:root` tokens as Webflow Variables so classes bind to them. Resolve literals to variables — **don't bake literals into classes**.

1. Create collections mirroring the token groups: **Color**, **Typography** (font-family + size vars), **Spacing**, **Radius**, and a **Mode** collection for theming. `data_variable_tool > create_variable_collection`.
2. Create the variables:
   - Colors → `create_color_variable` (static hex).
   - Font families → `create_font_family_variable`, value = the **exact uploaded family name** from Phase 1.
   - Font sizes / spacing / radii → `create_size_variable` (`{value, unit}`).
   - Numbers/percentages → the matching `create_*_variable`.
3. **Modes / theming:** if the design has a light/dark inversion (`.cc-light` redefining `--mode-*`), create the Mode collection with a second mode (`create_variable_mode`), then set each mode var's value per mode (`update_color_variable` with `mode_id`). Optionally alias Mode vars to Color vars (`existing_variable_id`) for a clean graph.
4. Keep every returned `variable id` and `cssName` (looks like `--_<collection>---<name>`) — you need ids for binding and cssNames for the WHTML `css` string.

---

## Phase 3 — Classes (native elements, bound to variables)

### 3a. Insert the markup as native elements
Lay down **structure only** — the goal here is native elements in the right tree, *not* styling (that's 3b/3c, done deterministically). Two options:
- **Preferred:** `data_element_builder` / `data_whtml_builder` with **markup only** — no `css` param, no inline `style=""`. You get native elements carrying class *names* as attributes, with zero lossy style creation.
- If you do pass `css` to the builder, treat it as a last resort and respect **every** constraint below — violating any one silently drops the **entire** css block (HTML still inserts, call still returns `success`, **zero classes attach**):
  - **No `!important`.**
  - **Class selectors only** — no bare tags (`h1`, `p`, `table`), **no descendant/child selectors** (`.a .b`, `.a > .b`), no `:nth-child`/`:has`. Combos (`.btn.cc-lg`) are fine. (Phase 0 should have already removed these from the source.)
  - **No shorthand that expands to multiple props** in practice (`border`, `padding`, `margin`, `gap`, `border-radius`, multi-gradient `background`, `aspect-ratio`, `mask`, multi-value `transition`) — author longhand/single-value.
  - **No** `@keyframes`, `@import`, `@font-face`, `:root`, `<style>` tags.
  - **Only Webflow breakpoints:** `@media screen and (max-width:991px|767px|479px)`.

**Per-insert class-creation cap (~50 new classes):** a big page silently drops a *different* random subset each run. This is a builder-only failure — another reason to keep the builder to structure and create classes via `create_style` (below), which has no such cap.

**Verify structure, never trust `success`:** after inserting, `get_all_elements` / `query_elements` and confirm the tree — the builder reports `success` even when it dropped the css block or half the classes.

**Native vs DOM (prioritise native):** `<table>`/`<thead>`/`<tr>`/`<td>`, sometimes `<article>`/`<span>` import as **DOM nodes** — class becomes a plain attribute, subtree is opaque, unstyleable by class. **Rebuild these as `div` grids.** Avoid inline `style=""` (the builder mints an `inline-div-N` class and may drop the authored class).

**Reserved names:** Webflow rejects `h1`–`h6` as class names (builder *and* `create_style`). Put the visual size on a non-reserved class (e.g. `*-text-display-*`) applied to the real heading element.

### 3b. Fill gaps deterministically
For classes the cap dropped, `data_style_tool > create_style` (reliable), then `set_style` to attach to the native elements. `set_style` **replaces the element's full class list** — pass base + every combo (`["ramp__sample","text-display-xl"]`). Get element ids from `get_all_elements` (parse the persisted file if it's large) and reconstruct full ids from the short suffix.

### 3c. Bind every property to a variable
Don't leave literals. With `create_style`/`update_style`, set `variable_as_value: "<variable_id>"` per property:
- One variable per single value; **longhand only** — bind each of the 4 `border-*-radius` corners, 4 `border-*-color` sides, each `padding-*`/`margin-*` side.
- Gaps are stored as **`grid-column-gap`/`grid-row-gap`** — bind those (binding `gap`/`row-gap` throws an internal error).
- **EXCEPTION — `font-family`: set the literal family name, NOT the variable.** Webflow's font system is built around the font *picker*; a `font-family` bound to a variable doesn't reliably apply on the Designer canvas — it renders a fallback until you click the font control and click away ("nudge"). Set `property_value` to the **exact uploaded family name** (e.g. `"Sharpgrotesk 25 Trial"`, `"Gesturadisplaytrial"`) instead of `variable_as_value`. You can still *create* the `Font *` variables as design-token reference, but bind classes to the literal. (Google-font families like Inter/Lekton must also be added in Designer → Site Settings → Fonts, or they fall back regardless.)
- Mode-driven props (text/bg/stroke) bind to the **Mode** vars; static props bind to Color/Spacing/Radius/Typography vars.
- Generate the (often 200+) bind ops with a small script and batch them through `update_style` (many actions per call). Skeleton:

```python
# build update_style actions: per style, {property_name, variable_as_value}
def corners(v): return {f'border-{c}-radius':v for c in ['top-left','top-right','bottom-left','bottom-right']}
def sides(v):   return {f'border-{s}-color':v  for s in ['top','right','bottom','left']}
def gap(v):     return {'grid-column-gap':v,'grid-row-gap':v}
# STYLES = [(name, parent_or_None, {prop: VARID}), ...]  → emit update_style actions, batch ~20/call
```

### 3d. Theming
Apply the light/dark mode by setting the Mode collection's mode on the modifier combo: `set_style_variable_mode` on e.g. `cc-light` (with `parent_style_names` = the base it's used with). It cascades to descendants. Set it on the combo the element **actually uses** (watch for suffixed bases).

---

## Phase 4 — Style-guide page

If `template/style-guide.html` exists, populate the corresponding Webflow page using Phases 1–3 (it's just a page whose classes are the design system). Fix the page slug/SEO. This becomes the living reference for the tokens/classes.

---

## Phase 5 — Components (LAST)

Only after classes + variables + (ideally) the style guide exist:
- For each entry in `template/components.html` / the Components Index, build it with `data_component_tool` / `data_component_builder` (`create_blank_component`, `transform_element_to_component`, props/slots/variants).
- Map Webflow **Variants → `cc-*` combo classes**, **Props → Text/Image/Link/etc.**, **Slots → child regions**.
- Reuse the classes/variables already created — don't re-create styles inside components.

---

## Verification & cleanup

- Verify with `query_styles` / `query_elements` (check `styleNames` actually attached + properties bound to `{id: variable-…}`). `element_snapshot_tool` only works with a live Designer session open on the page.
- **Builder residue to purge** if an earlier builder pass ran: `inline-div-*` / `inline-p-*` / `inline-section-*` (minted from inline `style=""` — the real class was likely dropped on that element; re-attach it with `set_style`) and suffixed duplicates (`ramp-1`, `tokens-table-1`, `_w-input-1` — a second copy of an existing name). Grep the live style dump for `inline-` and `-[0-9]+$` and reconcile before continuing.
- **Cleanup is hard once duplicates exist** — `remove_style`/`rename_style` are name-based and can't disambiguate duplicate names (global vs combo, used vs orphan). Best defence: clean stylesheet + per-section inserts from the start. To free a clean name that's taken, re-point its *minority* user onto the suffixed name, delete the freed name, then `rename_style` (propagates to combos + their variable modes).
- Confirm before **publishing** (`data_sites_tool > publish_site`) — it's outward-facing.

## Hand-off notes to always surface
- Which Google fonts the user must still add (Phase 1).
- Any class/property left as a literal (e.g. non-token one-off values) or any suffixed-name residue.
- That the site is not published until they confirm.

> Full rationale and examples live in `AGENTS.md` → "Transferring the Static Build into Webflow (via Webflow MCP)". Keep both in sync.
