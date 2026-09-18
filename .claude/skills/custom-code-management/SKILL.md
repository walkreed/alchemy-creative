---
name: custom-code-management
description: Add, review, or remove inline custom scripts in this portable static HTML/CSS Webflow project. Mirrors Webflow's site-level / page-level custom-code model but writes to local files (template/*.html) via a JSON registry + sync script — no Webflow MCP required. Use for analytics (GA, GTM), tracking pixels, chat widgets, or any custom JavaScript that must ship with the project before it is imported into Webflow.
---

# Custom Code Management (Portable)

A project-local alternative to the Webflow MCP custom-code skill. Mirrors Webflow's mental model — **site-level** scripts (apply to every page) and **page-level** scripts (apply to one page) — but stores everything in source-controlled local files so the project remains portable.

## Important Note

**Do NOT call any Webflow MCP tools for this project** (the project rules forbid Webflow MCP unless explicitly told). All operations are file-based.

## Architecture

```
template/
  custom-code.json        ← single source of truth (registry)
  *.html                  ← injection markers placed in <head> and before </body>
scripts/
  sync-custom-code.mjs    ← reads registry, rewrites marker blocks across pages
```

### Registry — `template/custom-code.json`

```json
{
  "site": {
    "header": [
      {
        "name": "Google Tag Manager",
        "version": "1.0.0",
        "canCopy": true,
        "source": "(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXXX');"
      }
    ],
    "footer": []
  },
  "pages": {
    "thanks.html": {
      "header": [],
      "footer": [
        { "name": "Conversion Pixel", "version": "1.0.0", "canCopy": false, "source": "gtag('event','conversion',{...});" }
      ]
    }
  }
}
```

- **`name + version`** combination must be unique within its scope (matches Webflow's constraint).
- **`source`** is raw JS — no `<script>` wrapper; the sync script adds it.
- Hard limit: **10,000 characters per script** (Webflow parity).
- `canCopy` is informational only — preserved so the registry round-trips to Webflow cleanly.

### Injection markers (HTML)

Every page in `template/` must contain these four marker pairs. Anything between the markers is owned by the sync script and will be overwritten.

```html
<head>
  ...
  <!-- custom-code:site:header:start -->
  <!-- custom-code:site:header:end -->
  <!-- custom-code:page:header:start -->
  <!-- custom-code:page:header:end -->
</head>
<body>
  ...
  <!-- custom-code:site:footer:start -->
  <!-- custom-code:site:footer:end -->
  <!-- custom-code:page:footer:start -->
  <!-- custom-code:page:footer:end -->
</body>
```

If a page is missing markers, the sync script inserts them at the correct location before writing.

### Sync script — `scripts/sync-custom-code.mjs`

Run with `node scripts/sync-custom-code.mjs`. The script:

1. Loads `template/custom-code.json`.
2. For each `.html` file in `template/`, ensures the four marker pairs exist (inserts before `</head>` and `</body>` if missing).
3. Rewrites each marker block with the matching scripts, wrapped in `<script data-custom-code="<scope>:<location>" data-name="<name>" data-version="<version>"> ... </script>`.
4. Pages not listed in `pages` get empty page-level blocks.
5. Prints a summary: which files changed, how many scripts of each scope/location.

## Workflow

### Phase 1 — Discovery
1. Read `template/custom-code.json` if it exists. If it does not, treat the registry as empty `{ "site": { "header": [], "footer": [] }, "pages": {} }` — do not create the file until a change is made.
2. List existing scripts grouped by scope (site/page) and location (header/footer). Include name, version, char count.

### Phase 2 — Planning & Confirmation
Before mutating the registry, present the diff and require explicit confirmation:
- Adding a script: user types **"add"**
- Updating a script (same name, new version or source): user types **"update"**
- Removing a script: user types **"remove"**
- Removing all scripts in a scope: user types **"delete all"** (warn first — list what will be lost)

### Phase 3 — Execution
1. Mutate `template/custom-code.json` (preserve key order; 2-space indent; trailing newline).
2. Run `node scripts/sync-custom-code.mjs`.
3. Report: registry diff + which HTML files changed.

### Phase 4 — Verification
1. Re-read the registry and confirm the change is present.
2. Spot-check one affected HTML file to confirm the marker block contains the expected `<script>` tag.
3. Remind the user this is local-only — when the project is imported into Webflow, the registry can be replayed via the Webflow MCP `custom-code-management` skill (matching field names: `displayName`, `version`, `location`, `canCopy`, `sourceCode`).

## Guidelines

- **No `<script>` tags inside `source`** — the sync script adds the wrapper (Webflow parity).
- **Header** for analytics (GA, GTM, Plausible); **footer** for chat widgets, conversion pixels, anything non-critical.
- **Page-level** scripts go in `pages["<filename>.html"]` keyed by the exact filename in `template/`.
- **Never inline scripts directly** into the HTML outside the marker blocks — they will not round-trip to Webflow and will be lost when the sync script runs.
- **External scripts**: if hosting on a CDN, the `source` should be the loader snippet (e.g. GTM bootstrap), not a `<script src="...">` tag — store the URL in a comment at the top of the source if helpful.
- **Bumping a version** is the recommended way to update an existing script — increment `version` and replace `source`.
- After any change, suggest committing `template/custom-code.json` and the touched HTML files together so the registry and rendered output stay in sync.

## First-run setup

If `template/custom-code.json` and `scripts/sync-custom-code.mjs` do not yet exist, create them as part of the first mutation. Do not scaffold them speculatively on a read-only "list" request.
