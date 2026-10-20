# Design System

<!-- impeccable:design-schema 1 -->

## Brand Identity

- Project: `mono` / `@therealtinhtute/design`
- Primary Brand: `#124b68` — `oklch(0.3917 0.0748 236.055)` light, `oklch(0.52 0.105 223.128)` dark (`--primary`)
- Focus Ring: `oklch(15% 0 0)` light, `oklch(93.5% 0 0)` dark (`--kumo-focus`)
- Border & Line: `oklch(0.9219 0 0)` light, `oklch(0.3618 0.0101 106.8928)` dark (`--border` / `--kumo-line`)

## Typography

- Sans: Archivo, ui-sans-serif, system-ui, sans-serif (`--font-sans`)
- Mono: Google Sans Code, ui-monospace, monospace (`--font-mono`)
- Serif / heading: Xanh Mono, ui-monospace, monospace (`--font-serif`, `--font-heading`)
- Headings: Semibold, default tracking (Kumo `font-tracking`), fluid scale
- Body: 14px base (`text-sm`), 1.5 line height

## Color Tokens

- Light Background: `oklch(0.9798 0.0045 78.2983)`
- Dark Background: `oklch(0.2679 0.0036 106.6427)`
- Placeholder text: `oklch(56% 0 0)` light, `oklch(65% 0 0)` dark — ≥ 4.5:1 on the control surface
- Status Hues: Success (green), Warning (amber), Danger (crimson), Info (sky blue)

## Layout & Rhythm

- Spacing unit: 4px (`0.25rem`) base increment
- Radius: Default `0.625rem` (`10px`), scaled proportionally
- Elevation: Multi-layer subtle box shadows (`shadow-sm`, `shadow-md`)

## Motion & Transitions

- Timing: Standard `200ms cubic-bezier(0.2, 0, 0, 1)`, Emphasized `400ms cubic-bezier(0.4, 0, 0.2, 1)`
- Easing: Decelerated / exponential easing (`ease-out-quart`, `cubic-bezier(0.25, 1, 0.5, 1)`); strict ban on bounce/elastic animations, `prefers-reduced-motion` honored

## Kumo Rules (audit baseline)

Components port Cloudflare Kumo; audits apply the 15 Kumo design rules in
`.claude/skills/kumo-design/SKILL.md` (ids: content-text-size, heading-case,
font-tracking, font-weight, related-text-spacing, text-spacing,
hover-color-transitions, shadow-borders, concentric-border-radius,
icon-alignment, inline-monospace-size, sticky-borders, collapse-content-size,
layer-card-nesting, dialog-rendering). Report findings by rule id.

- Headings no longer use `tracking-tight` (Kumo `font-tracking` wins, 2026-10-20).
- Upstream drift (pin 2.13.0 → latest) is checked via the kumo-design skill.
