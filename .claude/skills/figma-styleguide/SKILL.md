---
name: figma-styleguide
description: "Builds a Style Guide page INSIDE a Figma design file by deriving the design system from finished page designs — reading existing paint/text styles and variables, measuring real spacing and radii from auto-layout frames, then assembling a documented Color / Typography / Spacing / Radii / Components page. Use when a Figma file has page designs but no style guide artifact, when the user says 'build the style guide in Figma', 'extract the design system from these designs', or runs /figma-styleguide. Run BEFORE /styleguide — this produces the Figma artifact that /styleguide then imports into static HTML/CSS."
---

# Figma Style Guide

Designers often ship page comps without ever producing the style-guide artifact. This skill
manufactures that artifact **inside Figma**, derived from what the designs actually do.

**Its primary audience is the agent, not the designer.** The goal is clear, complete,
unambiguous documentation of the system — every token named, every theme role resolved,
every gap flagged. Visual polish in Figma is secondary; do not spend calls chasing pixel
rendering. If something renders oddly in Figma but the data is correct, say so and move on.

**Position in the pipeline:** `/figma-styleguide` → `/styleguide` → `/component` → `/page` → `/webflow-transfer`

---

## Transport constraints (read first — these will bite)

The Figma desktop MCP bridge is fragile in specific, reproducible ways.

| Symptom | Cause | Do this instead |
|---|---|---|
| `Failed to parse SSE message … EOF while parsing a string` at col ~19 500 | Response exceeds ~19.5 KB. **Triggered by how many nodes a script touches, not by the size of what you return** — a script returning 40 bytes still fails if it walked the wrong nodes. | Keep each call narrow. Fan out across parallel `use_figma` calls. |
| `get_metadata` on a busy page always fails | Whole-page XML dump blows the limit | Don't use it on real files. Use `use_figma` with a targeted script. |
| Any call that runs `setCurrentPageAsync` on a large page fails | The page switch alone emits an oversized payload | **Never call it.** `await figma.getNodeByIdAsync('<pageId>')` loads the page *and* makes it current. |
| One specific child node crashes every call that touches it | Usually an annotation TEXT node whose *layer name* is an entire paragraph | Identify by index, skip it. Don't try to read even its `.name`. |

Traversing ~200 nodes **inside** one script is fine (`root.findAll(...)` and aggregate).
It is *returning per-node data for many nodes* and *page switching* that break.

---

## Step 1 — Inventory the file

One small call. Never switch pages.

```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const ps = await figma.getLocalPaintStylesAsync();
const ts = await figma.getLocalTextStylesAsync();
return {
  pages: figma.root.children.map(p => p.name + '|' + p.id),
  collections: collections.map(c => c.name + '|' + c.variableIds.length + '|' + c.modes.map(m=>m.name).join('/')),
  paintStyleCount: ps.length, textStyleCount: ts.length
};
```

A file's `node-id` from the URL is often a **page**, not a frame. Check it against the page list
before assuming you were handed a frame.

## Step 2 — Read the existing styles

Paint styles, text styles and variables usually already encode most of the system. Read them
verbatim — do not invent names.

```js
function hex(c){const f=v=>Math.round(v*255).toString(16).padStart(2,'0');return '#'+f(c.r)+f(c.g)+f(c.b);}
const paints = (await figma.getLocalPaintStylesAsync()).map(s => {
  const p = s.paints[0];
  return s.name + '|' + (p && p.type === 'SOLID' ? hex(p.color) : p ? p.type : 'none');
});
const texts = (await figma.getLocalTextStylesAsync()).map(s => [s.name, s.fontName.family, s.fontName.style,
  s.fontSize,
  s.lineHeight && s.lineHeight.unit !== 'AUTO' ? s.lineHeight.value + (s.lineHeight.unit === 'PERCENT' ? '%' : 'px') : 'auto',
  s.letterSpacing ? s.letterSpacing.value + (s.letterSpacing.unit === 'PERCENT' ? '%' : 'px') : '0',
  s.textCase || 'ORIGINAL'].join('|'));
return { paints, texts };
```

## Step 3 — List the page frames

Get the design page's children in **chunks of three**, as parallel calls. Larger slices fail.

```js
const p = await figma.getNodeByIdAsync('<designPageId>');
return p.children.slice(0,3).map(n => n.name + '~' + n.id);
```

## Step 4 — Measure spacing and radii (the actual derivation)

One call **per page frame**, emitted in parallel. Each traverses its whole subtree but returns
only a small histogram — this is the pattern that stays under the limit.

```js
const root = await figma.getNodeByIdAsync('<frameId>');
const gap={},padV={},padH={},radius={};
const bump=(o,v)=>{if(typeof v==='number'&&v>0)o[v]=(o[v]||0)+1;};
let n=0;
for (const x of root.findAll(x=>x.layoutMode!==undefined||x.cornerRadius!==undefined)) { n++;
  if(x.layoutMode&&x.layoutMode!=='NONE'){
    bump(gap,x.itemSpacing);
    bump(padV,x.paddingTop); bump(padV,x.paddingBottom);
    bump(padH,x.paddingLeft); bump(padH,x.paddingRight);
  }
  if(typeof x.cornerRadius==='number') bump(radius,x.cornerRadius);
}
const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>k+':'+v).join(' ');
return {nodes:n,gap:top(gap),padV:top(padV),padH:top(padH),radius:top(radius)};
```

**Reading the histogram.** Aggregate across pages, then separate:
- **Scale steps** — values that recur across many pages (these become the spacing scale)
- **Component constants** — values that recur on *some* pages in a fixed pair (e.g. a nav's height + side padding)
- **One-offs and outliers** — a value appearing exactly once per page is usually a layout artefact, not a token

Cross-check derived radii against any existing FLOAT variables; they usually confirm each other.

Report the derived scale to the user with its evidence **before** building the page.

## Step 4b — Derive the theme model

Most brand systems have more than one theme, and this is the single most important thing to
get right because it is what maps onto **Webflow variable modes** — the only descendant
cascade Webflow reproduces natively.

Do not eyeball it. Map every text fill to its nearest filled ancestor background:

```js
const hex=c=>{const f=v=>Math.round(v*255).toString(16).padStart(2,'0');return '#'+f(c.r)+f(c.g)+f(c.b);};
const fh=n=>{const f=n.fills;return Array.isArray(f)&&f.length&&f[0].type==='SOLID'&&f[0].visible!==false?hex(f[0].color):null;};
const root=await figma.getNodeByIdAsync('<frameId>');
const pairs={};
for(const t of root.findAll(n=>n.type==='TEXT')){
  const tf=fh(t); if(!tf) continue;
  let p=t.parent,bg=null;
  while(p){const b=fh(p); if(b){bg=b;break;} p=p.parent;}
  const k=(bg||'none')+' > '+tf; pairs[k]=(pairs[k]||0)+1;
}
return Object.entries(pairs).sort((a,b)=>b[1]-a[1]).slice(0,16).map(([k,v])=>k+' ×'+v);
```

Run the same shape over button-like nodes (`/button|btn|cta/i` on name, or by corner radius)
capturing *outer background → button fill → label color*. That triple is what defines a
theme's call-to-action treatment.

Then resolve each **role** per theme: background, alt surface, heading, body text, text
accent, button fill, button label, border. Present it as a table.

**Expect to find untokenised colors and inconsistencies** — a near-duplicate accent, a label
color that is not any named style, one instance styled against the pattern. These are the
most valuable output of the whole skill. List them as explicit questions; never silently pick
the most frequent value.

Document the Webflow target alongside it: a `Mode` collection with the primary theme as
default. Every themed property binds to a Mode variable — a child bound to a brand color
directly will not flip.

## Step 5 — Build the page

`figma.createPage()`, then a root auto-layout frame, then one section per topic with
`placeholder = true`, filled in over several calls.

### The two rules that cause every bug here

**1. `figma.createAutoLayout()` frames default to an opaque white fill.** On a dark style guide,
every container becomes a white box and light text vanishes into it. Clear them:

```js
for (const n of root.findAll(x => x.type === 'FRAME')) {
  if (/(chip|bar|sample)$/.test(n.name)) continue;  // keep intentional fills
  n.fills = [];
}
```

**2. Set every layout property BEFORE applying a text style.** Applying a brand text style leaves
the node's font *unloaded*, after which `textAutoResize`, `layoutSizingHorizontal` and similar
writes throw `Cannot write to node with unloaded font`. Fills and `resize()` still work.

```js
async function text(parent, chars, styleName, color, mode, w) {
  const t = figma.createText();
  parent.appendChild(t);
  t.characters = chars;                              // Inter — loaded
  if (mode === 'fixed')      { t.resize(w, 20); t.textAutoResize = 'HEIGHT'; }
  else if (mode === 'fill')  { t.textAutoResize = 'HEIGHT'; t.layoutSizingHorizontal = 'FILL'; }
  else                       { t.textAutoResize = 'WIDTH_AND_HEIGHT'; }
  await t.setTextStyleIdAsync(styleId(styleName));   // brand font — now unloaded
  t.fills = solid(color);                           // still allowed
  return t;
}
```

**3. `resize()` silently clears `textAutoResize` to `NONE`.** So for a fixed-width label you
must resize *first* and set `textAutoResize` *after* — the opposite of the usual order. Get
this wrong and the node is frozen at whatever height it had as Inter.

**Never `resize()` a text node after applying the style.** It succeeds, which makes it a
tempting "repair" for collapsed heights, but it sets `textAutoResize = 'NONE'` permanently:
you cannot set it back, because that write needs the font loaded. Auto-height is what lets
Figma fix the layout itself once real metrics are available. Freezing it destroys that.
Verify with a mode census before declaring done:

```js
const modes = {};
for (const t of root.findAll(n => n.type === 'TEXT')) modes[t.textAutoResize] = (modes[t.textAutoResize]||0)+1;
return modes;  // expect no NONE
```

## Step 6 — Handle a missing brand font (very common)

Licensed and Adobe-activated faces frequently are **not** loadable by the plugin sandbox:

```js
await figma.loadFontAsync({ family:'ITC Avant Garde Gothic Pro', style:'Bold' })
// -> The font family "…" does not exist
```

What still works, and what does not:

- ✅ `setTextStyleIdAsync` **does** bind the style correctly — `fontSize`, `fontName` and
  `textStyleId` all end up right. Verify by reading them back.
- ❌ The node cannot be **re-laid-out**, so it keeps the stale height it had as Inter
  (typically **15px**) and renders substituted glyphs crushed into that box.
- Existing designs look fine because their metrics were baked when the designer had the font active.

**Diagnose by reading `height`, not by looking at a downscaled screenshot** — a collapsed
80px heading and a correct 16px label look similar at 3× reduction.

Best-effort repair (layout becomes correct; glyphs stay substituted until the font is activated):

```js
for (const t of root.findAll(n => n.type === 'TEXT')) {
  const fs = typeof t.fontSize === 'number' ? t.fontSize : 16;
  const lh = t.lineHeight && t.lineHeight.unit === 'PERCENT' ? fs * t.lineHeight.value / 100
           : t.lineHeight && t.lineHeight.unit === 'PIXELS' ? t.lineHeight.value : fs * 1.2;
  const lines = Math.max(1, Math.ceil((t.characters.length * fs * 0.52) / (t.width || 400)));
  t.resize(t.width, Math.ceil(lh * lines) + 4);
}
```

**Always tell the user.** The real fix is theirs: activate the family in Figma (Adobe Fonts →
activate, or install the desktop files) and reopen the file. Do not ship a silently-substituted
style guide and call it done — and flag that the same font must be uploaded to Webflow later.

## Step 7 — Verify

Screenshot each section at **full resolution** (`maxDimension` ≥ 1400 for a 1480-wide section).
Downscaled screenshots hide collapsed text and low-contrast failures. Then read back a couple
of nodes' `fontSize` / `height` and confirm they match the spec you documented.

## Step 8 — Hand off

Record in the project's `FIGMA-EXTRACT.md` (or equivalent): every paint style with hex,
every text style with full spec, every variable, the derived spacing scale **with its evidence**,
the page-frame node IDs, and any font that must be activated or uploaded later.
`/styleguide` reads this instead of re-querying Figma.

---

## Constraints

- **Derive, never invent.** Every value on the page must trace to a style, a variable, or a
  measured frequency. If something is genuinely absent, list it as a gap and ask.
- **Never rename the client's styles.** Mirror their names verbatim, even if inconsistent.
- **Never call `setCurrentPageAsync`.**
- Present the derived scale for approval before building the page.
- Return created node IDs from every write call.
