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

**Open.** Both selects ship with their placeholder option only. The comp shows
the closed state, so the option lists are genuinely unspecified — marked TODO
in the markup rather than invented.

---

<!-- No pages logged yet. The first /page or /webflow-page run should add its
     section above this line. -->
