# Design System

<!-- impeccable:design-schema 1 -->

## Brand Identity
- Project: `mono` / `@therealtinhtute/design`
- Primary Brand: `#124b68` (`oklch(0.3917 0.0748 236.055)`)
- Focus Ring: `oklch(0.708 0 0)` / `--kumo-focus`
- Border & Line: `oklch(0.922 0 0)` / `--kumo-line`

## Typography
- Font Family: Inter, system-ui, -apple-system, sans-serif
- Headings: Semibold, tracking-tight, fluid scale
- Body: 14px base (`text-sm`), 1.5 line height

## Color Tokens
- Light Background: `oklch(1 0 0)`
- Dark Background: `oklch(0.145 0 0)`
- Primary Emphasis: `#124b68` with `color-mix(in oklch, #124b68, white 30%)` button surface
- Status Hues: Success (green), Warning (amber), Danger (crimson), Info (sky blue)

## Layout & Rhythm
- Spacing unit: 4px (`0.25rem`) base increment
- Radius: Default `0.625rem` (`10px`), scaled proportionally
- Elevation: Multi-layer subtle box shadows (`shadow-sm`, `shadow-md`)

## Motion & Transitions
- Timing: Standard `200ms cubic-bezier(0.2, 0, 0, 1)`, Emphasized `400ms cubic-bezier(0.4, 0, 0.2, 1)`
- Easing: Decelerated / exponential easing (`ease-out-quart`), strict ban on bounce/elastic animations
