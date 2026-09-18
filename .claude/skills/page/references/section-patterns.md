# Section Patterns

A vocabulary of common page section layouts mapped to the project's 12-column grid system. Use these when classifying Figma sections in Step 6 and emitting markup in Step 10.

All examples use `<prefix>` — replace with the resolved project prefix at runtime.

## Hero — text only (centred)

```html
<section class="section">
  <div class="container">
    <div class="row row-justify-centre">
      <div class="col col-lg-8 col-md-12 u-text-centre">
        <span class="<prefix>-eyebrow">Eyebrow</span>
        <h1>Headline goes here</h1>
        <p>Supporting body copy that explains the value proposition.</p>
        <a class="<prefix>-button" href="#">Primary CTA</a>
      </div>
    </div>
  </div>
</section>
```

**Figma signal**: a tall section, centred content, single column, no image.

## Hero — text left, image right

```html
<section class="section">
  <div class="container">
    <div class="row row-align-centre">
      <div class="col col-lg-6 col-md-12">
        <span class="<prefix>-eyebrow">Eyebrow</span>
        <h1>Headline</h1>
        <p>Body copy.</p>
        <a class="<prefix>-button" href="#">CTA</a>
      </div>
      <div class="col col-lg-6 col-md-12">
        <img src="…" width="…" height="…" alt="…" loading="lazy">
      </div>
    </div>
  </div>
</section>
```

**Figma signal**: two equal columns, text + image. Swap columns for image-left layouts.

## 3-up cards / stats / features

```html
<section class="section">
  <div class="container">
    <div class="row row-gap-md">
      <div class="col col-lg-4 col-md-6 col-sm-12"><div class="<prefix>-card">…</div></div>
      <div class="col col-lg-4 col-md-6 col-sm-12"><div class="<prefix>-card">…</div></div>
      <div class="col col-lg-4 col-md-6 col-sm-12"><div class="<prefix>-card">…</div></div>
    </div>
  </div>
</section>
```

**Figma signal**: 3 identical-sized blocks in a row. Use `<prefix>-stat` for proof points (number + label), `<prefix>-card` for feature blocks.

## 4-up grid

```html
<section class="section">
  <div class="container">
    <div class="row row-gap-md">
      <div class="col col-lg-3 col-md-6 col-sm-12">…</div>
      <div class="col col-lg-3 col-md-6 col-sm-12">…</div>
      <div class="col col-lg-3 col-md-6 col-sm-12">…</div>
      <div class="col col-lg-3 col-md-6 col-sm-12">…</div>
    </div>
  </div>
</section>
```

**Figma signal**: 4 blocks in a row. Logo grids, team avatars, integration cards.

## Sidebar layout — content + aside

```html
<section class="section">
  <div class="container">
    <div class="row">
      <div class="col col-lg-8 col-md-12">Main content</div>
      <div class="col col-lg-4 col-md-12">Aside content</div>
    </div>
  </div>
</section>
```

**Figma signal**: asymmetric two columns, ~2/3 + 1/3 split. Blog post + TOC, product detail + buy box.

## Two-column equal

```html
<section class="section">
  <div class="container">
    <div class="row row-gap-md">
      <div class="col col-lg-6 col-md-12">Column A</div>
      <div class="col col-lg-6 col-md-12">Column B</div>
    </div>
  </div>
</section>
```

**Figma signal**: 50/50 split — comparison tables, pros vs cons, dual CTAs.

## CTA strip (full-bleed)

```html
<section class="section">
  <div class="container">
    <div class="row row-justify-between row-align-centre">
      <div class="col col-shrink">
        <h2>Ready to start?</h2>
        <p>Short supporting line.</p>
      </div>
      <div class="col col-shrink">
        <a class="<prefix>-button cc-lg" href="#">Get started</a>
      </div>
    </div>
  </div>
</section>
```

**Figma signal**: full-width band, often coloured (`.<prefix>-bg-primary` utility), text left + CTA right.

## Feature alternating rows

```html
<section class="section">
  <div class="container">
    <div class="row row-gap-md row-align-centre">
      <div class="col col-lg-6 col-md-12">Text</div>
      <div class="col col-lg-6 col-md-12">Image</div>
    </div>
    <div class="row row-gap-md row-align-centre">
      <div class="col col-lg-6 col-md-12 col-lg-last">Text</div>
      <div class="col col-lg-6 col-md-12 col-lg-first">Image</div>
    </div>
  </div>
</section>
```

**Figma signal**: 3+ feature rows alternating image/text sides. Uses `col-lg-first`/`col-lg-last` to swap order at desktop while keeping mobile order intact.

## Pricing tiers

```html
<section class="section">
  <div class="container">
    <div class="row row-gap-md">
      <div class="col col-lg-4 col-md-12"><div class="<prefix>-card">Free tier</div></div>
      <div class="col col-lg-4 col-md-12"><div class="<prefix>-card cc-featured">Pro tier</div></div>
      <div class="col col-lg-4 col-md-12"><div class="<prefix>-card">Enterprise</div></div>
    </div>
  </div>
</section>
```

**Figma signal**: 3 cards, middle one visually elevated (border, scale, badge). Use `cc-featured` variant on the highlighted tier.

## Logo strip / social proof

```html
<section class="section">
  <div class="container">
    <p class="<prefix>-eyebrow u-text-centre">Trusted by</p>
    <div class="row row-gap-md row-align-centre row-justify-between">
      <div class="col col-shrink"><img src="logo-1.svg" width="120" height="32" alt="Company 1"></div>
      <div class="col col-shrink"><img src="logo-2.svg" width="120" height="32" alt="Company 2"></div>
      <div class="col col-shrink"><img src="logo-3.svg" width="120" height="32" alt="Company 3"></div>
      <div class="col col-shrink"><img src="logo-4.svg" width="120" height="32" alt="Company 4"></div>
    </div>
  </div>
</section>
```

**Figma signal**: row of customer/partner logos, often desaturated. `col-shrink` makes each column hug its image.

## FAQ accordion list

```html
<section class="section">
  <div class="container">
    <div class="row row-justify-centre">
      <div class="col col-lg-8 col-md-12">
        <h2>FAQ</h2>
        <details>
          <summary>Question one?</summary>
          <p>Answer.</p>
        </details>
        <details>
          <summary>Question two?</summary>
          <p>Answer.</p>
        </details>
      </div>
    </div>
  </div>
</section>
```

**Figma signal**: stacked question + answer pairs, usually narrow column. Use native `<details>`/`<summary>` per CLAUDE.md accessibility rules.

## Form section

```html
<section class="section">
  <div class="container">
    <div class="row row-justify-centre">
      <div class="col col-lg-6 col-md-12">
        <h2>Get in touch</h2>
        <form class="<prefix>-form">
          <div class="<prefix>-input-group">
            <label class="<prefix>-input-label" for="email">Email</label>
            <input class="<prefix>-input" type="email" id="email" name="email" required>
          </div>
          <button class="<prefix>-button" type="submit">Send</button>
        </form>
      </div>
    </div>
  </div>
</section>
```

**Figma signal**: input fields stacked, centred column. Use the form primitives from the design system.

---

## When to choose inline custom CSS vs new component

If a section appears **once on this page only** and contains a layout/look that isn't obviously reusable elsewhere → inline custom CSS (Step 7 option "Inline custom CSS").

If a section is likely to be reused on another page (newsletter signup, testimonial slider, pricing table) → pause for `/component` (Step 7 option "Pause for /component").

Flag inline sections with a TODO comment:
```css
/* TODO: extract to component if reused on another page */
```

---

## Mobile-first considerations

The grid is desktop-first (`col-lg-*` is the desktop spec, `col-md-*`/`col-sm-*` override downwards). Always include `col-md-12` or `col-sm-12` modifiers on multi-column rows so they stack on smaller viewports.

Standard breakpoint cascade:
- `col-lg-*` for desktop (1200px+)
- `col-md-*` for tablet (768-991px)
- `col-sm-*` for mobile landscape (480-767px)
- `col-xs-*` for mobile portrait (<480px)

If unsure about a breakpoint, default to `col-lg-X col-md-12` (stack on tablet).
