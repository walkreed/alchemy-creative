# Figma Page Extraction Guide

How to pull a full page worth of design context from Figma without exceeding context limits or losing key information.

## The size problem

A single page frame in Figma can easily generate 50-100k characters of XML when passed to `get_design_context`. Don't call it on the page node directly — it will be saved to a file and become hard to reason about.

**Always work section-by-section.**

## Recommended extraction workflow

### 1. Map the page structure first

Call `mcp__Figma__get_metadata` on the page nodeId. This returns a small XML listing of direct child frames — usually one per section:

```xml
<frame id="100:1" name="01 / hero" x="0" y="0" width="1440" height="700">...</frame>
<frame id="100:2" name="02 / stats" x="0" y="700" width="1440" height="400">...</frame>
<frame id="100:3" name="03 / team" x="0" y="1100" width="1440" height="900">...</frame>
<frame id="100:4" name="04 / newsletter" x="0" y="2000" width="1440" height="500">...</frame>
```

Record the section frame IDs and a draft section list for Step 4 of the SKILL workflow.

### 2. Get a screenshot of the whole page

One call to `mcp__Figma__get_screenshot` on the page nodeId. Use it for visual reference and to confirm the section list matches what's visible.

### 3. Process sections one at a time

For each section frame ID from Step 1, call `mcp__Figma__get_design_context` on that frame. These are typically 5-20k characters each and fit within context limits.

The response contains:
- Text content (headings, body, button labels) as `<text name="..." />` nodes
- Image references as `<image fill="..." />` or asset URLs
- Layout hints (auto-layout direction, gap, padding)
- Component references where the designer used existing Figma components

### 4. Handle saved-to-file responses

If a section is still too large (rare for a single section, but possible for a hero with complex layered illustrations), the response is saved to a file. Run the extraction script:

```bash
python3 .claude/skills/page/scripts/extract_figma_page.py <saved-file> --mode sections
python3 .claude/skills/page/scripts/extract_figma_page.py <saved-file> --mode images
python3 .claude/skills/page/scripts/extract_figma_page.py <saved-file> --mode text
```

Modes:
- `sections` — direct child frames with their dimensions (for further drilling)
- `images` — every image reference with nodeId, asset URL, and bounding box (for the image download step)
- `text` — every text node with its position (for filling section content)
- `all` — runs every mode in sequence

## Image identification

Images in Figma design context appear as `<image>` or `<rectangle fill="image:..." />` elements. The extraction script collects them with:
- `id` — Figma node ID (for `data-figma-node` attribute fallback)
- `name` — Figma layer name (helps with file naming)
- `width` / `height` — for `<img>` element attributes
- `assetUrl` — URL to fetch (when present in the response)

### Downloading images

Try, in order:

1. **Direct asset URL** — if `assetUrl` is present in the response, fetch it with `curl` (or `requests` in a script). Always check status code; Figma URLs expire after a short window.
2. **Re-fetch with `get_screenshot`** — for each image node, call `get_screenshot` with the image's nodeId and a 2× scale. This always works but is slower.
3. **Manual placeholder** — if both fail, emit:
   ```html
   <img src="placeholder.jpg"
        data-figma-node="123:456"
        data-figma-name="Hero illustration"
        width="1920" height="1080"
        alt="" loading="lazy">
   ```
   and list it in the final report so the user can grab it manually.

### WebP conversion

```bash
cwebp -q 85 source.png -o template/assets/<page>/<name>.webp
```

Check `cwebp` is installed first with `which cwebp`. On macOS: `brew install webp`. If missing, save as the original format and add a TODO comment.

## Layout extraction

Figma auto-layout properties translate roughly to flex/grid:

| Figma | CSS |
|---|---|
| Auto-layout horizontal | `display: flex; flex-direction: row;` |
| Auto-layout vertical | `display: flex; flex-direction: column;` |
| Gap | `gap: <px>` — match to closest `--<prefix>-space-*` |
| Padding | `padding: <values>` — match to spacing tokens |
| Align centre | `align-items: center` |
| Distribute space between | `justify-content: space-between` |

But: don't try to translate every layout pixel-perfect. The project's 12-column grid is the answer for most layouts. Map Figma layouts to the grid where possible:

| Figma layout | Grid translation |
|---|---|
| Single full-width column | `<div class="row"><div class="col col-lg-12">…</div></div>` |
| Two equal columns | `<div class="row"><div class="col col-lg-6 col-md-12">…</div><div class="col col-lg-6 col-md-12">…</div></div>` |
| 2/3 + 1/3 sidebar | `col-lg-8` + `col-lg-4` |
| 3-up cards | three `col-lg-4 col-md-6 col-sm-12` |
| 4-up cards | four `col-lg-3 col-md-6 col-sm-12` |
| Hero with image | `col-lg-6` text + `col-lg-6` image, or `col-lg-7` + `col-lg-5` for asymmetry |

See `section-patterns.md` for the full layout vocabulary.

## Text content extraction

Each `<text name="..." />` node carries the actual user-visible string in its `name` attribute. Extract them in document order and fill into the component markup by role:

- The first large text node → heading
- The next medium text node → subheading or eyebrow
- Paragraphs → body content
- Short capitalised text → button label or eyebrow tag

When ambiguous, ask the user to confirm the mapping. Don't guess at copy.

## What the script does NOT do

- It doesn't infer semantic structure (h1 vs h2 vs body) — that's an LLM call
- It doesn't decide which component matches a section — that's Step 6
- It doesn't download images — Step 9 of SKILL handles that with API calls
- It doesn't write any files — purely extraction
