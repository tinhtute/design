---
title: Kumo full catalog port
status: planned
interviewed: 2026-09-02
slug: kumo-full-catalog
authority: https://unpkg.com/@cloudflare/kumo@2.13.0/ai/component-registry.json
upstream: "@cloudflare/kumo@2.13.0"
commit: a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf
---

# Kumo full catalog port

## Outcome

`@therealtinhtute/ui` ships the full Kumo 2.13.0 component + block catalog as a shadcn registry: source-cloned (MIT), canonical names, Base UI + Phosphor, files at `components/ui/{name}.tsx`. Brand fill and link are `#124b68`. Consumers run `shadcn add @therealtinhtute/button` and get the Kumo Button — not the old Radix/shadcn one. No `@cloudflare/kumo` runtime dependency. No `kumo-` name prefix. No Cloudflare logo. Deprecated Kumo items stay out.

## Success Condition

Someone who was not in the interview can prove all of:

1. Registry item names match the catalog tables plus infra (`theme-default`, `utils`, `third-party-licenses`). Set = 44 UI + 3 Kumo blocks + 3 rewired patterns + 3 infra = **53** names. No extras, no missing in-scope names.
2. `kumo-badge` and shadcn `card` are gone from `packages/registry/registry.json`.
3. Playground renders every in-scope registry UI item (one section each) plus rewired `data-table` / `filter-bar` / `dashboard`.
4. Computed `--primary`, `--kumo-brand`, and `--kumo-link` in light mode equal `#124b68` / `oklch(0.3917 0.0748 236.055)`.
5. E2E `shadcn add` installs every in-scope item without `@cloudflare/kumo` in the consumer lockfile.
6. Every ported source file header cites pin `a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf`. Consumer also receives the **full** Cloudflare MIT copyright + permission notice via installed `THIRD_PARTY_LICENSES.md` (e2e asserts the file contains `Copyright (c) 2026 Cloudflare, Inc.`).

## Scope

**May change:**

- `packages/registry/src/components/**` (replace shadcn primitives with Kumo ports; add the rest of the catalog)
- `packages/registry/registry.json`
- `packages/tokens/**` (set primary to `#124b68`; replace thin `KUMO_COMPAT` with full `theme-kumo.css` from the pin, then override brand/link/brand-hover)
- `app/components/**` and playground
- `packages/registry/scripts/e2e-smoke.sh`

**Must not change:**

- Static shadcn registry architecture (JSON items, CLI install)
- Namespace `@therealtinhtute`
- `theme.json` → generator → `registry:theme` pipeline
- Full Cloudflare MIT copyright + permission notice shipped to every consumer (`THIRD_PARTY_LICENSES.md`); short pin header on source files is not enough by itself
- No runtime dependency on `@cloudflare/kumo`
- Status hues (success/warning/danger/info/badge-*) stay Kumo values except brand/link
- `text-kumo-brand` orange `#f6821f` is **not** remapped unless a later spec says so

## Context to Read First

- Catalog authority: https://unpkg.com/@cloudflare/kumo@2.13.0/ai/component-registry.json
- Source pin: `cloudflare/kumo` commit `a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf` — `packages/kumo/src/components/*`, `packages/kumo/src/blocks/*`, `packages/kumo/src/styles/theme-kumo.css`
- Local: `packages/registry/src/components/kumo/badge.tsx` (pattern to generalize, then delete)
- Local: `packages/tokens/src/generator/shared.ts` (`KUMO_COMPAT` — too thin, replace)
- Local: `packages/registry/registry.json`
- Local: `app/components/playground.tsx`, `app/components/data-table.tsx`, `app/components/dashboard.tsx`

## Key Decisions

1. **Catalog authority**: `unpkg @cloudflare/kumo@2.13.0/ai/component-registry.json` (48 components + 3 blocks). Do not infer extras from `src/` or `main`. Depends on: pin.
2. **Pin**: `@cloudflare/kumo@2.13.0` → `a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf`. Replace badge pin `e6d17c6`. Depends on: catalog authority.
3. **Names**: Kumo occupies canonical registry names (`button`, `input`, `badge`, `dropdown-menu`, `table`, …). No `kumo-` prefix. Depends on: catalog authority (JSON name `DropdownMenu` → `dropdown-menu`).
4. **Primitives**: Keep Base UI (`@base-ui/react`) + Phosphor. Port source, do not restyle Radix. Depends on: names.
5. **Skip**: `CloudflareLogo` (trademark), `MenuBar` / `Surface` / `DateRangePicker` (deprecated in Kumo). 48 − 4 = **44 UI**.
6. **Flow**: out. Not in the 2.13.0 registry JSON.
7. **Chart family**: in as five catalog items — `chart`, `sankey-chart`, `timeseries-chart`, `bubble-map`, `choropleth-map`.
8. **InputArea**: own registry item `input-area`, not folded into `input`.
9. **Toasty**: registry name `toasty` (JSON name), not `toast`.
10. **Blocks**: `delete-resource`, `page-header`, `resource-list-page` (JSON: `ResourceListPage`).
11. **`table`**: in. Existing `data-table` rewires onto Kumo `table` + `button` + `checkbox` + `dropdown-menu`.
12. **`card`**: drop. Dashboard uses `layer-card`. No parallel shadcn card.
13. **`kumo-badge`**: delete. `badge` is the Kumo badge.
14. **Patterns kept**: `data-table`, `filter-bar`, `dashboard` — rewire to new primitives.
15. **Color**: `--primary` + `--kumo-brand` + `--kumo-link` = `#124b68`. Dark mode: lighter tint, same hue. `brand-hover` derived from that hue. Badge-blue / info stay Kumo blue.
16. **Tokens**: port full `theme-kumo.css` from the pin into the token generator; do not ship the 25-token badge bridge as-is.
17. **Files**: consumer path `components/ui/{name}.tsx`. Shared helpers (`resolve-variant`, `cn`) → `lib/`.
18. **Icons / a11y stack**: Phosphor + Base UI. Lucide/Radix leave ported items.

## Catalog — in (44 UI)

Registry `name` is kebab-case. Source is the JSON component of the same PascalCase name at the pin.

| Registry name | JSON name | Category |
|---|---|---|
| autocomplete | Autocomplete | Other |
| badge | Badge | Display |
| banner | Banner | Feedback |
| breadcrumbs | Breadcrumbs | Display |
| bubble-map | BubbleMap | Data Visualization |
| button | Button | Action |
| chart | Chart | Data Visualization |
| checkbox | Checkbox | Input |
| choropleth-map | ChoroplethMap | Data Visualization |
| clipboard-text | ClipboardText | Action |
| code | Code | Display |
| collapsible | Collapsible | Display |
| combobox | Combobox | Input |
| command-palette | CommandPalette | Navigation |
| date-picker | DatePicker | Other |
| dialog | Dialog | Overlay |
| dropdown-menu | DropdownMenu | Overlay |
| empty | Empty | Display |
| field | Field | Input |
| grid | Grid | Layout |
| input | Input | Input |
| input-area | InputArea | Input |
| input-group | InputGroup | Input |
| label | Label | Other |
| layer-card | LayerCard | Display |
| link | Link | Other |
| loader | Loader | Feedback |
| meter | Meter | Display |
| pagination | Pagination | Navigation |
| popover | Popover | Overlay |
| radio | Radio | Input |
| sankey-chart | SankeyChart | Data Visualization |
| select | Select | Input |
| sensitive-input | SensitiveInput | Other |
| sidebar | Sidebar | Other |
| switch | Switch | Input |
| table | Table | Other |
| table-of-contents | TableOfContents | Other |
| tabs | Tabs | Navigation |
| text | Text | Display |
| timeseries-chart | TimeseriesChart | Data Visualization |
| toasty | Toasty | Feedback |
| toolbar | Toolbar | Other |
| tooltip | Tooltip | Overlay |

Count: **44**.

## Catalog — in (3 Kumo blocks)

| Registry name | JSON name |
|---|---|
| delete-resource | DeleteResource |
| page-header | PageHeader |
| resource-list-page | ResourceListPage |

## Catalog — keep and rewire (3)

| Registry name | Rewire onto |
|---|---|
| data-table | table, button, checkbox, dropdown-menu |
| filter-bar | input, button |
| dashboard | layer-card, button, badge, data-table |

## Catalog — out

| Name | Why |
|---|---|
| CloudflareLogo | Trademark / not our brand |
| MenuBar | Deprecated (use Tabs `variant="segmented"`) |
| Surface | Deprecated (use LayerCard) |
| DateRangePicker | Deprecated (use DatePicker `mode="range"`) |
| Flow | Not in 2.13.0 `component-registry.json` |
| kumo-badge | Replaced by `badge` |
| card | No Kumo Card; dashboard uses `layer-card` |

## Infra kept / added

- `theme-default`
- `utils`
- `third-party-licenses` (new `registry:file` — full Kumo MIT text; every ported item `registryDependencies` it)

## Validation Loop

**During work:** after each ported item: file at `components/ui/{name}.tsx`, `registry.json` entry, MIT+pin header, playground section, `bg-kumo-*` classes resolve against the expanded theme.

**Final proof:**

- Diff registry names vs the 44+3+3 tables (exact set).
- E2E add all in-scope items.
- Playground smoke: every section mounts; brand CSS vars = `#124b68`.
- `pnpm` why / lockfile: no `@cloudflare/kumo`.
- `kumo-badge` and `card` absent.

## Stop / Pause

**Done when:** success conditions 1–6 all pass.

**Pause if:**

- A ported component needs a token or primitive not in the pin’s `theme-kumo.css` / Base UI set.
- Chart / map items cannot render without an `echarts` peer and that peer breaks the demo app — stop after core UI (non-viz) and ask before adding the five viz items’ peer.
- Base UI 1.6 × React 19 incompatibility in the demo app.

## Approach

1. Read source only from `cloudflare/kumo` commit `a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf` or `@cloudflare/kumo@2.13.0`. Never `main`.
2. Expand `KUMO_COMPAT` from pin `packages/kumo/src/styles/theme-kumo.css` (all `--color-kumo-*` / `--text-color-kumo-*`). Override:
   - light `--primary` / `--kumo-brand` / `--kumo-link` = `oklch(0.3917 0.0748 236.055)` (`#124b68`)
   - dark same hue, `oklch(0.72 0.0748 236.055)`
   - `--kumo-brand-hover` = darker/lighter of that hue
   - do **not** remap `--text-color-kumo-brand` orange `#f6821f`
3. `pnpm --filter @therealtinhtute/tokens generate` then copy generated theme item into `packages/registry/registry.json` `theme-default`.
4. Add `third-party-licenses` item: file `src/licenses/THIRD_PARTY_LICENSES.md` → consumer `THIRD_PARTY_LICENSES.md`, full MIT from pin `LICENSE`. Every ported UI/block item lists it in `registryDependencies`.
5. Port recipe (each UI item):
   - Default: single `packages/registry/src/components/ui/{name}.tsx`. **Never** create `ui/{name}/` while `ui/{name}.tsx` exists — `button.tsx`/`input.tsx`/`badge.tsx`/`checkbox.tsx`/`table.tsx`/`dropdown-menu.tsx` win over `{name}/index.ts`. Replace those files in place in the same wave.
   - Folder form only when 3+ modules AND the `.tsx` stem is deleted in the same wave.
   - Rewrite `@cloudflare/kumo` / relative utils to `@/lib/utils`, `@/lib/resolve-variant`, local UI imports.
   - Header: `Adapted from cloudflare/kumo (MIT), commit a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf.`
   - `registry.json` item: kebab `name`, npm deps, `registryDependencies` (`utils`, `third-party-licenses`, composed UI).
   - Delete Radix/Lucide from that item.

6. `registry.json` is single-writer per wave (append items at wave end). Component files in a wave may be authored in parallel.
7. Viz wave is last and may **pause** if `echarts` peer breaks `app`.
8. File ownership is `docs/plans/active/kumo-source-manifest.json`. Each support file belongs to exactly one registry item.
9. Isolated-install gate: `validate-deps` plus fresh-consumer add of `button`, `badge`, `dialog`, `chart` — batch add of 53 is not proof of complete `registryDependencies`.


## Phases

### Foundation

**Wave A — tokens**
- Files: `packages/tokens/src/generator/shared.ts`, `types.ts` if new keys needed, `packages/tokens/src/themes/default/theme.json` (`primary` + `sidebar-primary` light = `#124b68` oklch).
- Port full kumo token set from pin `theme-kumo.css` into `KUMO_COMPAT` (canvas, elevated, control, overlay, brand-hover, focus, banner-*, text inactive/placeholder/inverse, etc.).
- Run `pnpm --filter @therealtinhtute/tokens generate && pnpm --filter @therealtinhtute/tokens validate`.
- Copy generated cssVars into `registry.json` `theme-default`.

**Wave A check**
- Generated CSS contains `--kumo-control`, `--kumo-brand-hover`, `--kumo-canvas`.
- Light `--primary` / `--kumo-brand` / `--kumo-link` match `oklch(0.3917 0.0748 236.055)`.
- `--text-color-kumo-brand` / text brand still `#f6821f` if that token is emitted.

**Wave B — license + lib**
- Add `packages/registry/src/licenses/THIRD_PARTY_LICENSES.md` = pin LICENSE (full text).
- Registry item `third-party-licenses` type `registry:file`, target `THIRD_PARTY_LICENSES.md`.
- Move `resolve-variant.ts` → `packages/registry/src/lib/resolve-variant.ts`; attach to `utils` or a `resolve-variant` lib item. Delete `src/components/kumo/` after badge cutover (Wave Rewire). Until then, keep re-export or update kumo-badge import.
- Registry `utils` stays `cn()`.

**Wave B check**
- `pnpm --filter @therealtinhtute/registry validate`
- Built `/r/third-party-licenses.json` contains `Copyright (c) 2026 Cloudflare, Inc.`

### Atoms

No Kumo UI-to-UI deps. Parallel files, one `registry.json` write at end.

**Wave C:** `button`, `badge`, `text`, `label`, `link`, `loader`, `tooltip`
**Wave D:** `input`, `checkbox`, `switch`, `radio`, `meter`, `clipboard-text`, `grid`, `collapsible`

Each: follow port recipe. `clipboard-text` may depend on `button` — if so, put it in Wave D and list `button` in `registryDependencies`.

**Atoms check**
- `pnpm --filter @therealtinhtute/registry build && validate && validate:build`
- `public/r/{name}.json` exists for all 15 names; each lists `third-party-licenses`.
- Demo playground: Button / Badge / Input sections render (partial playground OK until Prove).

### Forms

**Wave E:** `input-group`, `input-area`, `field`, `sensitive-input`, `banner`, `empty`
**Wave F:** `select`, `combobox`, `autocomplete`

`registryDependencies` as upstream imports require (typically `input`, `button`, `label`, `field`, `popover` — if a form item needs `popover`/`dialog`, delay that item to Overlay).

**Forms check**
- Same build+validate.
- No item in this phase imports overlay components that are not yet ported; if blocked, move that item to Overlay.

### Overlay

**Wave G:** `popover`, `dialog`, `dropdown-menu`
**Wave H:** `date-picker` (`react-day-picker`; `mode="range"` covers skipped DateRangePicker)

**Overlay check**
- build+validate
- Typecheck registry package with `@base-ui/react` in registry `devDependencies`.

### Chrome

**Wave I:** `layer-card`, `table`, `breadcrumbs`, `code` (`shiki` + `@shikijs/*`)
**Wave J:** `tabs`, `pagination`, `toolbar`, `toasty`
**Wave K:** `sidebar`, `command-palette`, `table-of-contents`

**Chrome check**
- build+validate
- `table` item exists (required before data-table rewire).

### Blocks + rewire

**Wave L — Kumo blocks:** `delete-resource`, `page-header`, `resource-list-page` from pin `packages/kumo/src/blocks/*`.
**Wave M — rewire + delete:**
- `data-table` → Kumo `table` + `button` + `checkbox` + `dropdown-menu` (drop Radix table primitives / old shadcn table).
- `filter-bar` → Kumo `input` + `button`.
- `dashboard` → `layer-card` + `button` + `badge` + `data-table`. Remove shadcn `Card*` usage.
- Delete registry items `card`, `kumo-badge`. Delete `src/components/ui/card.tsx`, `src/components/kumo/**`.
- App copies follow (`app/components/**`).

**Rewire check**
- `rg` in `packages/registry` and `app`: no `kumo-badge`, no `components/ui/card`, no `from "@/components/kumo`.
- `registry.json` names include `layer-card`, exclude `card` and `kumo-badge`.
- `pnpm --filter app typecheck`

### Viz (pause gate)

**Wave N:** `chart`, `sankey-chart`, `timeseries-chart`, `bubble-map`, `choropleth-map`
- npm: `echarts` (peer), `d3-geo`, `motion` as upstream.
- Add `echarts` to `app` only if playground mounts these sections.

**Viz check**
- build+validate those 5 JSON files.
- If `app` build fails on `echarts`/SSR: **pause** (spec Stop/Pause). Do not delete the registry items; leave playground sections unmounted until unblocked.

### Prove

**Wave O — playground**
- `app/components/playground.tsx`: one section per 44 UI items + 3 blocks + 3 patterns.
- `app/package.json`: add `@base-ui/react`, keep `@phosphor-icons/react`; remove Radix deps that nothing imports.
- `pnpm --filter app typecheck` and `pnpm --filter app build`.
- Browser: light mode computed `--kumo-brand` / `--primary` = `#124b68` or the oklch equivalent.

**Wave P — e2e + catalog set + isolated deps**
- Add `packages/registry/src/validate-deps.ts`: for every non-theme item, parse owned TS/TSX imports; every relative import must resolve to a `files[]` path of this item or of an item in the recursive `registryDependencies` closure. Wire into `validate`.
- Rewrite `packages/registry/scripts/e2e-smoke.sh`:
  - exact-set of 53 names vs `public/r/registry.json`
  - isolated add: `button`, `badge`, `dialog`, `chart` each in a **fresh** consumer with only that item + `theme-default`. Must compile.
  - then full-set add in the main consumer
  - expected files from manifest owners + `THIRD_PARTY_LICENSES.md`
  - forbid `src/components/ui/card.tsx`, `src/components/kumo/**`
  - consumer deps: `@base-ui/react`, `@phosphor-icons/react`, plus item peers
  - assert CSS `--kumo-brand` and `bg-kumo-control`
  - assert license file contains `Copyright (c) 2026 Cloudflare, Inc.`
  - assert consumer lockfile has **no** `@cloudflare/kumo`
- `render-check.tsx`: Button, Badge, FilterBar, DataTable, Dashboard (layer-card copy).
- Run `pnpm --filter @therealtinhtute/registry e2e`.

**Prove check = done:** success conditions 1–6.

## Wave ownership

| Wave | Owner writes | Parallel OK |
|---|---|---|
| A | tokens + theme-default cssVars | no |
| B | licenses + lib | no |
| C–K | `src/components/ui/*` parallel; **one** `registry.json` patch per wave | files yes, registry.json no |
| L–M | blocks + patterns + deletes | no (deletes) |
| N | viz | files yes, registry.json no |
| O–P | app playground + e2e | no |

## Next

`work` — execute Foundation Wave A first. Do not skip license (Wave B) before shipping any ported UI item.
