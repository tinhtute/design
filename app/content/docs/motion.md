# Motion

Motion in the registry gives feedback: it shows where something came from,
that a state changed, or that work is in progress. Every timing comes from the
theme scale, every animated property is named, and every motion has a static
fallback under `prefers-reduced-motion: reduce`.

## Tokens

The theme item ships the scale as Tailwind theme variables, so the utilities
below work in any app that installs `theme-default`.

| Token        | Value                          | Utility           | Use for                                      |
| ------------ | ------------------------------ | ----------------- | -------------------------------------------- |
| `fast`       | `100ms`                        | `duration-fast`   | Hover reveals, toggles, press feedback       |
| `base`       | `200ms`                        | `duration-base`   | Overlays entering and leaving, indicators    |
| `slow`       | `400ms`                        | `duration-slow`   | A one-off value change the eye should follow |
| `standard`   | `cubic-bezier(0.2, 0, 0, 1)`   | `ease-standard`   | Default for every transition                 |
| `emphasized` | `cubic-bezier(0.4, 0, 0.2, 1)` | `ease-emphasized` | Movement that starts and ends at rest        |

Durations are emitted as `--duration-*` and as `--transition-duration-*`; the
second name is the namespace Tailwind v4 reads for `duration-*` utilities.
`pnpm --filter @therealtinhtute/registry validate` fails on raw `duration-150`,
`duration-[…]`, `ease-out` or `ease-[…]` classes in registry components.

## Rules

- Name the properties: `transition-[translate,width]`, never `transition-all`,
  so theme switches and unrelated style changes do not animate.
- Add `motion-reduce:transition-none` (or `motion-reduce:animate-none`) next to
  every transition or animation; the end state must already be correct without
  motion.
- Interruptions retarget: CSS transitions start from the current value, so a
  second click mid-transition never jumps back to the start.
- No bounce or elastic curves. The toast and copy bumps use ease-out-quart
  (`cubic-bezier(0.25, 1, 0.5, 1)`) and are switched off under reduced motion.

## Inventory

| Component                 | Motion and purpose                     | Timing                    | Reduced motion                    |
| ------------------------- | -------------------------------------- | ------------------------- | --------------------------------- |
| Tabs                      | Indicator follows the selected tab     | `base`, `standard`        | Indicator jumps to the tab        |
| Tooltip, Popover          | Scale and fade from the trigger side   | `base`, `standard`        | Appears in place                  |
| Dialog, Command palette   | Popup scales in, backdrop fades        | `base`, `standard`        | Appears in place                  |
| Collapsible, Layer dialog | Panel height and caret rotation        | `base`, `standard`        | Opens at full height              |
| Switch                    | Thumb slides, track recolours          | `fast`, `standard`        | Thumb moves without sliding       |
| Meter                     | Fill grows to the new value            | `slow`, `standard`        | Fill shows the value              |
| Clipboard text, Empty     | Copy icon swaps to a check             | `base` / `fast`           | Icon swaps without sliding        |
| Inline copy, Breadcrumbs  | Action icon fades in on hover or focus | `fast`, `standard`        | Icon appears                      |
| Sidebar                   | Panel width, labels, caret             | `animationDuration` prop  | Width changes without sliding     |
| Toasty                    | Stack position, swipe, bump on update  | Base UI stack, `0.5s`     | Toasts appear and leave in place  |
| Loader                    | SVG spinner (SMIL)                     | `1.5s` / `2s` loop        | Paused on a visible arc           |
| Skeleton line             | Shimmer sweep                          | `1.5s` loop, random delay | Static line                       |
| Refresh button            | Icon spins while loading               | `0.5s` loop               | Static icon                       |
| Layer dialog drawer       | Sheet follows the swipe gesture        | `450ms`, swipe strength   | Gesture-driven (listed exception) |
