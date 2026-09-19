# Fluid type-scale expressions

The Webflow variable API **cannot write custom expressions** — `create_size_variable` and
`update_size_variable` both reject `custom_value`. Verified with a clamp referencing
variables and with a clamp of pure literals; both failed while `static_value` writes in
the same batch succeeded.

The Min/Max **number** variables below are already created and set via the API. What is
left is a one-time paste of each expression into the matching `Font Size` variable in the
Designer. After that the scale is permanently API-drivable: change the Min/Max numbers and
the expression follows.

This mirrors how MAST already handles `Section/Padding`, which is exactly why that value
was reachable through the API and these were not.

| Level | Min (rem) | Max (rem) |
|---|---|---|
| H1 | 2.5 | 5 |
| H2 | 2.25 | 4 |
| H3 | 1.75 | 3 |
| H4 | 1.5 | 2 |
| H5 | 1.25 | 1.5 |
| H6 | 1.125 | 1.25 |
| Paragraph (Body) | 1 | 1.25 |
| Paragraph LG | 1.125 | 1.5 |

---


## H1/Font Size

```
clamp(var(--_typography---h1--font-size-min-rem) * 1rem, ((var(--_typography---h1--font-size-min-rem) - ((var(--_typography---h1--font-size-max-rem) - var(--_typography---h1--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min)) * var(--_layout---fluid--min))) * 1rem + ((var(--_typography---h1--font-size-max-rem) - var(--_typography---h1--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min))) * 100vw), var(--_typography---h1--font-size-max-rem) * 1rem)
```


## H2/Font Size

```
clamp(var(--_typography---h2--font-size-min-rem) * 1rem, ((var(--_typography---h2--font-size-min-rem) - ((var(--_typography---h2--font-size-max-rem) - var(--_typography---h2--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min)) * var(--_layout---fluid--min))) * 1rem + ((var(--_typography---h2--font-size-max-rem) - var(--_typography---h2--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min))) * 100vw), var(--_typography---h2--font-size-max-rem) * 1rem)
```


## H3/Font Size

```
clamp(var(--_typography---h3--font-size-min-rem) * 1rem, ((var(--_typography---h3--font-size-min-rem) - ((var(--_typography---h3--font-size-max-rem) - var(--_typography---h3--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min)) * var(--_layout---fluid--min))) * 1rem + ((var(--_typography---h3--font-size-max-rem) - var(--_typography---h3--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min))) * 100vw), var(--_typography---h3--font-size-max-rem) * 1rem)
```


## H4/Font Size

```
clamp(var(--_typography---h4--font-size-min-rem) * 1rem, ((var(--_typography---h4--font-size-min-rem) - ((var(--_typography---h4--font-size-max-rem) - var(--_typography---h4--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min)) * var(--_layout---fluid--min))) * 1rem + ((var(--_typography---h4--font-size-max-rem) - var(--_typography---h4--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min))) * 100vw), var(--_typography---h4--font-size-max-rem) * 1rem)
```


## H5/Font Size

```
clamp(var(--_typography---h5--font-size-min-rem) * 1rem, ((var(--_typography---h5--font-size-min-rem) - ((var(--_typography---h5--font-size-max-rem) - var(--_typography---h5--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min)) * var(--_layout---fluid--min))) * 1rem + ((var(--_typography---h5--font-size-max-rem) - var(--_typography---h5--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min))) * 100vw), var(--_typography---h5--font-size-max-rem) * 1rem)
```


## H6/Font Size

```
clamp(var(--_typography---h6--font-size-min-rem) * 1rem, ((var(--_typography---h6--font-size-min-rem) - ((var(--_typography---h6--font-size-max-rem) - var(--_typography---h6--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min)) * var(--_layout---fluid--min))) * 1rem + ((var(--_typography---h6--font-size-max-rem) - var(--_typography---h6--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min))) * 100vw), var(--_typography---h6--font-size-max-rem) * 1rem)
```


## Paragraph (Body)/Font Size

```
clamp(var(--_typography---paragraph-body--font-size-min-rem) * 1rem, ((var(--_typography---paragraph-body--font-size-min-rem) - ((var(--_typography---paragraph-body--font-size-max-rem) - var(--_typography---paragraph-body--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min)) * var(--_layout---fluid--min))) * 1rem + ((var(--_typography---paragraph-body--font-size-max-rem) - var(--_typography---paragraph-body--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min))) * 100vw), var(--_typography---paragraph-body--font-size-max-rem) * 1rem)
```


## Paragraph LG/Font Size

```
clamp(var(--_typography---paragraph-lg--font-size-min-rem) * 1rem, ((var(--_typography---paragraph-lg--font-size-min-rem) - ((var(--_typography---paragraph-lg--font-size-max-rem) - var(--_typography---paragraph-lg--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min)) * var(--_layout---fluid--min))) * 1rem + ((var(--_typography---paragraph-lg--font-size-max-rem) - var(--_typography---paragraph-lg--font-size-min-rem)) / (var(--_layout---fluid--max) - var(--_layout---fluid--min))) * 100vw), var(--_typography---paragraph-lg--font-size-max-rem) * 1rem)
```
