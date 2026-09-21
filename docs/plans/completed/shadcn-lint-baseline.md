---
title: Fix @shadcn/lint baseline findings
status: completed
slug: shadcn-lint-baseline
id: shadcn-lint-baseline
upstream: '@cloudflare/kumo@2.13.0'
---

# Fix @shadcn/lint baseline findings

## Context

`@shadcn/lint` is registered in the root `eslint.config.js` with all six rules
enabled for consumers and styling rules off inside the design-system source
(`packages/registry/src/components/**`, `app/components/ui/**` mirroring it;
`no-unknown-classes` off for `packages/registry/**` since that package has no
resolvable theme). Baseline: 58 errors. This plan fixes them at the source of
truth rather than weakening the rules.

Key facts discovered:

- `packages/registry/src/components` and `app/components` are byte-identical
  copies; registry is canonical (`shadcn build` publishes it). Edits go to
  registry source and are mirrored to `app/`. `playground.tsx`/`theme-toggle.tsx`
  are app-only.
- `app/app/theme.css` is a manual copy of `packages/tokens/dist/themes/default.css`;
  theme authority is `packages/tokens/src` (run `pnpm --filter @therealtinhtute/tokens generate`).
- `text-kumo-*` classes are powered by `--text-color-kumo-*` (upstream Kumo
  namespace, real Tailwind v4 output — verified in built CSS). The linter only
  models `--color-*`, so text tokens with no `--color-kumo-*` twin
  (`default`, `subtle`, `strong`, `inactive`, `placeholder`, `inverse`,
  `badge-*`) are flagged. Names that already have a `--color-kumo-*` twin
  (`brand`, `link`, `info`, `success`, `danger`, `warning`) pass.
- `kumo-*` utility classes, `animate-*` bumps, `no-scrollbar`, `skeleton-line`,
  `link-external-icon` are all defined upstream in `kumo-standalone.css` /
  `kumo.css` — the vendored clone dropped that layer, so they are dead classes
  here and in consumer installs.
- `tw-animate-css` is an app dependency but is never imported; dropdown-menu and
  chart/Maps.tsx use its `animate-in`/`fade-in`/`zoom-in`/`slide-in` classes.
- `rdp-root` is a react-day-picker hook class; `keeper-ignore` is a
  password-manager marker. Neither needs generated CSS.
- `shadow-m` in `dialog.tsx` is a typo for `shadow-md`.

## Fixes

1. **Tokens (`packages/tokens/src/generator/shared.ts`)** — emit
   `--color-kumo-{name}: var(--text-color-kumo-{name})` aliases for the text
   names lacking a `--color-kumo-*` twin. Regenerating flows to
   `dist/themes/default.css`, `dist/registry/theme-default.json` (cssVars.theme).
   Sync `app/app/theme.css` and the `theme-default` item in `registry.json`.

2. **Vendored utilities (`generator/css.ts` + `registry.ts`)** — the utility
   layer is kept as a structured `CssTree` (`KUMO_UTILITY_CSS`) in `shared.ts`:
   `cssTreeToString()` serializes it into generated `theme.css`, and the object
   is emitted verbatim as the theme item's `css` field (the shadcn registry
   schema requires `css` to be an object map, not a string). Includes
   `--animate-refresh` + `@keyframes refresh`; `@keyframes shimmer`,
   `toast-bump`, `clipboard-toast-bump`; `.kumo-chart-shimmer`,
   `.kumo-input-placeholder`, `.kumo-popover-popup`, `.kumo-tooltip-popup`,
   `.kumo-tabs-list`, `.no-scrollbar`, `.skeleton-line`, `.link-external-icon`,
   `.animate-toast-bump`, `.animate-clipboard-toast-bump` (upstream defs,
   incl. `prefers-reduced-motion` guards where upstream has them).

3. **tw-animate-css** — `@import "tw-animate-css";` in `app/app/globals.css`;
   `dropdown-menu` item gains `tw-animate-css` dependency +
   `css: {"@import \"tw-animate-css\"": {}}`. (`chart`/`Maps.tsx` match was a
   comment, no real usage — no dep added there.)

4. **Allowlist** — `no-unknown-classes` gets `allow: ["rdp-*", "keeper-ignore"]`
   in `eslint.config.js`.

5. **Component fixes (registry + app mirror)**
   - `dialog.tsx`: `shadow-m` → `shadow-md`; give `DialogTitle` base
     `text-lg font-semibold` (it currently forwards className unstyled).
   - `delete-resource.tsx`: drop no-op `p-0` on Dialog (base has no padding);
     drop `text-lg font-semibold` on DialogTitle (now in component).

6. **Block fixes**
   - `dashboard.tsx`: drop redundant `p-4` on LayerCard (base has `p-4`).
   - `data-table.tsx`: `capitalize` → `<span className="capitalize">` around the
     label; `leading-none` on Table.Head/Cell → inner `<div className="leading-none">`.
   - `filter-bar.tsx`: `Input className="pl-8"` → `InputGroup` with icon addon.
   - `resource-list-page.tsx`: `max-w-[1400px]` → `max-w-350`; `xl:w-[380px]` →
     `xl:w-95`.
   - `playground.tsx` (app-only): `SidebarMenuButton` keeps deliberate inactive
     coloring → `no-restyle` contract `{ pattern: "^SidebarMenuButton$",
allow: ["layout", "text-kumo-*"] }` (a contract _replaces_ `allow` for the
     matched component, so `layout` must be restated to keep it).

## Outcome

- `pnpm lint` → **0 errors** (baseline was 58).
- `pnpm --filter @therealtinhtute/tokens generate` → regenerated
  `dist/themes/default.css` + `dist/registry/theme-default.json`; synced to
  `app/app/theme.css` and the `theme-default` item in `registry.json`.
- `pnpm --filter @therealtinhtute/registry validate` → 53 items OK,
  `validate-deps` closure OK (incl. `filter-bar` → `input-group`).
- `pnpm --filter @therealtinhtute/registry validate:build` → 54 built files OK;
  `shadcn build` + `app/scripts/sync-registry.mjs` run clean.
- `pnpm typecheck` (turbo, all 3 packages) → pass.
- `filter-bar` `registryDependencies`: `@therealtinhtute/input` →
  `@therealtinhtute/input-group` (transitively still pulls input/button/utils).
- Component trees re-verified byte-identical post-mirror (`diff -rq` — only
  app-only `playground.tsx`/`theme-toggle.tsx` differ).

Residual notes:

- Regenerating `registry.json`'s theme item also pulled in pre-existing drift
  (description text, `--font-serif` bridge, palette refresh) — the checked-in
  manifest was stale relative to the tokens source; the generated output is
  authoritative.
- `rdp-*` / `keeper-ignore` remain allowlisted in `no-unknown-classes`
  (third-party hook class / password-manager marker — no CSS needed).
