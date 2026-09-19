# Webflow transfer map — Alchemy Creative

Every ID needed to set the site's variables, plus the target value for each and
whether it differs from what is live. Captured 2026-09-19 by reading the site, so
a future session does not have to re-derive any of it.

**Site** `6aad7d4121d8828938eb64fd` (`alchemytv`) · **Home page** `6aad7d4121d8828938eb64ce`

**Connector:** reachable only on **Webflow Beta**. The standard "Webflow" connector
cannot see this site. Both have needed re-auth at least once — if a call returns
"connector requires authentication", re-auth in claude.ai connector settings.

**Nothing below has been applied yet.** The first write attempt failed on auth
before any mutation, so the site is still in its MAST starter state.

---

## Two bugs already live on the site

1. **`Eyebrow/Font` is the literal string `"IBM Plex Mono"`** — not aliased to Primary
   Font, and that family is not on the site. Eyebrows are falling back today.
2. **Every Paragraph weight and `Button/Font Weight` is 400.** The Adobe kit serves
   **500/600/700 only**, so those render a fallback or synthesised weight.

Neither is caused by our build; both are starter defaults meeting this brand's font.

---

## Color — `collection-b79ca2fc-c9a8-5c66-ffb3-278fd315150c`

Names stay MAST-generic deliberately: the `o10`/`o20`/`o50` tints are `color-mix`
expressions that reference the base variables **by cssName**, so renaming a base
variable breaks them. Set values in place; rename later, together with the
expressions, if at all.

| Variable | ID | Live | Target |
|---|---|---|---|
| Base/Brand Primary | `variable-ba25d908` | `#006acc` | **`#c6dc42`** Lichen |
| Base/Brand Dark | `variable-30076ef4-ff89-29b2-6a0d-5816f8c84942` | `color-mix(primary, black 80%)` | **`#17251c`** Deep Forest (static — removes the derivation) |
| Base/Brand Secondary | `variable-48b90597-b46c-7c22-b28e-0dd7a0847d66` | `#6b5d3f` | **`#667a3a`** Moss |
| Base/Brand Neutral | `variable-89813b2f-b046-8d42-1c20-be3c83c4d3c8` | `#dfe6d1` | **`#d8d0b8`** Oat |
| Base/White | `variable-0065a3d9` | `white` | **`#f0ebdd`** Bone |
| Base/Brand Primary - o10 | `variable-a916a5ae-6a4a-f950-0bb1-5cd931bd284b` | color-mix | leave |
| Base/Dark - o20 | `variable-dbdca7f3-d014-c246-2f9b-11a0f1765d45` | color-mix | leave |
| Base/White - o10 | `variable-ac274924-c489-d25b-17c5-efb74892a7f9` | color-mix | leave |
| Base/White - o50 | `variable-9f9683d3-0c26-a3e6-39b1-86185de4ce88` | color-mix | leave |

**Create:** `Base/Charred Bark` `#24231e` · `Base/Clay` `#a56f52`

Note "Base/White" will hold Bone, which reads oddly. Accepted for now to avoid
breaking the tint expressions.

---

## Theme — `collection-7df4a73c-9a56-a8b7-efe4-68d0c5f0336d`

Modes: `base` (= **Base mode**, the dark palette) and `mode-bf6faaa8-2bf5-9c53-b568-f9d802b7c009` (= **Light**).
The Light mode id was previously "Accent" and still holds those values.

| Role | ID | Base (dark) | Light |
|---|---|---|---|
| Primary/Background | `variable-9da3735a-3665-e4a7-0144-bd2d3cac66d2` | Brand Dark | White (Bone) |
| Primary/Text | `variable-f3ad99f6-c570-2079-815f-5d1330cb061f` | White (Bone) | Brand Dark |
| Primary/Border | `variable-11024737-13f6-2e44-62c6-dbf07da4d227` | Brand Secondary (Moss) | Brand Secondary |
| Primary/Accent | `variable-509e6879-1afd-6ed5-a87a-b21acc301485` | Brand Primary (Lichen) | Brand Secondary (Moss) |

**Create:** `Primary/Surface` — Base → Charred Bark, Light → Brand Neutral (Oat)

Buttons need no colour role: fill = `Primary/Accent`, label = `Primary/Background`,
correct in both modes.

---

## Typography — `collection-9d323d2d-82a9-e2bc-252e-67213e00be97`

`Fonts/Primary Font` `variable-aaf0a01d-de50-9613-5c48-f68377edd33f` =
`itc-avant-garde-gothic-pro` — **already correct.**

Fluid sizes are stored as a custom clamp expression built from a min/max rem pair
against `Fluid/Min` and `Fluid/Max`. Note H2's expression hardcodes `90` where the
others reference `--_layout---fluid--max`; worth normalising.

| Level | Size ID | Weight ID | Live → target |
|---|---|---|---|
| H1 | `variable-42c823f7-47e6-82c3-1f23-62785adad921` | `variable-af2df176-ad1c-1b51-6874-651e5c052363` | 2.8→5.5rem / w500 / lh1 / -0.02em ⇒ **2.5→5rem / w700 / lh1 / -0.025em** |
| H2 | `variable-6bf51e71-4792-80fa-3de4-8de2466e4bed` | `variable-3af868c1-dd36-6aa4-95cb-6666522bcf1b` | 2→3.8rem / w500 / lh1.1 / -0.02em ⇒ **2.25→4rem / w700 / lh1 / 0** |
| H3 | `variable-881e49bd-9eb3-1f7a-3fa6-9eae43c218c9` | `variable-4e115101-8aa1-229d-7609-4e96363e9d85` | 1.5→2.3rem / w500 / lh1.2 ⇒ **1.75→3rem / w700 / lh1 / -0.01em** |
| H4 | `variable-599a7767-611a-0ffe-3ef8-2b1e7d3cedb8` | `variable-094c51e2-0883-8967-536d-3c9276c75c10` | 1.3→1.5rem / w500 / lh1.4 ⇒ **1.5→2rem / w700 / lh1** |
| H5 | `variable-4fd1329f-d69c-5bf8-200b-409129af67ac` | `variable-67c86b66-4274-5eac-e9bd-c3bad1a20f14` | 1.1→1.2rem / w500 / lh1.4 ⇒ **1.25→1.5rem / w600 / lh1.25** |
| H6 | `variable-1802aeb3-89a5-db17-a112-04df9562779f` | `variable-00f79423-bc69-d7f6-c755-0d5295fb89ec` | 0.75→1rem / w500 ⇒ **1.125→1.25rem / w600 / lh1.25** |
| Paragraph (Body) | `variable-51185a7b-8f67-d770-2243-45763cc61bef` | `variable-36f02573-7129-9f9c-5452-a7155777c1d0` | 0.9→1rem / **w400** / lh1.6 ⇒ **1→1.25rem / w500 / lh1.6** |
| Paragraph SM | `variable-97f12be8-2f41-6baf-0042-388522b26ee5` | `variable-f72e582f-eae5-da75-c6b6-be7f6ed9a318` | 0.8→0.9rem / **w400** ⇒ **1rem fixed / w500 / lh1.6** |
| Eyebrow | `variable-6e55da87-7307-ac61-f1f0-052fa5e60fdf` | `variable-dca0469b-4a3b-41f3-758b-8dda2cf21083` | 0.7→0.8rem / w500 / lh1.2 / +0.1em ⇒ **0.875rem fixed / w600 / lh1.5 / +0.1em** |

Other per-level IDs — line height / letter spacing / bottom margin:
H1 `variable-e2d45d78-…` / `variable-f35b7c61-…` / `variable-5162047e-…` ·
H2 `variable-d40ea3e4-…` / `variable-9f200557-…` / `variable-e258150e-…` ·
H3 `variable-1b8da084-…` / `variable-4fd1cfdd-…` / `variable-eef1931e-…` ·
H4 `variable-bfdf3dd0-…` / `variable-c0db4a0b-…` / `variable-db4144ba-…` ·
H5 `variable-38b09077-…` / `variable-7163293a-…` / `variable-2507e3ec-…` ·
H6 `variable-9c3950b4-…` / `variable-bf6d8929-…` / `variable-b497f99d-…` ·
Body `variable-77458dcd-…` / `variable-e47bda25-…` / `variable-bc3360a1-…` ·
Eyebrow `variable-2b389937-…` / `variable-36a11599-…` / `variable-a0ff2b92-…`

**`Eyebrow/Font` `variable-6354049b-61e7-343b-5872-e54c59467d70`** — change the
literal `"IBM Plex Mono"` to an alias of Primary Font.

---

## Layout — `collection-97f2be71-bc47-82ef-742f-38f3a2dd0b75`

| Variable | ID | Live | Target |
|---|---|---|---|
| Grid/Columns | `variable-fd071d2a-bb61-bd51-537d-18433b223a39` | 12 | ✓ |
| Grid/Gap Main | `variable-69859685-28e1-bcbc-4bd8-a4fdb0b31f47` | 40px | ✓ |
| Grid/Gap MD | `variable-85045ea0-f11b-650c-81f8-46ff407bac28` | 24px | ✓ |
| Grid/Gap SM | `variable-9a8f9381-e84f-4f27-fb30-47c3a4c45503` | 8px | **10px** |
| Grid/Gap Button | `variable-a3bee402-bb99-9d63-246f-aab70cb460ca` | 16px | ✓ |
| Spacing/Margin XS–LG | `variable-7fd438bc-…` `variable-3a7a3f61-…` `variable-f87d4b30-…` `variable-646e8dd4-…` | 0.5 / 1 / 2 / 3em | ✓ |
| Fluid/Max · Fluid/Min | `variable-130fc765-…` · `variable-0eaf6d1f-…` | 90 · 20 | ✓ |

---

## Components — `collection-389f9d78-f416-84a3-d00d-1094c8095454`

| Variable | ID | Live | Target |
|---|---|---|---|
| Section/Padding Min (rem) | `variable-114fb993-c405-e45d-f0ce-24c9641dfb5d` | 3 | ✓ |
| Section/Padding Max (rem) | `variable-b10649fa-53fd-d0af-c0ae-413f0024788a` | 6 | **7.5** |
| Container/Max Width | `variable-e902ad3f-c11d-6c00-20a3-cc500dc64246` | `calc(fluid-max*1rem)` = 90rem | **75rem** (1200px measured) |
| Container/Gutter | `variable-4d0ede4e-f1ec-ea83-f9e4-40b71f6fac92` | 6vw | ✓ |
| Card/Border Radius | `variable-30571a26-0320-189d-8e1f-e096624aa6d4` | 0.5rem | **0.625rem** (10px) |
| Card/Padding Min · Max | `variable-cdf33f76-…` · `variable-e8ca3cd4-…` | 1 · 1.5 | ✓ |
| Button/Font Weight | `variable-821dc75d-a90a-fca6-37ee-fcbc5677282f` | **400** | **600** |
| Button/Border Radius | `variable-d63e0ed2-588f-1045-6976-6bbe70f43c8b` | 0.5rem | **0.25rem** (4px) |
| Button/Vertical Padding | `variable-a61ea47b-4a6a-3bcb-c23a-fee6705b0228` | 0.7em | **1em** |
| Button/Horizontal Padding | `variable-c0d661ec-e910-34b9-9e36-c849ad1e70b9` | 1em | **2em** |
| Button/Font Size · Line Height | `variable-2d2dc798-…` · `variable-f89e2bd0-…` | 1rem · 1.3em | ✓ |
| Input/Border Radius | `variable-05dc4f3e-a996-3923-909d-b2ca561e705f` | 0.5rem | **0.25rem** |

---

## Order when auth is restored

1. **Color** — 5 updates + 2 creates. Cheapest meaningful test: the starter pages
   should visibly restyle to Deep Forest and Lichen.
2. **Theme** — 8 updates across two modes + 1 new Surface role. Proves modes work.
3. Stop and look before going further.
4. Typography (~40 writes), Layout (1), Components (7).
5. Only then classes and components.
