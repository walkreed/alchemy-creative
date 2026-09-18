# The Alchemy Build Process

Our pipeline for taking a Figma design to a live Webflow site. Adapted from the
`webflai-ai-workflow-template` (Samuel Gregory / MAST), with one stage added at the front.

**The local `template/` build is the source of truth — always.** Webflow is a publishing
target, not a place we author. When a client asks for a change we change the static files
and re-sync upward. Never the reverse; divergence between the two is the main failure mode.

---

## The stages

| # | Stage | Skill | Produces |
|---|-------|-------|----------|
| 0 | **Figma style guide** | `/figma-styleguide` | A Style Guide page inside the Figma file, derived from the page comps |
| 1 | Static design system | `/styleguide` | `template/styles.css` + `template/style-guide.html` + a project design-system skill |
| 2 | Components | `/component` | `template/components.html` entries + base CSS, one at a time |
| 3 | Pages | `/page` | `template/<page>.html` + page-scoped CSS |
| 4 | Scripts | — | `site-scripts/` bundle, tagged and served from jsDelivr |
| 5 | Transfer | `/webflow-transfer` | Fonts → Variables → Classes → Style guide → Components, in that order |
| 6 | Per-page transfer | `/webflow-page` | One page replicated pixel-exact |

### Why stage 0 exists

This is our addition. Designs routinely arrive as finished page comps with no style-guide
artifact — the system is implicit in the work rather than written down anywhere. Stage 0
makes it explicit and, just as importantly, produces something deliverable to the client.

It derives rather than invents: it reads the file's existing paint styles, text styles and
variables, then **measures** real auto-layout gaps, padding and radii across every page frame
and builds the spacing scale from observed frequency. It also derives the **theme model** by
mapping every text fill to its nearest filled ancestor background, which is what later becomes
the Webflow `Mode` variable collection. Every number traces to a named style or a measurement.

The artifact is **documentation for the agent first**. Completeness and unambiguity matter;
visual polish in Figma does not. Its most valuable output is often the list of gaps —
untokenised colors, near-duplicate accents, one-off instances that contradict the pattern.
Those get raised as questions, never silently resolved.

Stage 1 then imports that artifact instead of guessing from comps.

---

## Order is not negotiable

Two orderings cause most of the pain, and both are cheap to get right:

**Design system before components before pages.** The design-system skill generated in
stage 1 is what constrains the agent later. Build a page first and it invents tokens that
then have to be reconciled backwards.

**Fonts → Variables → Classes → Components on transfer.** Create classes before fonts exist
and every `font-family` silently falls back to a system face. Create them before variables
exist and values bake in as literals, so the design system "isn't there" even though the
site renders.

---

## Non-negotiable authoring rules

These exist because Webflow's style model cannot represent certain CSS. Breaking them
produces a site that imports looking broken.

- **Webflow-flat selectors.** No descendant (`.a .b`), child (`.a > .b`), or `:nth-child`
  styling. Style each element on its own class or a combo (`.base.cc-x`). Per-item variation
  uses explicit `.cc-1` / `.cc-2` combos in the markup.
  - *Only* allowed descendant: the color/mode cascade (`.parent.cc-light .child`), which
    Webflow reproduces natively via variable modes.
  - Runtime/JS-state rules (`[data-*]`, `[open]`, `.is-*`) go in a custom-code embed.
- **Never declare custom properties on `:root`** once in Webflow — Webflow owns `:root`.
- **JS targets `data-*` attributes or IDs, never classes.** A designer renaming a class in
  the Designer must not break behaviour.
- **No `transition: all`.** Target specific properties.
- Every page keeps the `page-wrapper > nav > main.main-wrapper > footer` structure.

Self-check before committing CSS:

```bash
grep -nE '\.[a-z][a-zA-Z0-9_-]*(\.[a-zA-Z0-9_-]+)*\s+\.[a-zA-Z_-]|\s>\s*\.|:nth-child' template/styles.css
```

Only mode cascades and flagged embeds should appear.

---

## Verify, don't trust

The Webflow WHTML builder returns `success` while silently discarding an entire CSS block,
and caps class creation at roughly 50 per insert — dropping a *different* random subset each
run. Agent self-reports are not evidence.

After any "component complete" or "page transferred" report, independently re-query the
element tree (`get_all_elements` / `query_elements`) and confirm `styleNames` are attached to
the right elements. Nav and footer especially — a gap there shows up on every page.

The same discipline applies in Figma: read back `fontSize` and `height` on a node rather
than judging from a downscaled screenshot.

---

## Environment notes

- **Webflow MCP** is wired in `.mcp.json`. `AGENTS.md` deliberately forbids using it except
  during an explicit transfer, so only the transfer skills touch the live site.
- **Figma MCP** is connected at the app level, not in `.mcp.json`.
- **Browser** — keep a browser available so pages can be checked during `/page`.
- **Models** — Opus/Fable on high for stages 0–3, where the foundation is set. Drop to Sonnet
  for incremental edits once the design system exists.
