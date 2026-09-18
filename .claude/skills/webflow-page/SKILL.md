---
name: webflow-page
description: "Transfer ONE static template/ page into Webflow as a pixel-exact replica via the Webflow MCP — strict fidelity of HTML structure and CSS, native Webflow elements only (no DOM/opaque nodes), classes bound to Variables not literals, and a mandatory head-CSS report listing every rule that cannot live as a Designer class and must be pasted into Webflow custom code. Use when the user wants to push/import/replicate/mirror a single template/*.html page into Webflow, or runs /webflow-page. For a whole design-system + multi-page + component transfer in order, use /webflow-transfer instead."
---

# Webflow Page Transfer (strict, single page)

Replicate **one** `template/*.html` page inside Webflow so the Designer output matches the static source **exactly** — same DOM structure, same computed styles, same responsive behaviour — built from **native Webflow elements** (never opaque DOM nodes), with every style property bound to Webflow **Variables**, and with a **complete head-CSS report** at the end listing every rule that Webflow's class model cannot hold and that you must paste into custom code.

This is the narrow, high-fidelity sibling of `/webflow-transfer`. Use it when the design system (fonts + variables + base/component classes) **already exists in Webflow** and the job is to faithfully reproduce a specific page. If fonts/variables/classes are NOT yet in Webflow, run `/webflow-transfer` first (or Phases 1–3 of it), then return here.

**The contract:** when you finish, opening the page in Webflow Designer and viewing the live static file side by side should be indistinguishable at every breakpoint. Any deviation you cannot reproduce natively must be explicitly reported, not silently dropped.

---

## Non-negotiable rules

1. **Exact structure.** The Webflow element tree mirrors the source DOM node-for-node — same tags, same nesting, same order, same `page-wrapper > nav / main / footer` skeleton. No collapsing wrappers, no "close enough" restructuring.
2. **Native elements only.** Every node must be a real Webflow element carrying real Designer classes. If a tag imports as an opaque DOM node (`<table>`, sometimes `<span>`/`<article>`), rebuild it as `div` structures so it takes classes. Verify — never assume.
3. **No literals where a token exists.** Every color, size, spacing, radius, font-size property binds to the matching Webflow Variable (`variable_as_value`). Literals are only allowed for genuine one-offs that have no token, and each one must be listed in the hand-off.
4. **Deterministic styling.** Create/attach classes with `data_style_tool` (`create_style` / `set_style` / `update_style`). The `data_whtml_builder` `css` param is lossy and banned for styling here — use the builder for **markup only** (no `css`, no inline `style=""`), or build with `data_element_builder`.
5. **Nothing invisible gets dropped.** Any source CSS that cannot become a Designer class (runtime state, pseudo-elements, keyframes, descendant selectors that aren't mode cascades) goes into the **Head-CSS report** and gets pasted into Webflow custom code. Silence is a failure.
6. **Verify, don't trust `success`.** After every insert, re-query the element tree and confirm `styleNames` are attached to the right elements and properties are bound to variables. The builder returns `success` even when it dropped the entire css block or half the classes.

---

## Prerequisites

- Webflow MCP connected. Call `webflow_guide_tool` once, then `data_sites_tool > list_sites` → resolve `site_id` (never assume). Resolve/create the target page with `data_pages_tool > list_pages` / `create_page`.
- **Design system already in Webflow.** Confirm fonts, Variables, and base classes exist (`data_fonts_tool > list_fonts`, `data_variable_tool` list, `data_style_tool > get_styles`). If they don't, stop and run `/webflow-transfer` Phases 1–3 first — this skill will not re-create the token system.
- The source page: `template/<page>.html` + `template/styles.css`. Read `AGENTS.md` for the project prefix, the Pages Index row for this page, and the Components Index.

---

## Step 1 — Resolve the page to its exact class + selector set

Do this before touching Webflow. You are building an inventory of *everything the page renders* so nothing is missed.

1. **Read the page HTML** and list every element with its full class list, in DOM order. This is your build checklist.
2. **Extract every CSS rule that applies to the page** from `template/styles.css`:
   - The page-local block (`/* Page: <page>.html */` banner).
   - Every base/combo/utility/custom class used in the markup (grep the classes out of the HTML, then pull their rules).
   - All `@media` blocks touching those classes (desktop-first: 991 / 767 / 479).
3. **Classify every selector into the fidelity buckets** (Step 2). This partitions the work into "Designer classes" vs "Head-CSS report".

Keep this inventory — you will check off each element and each rule as you go, and the leftover un-translatable rules ARE the head-CSS report.

---

## Step 2 — Selector triage (what becomes a class vs what goes in the head)

Webflow styles are **per-element class lists** — a class or a combo chain (`.base.cc-x`) on *one* element. It has **no representation** for descendant (`.a .b`), child (`.a > .b`), `:nth-child`, `:hover`/`::before`/`::after`, `@keyframes`, or attribute/state selectors. Every rule falls into exactly one bucket:

| Bucket | Looks like | Destination | Action |
|--------|-----------|-------------|--------|
| **A. Mode cascade** | `.section.cc-light .heading`, `.footer.cc-dark .footer_link` | **Variable modes** (native) | Bind the child's flipped props to **Mode** variables, then `set_style_variable_mode` (Light/Dark) on the `.cc-*` combo — it cascades to descendants. Do NOT flatten, do NOT put in head. |
| **B. Structural child/descendant** | `.nav > .container`, `.form_form .input` | **Flatten → combo class** | Create a combo on the *child* (`.container.cc-nav`), move the overridden props there, attach it to that element in Webflow. (Ideally already flattened in source per AGENTS.md — if not, flatten in `template/styles.css` first so source and Webflow stay in sync.) |
| **C. nth-child fans** | `.grid > .card:nth-child(2)` | **Flatten → `.cc-N` combos** | Give each child an explicit `.cc-1/2/3` combo; move per-position props onto those. Attach in Webflow. |
| **D. Runtime / JS state** | `.js-ready …`, `[data-*]`, `[open]`, `.is-armed` | **HEAD-CSS report** | Cannot be a Designer class. Goes verbatim into Webflow custom code (head or page). List it. |
| **E. Pseudo-elements / states** | `::before`, `::after`, `:hover`, `:focus`, `:has()` | Split | `:hover`/`:focus` on a *single class* → apply via `update_style` with the `pseudo:` param (native). `::before`/`::after` content, `:has()`, complex pseudos → **HEAD-CSS report**. |
| **F. @keyframes / @font-face / @import** | `@keyframes fade-in {…}` | **HEAD-CSS report** | Builder rejects these outright. Paste into custom code. |

**The head-CSS report = buckets D, F, plus every E rule that isn't a simple single-class `:hover`/`:focus`.** Track these from the first read — do not wait to "discover" them at the end.

Run the sweep to be sure you caught them all:
```bash
grep -nE ':hover|:focus|:has\(|::before|::after|:nth-child|@keyframes|@font-face|\[data-|\[open\]|\.is-' template/styles.css
```

---

## Step 3 — Insert the markup as native elements (structure only)

- **Preferred:** `data_element_builder`, or `data_whtml_builder` with **markup only** — no `css` param, no inline `style=""`. You get native elements carrying class *names* as attributes and zero lossy style creation.
- **Reserved names:** Webflow rejects `h1`–`h6` as class names. Put the visual size on a non-reserved class (e.g. `<prefix>-text-display-*`) on the real heading element.
- **Native vs DOM:** `<table>`/`<thead>`/`<tr>`/`<td>` and sometimes `<span>`/`<article>` import as opaque DOM nodes — rebuild as `div` grids so they take classes. Avoid inline `style=""` (the builder mints an `inline-div-N` junk class and may drop the authored class).
- **Chunk large pages** — the builder silently drops classes past ~50 new per insert (a different random subset each run). Insert **per section**, verify, then the next. (Since we style deterministically, most classes should already exist from the design system — the builder is only laying down structure.)
- **Verify after every insert:** `get_all_elements` / `query_elements`, confirm the tree matches the source node-for-node and each element carries its class attribute.

---

## Step 4 — Attach classes + bind every property to a Variable

For each element, `set_style` the full class list (base + every combo — `set_style` **replaces** the element's whole list, so pass all of them). Then ensure each class's properties are bound to Variables:

- If the class already exists from the design system, reuse it — do not re-create it (that spawns suffixed duplicates like `-1`).
- For page-local classes, `create_style` then bind properties with `update_style` `variable_as_value: "<variable_id>"`.
- **Longhand only.** Bind each of the 4 `border-*-radius` corners, 4 `border-*-color`/`padding-*`/`margin-*` sides individually. Gaps are stored as **`grid-column-gap`/`grid-row-gap`** — bind those (binding `gap`/`row-gap` errors).
- **`font-family` EXCEPTION — set the literal family name, not the variable.** A `font-family` bound to a variable doesn't reliably apply on the Designer canvas (renders a fallback until you "nudge" the font control). Use the **exact uploaded Webflow family name** (from `list_fonts`) as the literal `property_value`. Google-font families must be added in Designer → Site Settings → Fonts or they fall back regardless.
- **Responsive:** re-create each `@media (max-width:991|767|479)` override on the same class at the matching Webflow breakpoint (`update_style` with the breakpoint arg). Webflow is desktop-first, matching the source cascade — mirror it exactly.
- **Mode cascade (bucket A):** bind flipped props to Mode variables, then `set_style_variable_mode` on the `.cc-light`/`.cc-dark` combo (with `parent_style_names` = the base it's used with). It cascades to descendants — no head CSS needed.

---

## Step 5 — Head-CSS report (MANDATORY — the whole point)

Assemble every rule from buckets **D, F, and the complex-E** cases into a single copy-paste block, and present it to the user with exact instructions. **Never finish without this**, even if the block is empty (say so explicitly).

For each rule, give: the selector, the CSS verbatim, *why* it can't be a Designer class, and *where* it goes (site head vs this page's custom code).

Format the hand-off like this:

```
## Head CSS — paste into Webflow custom code

These rules cannot be represented as Designer classes and must be added manually.

### Site-wide → Site Settings → Custom Code → Head Code
(runtime-state selectors, keyframes shared across pages)

<style>
@keyframes fade-in { /* …verbatim… */ }
.accordion-item:not([open]) > .accordion-item_body { display: none; }
.accordion-item[open] .accordion-item_indicator::before { content: "−"; }
/* …etc… */
</style>

### Page-level → Page Settings → Custom Code → Inside <head>  (this page only)
<style>
/* page-scoped runtime/pseudo rules */
</style>

Reason each rule is here: [selector] → [bucket D: keyed on [open] JS state | bucket F: @keyframes | bucket E: ::before content toggle …]
```

Cross-check against `AGENTS.md` → Libraries → "Head freeform `<style>` = the runtime-state CSS bucket": if the project already documents a canonical head-CSS block in Webflow, **reconcile with it** (add missing rules, don't duplicate) rather than inventing a parallel one.

---

## Step 6 — Verify fidelity (do not skip)

- `query_styles` / `query_elements` on the page scope: confirm every element's `styleNames` are attached and properties are bound to `{id: variable-…}`, not literals (except `font-family`).
- Walk the source DOM checklist from Step 1 and tick off every element as present in Webflow with the correct classes.
- Confirm every media-query override was recreated at the right breakpoint.
- Confirm bucket-A mode combos carry the variable mode.
- **Builder residue** to purge if any builder pass touched styles: `inline-div-*`/`inline-p-*` (minted from inline styles — the real class was likely dropped; re-attach with `set_style`) and suffixed duplicates (`*-1`, `*-1-2-3`). Grep the live style dump for `inline-` and `-[0-9]+$`.
- `element_snapshot_tool` gives a visual check but needs a live Designer session open on the page (fails headless) — offer it if the user has Designer open.

---

## Hand-off — always surface

1. **The Head-CSS report** (Step 5) — the primary deliverable. What to paste, where, and why.
2. Any Google/external fonts the user must still add in Designer (they don't transfer via MCP).
3. Any property left as a **literal** because it had no token, and any suffixed-name residue.
4. Anything you could NOT reproduce natively and chose not to fake — call it out explicitly.
5. The page is **not published** until the user confirms (`data_sites_tool > publish_site` is outward-facing — ask first). Custom-code/freeform edits are not live until the site is published.

> Rationale, MCP gotchas, and the canonical head-CSS bucket live in `AGENTS.md` → "Transferring the Static Build into Webflow" and Libraries. Keep this skill and `/webflow-transfer` in sync with it.
