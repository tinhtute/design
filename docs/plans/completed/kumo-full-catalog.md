---
title: Kumo full catalog port
status: completed
completed_at: 2026-09-03
interviewed: 2026-09-02
slug: kumo-full-catalog
id: kumo-full-catalog
intake_id: intake-kumo-20260902
authority: https://unpkg.com/@cloudflare/kumo@2.13.0/ai/component-registry.json
upstream: '@cloudflare/kumo@2.13.0'
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

| Registry name     | JSON name       | Category           |
| ----------------- | --------------- | ------------------ |
| autocomplete      | Autocomplete    | Other              |
| badge             | Badge           | Display            |
| banner            | Banner          | Feedback           |
| breadcrumbs       | Breadcrumbs     | Display            |
| bubble-map        | BubbleMap       | Data Visualization |
| button            | Button          | Action             |
| chart             | Chart           | Data Visualization |
| checkbox          | Checkbox        | Input              |
| choropleth-map    | ChoroplethMap   | Data Visualization |
| clipboard-text    | ClipboardText   | Action             |
| code              | Code            | Display            |
| collapsible       | Collapsible     | Display            |
| combobox          | Combobox        | Input              |
| command-palette   | CommandPalette  | Navigation         |
| date-picker       | DatePicker      | Other              |
| dialog            | Dialog          | Overlay            |
| dropdown-menu     | DropdownMenu    | Overlay            |
| empty             | Empty           | Display            |
| field             | Field           | Input              |
| grid              | Grid            | Layout             |
| input             | Input           | Input              |
| input-area        | InputArea       | Input              |
| input-group       | InputGroup      | Input              |
| label             | Label           | Other              |
| layer-card        | LayerCard       | Display            |
| link              | Link            | Other              |
| loader            | Loader          | Feedback           |
| meter             | Meter           | Display            |
| pagination        | Pagination      | Navigation         |
| popover           | Popover         | Overlay            |
| radio             | Radio           | Input              |
| sankey-chart      | SankeyChart     | Data Visualization |
| select            | Select          | Input              |
| sensitive-input   | SensitiveInput  | Other              |
| sidebar           | Sidebar         | Other              |
| switch            | Switch          | Input              |
| table             | Table           | Other              |
| table-of-contents | TableOfContents | Other              |
| tabs              | Tabs            | Navigation         |
| text              | Text            | Display            |
| timeseries-chart  | TimeseriesChart | Data Visualization |
| toasty            | Toasty          | Feedback           |
| toolbar           | Toolbar         | Other              |
| tooltip           | Tooltip         | Overlay            |

Count: **44**.

## Catalog — in (3 Kumo blocks)

| Registry name      | JSON name        |
| ------------------ | ---------------- |
| delete-resource    | DeleteResource   |
| page-header        | PageHeader       |
| resource-list-page | ResourceListPage |

## Catalog — keep and rewire (3)

| Registry name | Rewire onto                            |
| ------------- | -------------------------------------- |
| data-table    | table, button, checkbox, dropdown-menu |
| filter-bar    | input, button                          |
| dashboard     | layer-card, button, badge, data-table  |

## Catalog — out

| Name            | Why                                         |
| --------------- | ------------------------------------------- |
| CloudflareLogo  | Trademark / not our brand                   |
| MenuBar         | Deprecated (use Tabs `variant="segmented"`) |
| Surface         | Deprecated (use LayerCard)                  |
| DateRangePicker | Deprecated (use DatePicker `mode="range"`)  |
| Flow            | Not in 2.13.0 `component-registry.json`     |
| kumo-badge      | Replaced by `badge`                         |
| card            | No Kumo Card; dashboard uses `layer-card`   |

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

## Approach and Risks

### Implementation Approach

100% pure self-hosted port. Remove `@cloudflare/kumo` runtime dependency entirely from `app/package.json`.
`app/components/playground.tsx` imports exclusively from `@/components/ui/*` (the ported registry components).
`app/app/globals.css` stops importing `@cloudflare/kumo/styles/tailwind` and loads our generated `#124b68` theme tokens.
Trademark (`CloudflareLogo`), deprecated (`MenuBar`, `Surface`, `DateRangePicker`), and out-of-catalog (`Flow`) components are purged from `playground.tsx`.

### Constraints & Dependencies

- Zero runtime dependency on `@cloudflare/kumo` across the entire repository.
- All UI components use Base UI (`@base-ui/react`) + Phosphor icons (`@phosphor-icons/react`).
- Light mode `--primary`, `--kumo-brand`, and `--kumo-link` computed values strictly equal `#124b68` / `oklch(0.3917 0.0748 236.055)`.
- Cloudflare MIT copyright and license notice preserved in `THIRD_PARTY_LICENSES.md`.

### Rejected Alternatives

- **Dual architecture (app using official @cloudflare/kumo package)**: Rejected by user direction ("kéo sạch app về xài hàng tự port"). Violates success condition 5 and creates split styling.

### Primary Risks & Mitigations

- **Risk**: Ported `Sidebar` component in `app/components/ui/sidebar.tsx` might differ slightly in compound API or animations from the npm package.
  - **Mitigation**: Verified port in `packages/registry/src/components/ui/sidebar.tsx` was adapted directly from pin `a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf`.
- **Risk**: Next.js build or SSR failures with `echarts` when `@cloudflare/kumo` CSS is removed.
  - **Mitigation**: Theme tokens already include canvas and chart variables. `echarts.use` is client-side in `playground.tsx`.

---

## Phases and Verification

### Phase 1: Foundation & Registry Catalog

- **Slug**: `foundation-and-registry`
- **Story ID**: `story-foundation-registry-001`
- **Status**: `done`
- **Goal**: 53 registry items (44 UI + 3 blocks + 3 patterns + 3 infra) ported, schemas validated, token generator producing `#124b68`.
- **Verification**: `pnpm --filter @therealtinhtute/registry validate` and `validate:build` pass without errors.

### Phase 2: App Clean Cutover

- **Slug**: `app-clean-cutover`
- **Story ID**: `story-app-clean-cutover-002`
- **Status**: `done`
- **Goal**: Complete migration of `app` to 100% local ported components, removing `@cloudflare/kumo`.
- **Waves**:
  - **Wave 2A (Dependencies & CSS)**:
    - Remove `@cloudflare/kumo` from `app/package.json` and reinstall.
    - In `app/app/globals.css`, remove `@import "@cloudflare/kumo/styles/tailwind"` and `@source "../node_modules/@cloudflare/kumo/..."`.
    - Import our generated theme CSS vars with `#124b68`.
  - **Wave 2B (Playground Cutover)**:
    - In `app/components/playground.tsx`, replace `import ... from "@cloudflare/kumo"` with local imports from `@/components/ui/*`.
    - Remove out-of-scope/deprecated items from nav and canvas: `CloudflareLogo`, `MenuBar`, `Surface`, `DateRangePicker`, `Flow`.
    - Retain `mono` sidebar branding, collapsible groups with Phosphor icons, and bottom trigger.
- **Verification**:
  - `pnpm --filter app exec pnpm why @cloudflare/kumo` reports no dependency.
  - `pnpm --filter app typecheck` and `pnpm --filter app build` exit 0.
  - Browser visual check: primary button computed background is `#124b68` (`oklch(0.3917...)`), sidebar works.

### Phase 3: E2E Smoke & Plan Closure

- **Slug**: `e2e-and-close`
- **Story ID**: `story-e2e-and-close-003`
- **Status**: `done`
- **Goal**: Prove end-to-end fresh consumer installation and archive plan to `docs/plans/completed/`.
- **Waves**:
  - **Wave 3A (E2E Verification)**:
    - Run `pnpm --filter @therealtinhtute/registry e2e`.
    - Verify isolated add of `button`, `badge`, `dialog`, `chart` in fresh consumers.
    - Verify full 53-item install, lockfile without `@cloudflare/kumo`, and MIT license text.
  - **Wave 3B (Archive)**:
    - Move `docs/plans/active/kumo-full-catalog.md` to `docs/plans/completed/kumo-full-catalog.md`.
    - Update status to `completed`.
- **Verification**:
  - `bash packages/registry/scripts/e2e-smoke.sh` exits 0.
  - `git status` clean and committed.
