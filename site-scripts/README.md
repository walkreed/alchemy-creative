# site-scripts

The JavaScript half of the template. Source modules live here, get concatenated
into a bundle by `./build.sh`, and are served to the live Webflow site from a
pinned jsDelivr tag.

Webflow's footer custom code has a 10,000-character limit and no build step, so
pasting real JS into the Designer does not scale. Hosting it here instead means
the code is version-controlled, reviewable, and identical between the local
static build and production.

---

## Layout

```
site-scripts/
├── VERSION               ← the single source of truth for the release tag
├── build.sh              ← concatenates modules → site-core.js, stamps the pin
├── .githooks/pre-commit  ← blocks a commit if the bundle is stale
├── page-init.js          ← module registry + lifecycle (must be first in bundle)
├── example-module.js     ← copy this to start a new module
├── site-core.js          ← GENERATED — do not edit
└── webflow-snippet.html  ← what to paste into Webflow (JS pin + CSS embed)
```

---

## The module contract

`page-init.js` defines `window.SitePage`. Every module registers an
`init`/`destroy` pair against it:

```js
window.SitePage.register({ init, destroy });
```

- **`init(scope)`** runs on first load with `scope = document`, and again on
  every `SitePage.reinit(newScope)`. **Always query inside `scope`**, never
  `document` — otherwise a re-init binds the wrong elements.
- **`destroy()`** runs before a re-init. Release every piece of global state:
  window/document listeners, `requestAnimationFrame` loops,
  `IntersectionObserver`s, GSAP tweens and ScrollTriggers, WebGL contexts. A
  module that leaks here will double-bind on the next init.

Re-init exists because some markup appears after first paint — CMS load-more,
a modal's contents, a page swapped in by an SPA transition layer. Call it
yourself when you inject markup:

```js
SitePage.reinit(newContainer);
```

Every module also ends with a standalone fallback, so it still works if loaded
on its own without `page-init.js`:

```js
if (window.SitePage) window.SitePage.register({ init, destroy });
else init(document);
```

### Conventions every module follows

| Rule | Why |
|------|-----|
| IIFE + `'use strict'` | nothing leaks to the global scope |
| Target `data-*` attributes or IDs, **never classes** | classes belong to styling; a designer renaming one in Webflow must not break the JS |
| Early exit when elements are absent | the bundle ships to every page; a module must cost nothing on pages that don't use it |
| Respect `prefers-reduced-motion` | and still reveal any content that was pre-hidden for the animation |
| Never `transition: all` | target specific properties |

Anything a module pre-hides in CSS must be gated on `.site-js` (added by
`page-init.js`) so no-JS visitors still see the content — and should carry a
bounded animation fallback so the content appears even if the bundle is slow or
fails to load.

---

## Adding a module

1. Copy `example-module.js` to `your-module.js` and write it.
2. Add its basename to the `core` array in `build.sh`.
3. Run `./build.sh`.
4. Commit the module **and** the regenerated `site-core.js`.

### Adding a second bundle

If an effect is heavy and only a few pages need it, give it its own bundle
rather than taxing every page. Declare another array in `build.sh`, add a
matching `build` call at the foot of the file, add the bundle name to the
`--check` loop, and lazy-load it from `page-init.js` when the relevant hook
(e.g. `[data-heavy-effect]`) is present on the page.

---

## Releasing

`VERSION` is the only place the release tag is set. `build.sh` stamps it into
every file listed in `STAMPED`, so hand-pinned URLs can never drift.

```bash
# 1. bump
echo "0.2.0" > VERSION

# 2. rebuild — regenerates the bundle and re-stamps the pinned tag
./build.sh

# 3. commit, tag (the tag MUST match VERSION), push
git add -A && git commit -m "site-scripts v0.2.0"
git tag v0.2.0
git push && git push --tags

# 4. paste the updated <script> line from webflow-snippet.html into
#    Webflow → Site Settings → Custom Code → Footer Code, then publish
```

Enable the staleness guard once per clone:

```bash
git config core.hooksPath site-scripts/.githooks
```

It runs `./build.sh --check` before every commit and fails if a module was
edited without rebuilding.

---

## Why pin a tag, not a branch

jsDelivr caches tagged files permanently and serves an auto-minified
`.min.js` variant of any tagged file — which is what
`webflow-snippet.html` points at. A branch URL would push every commit
straight onto live client sites the moment it landed, untested. Always pin.

The published site is only updated when the Webflow footer pin is bumped **and**
the site is republished. Bumping `VERSION` alone changes nothing in production.

---

## Local development

`scripts/dev-server.mjs` (repo root) serves `template/` and mounts this
directory, rewriting the pinned jsDelivr URL to the local copy and rebuilding
the bundle when a module is newer than it. So the static pages under
`template/` run the code you are editing, not the published tag:

```bash
node scripts/dev-server.mjs
```
