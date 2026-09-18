# Webflow Project Template

A static HTML/CSS scaffold and convention guide for building sites that are idiomatic for Webflow — written so an AI agent (or a human) can produce output that imports cleanly into Webflow Designer.

Copy this repo to start a client project. It ships unbranded: a neutral greyscale palette, system font stacks, and `[BRAND-NAME]` placeholders throughout.

The project is built around three artefacts:

1. **`AGENTS.md`** — the conventions an agent must follow (class architecture, page structure, breakpoints, accessibility, and the accumulated Webflow MCP transfer gotchas)
2. **`template/`** — a working static scaffold that demonstrates those conventions
3. **`site-scripts/`** — the site's JavaScript, bundled and served to Webflow from a pinned tag

Inspired by [MAST](https://www.nocodesupply.co/mast/docs).

---

## Starting a Client Project

1. Set the project name in `AGENTS.md` (`Project name:` under **Project Name**) — `CLAUDE.md` points at it, so agents pick it up automatically.
2. Run `/styleguide` to replace the placeholder tokens with the client's design system from Figma.
3. Find and replace `[BRAND-NAME]` across `template/` and the site-scripts snippet.
4. Point `GH_SLUG` in `site-scripts/build.sh` at the repo that will serve the bundle.

---

## Project Layout

```
.
├── AGENTS.md              ← Conventions for agents (read this first)
├── CLAUDE.md              ← Points at AGENTS.md
├── PAGE-LOG.md            ← Per-page build history (why, not just what)
├── README.md              ← You are here
├── template/              ← The static build
│   ├── index.html         ← Minimal home page — copy this to start a new page
│   ├── style-guide.html   ← Typography, color, spacing, buttons, forms, icons, cards, grid
│   ├── styles.css         ← Tokens, base classes, utilities, breakpoints
│   ├── assets/            ← Images and fonts
│   └── components.html    ← Created by /component on the first component — absent on a fresh project
├── site-scripts/          ← Site JavaScript: source modules, bundler, release pins
├── scripts/
│   ├── dev-server.mjs     ← Serves template/ against the LOCAL script bundle
│   └── sync-custom-code.mjs ← Mirrors Webflow's site/page-level inline scripts
└── .claude/
    ├── agents/            ← webflow-style-components-auditor
    └── skills/            ← /styleguide, /component, /page, /webflow-page, /webflow-transfer
```

---

## How to Use This Project

### 1. Read AGENTS.md first

Before adding anything, skim `AGENTS.md`. The non-obvious rules:

- **Four class types** with strict mixing rules: base, combo (`cc-`), utility (`u-`), custom
- **Mandatory page structure**: `page-wrapper` > `nav` > `main.main-wrapper` > `footer`
- **Desktop-first** breakpoints: 991px / 767px / 479px

### 2. Preview the template

Open the files directly in a browser — no build step:

```bash
open template/index.html
open template/style-guide.html
# open template/components.html   ← only once /component has created it
```

### 3. Build a new page

Copy `template/index.html`, rename it, and replace the contents of `<main class="main-wrapper">`. Do **not** modify the wrapper, nav, or footer markup — those are global components.

```html
<main class="main-wrapper" id="main">
  <section class="section">
    <div class="container">
      <div class="row">
        <div class="col col-lg-8 col-md-12">
          <!-- your content -->
        </div>
      </div>
    </div>
  </section>
</main>
```

### 4. Add a new component

Follow this order strictly:

1. Add CSS to `template/styles.css` — base class first, then any `cc-` variants
2. Add a live instance to `template/components.html` with a props/slots/variants comment block
3. If it introduces new tokens (color, spacing, etc.), demonstrate them on `template/style-guide.html`
4. Only then use the component in pages

### 5. Add a new utility or variant

- **Utility** (`u-*`) — single-purpose, uses `!important`, max 4 per element
- **Combo class** (`cc-*`) — modifier on a base class (`button cc-secondary`)

If an element needs more than 4 utility classes, promote them into a custom class.

---

## Class Cheat Sheet

| You want… | Use |
|-----------|-----|
| A button | `<button class="button">` |
| A secondary button | `<button class="button cc-secondary">` |
| A small ghost button | `<button class="button cc-ghost cc-sm">` |
| A 12-column grid row | `<div class="row">` with `<div class="col col-lg-X">` children |
| Centerd text | `class="u-text-center"` |
| Top margin | `class="u-mt-sm"` / `u-mt-md` / `u-mt-lg` |
| Hide on mobile landscape and below | `class="u-d-sm-none"` |
| A visual size that differs from the tag | `<h3 class="h2">` |
| A page section | `<section class="section">` with `<div class="container">` inside |

Full reference: `template/styles.css` and `template/style-guide.html`.

---

## Workflow with Agents

1. Agents reference `AGENTS.md` automatically (via `CLAUDE.md` symlink)
2. When asked to build a page, the agent will:
   - Copy structure from `template/index.html`
   - Reuse classes already defined in `template/styles.css`
   - Check `template/components.html` before creating new components
3. The `webflow-style-components-auditor` subagent (in `.claude/agents/`) reviews changes against AGENTS.md standards

### Useful commands

- "Build a [feature] page following the template" — produces a new HTML file matching the scaffold
- "Add a [component] to components.html" — adds CSS, live instance, and props documentation
- "Audit the style guide" — invokes the style/components auditor agent

---

## JavaScript

Site JavaScript lives in `site-scripts/` — source modules are concatenated into a
bundle by `./build.sh` and served to the live Webflow site from a pinned jsDelivr
tag. Webflow's footer custom code has a 10,000-character limit and no build step,
so pasting real JS into the Designer does not scale.

```bash
node scripts/dev-server.mjs        # serves template/ with the LOCAL bundle
```

The dev server mounts `site-scripts/`, rewrites the pinned jsDelivr URL to the
local copy, and rebuilds the bundle whenever a module is newer than it — so the
static pages run the code you are editing, not the published tag.

### The module contract

`page-init.js` defines `window.SitePage`; every module registers an init/destroy
pair against it:

```js
if (window.SitePage) window.SitePage.register({ init, destroy });
else init(document);
```

- `init(scope)` runs on first load and on every `SitePage.reinit(newScope)`.
  Always query inside `scope`, never `document`.
- `destroy()` releases all global state — listeners, rAF loops, observers, GSAP
  tweens and ScrollTriggers, WebGL contexts.

Re-init exists because some markup arrives after first paint: a CMS load-more, a
modal's contents, a page swapped in by an SPA transition layer.

Copy `site-scripts/example-module.js` to start a new module, add its basename to
the `core` array in `build.sh`, run `./build.sh`, and commit the module together
with the regenerated bundle. Full details, including the release procedure, are
in [site-scripts/README.md](./site-scripts/README.md).

### Rules

- Target `data-*` attributes or IDs, **never classes** — classes belong to
  styling, and a designer renaming one in Webflow must not break the JS
- Early-exit when the elements are absent; the bundle ships to every page
- Always respect `prefers-reduced-motion`, and still reveal anything that was
  pre-hidden for the animation
- Gate any CSS pre-hide on `.site-js` (added by `page-init.js`) so no-JS visitors
  still see the content

---

## Moving to Webflow

When the static scaffold is ready to import to Webflow:

1. **Variables** — the `:root` custom properties in `styles.css` become Webflow Variables (recreate them in the Designer using Title Case with spaces, e.g. `Gap Main`)
2. **Base classes** (`.button`, `.row`, `.col`, etc.) — recreate as Webflow classes with the same names
3. **Combo classes** (`.cc-secondary`, etc.) — add as combo classes on the relevant base
4. **Components** — convert each block in `components.html` into a Webflow Component with the props/slots/variants documented in the comment block
5. **Custom code** — paste `styles.css` into a Custom Code component at the top of the Navigator
6. **Remove `:root`** — once Variables are recreated in Webflow, delete the static `:root` block (Webflow manages `:root` itself)

See the **Webflow-Specific Gotchas** table in `AGENTS.md` for traps to avoid during this step.

---

## Conventions Reminder

- **Spelling**: US English (`color`, `center`, `behavior`) in Claude-authored copy; never alter user-supplied copy
- **MCP**: Do not use Webflow MCP unless explicitly told
- **Accessibility**: every page includes a skip link, semantic landmarks, alt text, and respects `prefers-reduced-motion`
- **No `transition: all`** — always target specific properties
- **No JS class hooks** — JavaScript targets `data-*` attributes or IDs, never classes

---

## Further Reading

- [AGENTS.md](./AGENTS.md) — full conventions reference
- [MAST docs](https://www.nocodesupply.co/mast/docs) — the framework that inspired this approach
