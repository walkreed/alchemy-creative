---
description: >-
  Use this skill when building or extending pages, layouts, and components so
  they follow the site's established design system.
isDraft: false
---
# Design System

## System Identity and Source

This design system belongs to the Webflow site **Mast Starter - WR**.

Extend the system from its authored semantic collections, shared components, and responsive utilities. Keep the established Theme modes and use the authored collections as the source of truth for visual decisions. {{wf-ref:variable_collection:collection-7df4a73c-9a56-a8b7-efe4-68d0c5f0336d}} {{wf-ref:variable_collection:collection-9d323d2d-82a9-e2bc-252e-67213e00be97}} {{wf-ref:variable_collection:collection-389f9d78-f416-84a3-d00d-1094c8095454}} {{wf-ref:variable_collection:collection-97f2be71-bc47-82ef-742f-38f3a2dd0b75}} {{wf-ref:variable_collection:collection-b79ca2fc-c9a8-5c66-ffb3-278fd315150c}}

The site evidences MAST conventions through semantic variables, a 12-column responsive grid, descriptive base classes, u- utilities, and cc- modifiers. Preserve those conventions when adding pages, components, and variants. Use the existing page shell and shared layout foundations instead of creating parallel structures.

## Design Principles

- Reuse authored variables for semantic roles such as background, text, accent, border, typography, component sizing, and layout spacing. Extend the appropriate collection before introducing a new token.
- Build page structure from the shared wrapper, section, row, and column foundations. Use responsive column classes and established row alignment modifiers rather than one-off grid rules.{{wf-ref:style:0d4417db-eb45-5014-547d-0710f260a16f}}{{wf-ref:style:2954b806-7928-1aa7-2cd5-de0aa6d1f359}}{{wf-ref:style:2954b806-7928-1aa7-2cd5-de0aa6d1f35a}}
- Use shared components for repeated interaction and content patterns. Choose an existing variant or cc- modifier before creating a new component or custom class.
- Keep authored responsive behavior intact. Extend existing breakpoint tiers and preserve the site's mobile reflow patterns for navigation, columns, images, rich text, and controls.
- Preserve the system's restrained visual language: semantic color roles, thin borders, rounded component surfaces, responsive type, and short state transitions.

## Components

Use the shared component library as the primary extension surface. Configure component props and existing variants first, then compose components through their documented child relationships. Keep nested components inside their intended parents.

### {{wf-ref:component:67b7c4aa-94fb-954e-4841-e652e35b59e3}}

Use this for semantic headings and select the authored heading level or inherit option according to document hierarchy. Don't choose a heading variant only for visual size, skip heading levels, or use it in place of body copy.

- **Variants:** Inherit, H1, H2, H3, H4, H5, H6
- **Content shape:** Provide heading text through the component's authored props and preserve the document outline. Use the typography variables through the existing heading variants.
- **Data source:** Static and CMS-bound. Its mixed data source supports authored labels and connected heading content. Keep heading semantics independent from the source of the text.
- **Usage:** 99 instances across 4 pages (common). Treat it as a common content primitive and use it instead of styling arbitrary text to look like a heading.

### {{wf-ref:component:8171c932-813f-23f6-48d9-1ec5e9c7cb7c}}

Use this only inside the shared grid row. Select the authored fill, shrink, or fractional width variant that matches the layout.{{wf-ref:style:2954b806-7928-1aa7-2cd5-de0aa6d1f35f}}{{wf-ref:style:bbb400bd-fdcf-bbaa-7c6f-0d58cbf14d4a}}{{wf-ref:style:5921b864-f7c8-485a-838d-5a9b7d56a423}}{{wf-ref:style:c6dc3fbe-e6f3-bd82-2125-00cc7f03625b}} Don't use it as a standalone flex column or create custom percentage widths when an authored column variant provides the needed behavior.

- **Variants:** Fill, Shrink, 2/12, 3/12, 4/12, 5/12, 6/12, 7/12, 8/12, 9/12, 10/12, 11/12, 12/12
- **Content shape:** Place content inside the column and compose the row with the responsive column variants. Use nested content wrappers when alignment or sizing needs to remain separate from the grid width.{{wf-ref:component:88c35d9d-e94a-b7df-d5b9-89bcabf4c59b}}
- **Data source:** Static and CMS-bound. Its mixed data source supports authored column composition and connected content. Keep responsive sizing in the column variant.
- **Usage:** 84 instances across 4 pages (common). Treat it as a common nested layout component. Its high reuse makes it the default path for new grid content.

### {{wf-ref:component:bb9c9ec6-d066-6969-8252-cbd8099adc8b}}

Use this for structured editorial content. Select the authored paragraph size variant when the content needs a deliberate reading scale.{{wf-ref:style:1eb34da7-0856-4544-995d-b40135a78e5b}} Don't use it for a single short label, a heading, or a control label. Use the dedicated content or heading component for those roles.

- **Variants:** Paragraph SM, Inherit, Paragraph LG, Paragraph XL
- **Content shape:** Pass rich text through the component and preserve its authored heading, list, link, quote, and code treatment. Use the responsive paragraph variants rather than local type overrides.
- **Data source:** Static and CMS-bound. Its mixed data source supports authored rich text and connected editorial content. Preserve semantic rich text structure when binding CMS content.
- **Usage:** 72 instances across 4 pages (common). Treat it as a common content primitive and use it for long-form material instead of duplicating rich text styles.

### {{wf-ref:component:620b0582-6969-654a-745c-3ae5c1468861}}

Use this for repeated content surfaces and select the hoverable variant only when the whole card has an interactive state.{{wf-ref:variable:variable-30571a26-0320-189d-8e1f-e096624aa6d4}} Don't use a card to create an arbitrary border around every group of content or add a hover state to a non-interactive surface.

- **Variants:** None, Hoverable
- **Content shape:** Compose the surface with the nested card body and place content, media, and actions inside the established card structure.{{wf-ref:component:c54f99be-c006-b230-880b-566e2bcf238d}}
- **Data source:** Static and CMS-bound. Its mixed data source supports authored cards and connected repeated content. Keep collection-driven content inside the same card composition.
- **Usage:** 78 instances across 3 pages (common). Treat it as a common layout component. Its high reuse means new repeated content should start from this pattern.

### {{wf-ref:component:b491691c-02bf-727c-f564-5b834dbc16ae}}

Use this as the parent for every shared grid row. Choose an existing alignment variant for the row's horizontal and vertical behavior.{{wf-ref:style:2954b806-7928-1aa7-2cd5-de0aa6d1f35a}}{{wf-ref:style:5921b864-f7c8-485a-838d-5a9b7d56a428}} Don't combine it with an unrelated custom grid system or place grid columns outside its intended structure.

- **Variants:** Top Left, Top Right, Top Center, Top Between, Center Left, Center Right, Center Center, Center Between, Bottom Left, Bottom Right, Bottom Center, Bottom Between
- **Content shape:** Pass row content through its authored record props and compose it from the dedicated column component.{{wf-ref:component:8171c932-813f-23f6-48d9-1ec5e9c7cb7c}}
- **Data source:** Static and CMS-bound. Its mixed data source supports both authored layout composition and connected content. Keep layout responsibility in the row and column pair.
- **Usage:** 42 instances across 4 pages (common). Treat it as a common foundation. Reuse alignment variants instead of adding alignment utilities for repeated cases.

### {{wf-ref:component:2bb3e920-91be-def7-1509-d38c2b3acc09}}

Use this as the global navigation shell on pages that need site navigation. Preserve its existing base and inverted variants and its relationship with the shared navigation classes.{{wf-ref:style:d6b351b5-5669-1409-40d2-a3ad72738c4d}}{{wf-ref:style:cc00e7b2-4d90-7773-b1e8-44bb29f10d0f}}{{wf-ref:style:d706f3ae-59f8-3a57-c784-dc5bde5d738c}} Don't recreate navigation markup as a page-specific component or use it as a general content wrapper.

- **Variants:** Base, Invert
- **Content shape:** Configure its authored record props and select an existing variant. Keep navigation links and the nested action within the component's established structure.{{wf-ref:component:2802151f-85ca-94c8-256a-a9206a0d9625}} Established child components: {{wf-ref:component:2802151f-85ca-94c8-256a-a9206a0d9625}}.
- **Data source:** Static and CMS-bound. Its mixed data source supports the site's authored and connected navigation content. Preserve that boundary when extending menu content.
- **Usage:** 6 instances across 6 pages (occasional). Treat it as an occasional global component and reuse the same instance pattern across page types rather than adding local navigation versions.

### {{wf-ref:component:e2fa2670-5bca-38f1-9fbd-3bf287b462f6}}

Use this for the shared page footer. Preserve its base and inverted variants and the existing footer modifier treatment.{{wf-ref:style:4e4d3a0c-7895-c9ac-00d2-64b6ce25a059}} Don't use it as a generic bottom-of-section container or replace it with a page-specific footer.

- **Variants:** Base, Invert
- **Content shape:** Pass its authored record props and row content through the component. Keep footer content inside the global component boundary.
- **Data source:** Static and CMS-bound. Its mixed data source allows the authored footer structure to support connected content. Extend the existing fields instead of hardcoding a second footer.
- **Usage:** 6 instances across 6 pages (occasional). Treat it as an occasional global component and keep its placement consistent with the page shell.

### {{wf-ref:component:2802151f-85ca-94c8-256a-a9206a0d9625}}

Use this for primary and secondary calls to action. Select the authored variant and add an icon only through the existing nested icon relationship.{{wf-ref:style:c6dc3fbe-e6f3-bd82-2125-00cc7f036256}}{{wf-ref:component:06bb80cf-49ba-d581-f40f-0b3e650b691b}} Don't create a local button class for a color, radius, padding, or focus state that the shared component already controls.

- **Variants:** Primary, Secondary
- **Content shape:** Provide the authored label, action, record props, and optional nested icon. Preserve the component's inline-flex sizing and state behavior. Established child components: {{wf-ref:component:06bb80cf-49ba-d581-f40f-0b3e650b691b}}.
- **Data source:** Static and CMS-bound. Its mixed data source supports authored actions and connected labels or links. Keep action semantics in the component rather than styling arbitrary text as a button.
- **Usage:** 18 instances across 5 pages (common). Treat it as a common interactive primitive and reuse its variants across content, error, and utility pages.

### {{wf-ref:component:b886391d-2fdd-670b-4e58-638db98d5904}}

Use this for editorial and responsive media. Select an authored aspect-ratio variant or the background option according to the content role.{{wf-ref:style:aa5ad9ad-f301-35e2-2833-1e4423652b65}}{{wf-ref:style:ba21126e-1a7f-93fe-1d1b-5d602a58ccd9}} Don't add custom image sizing when an existing ratio or fit option matches the composition, and don't use background treatment for content that needs an informative image.

- **Variants:** 4x3, 3x4, 16x9, 9x16, 1x1, Custom Aspect Ratio, Background
- **Content shape:** Provide the image content and select the authored fit or ratio through the nested image relationship. Preserve the crop position when the subject requires it.{{wf-ref:component:f26a2293-395b-4ae8-790c-995767bc55e4}} Established child components: {{wf-ref:component:f26a2293-395b-4ae8-790c-995767bc55e4}}.
- **Data source:** Static and CMS-bound. Its mixed data source supports authored and connected media. Keep image content and crop settings configurable through the component.
- **Usage:** 22 instances across 3 pages (common). Treat it as a common content component and use it for repeated media instead of styling raw image elements independently.

### {{wf-ref:component:bebbcdc3-9abd-e622-1504-a2e3ba27c2a9}}

Use this as the primary section-level layout boundary. Select the existing section variant for the intended surface and place shared spacing or section content inside it.{{wf-ref:style:2954b806-7928-1aa7-2cd5-de0aa6d1f359}}{{wf-ref:component:c16decc0-1e8a-912d-4d26-28ec046e3191}} Don't use it for small internal spacing or to replace a component body. Use the spacing component or component-level padding for those cases.

- **Variants:** Primary, Secondary, Dark
- **Content shape:** Compose section content from the section's authored record props and row-based children. Use the nested spacer only where a deliberate section gap is needed. Established child components: {{wf-ref:component:c16decc0-1e8a-912d-4d26-28ec046e3191}}.
- **Data source:** Static and CMS-bound. Its mixed data source supports authored section composition and connected content. Keep the section variant responsible for surface intent.
- **Usage:** 18 instances across 3 pages (common). Treat it as a common layout primitive and use it consistently to maintain section rhythm across pages.

### {{wf-ref:component:2bfc4e52-8abc-c92f-2661-80d0c4a33fe2}}

Use this for expandable question-and-answer or progressive disclosure content. Keep the trigger, content, and icon relationship intact.{{wf-ref:style:467a6191-e9c3-dbb5-ba32-45ad491d90f6}}{{wf-ref:style:467a6191-e9c3-dbb5-ba32-45ad491d90f8}} Don't use it when all content should remain visible or when a tab, modal, or navigation pattern better represents the interaction.

- **Content shape:** Provide trigger text and panel content through the authored record props. Preserve the trigger's button semantics and the icon's state transition.
- **Data source:** Static and CMS-bound. Its mixed data source supports authored panels and connected content. Keep each trigger paired with its corresponding panel.
- **Usage:** 9 instances across 2 pages (occasional). Treat it as an occasional interactive pattern and reuse the existing component before implementing custom disclosure behavior.

### {{wf-ref:component:6865adb9-ad77-8000-2327-4f8be5e25311}}

Use this for mutually exclusive content views. Compose it with the corresponding menu, links, panes, and optional play or pause control.{{wf-ref:component:12377579-99b1-ac1f-ea79-1bb609f86985}}{{wf-ref:component:3bcb4c0b-515d-0723-4f48-f6007e4a90ab}}{{wf-ref:component:3ed710cd-f13d-0719-4b9e-32a585ab056a}}{{wf-ref:component:34e77a18-ed2d-df6c-f055-f308523161bc}} Don't use tabs for a short sequence of actions, unrelated navigation, or content that users need to compare simultaneously.

- **Content shape:** Keep the tab links and panes in the same order, choose the horizontal or vertical menu variant, and add the optional playback control only when autoplay is intentional.
- **Data source:** Static and CMS-bound. Its mixed data source supports authored tab structures and connected pane content. Preserve the one-to-one ordering between menu items and panes.
- **Usage:** 3 instances across 2 pages (occasional). Treat it as an occasional interactive component and extend the existing nested pattern rather than creating a new tab implementation.

## Layout and Grid

Keep the established page structure: a page wrapper contains the page main region, sections provide vertical boundaries, containers control readable width, and rows and columns provide responsive composition.

Use the shared utility grid before writing custom layout CSS. Apply base classes for structure, responsive column classes for width, and row alignment modifiers for positioning.

{{wf-ref:style:2954b806-7928-1aa7-2cd5-de0aa6d1f35c}} Use this to center content, apply the authored gutter, and cap the readable width. Place it inside sections and use it as the default content width before introducing a narrower local wrapper.

{{wf-ref:style:2954b806-7928-1aa7-2cd5-de0aa6d1f35f}} Use this as the base column behavior. It supplies the shared gap compensation and responsive flex sizing. Combine it with an authored width variant and let the breakpoint rules control reflow.

{{wf-ref:style:0d4417db-eb45-5014-547d-0710f260a16f}} Use this as the outer page shell so the page keeps the authored flex structure, surface roles, and text color relationship. Keep it as the outermost wrapper on static page patterns that already use it. Add page-specific behavior inside the shell rather than changing the shell for one page.

{{wf-ref:style:2954b806-7928-1aa7-2cd5-de0aa6d1f35a}} Use this as the shared flex row with the authored main gap and alignment behavior. Compose rows from the shared grid columns and select an existing alignment modifier when content needs a different vertical or horizontal arrangement.

{{wf-ref:style:bbb400bd-fdcf-bbaa-7c6f-0d58cbf14d4a}} Use this as the three-column fraction in the 12-column system. Pair it with the authored medium and small column variants when the layout should move from three columns to two and then one.{{wf-ref:style:5921b864-f7c8-485a-838d-5a9b7d56a423}}{{wf-ref:style:c6dc3fbe-e6f3-bd82-2125-00cc7f03625b}}

{{wf-ref:style:5921b864-f7c8-485a-838d-5a9b7d56a428}} Use this established row modifier when content must distribute space between the row edges. Prefer the shared alignment modifiers over custom justify-content declarations for repeated row arrangements.

For a new page, start with the existing page shell, add a section and container, then compose a row from responsive columns. Keep page-specific classes focused on genuine content differences and use shared utilities for spacing, width, visibility, and alignment.

## Page Templates

Reuse the global shell for static page patterns that already use it, including the home, component reference, password, and not-found page structures.{{wf-ref:page:6aad7d4121d8828938eb64ce}}{{wf-ref:page:6aad7d4121d8828938eb64d2}}{{wf-ref:page:6aad7d4121d8828938eb64d0}}{{wf-ref:page:6aad7d4121d8828938eb64d1}}

- Use the component reference page as the place to demonstrate and validate shared components, variants, responsive behavior, and nested relationships.{{wf-ref:page:6aad7d4121d8828938eb64d2}}
- Keep the CMS template boundary separate from static page composition. Preserve its dynamic content role when extending blog detail pages.{{wf-ref:page:6aad7d4121d8828938eb64d7}}
- Keep utility pages structurally simple and use the shared button and page shell patterns where they already apply.{{wf-ref:page:6aad7d4121d8828938eb64d0}}{{wf-ref:page:6aad7d4121d8828938eb64d1}}{{wf-ref:component:2802151f-85ca-94c8-256a-a9206a0d9625}}

## Tokens

### Colors

Use semantic color roles rather than raw color values. Preserve the authored Theme modes and keep base brand values in the Color collection, with role variables resolving the active surface, text, border, and accent behavior.{{wf-ref:variable_collection:collection-7df4a73c-9a56-a8b7-efe4-68d0c5f0336d}}{{wf-ref:variable_collection:collection-b79ca2fc-c9a8-5c66-ffb3-278fd315150c}}{{wf-ref:variable_mode:collection-7df4a73c-9a56-a8b7-efe4-68d0c5f0336d/mode-bf6faaa8-2bf5-9c53-b568-f9d802b7c009}}{{wf-ref:variable_mode:collection-7df4a73c-9a56-a8b7-efe4-68d0c5f0336d/mode-004c43ec-f566-51d5-67f2-c6a54b9a2944}}

- {{wf-ref:variable:variable-9da3735a-3665-e4a7-0144-bd2d3cac66d2}}: Use this as the primary page and section background role. Apply it through the shared page, section, navigation, menu, modal, and content surface patterns. Keep background decisions mode-aware. Check every foreground pairing against the active background at WCAG AA before shipping, especially when a new mode or surface is added.
- {{wf-ref:variable:variable-f3ad99f6-c570-2079-815f-5d1330cb061f}}: Use this as the primary text role for page content and controls. Use it for readable content, navigation, modal text, and interactive states that need to inherit the active theme. Verify normal and large text contrast against every background where this role is used in each authored mode.
- {{wf-ref:variable:variable-11024737-13f6-2e44-62c6-dbf07da4d227}}: Use this as the semantic border role for cards, controls, dividers, navigation, and form surfaces. Prefer it over local border colors so surfaces and controls remain consistent across theme modes. Check border visibility where a border conveys component boundaries or state, and don't rely on a low-contrast border as the only indication of interaction.
- {{wf-ref:variable:variable-509e6879-1afd-6ed5-a87a-b21acc301485}}: Use this as the active accent role for calls to action, focus indicators, hover states, and selected interactive states. Use it for buttons, links, focus outlines, active tabs, and other state changes already established by the shared components. Verify accent text, accent fills, focus indicators, and hover treatments against their surrounding surfaces for WCAG AA and non-text contrast requirements.
- {{wf-ref:variable:variable-ba25d908}}: Use this as a base brand color where the authored system calls for a direct brand role, including the skip-link treatment. Keep base brand values in the Color collection and reference them through semantic roles when a component needs theme-aware behavior. Test direct brand usage with its foreground and background pairing instead of assuming the brand color is accessible in every context.
- {{wf-ref:variable:variable-48b90597-b46c-7c22-b28e-0dd7a0847d66}}: Use this as the authored secondary brand value for supporting visual emphasis. Use it only where a component or theme role calls for secondary brand emphasis. Don't substitute it for the primary accent without a documented semantic reason. Verify contrast for each text and control pairing before using this value in an interactive or informational role.
- {{wf-ref:variable:variable-a916a5ae-6a4a-f950-0bb1-5cd931bd284b}}: Use this as the authored light tint derived from the primary brand color for subtle supporting surfaces. Use it for low-emphasis backgrounds or supporting states where the existing theme role expects a light tint, not for primary text or critical state communication. Treat light tints as backgrounds and test the foreground placed over them in every mode.
- {{wf-ref:variable:variable-89813b2f-b046-8d42-1c20-be3c83c4d3c8}}: Use this as the authored neutral brand value for supporting surfaces or accents where the component or theme specifies it. Reference it through a semantic role and preserve the Color collection's separation between base brand values and theme roles. Check whether the neutral is being used as a background, text color, border, or decorative fill before approving the pairing.

Add new colors to the appropriate base or semantic collection, then connect them to Theme roles and modes. Avoid hardcoded colors in new classes unless the authored system already uses a deliberate component-specific exception.

### Typography

Use the authored primary family for body copy, headings, controls, and most content styles, with the separate authored mono family reserved for eyebrow content. Keep responsive clamp-based type scales, authored weights, line heights, and letter spacing together.{{wf-ref:variable:variable-aaf0a01d-de50-9613-5c48-f68377edd33f}}{{wf-ref:variable:variable-6354049b-61e7-343b-5872-e54c59467d70}}

Preserve semantic heading levels. Use heading components or tag styles for hierarchy, and use rich text variants for deliberate paragraph scale rather than changing font size locally.

The authored font families are `IBM Plex Mono` and `IBM Plex Sans`.

- {{wf-ref:variable:variable-36f02573-7129-9f9c-5452-a7155777c1d0}}. Use this as the authored body weight. Keep ordinary body copy at the authored regular weight and use heavier weights only through existing heading or control styles.
- {{wf-ref:variable:variable-51185a7b-8f67-d770-2243-45763cc61bef}}. Use this as the responsive body text size. Apply it through the body foundation and keep ordinary page copy on the authored body scale.
- {{wf-ref:variable:variable-77458dcd-1808-0bef-0705-4e38e571fdba}}. Use this as the body line-height role. Keep body copy readable with the authored line height and avoid tightening long-form text through local overrides.
- {{wf-ref:variable:variable-3af868c1-dd36-6aa4-95cb-6666522bcf1b}}. Use this as the authored second-level heading weight. Preserve the shared medium heading weight rather than introducing a heavier display treatment.
- {{wf-ref:variable:variable-6bf51e71-4792-80fa-3de4-8de2466e4bed}}. Use this as the responsive second-level heading scale. Use it for major section headings and preserve the authored tight tracking and line height.
- {{wf-ref:variable:variable-6e55da87-7307-ac61-f1f0-052fa5e60fdf}}. Use this as the responsive eyebrow size. Pair it with the authored mono family, uppercase treatment, tracking, and bottom margin for labels that introduce content.

Use the authored responsive hierarchy from body and small paragraph sizes through large paragraph and heading sizes. Preserve the existing clamp behavior and don't replace it with fixed desktop values.

Use the authored regular weight for body and paragraph variants, medium weight for headings, eyebrows, labels, and the shared interactive treatments where specified.

Keep the authored tighter line heights for large headings and the more generous line heights for body and paragraph variants. Preserve the component-specific control line heights.

Use semantic heading levels for document structure, the eyebrow style for short uppercase labels, rich text variants for editorial scale, and the shared button and input variables for controls. Avoid styling text by visual size alone.

### Spacing

Use the authored layout scale for gaps, margins, section rhythm, and component sizing. The system combines fixed grid gaps with em-based text spacing and fluid section or component dimensions.{{wf-ref:variable:variable-69859685-28e1-bcbc-4bd8-a4fdb0b31f47}}{{wf-ref:variable:variable-85045ea0-f11b-650c-81f8-46ff407bac28}}{{wf-ref:variable:variable-9a8f9381-e84f-4f27-fb30-47c3a4c45503}}

Use the smallest authored grid gap as the practical base for compact layout decisions, then move through the medium and main gap roles instead of inventing intermediate values.{{wf-ref:variable:variable-9a8f9381-e84f-4f27-fb30-47c3a4c45503}}{{wf-ref:variable:variable-85045ea0-f11b-650c-81f8-46ff407bac28}}{{wf-ref:variable:variable-69859685-28e1-bcbc-4bd8-a4fdb0b31f47}}

- {{wf-ref:variable:variable-69859685-28e1-bcbc-4bd8-a4fdb0b31f47}}. Use this as the main grid gap. Use it for the default row gap, column compensation, main spacer, and larger divider rhythm.
- {{wf-ref:variable:variable-f87d4b30-dac5-db12-1b25-d5546840b78b}}. Use this as the medium text-relative margin. Use it for common component separation, slider controls, and responsive utility spacing already tied to the medium scale.
- {{wf-ref:variable:variable-3a7a3f61-84d7-f0db-10fc-5f94ab9ec9e9}}. Use this as the small text-relative margin. Use it for compact vertical separation between related content groups.
- {{wf-ref:variable:variable-646e8dd4-d0ad-b664-7a2e-fc7a428c90e3}}. Use this as the large text-relative margin. Reserve it for larger content separation and authored utility applications rather than ordinary adjacent elements.

The observed grid gap progression is small, medium, and main. Text-relative margins extend the rhythm through extra-small, small, medium, and large roles.{{wf-ref:variable:variable-7fd438bc-6cc6-d93e-c2bc-62f9ac6b84f4}}{{wf-ref:variable:variable-3a7a3f61-84d7-f0db-10fc-5f94ab9ec9e9}}{{wf-ref:variable:variable-f87d4b30-dac5-db12-1b25-d5546840b78b}}{{wf-ref:variable:variable-646e8dd4-d0ad-b664-7a2e-fc7a428c90e3}}

Use grid gaps for rows, columns, dividers, spacers, and layout relationships. Use em-based margins for typography-led rhythm. Use the existing spacing utilities for repeated margin behavior.{{wf-ref:style:95e5d96d-753b-722c-0ca8-d5a0b89a701c}}{{wf-ref:style:95e5d96d-753b-722c-0ca8-d5a0b89a701d}}{{wf-ref:style:95e5d96d-753b-722c-0ca8-d5a0b89a701a}}{{wf-ref:style:49b6839d-6030-a4eb-1866-96f4fd8be7f1}}

Prefer authored fluid sizing for sections, cards, typography, and other surfaces that already use responsive ranges. Keep component padding and control dimensions tied to their component variables.{{wf-ref:variable:variable-a61ea47b-4a6a-3bcb-c23a-fee6705b0228}}{{wf-ref:variable:variable-c0d661ec-e910-34b9-9e36-c849ad1e70b9}}{{wf-ref:variable:variable-158558c4-5334-110c-d750-61eeb79d343d}}

### Responsive Behavior

- `main` applies through `10000px`.
- `medium` applies through `991px`.
- `small` applies through `767px`.
- `tiny` applies through `479px`.

Extend the existing breakpoint behavior rather than adding one-off viewport thresholds. Keep desktop composition in the shared grid, allow the authored medium and small rules to reflow content, and preserve the compact behavior at the narrowest tier.

When a new component needs responsive behavior, add it to the component or utility pattern and follow the site's existing direction changes, width changes, visibility rules, and spacing reductions.

- {{wf-ref:style:2954b806-7928-1aa7-2cd5-de0aa6d1f35f}}. Provides the base column flex behavior and authored responsive width changes. Pair the base column with responsive width variants so layouts move through the existing fractional widths before stacking.
- {{wf-ref:style:ba21126e-1a7f-93fe-1d1b-5d602a58ccd9}}. Provides responsive image crop positioning. Use an authored fit position when the subject needs a controlled crop, and preserve that position across the existing responsive states.
- {{wf-ref:style:aa5ad9ad-f301-35e2-2833-1e4423652b65}}. Provides the image component's authored aspect-ratio choices. Select an existing ratio for the content rather than creating a new ratio class for each viewport.
- {{wf-ref:style:3ee84174-4fdf-6570-4ada-ec3ed0911b8b}}. Provides the mega-menu changes between wide and narrower navigation states. Keep the menu's authored height, overflow, border, radius, and padding changes together when extending navigation.
- {{wf-ref:style:1eb34da7-0856-4544-995d-b40135a78e5b}}. Provides responsive rich text sizing through the authored paragraph variants. Use the existing small, large, and extra-large rich text variants instead of applying viewport-specific font overrides.
- {{wf-ref:style:c25f15ff-722b-3c76-2d61-2119ddf95849}}. Provides the slider pagination reflow for narrower layouts. Keep pagination in the authored responsive order and width behavior when adding slider content.
- {{wf-ref:style:d706f3ae-59f8-3a57-c784-dc5bde5d738c}}. Provides the navigation link changes for narrower navigation. Reuse the link's existing full-width and alignment behavior when extending the mobile navigation.

Use the existing breakpoint tiers and responsive class infixes. Test new layouts at the authored transitions, verify that columns stack as intended, and avoid adding a new breakpoint solely to fix one component.

## Iconography

Use the shared icon component for interface icons and select its authored color variant. Use the nested size component only within the main icon component.{{wf-ref:component:06bb80cf-49ba-d581-f40f-0b3e650b691b}}{{wf-ref:component:e16230fb-1f30-f571-d2a8-01ae79aeefaa}}

- Choose an existing size or inherit behavior instead of setting local icon dimensions.{{wf-ref:component:e16230fb-1f30-f571-d2a8-01ae79aeefaa}}
- Use icons as part of shared controls and component relationships, especially buttons, navigation, accordion triggers, tabs, and playback controls.{{wf-ref:component:2802151f-85ca-94c8-256a-a9206a0d9625}}{{wf-ref:component:2bfc4e52-8abc-c92f-2661-80d0c4a33fe2}}{{wf-ref:component:34e77a18-ed2d-df6c-f055-f308523161bc}}
- Keep icon color and sizing aligned with the parent component's semantic state. Don't introduce a new icon treatment when an existing component variant provides the required role.

## Elevation and Depth

The system communicates depth primarily through semantic borders, restrained rounded surfaces, background changes, and state transitions. Keep surfaces quiet and use the established radius roles consistently.

- {{wf-ref:variable:variable-30571a26-0320-189d-8e1f-e096624aa6d4}}. Use this as the shared card radius. Apply it to card surfaces and related framed content so repeated surfaces share the same corner treatment.
- {{wf-ref:style:d1093dda-e864-be23-709c-85ee1bb4b9e6}}. Provides the accent-filled banner surface with a restrained hover depth change. Use the banner pattern for prominent linked announcements and preserve its existing accent, inset hover, and focus behavior.
- {{wf-ref:variable:variable-d63e0ed2-588f-1045-6976-6bbe70f43c8b}}. Use this as the shared button radius. Apply it to buttons and control surfaces that follow the button treatment, including related interactive controls.
- {{wf-ref:style:ae625244-0896-dce4-1c01-157b1c848ef7}}. Provides the shared divider treatment for separating content without adding a heavy surface effect. Use the border component for authored section or content separation and select its existing size variant.
- {{wf-ref:variable:variable-05dc4f3e-a996-3923-909d-b2ca561e705f}}. Use this as the input radius. Keep form controls aligned with the input-specific surface treatment rather than borrowing an unrelated radius.

Prefer the established border and radius language over new shadows, gradients, or decorative effects. If a new surface needs depth, start with the existing semantic border, background role, and radius pattern.

## Motion and Animation

Separate authored interaction timelines from CSS state transitions. Reuse the shared short duration and easing for hover, focus, open, selected, and control-state changes, and keep motion tied to a meaningful state change.

The site includes one authored stagger interaction and a set of component-level CSS transitions. Extend the relevant pattern instead of adding a separate animation system.

- {{wf-ref:interaction:i-4538ce95}}. Use this interaction pattern for staggered child entrance behavior. Its timeline uses one 0.4-second action with the authored easing and animates autoAlpha. Keep the interaction for progressive entrance rather than applying it to every state change. It honors reduced-motion preferences.
- {{wf-ref:style:c6dc3fbe-e6f3-bd82-2125-00cc7f036256}}. Provides the shared button transition pattern. Reuse the existing short transition for background, border, hover, and focus state changes instead of animating layout or position.
- {{wf-ref:style:ad65829f-02cb-4499-67c8-3e3b817cdf82}}. Provides the shared tab-link transition pattern. Use it for tab color, border, and background state changes while keeping the active state understandable without motion.
- {{wf-ref:style:8a6ff0b5-a554-0566-bcda-506c1f6a6b9e}}. Provides the input border transition pattern. Use it for focus or hover border changes and keep the field's size and position stable.
- {{wf-ref:style:b88b8345-ee8a-2f6f-9926-25b88ab48e52}}. Provides the modal transition pattern. Reuse the modal state transition for opening and closing behavior, while preserving keyboard and focus management.
- {{wf-ref:style:467a6191-e9c3-dbb5-ba32-45ad491d90f6}}. Provides the accordion trigger transition pattern. Use it for trigger color changes and pair it with the established icon transform state.
- {{wf-ref:style:467a6191-e9c3-dbb5-ba32-45ad491d90f8}}. Provides the accordion icon transform transition. Use it to communicate expanded state without relying on color alone.

Honor reduced-motion preferences for every new timeline and transition. Remove or substantially reduce entrance, transform, and autoplay motion while preserving visibility, state, content order, and keyboard operation.Keep controls usable when motion is reduced. An accordion, modal, tab set, slider, or marquee must still expose its state and content without depending on animation.

## Accessibility

Use the established semantic page landmarks and shared page structure. The site uses main, nav, and section landmarks across its page patterns.

- Preserve the visible keyboard focus treatments already established for buttons, links, navigation controls, accordion triggers, modal controls, slider controls, and the skip link.{{wf-ref:style:c6dc3fbe-e6f3-bd82-2125-00cc7f036256}}{{wf-ref:style:default-a}}{{wf-ref:style:467a6191-e9c3-dbb5-ba32-45ad491d90f6}}{{wf-ref:style:b88b8345-ee8a-2f6f-9926-25b88ab48e58}}{{wf-ref:style:6fb14ce3-eaaa-a851-53fb-51a4f1f32ac2}}
- Keep the skip-link pattern in the global shell so keyboard users can move directly to the main content.{{wf-ref:style:6fb14ce3-eaaa-a851-53fb-51a4f1f32ac2}}
- Preserve the reduced-motion behavior of the authored entrance interaction and apply the same consideration to new motion.{{wf-ref:interaction:i-4538ce95}}
- Use the shared input label treatment with form controls and keep labels associated with their fields.{{wf-ref:style:8a6ff0b5-a554-0566-bcda-506c1f6a6b98}}

Use semantic HTML and maintain a logical heading outline, landmark structure, reading order, and keyboard order. Choose controls by their meaning, not only by their visual appearance.

- Give every form control a programmatically associated, visible label. Use descriptive names for buttons, links, tabs, accordion triggers, modal controls, slider controls, and navigation controls.
- Provide meaningful alternative text for informative images and explicitly mark decorative images as decorative. Do this for every new image even when the existing sample pages contain no image instances.
- Keep keyboard-visible focus styles for every interactive element. Focus must remain distinguishable from hover and must not be removed for visual reasons.
- Honor reduced-motion preferences across CSS transitions, authored interactions, autoplay, marquees, sliders, and other animated states.
- Test foreground, background, border, focus, and non-text state contrast against WCAG AA targets in every authored theme mode. Don't treat the presence of a color token as proof of sufficient contrast.

## Naming Conventions

Follow the site's MAST naming convention: use descriptive lowercase dash-separated base classes, u- utilities for reusable single-purpose adjustments, and cc- classes for combo or modifier behavior.

- Keep base classes responsible for component structure and shared behavior. Use the existing component classes as the model for new component foundations.{{wf-ref:style:0d4417db-eb45-5014-547d-0710f260a16f}}{{wf-ref:style:2954b806-7928-1aa7-2cd5-de0aa6d1f35c}}{{wf-ref:style:c6dc3fbe-e6f3-bd82-2125-00cc7f036256}}
- Use u- utilities for repeatable spacing, visibility, sizing, alignment, and accessibility helpers. Preserve the responsive breakpoint infix when a utility has breakpoint-specific behavior.{{wf-ref:style:95e5d96d-753b-722c-0ca8-d5a0b89a701c}}{{wf-ref:style:876cfe13-a5e6-d897-9bf1-4502beb1f3b4}}{{wf-ref:style:19682967-1cd4-7d57-3c90-4c3338265e5e}}{{wf-ref:style:cd2ff785-de97-433c-fabf-d21743c4eed4}}
- Use cc- modifiers for component variants or contextual changes, not for unrelated page-specific styling.{{wf-ref:style:964c42a4-b0c4-9f02-831c-bcbb406f9064}}{{wf-ref:style:4e4d3a0c-7895-c9ac-00d2-64b6ce25a059}}{{wf-ref:style:3ee84174-4fdf-6570-4ada-ec3ed0911b8b}}
- Use the authored row and responsive column vocabulary for grids. Preserve the col-{breakpoint}-{1..12} pattern and use the 12-column variable as the calculation source.{{wf-ref:style:2954b806-7928-1aa7-2cd5-de0aa6d1f35a}}{{wf-ref:style:bbb400bd-fdcf-bbaa-7c6f-0d58cbf14d4a}}{{wf-ref:style:5921b864-f7c8-485a-838d-5a9b7d56a423}}{{wf-ref:style:c6dc3fbe-e6f3-bd82-2125-00cc7f03625b}}{{wf-ref:variable:variable-fd071d2a-bb61-bd51-537d-18433b223a39}}
- Keep semantic variables readable and organized in the existing Theme, Typography, Components, Layout, and Color collections. Add a new variable to the collection that matches its role instead of creating an unscoped project token.{{wf-ref:variable_collection:collection-7df4a73c-9a56-a8b7-efe4-68d0c5f0336d}}{{wf-ref:variable_collection:collection-9d323d2d-82a9-e2bc-252e-67213e00be97}}{{wf-ref:variable_collection:collection-389f9d78-f416-84a3-d00d-1094c8095454}}{{wf-ref:variable_collection:collection-97f2be71-bc47-82ef-742f-38f3a2dd0b75}}{{wf-ref:variable_collection:collection-b79ca2fc-c9a8-5c66-ffb3-278fd315150c}}
