# Page Build Log

Per-page build history. Kept out of `AGENTS.md` so the always-loaded instructions
stay lean.

**Read the relevant page's section here before working on that page**, and append
new build narratives here — not in `AGENTS.md`.

The slim index (file ↔ Webflow page id + outstanding gaps) lives in `AGENTS.md` →
Pages Index. Recurring API and builder gotchas discovered during transfers get
consolidated in `AGENTS.md` → "Transferring the Static Build into Webflow", so
the next page benefits without anyone having to read this whole file.

Publish state is deliberately **not** tracked in the repo — check Webflow.

---

## Entry format

Add a `##` section per page, in the order the pages were built. Within a section,
append dated entries newest-last so the narrative reads chronologically.

```markdown
## <Page name> — `template/<file>.html`

**Purpose:** one line — what this page is for

**Sections:** the section stack, in document order

**History:**

**YYYY-MM-DD: <short title of the change>** — what changed and, more importantly,
*why*: the problem observed, the approach rejected and the reason, the values that
turned out to matter. Note anything transferred to Webflow (with element/class
names), anything that must still be done by hand in the Designer, and anything
verified vs. assumed.
```

What makes an entry worth writing: the reasoning that is not recoverable from the
diff. A future agent can read the CSS; it cannot read why three other approaches
were tried first, which browser disagreed, or which Designer step has no MCP
equivalent.

---

## Journal — `template/journal.html`

Built 2026-09-19 from Figma `243:1682` (1440 x 2670). Header reuses Interior Hero (H1 only —
no eyebrow, no copy, no accent words); the CTA band and chrome are existing components. The
two lists are new and both CMS-backed.

**The CMS was already there.** The `Blogs` collection carries every field these lists need —
`featured` (Switch), `date`, `image`, `summary`, `body`, `name`, `slug`. Nothing needed
creating. Note the brief said posts "tagged featured"; it is actually a **Switch**, so the
filter is `Featured? is on` / `is off` rather than a tag match.

**Alternation was the real design problem.** The two featured rows mirror each other —
text/image, then image/text. A Collection List renders every item from one template, so
per-item alternation needs `:nth-child`, which Webflow cannot represent and `AGENTS.md` bans.
Walker chose two Collection Lists (both `Featured? is on`, Date desc, limit 1, offsets 0 and
1), and that turns out to need **no CSS at all**: list B's template simply puts the media
before the body. No variant, no custom-code embed, nothing outside the Designer. Verified in
the browser — the two cards' child order reads `[body, media]` then `[media, body]`.

**Trade-off, stated plainly: exactly two featured posts render.** A third flagged post will
not appear anywhere on the page.

**The grid is a CSS grid, not `.row` / `.col`.** The comp's 3-up gutter is 10px (`--gap-sm`);
the grid system gives 40px and `.row-gap-sm` only sets the *row* gap. A grid is also how a
Collection List wrapper actually behaves. Measured in the browser against the comp: 393px
columns, 10px gutter, 64px row gap, and featured media at exactly 568x370 — the container fix
from the Contact transfer is what makes those land on the nose.

**Open.**
- **Rename `Blogs` to Journal in the Designer.** The CMS API has no `update_collection`
  action, so this cannot be done from here. Until it is, the collection and its `/blog/<slug>`
  URLs read Blogs while the whole site reads Journal.
- Card copy is the comp's lorem, left verbatim rather than invented — real content comes from
  the collection. Every card title in the comp is the same 48-character lorem string.
- 8 image placeholders (`#d9d9d9` in the comp).
- Frame `243:1692` (568x8, zero children) sits above each featured title — an empty slot,
  probably an unfilled date or category row. Left out.

---

## About — `template/about.html`

Built 2026-09-19 from Figma `243:1556` (1440 x 7617). Eleven sections; three reuse existing
components (Interior Hero, Logo Wall, CTA band) and six are new.

**Four sections share one shape** — Who we are, Research/Concept/Create, Meet the team, we
believe in are all an accent label column plus a 730px body. Walker chose a component per
section using the existing `.section` / `.row` / `.col` classes, so the shell is
`col-lg-4` + `col-lg-8` with the body capped at `--measure`, and the label is a shared
`.section-label` **class** rather than a component — four components use it and they agree
only on the label.

**The marquee mirrors MAST 1:1.** `.marquee-component` > `.marquee-wrapper` >
`.marquee-content` > two `.marquee-group`, same class names as the Webflow component, so the
transfer is a rename-free swap. The second group is a duplicate of the first — that is what
makes `translateX(-50%)` loop seamlessly, and why MAST's component exposes two slots
tooltipped "add the same set of components in each slot". Verified in the browser: two groups
at exactly 2286px each, 4572px of content, `overflow: hidden`, no horizontal page overflow.
The `@keyframes` live in `styles.css` here; **in Webflow they belong in the Custom Code embed**
(the Marquee toggle on the Custom Code component) because the style API cannot write keyframes.

Figma confirms the intent rather than me guessing: that strip's four tiles total 2222px against
a 1440 frame with **zero** horizontal padding, so it is built to overflow.

**Extraction gotcha worth remembering.** Node `243:1564` crashes every `use_figma` call that
touches it — the documented single-node failure, and its layer *name* is the full paragraph.
Truncating the name (`c.name.slice(0,60)`) worked; reading `.characters` on it never did. The
copy came from high-resolution screenshots instead, and every string was then **cross-checked
against the character counts** the API would return (`n.characters.length` works fine), so the
verbatim text is confirmed exact rather than transcribed by eye.

**Deliberately excluded.** Node `499:1927` in the Research section reads
`Moodbaards / lkjsd / lksjdf / lksdjf` — leftover working text. Not shipped. Riley's role,
`We're working on it...`, reads as intentional and is kept verbatim.

**Open.**
- 13 image placeholders. No photography exists in the comp — every image is a solid rectangle.
  Each placeholder carries `data-figma-node` pointing at the frame its asset belongs to.
- The nav renders dark; the comp's About nav is light. The Webflow Nav component has a
  `Color Mode` prop, the static nav does not — needs a decision before transfer.
- Image sections use the default 120px section padding; the comp uses 65px on the two image
  blocks only. Left consistent with the page rhythm rather than adding a combo on one page's
  evidence.
- The "we believe in" body copy renders near-black (`--primary-text-muted` is Charred Bark in
  Light) where the comp shows a warm grey. Flagged rather than inventing a grey.

---

## Contact — `template/contact.html`

Built 2026-09-19 from Figma `243:1651` (1440x1104). One section: a two-column
row, intro left and enquiry form right. No CTA band — the comp does not have
one, and the band is not automatic.

**Grid.** The comp's 518 / 100 / 582 split maps onto `col-lg-5` +
`col-lg-offset-1` + `col-lg-6`. The card lands pixel-exact (738-1319 against
the comp's 738-1320) because the row's negative margins absorb the outer
column padding. The left column ends up with 480px of content against the
comp's 518, so the intro paragraph wraps to four lines rather than three and
the location note to two rather than one. That is grid snapping, not a bug —
widening the left column moves the card off its mark, which is the more
visible error.

**The form card is a light panel in a dark section.** `.card.cc-light` flips
the theme roles, so `.input` and `.select` inside pick up Bone on Oat with
Deep Forest text without any of them naming a colour. The submit carries
`.button.cc-dark` to force the Base treatment back — the comp keeps the
Lichen button even on the light card. Webflow reproduces both with variable
modes on the `cc-*` combo.

**Three system changes came out of this page**, all confirmed before writing:
- `--input-height` 3.25rem -> 3.75rem and `--input-border-radius` 0.25rem -> 0.
  First form in the project, so first real evidence of input styling.
- `.container` now uses `max-width: calc(var(--container-max-width) + 2 *
  var(--container-gutter))`. Border-box was subtracting the 6vw gutter from
  the 1200px max-width, so content narrowed as the viewport grew — 1027px at
  1440, 970px at 1920. Every page gets wider; check `index.html` and
  `style-guide.html` when you next touch them.
- `.u-sr-only` added. The comp's fields are placeholder-only and a
  placeholder is not an accessible name.

**Gotchas found.**
- `.icon` is a *wrapper* class (`display: inline-flex`). Applied straight to
  an `<svg>` it collapses the width to nothing. Size the svg on its own class
  the way `.footer-social_icon` does.
- `.select`'s caret is a data-URI background image, so it cannot read a CSS
  variable, and a `<select>` has no usable pseudo-element — the caret cannot
  follow `currentColor` either. `.select.cc-flat` restates it in Deep Forest.
  A theme-aware caret needs the control wrapped with an inline SVG.

**Select options.** The comp only shows the closed state, so neither list was
designed. "What can we help with?" is filled from the site's own Our Work
taxonomy, minus "Awards & Recognition" and "All Work" — those are portfolio
views, not services someone requests. The budget bands are **proposed**:
nothing in the design implies them, they are conventional for commercial
production, and they exist so the control is usable. Both are commented as
needing client sign-off.

**Webflow transfer (2026-09-19).** Page `6aaea9f05359c79adc9be9fe`, slug `/contact`, left as
a **draft**. Everything mapped native and every class attached first time. Details and the two
`.container` defects it uncovered are in `WEBFLOW-MAP.md`.

**The static build and the Webflow page now use different form patterns, deliberately.** Asked
how to reconcile, Walker chose MAST's defaults. So Webflow uses MAST's floating-label field —
`.input-group` > `.input-label` + `.input`, with the input absolutely positioned and 2rem of top
padding to clear the label — plus `.input.cc-select` and `.input-group.cc-textarea`. The static
build still carries the comp's flat placeholder-only fields with `.select`, `.cc-flat` and
`.form.cc-tight`.

The consequence is worth being explicit about: **the live Contact form does not look like the
Figma comp.** It has visible labels above each field and MAST's 1px Moss borders, where the comp
has borderless Bone fields with placeholder text only. That was the choice, not an accident.
Reconciling means picking one: either restyle `template/styles.css` to MAST's pattern (the
static build stops matching the comp) or restyle `.input` in Webflow (the site stops matching
MAST). Until then the two are knowingly out of sync, which is the "two parallel families"
situation `AGENTS.md` warns about.

**Open — convert to the Layout components.** The section is currently a hand-built
`.section > .container > .row > .col` stack. It renders correctly and every class matches what
the components apply, but it is not assembled from `Section` / `Grid Row` / `Grid Column`, so
none of the Theme, Top/Bottom Spacing, Column Size or Column Alignment props are available on
this page. The MCP cannot populate a slot (see PROCESS.md), so the conversion is a Designer job:
drop Section (Theme: Dark) > Grid Row (**Top Between** — it reproduces the comp's 100px gap with
no offset class) > Grid Column **5/12** and **6/12**, then drag `.contact-intro` into the first
slot and `.card.cc-light.cc-form` into the second and delete the leftover wrapper. Walker parked
this on 2026-09-19 to come back to.

**Open.** Budget bands await sign-off. The form's `action` is still `#` —
in Webflow the native Form element handles submission, so this is only a
placeholder for the static build.

---

<!-- No pages logged yet. The first /page or /webflow-page run should add its
     section above this line. -->
