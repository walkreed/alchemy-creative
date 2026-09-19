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

---

## Restyle before you rebuild

The original plan — author every component locally, then push the markup up — is **wrong for
any component MAST already provides**. Verified on the Nav, 2026-09-19.

The Webflow Nav is better than the one we built. It uses Webflow's native Navbar elements
(`NavbarWrapper`, `NavbarBrand`, `NavbarButton`, `NavbarMenu`, `NavbarLink`) plus real
`DropdownWrapper`s, so it ships responsive menu behaviour, a mobile menu button, a skip link
and a native dropdown that the client can edit in the Designer. Its CTA is a `ComponentInstance`
of the shared Button with a full prop set. Replacing that with our div-and-JS version would
trade working native behaviour for custom code the client cannot touch.

**So the rule is:**

| Component | Approach |
|---|---|
| MAST already provides it (Nav, Footer, CTA, Button, Card, Row, Column, Heading, Rich text, Image, Section, Accordion, Tabs) | **Restyle in place.** Query the component's structure, keep it, change only the properties that differ. |
| MAST has no equivalent (most page sections) | Build it, following MAST's structure and naming conventions. |

And the direction of sync inverts for the first group: **the static build mirrors the Webflow
component**, not the other way round. Our `template/` version exists so pages can be previewed
and reasoned about locally; Webflow holds the canonical structure.

### Why variables-first matters more than it looks

MAST's classes are already bound to the Theme roles. `.nav-dropdown_overlay` binds its
background to `Primary/Background`, `.nav-menu_btn-bar` to `Primary/Text`, `.nav-logo_link` to
`Primary/Accent`. Once the Theme collection held Alchemy's values, the nav inherited the whole
palette **without a single colour being restyled**. Only geometry needed changing.

Do the variables first and most of the "restyling" turns out to be already done.

### Watch for shared-variable couplings

`.nav-link` binds its padding to `Button/Vertical Padding` and `Button/Horizontal Padding`.
Setting the button's padding to the measured 1em/2em therefore inflated the nav links too.
MAST reuses component variables across unrelated components, so **after changing any
Components-collection variable, check what else consumes it** rather than assuming the change
is local.

### What the WHTML builder actually does (markup-only insert)

Better than the warnings suggest, with one silent failure:

- Structure maps natively and exactly — `div`/`ul`/`li`/`a` become Block/List/ListItem/Link.
- A `ul` produced exactly the authored `li` count. **No auto-spawned default ListItems.**
- Combo chains survive: `class="container cc-nav"` → `styleNames: ["container","cc-nav"]`.
- **It attaches only classes that already exist, and silently ignores the rest** while still
  returning `success`. A nav insert left 11 of 16 elements with no class at all.

So: `create_style` first, then insert — or insert, then `set_style` every element. And always
re-query the tree and read `styleNames`; the return value will not tell you.

### Check the site's class vocabulary before naming anything

The site's nav family is `.nav-menu` / `.nav-link` / `.nav-logo_link` — hyphen after the
component name, underscore only for a deeper element scope. Our build had used `.nav_menu` /
`.nav_link` / `.nav_logo`. **The site's convention wins**; query `query_styles` for a
component's vocabulary before authoring class names, because two parallel families for one
component is expensive to unpick later.
