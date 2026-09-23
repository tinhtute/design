---
id: plan-hugeicons-20260922
intake_id: intake-hugeicons-20260922
slug: hugeicons-migration
title: Replace Phosphor Icons with Hugeicons
status: active
lane: normal
input_type: change-request
created: 2026-09-22
updated: 2026-09-23
---

# Replace Phosphor Icons with Hugeicons

## Outcome

`@therealtinhtute/design` renders all icons through Hugeicons —
`@hugeicons/react` (renderer, MIT) plus `@hugeicons/core-free-icons`
(MIT, ~6,000 Stroke Rounded icons) — and `@phosphor-icons/react` is
fully removed from dependencies, source, and registry metadata.

1. Every component in `packages/registry/src/components/` and its mirror in
   `app/components/`, plus `app/demos/` and `app/components/playground.tsx` /
   `theme-toggle.tsx`, imports icons from `@hugeicons/core-free-icons` and
   renders them via `HugeiconsIcon`.
2. `registry.json` item `dependencies` declare `@hugeicons/react` and
   `@hugeicons/core-free-icons` so `shadcn add` consumers receive working
   icons.
3. All gates green: `pnpm --filter @therealtinhtute/registry validate`,
   `validate:build`, `e2e`, `pnpm --filter app typecheck`, `pnpm lint`,
   `pnpm -r build`.

## Authority and Requirements

### Authoritative Sources

- Owner request (2026-09-22): "Tìm hiểu về https://hugeicons.com/ và lên kế
  hoạch thay nó cho design system của tui".
- `hugeicons.com/docs` + `@hugeicons/react` README: the renderer
  (`@hugeicons/react`, v1.x, MIT) is separate from icon data; free set is
  `@hugeicons/core-free-icons` (v4.3.5, MIT, Stroke Rounded only). Pro sets
  (`@hugeicons-pro/core-*`) require a paid license and per-seat terms —
  incompatible with open redistribution of source through a public
  `shadcn add` registry. Free set is the only viable target.
- Feasibility check (2026-09-22): all ~36 distinct Phosphor glyphs in use
  have confirmed free-set equivalents in `core-free-icons@4.3.5` (verified
  against package dist exports).
- API delta: Phosphor exports React components (`<CheckIcon />`, `type
Icon`); Hugeicons exports icon _data_ (`IconSvgElement`) rendered via
  `<HugeiconsIcon icon={CheckmarkIcon} size color strokeWidth />`.
  Components exposing `icon?: Icon | ReactNode` (button, badge, dashboard)
  must accept `IconSvgElement | ReactNode`; call-site shape
  `icon={SomeIcon}` is preserved, so consumer API stays source-compatible.
- File duplication: `packages/registry/src/components/**` is canonical;
  `app/components/**` is an exact mirror (verified `diff -q`). Both trees
  plus `app/demos/` must be updated — 53 import sites total.
- `app/components.json`: `iconLibrary: "lucide"` → `"hugeicons"` (shadcn
  supports the value; governs icons emitted by future `shadcn add`).
- `packages/registry/package.json`: `lucide-react` devDep has zero source
  references — orphaned; remove with Phosphor unless `validate-deps`
  proves otherwise.
- `docs/PROJECT.md`: identity line names "Phosphor components" — update to
  Hugeicons in the same change.

### Falsifiable Requirements

1. **R1 (removal)**: `grep -r "@phosphor-icons/react" packages app` returns
   zero matches; `@phosphor-icons/react` absent from both `package.json`
   files and `pnpm-lock.yaml` after install.
2. **R2 (render)**: every former Phosphor glyph renders via
   `<HugeiconsIcon icon={...}>`; a committed Phosphor→Hugeicons name
   mapping covers all 78 used icons (e.g. `CaretRightIcon` →
   `ArrowRight01Icon`, `MagnifyingGlass` → `Search01Icon`, `ArrowsClockwise`
   → `RefreshIcon`, `Check` → `Tick02Icon`).
3. **R3 (registry metadata)**: `registry.json` `dependencies` arrays
   replace `@phosphor-icons/react` with `@hugeicons/react` +
   `@hugeicons/core-free-icons`; `validate` and `validate:build` pass.
4. **R4 (API)**: `icon` props type as `IconSvgElement | ReactNode`;
   `renderIconNode` helpers wrap data icons in `HugeiconsIcon` and pass
   through React elements unchanged.
5. **R5 (gates)**: `typecheck`, `lint`, `pnpm -r build`, and registry `e2e`
   all pass; showroom renders each component section without missing-icon
   errors.
6. **R6 (config)**: `app/components.json` `iconLibrary` is `"hugeicons"`;
   `docs/PROJECT.md` identity updated.

## Non-goals

- Hugeicons Pro / `@hugeicons-pro/*` packages, extra styles (Solid,
  Duotone, Twotone, Bulk), and AI icon search — requires paid license and
  is not redistributable through the public registry.
- Icon font, CDN, or MCP/agent-skill delivery modes.
- Any visual redesign of components; only the icon glyphs change.
- A downstream consumer codemod or Phosphor compatibility shim — this is a
  breaking change; consumers re-pinning old registry items are unaffected.
- Icon audit beyond the 78 glyphs currently in use.

## Approach and Risks

### Implementation Approach

- **Free set only**: `@hugeicons/react@^1.1.10` (renderer) +
  `@hugeicons/core-free-icons@^4.3.5` (icon data, MIT). App →
  `dependencies`; registry → `devDependencies` (source-first: consumers get
  deps via `registry.json` item `dependencies`, matching the existing
  Phosphor pattern).
- **Committed mapping of record**: `packages/registry/scripts/icon-map.json`
  — all 78 distinct Phosphor imports found in the repo (audit supersedes the
  brainstorm estimate of ~36) → verified free-set export names. Doubles as
  the consumer migration reference.
- **Codemod, not 53 manual edits**: `packages/registry/scripts/migrate-icons.mjs`
  rewrites, per file: the `@phosphor-icons/react` import →
  `{ HugeiconsIcon }` from `@hugeicons/react` + mapped icon imports from
  `@hugeicons/core-free-icons`; JSX `<OldIcon …/>` →
  `<HugeiconsIcon icon={NewIcon} …/>`; prop rules — `weight="bold"` →
  `strokeWidth={2}`, drop `weight="regular"`, `size`/`className` pass
  through. Bare identifier refs (`icon={X}`, config arrays) get renamed to
  the mapped data object.
- **Hand-fix the plumbing** (codemod can't): `icon?: Icon | ReactNode` →
  `icon?: IconSvgElement | ReactNode` in `button.tsx`, `badge.tsx`,
  `dashboard.tsx`; `renderIconNode` wraps data icons in `HugeiconsIcon`,
  passes React elements through (`React.isValidElement` first). Files that
  store icons in arrays/objects (`dashboard.tsx` nav, `playground.tsx`
  GROUPS, `toasty.tsx` variant map) get their render sites changed to
  `<HugeiconsIcon icon={entry.icon}/>` manually.
- **Mirror sync**: all 49 `app/components/**` files are byte-identical to
  `packages/registry/src/components/**` (verified) — after codemod +
  plumbing edits, copy registry output over the mirrors; `diff -q` must
  stay clean.
- **Metadata sweep**: `registry.json` item deps swap, `app/components.json`
  `iconLibrary: "lucide"` → `"hugeicons"`, `PRODUCT.md`/`README.md`
  Phosphor mentions → Hugeicons, drop orphan `lucide-react` devDep.
  `public/r/*.json` and `app/public/r/*` are regenerated artifacts, not
  hand-edited.

### Constraints & Dependencies

- `IconSvgObject` (icon data type from `core-free-icons`) is assignable to
  `IconSvgElement` (`@hugeicons/react` prop type) — verified against
  `dist/types` of both published packages. Public `icon` props type as
  `IconSvgElement` (renderer package is the public surface).
- Hugeicons free set is stroke-only, default `strokeWidth` 1.5 — Phosphor
  `weight="bold"` ≈ `strokeWidth={2}`; `weight="fill"` (toasty.tsx) has no
  free equivalent → drop to stroke (accepted visual delta, recorded in
  Decisions at execution time).
- `fill-current` className on Phosphor carets is meaningless on stroke
  icons — codemod strips it.
- `@hugeicons/react` peer is `react>=16` — React 19 satisfied.

### Rejected Alternatives

- **Hugeicons Pro (`@hugeicons-pro/*`)**: rejected — paid per-seat license
  cannot be redistributed as source through a public `shadcn add` registry;
  consumers would hit auth-walled installs.
- **Icon font / CDN**: rejected — loses tree-shaking, adds a runtime
  network dependency, breaks the source-first registry model.
- **Phosphor→Hugeicons alias shim**: rejected — permanent dual-package
  surface; the initiative exists to remove Phosphor.
- **Fully manual 53-site edit**: rejected — mechanical, error-prone;
  codemod + typecheck + grep-zero proof is tighter and the mapping file is
  the auditable artifact either way.

### Primary Risks & Mitigations

- **Risk**: codemod misses a JSX/prop pattern (nested props, spreads).
  **Mitigation**: post-codemod `grep -r "@phosphor-icons\|weight="` must be
  zero; both `typecheck` runs gate the phase; leftover sites fixed in W2.
- **Risk**: semantic/glyph mismatch in the 78-name map. **Mitigation**:
  every target verified to exist in `core-free-icons@4.3.5` dist; phase-4
  browser probe eyeballs nav/sidebar/toast glyphs.
- **Risk**: `icon`-as-data breaks components storing icons in config
  arrays. **Mitigation**: W2 hand-fix lists the known sites
  (dashboard/playground/toasty); typecheck catches the rest.
- **Risk**: breaking change for existing registry consumers. **Mitigation**:
  commit message + `icon-map.json` document the migration; no shim
  (Non-goal).
- **Recovery**: whole migration is one revertible diff + `icon-map.json`
  reverse map; no external state, no DB, no deploy artifacts.

## Phases and Verification

### Phase 1: Dependencies and icon map

- **Slug**: `deps-and-map`
- **story_id**: story-deps-and-map-20260923
- **Status**: checked
- **Goal**: R5(partial), R2(mapping artifact). Hugeicons packages installed;
  `icon-map.json` covers every imported Phosphor name. Phosphor stays
  installed this phase — nothing breaks mid-migration.
- **Waves/Tasks**:
  - W1-T1: `pnpm --filter app add @hugeicons/react@^1.1.10 @hugeicons/core-free-icons@^4.3.5`
    and `pnpm --filter @therealtinhtute/registry add -D @hugeicons/react@^1.1.10 @hugeicons/core-free-icons@^4.3.5`.
    Check: both entries in the two `package.json`s; `pnpm install` exit 0.
  - W1-T2: author `packages/registry/scripts/icon-map.json` (78 entries)
    and a coverage check (inline `node -e` or sibling script): every
    `@phosphor-icons/react` imported name in `packages/registry/src` +
    `app` is a map key; every map value exists as
    `node_modules/@hugeicons/core-free-icons/dist/esm/<Name>.js`.
    Check: coverage output `78/78 mapped, 0 missing`.
- **Proof**: coverage check output; `pnpm install` clean.

### Phase 2: Component swap

- **Slug**: `component-swap`
- **story_id**: story-component-swap-20260923
- **Status**: checked
- **Goal**: R1, R2, R4, R5(partial). All source switched to Hugeicons;
  Phosphor and `lucide-react` removed; both trees typecheck.
- **Waves/Tasks**:
  - W1-T1: write `packages/registry/scripts/migrate-icons.mjs`; run over
    `packages/registry/src/**/*.tsx` and `app/{components,demos}/**/*.tsx`
    - `app/components/{playground,theme-toggle}.tsx`. Check:
      `grep -r "@phosphor-icons/react" packages/registry/src app` → 0 hits;
      `grep -rn 'weight="' <changed files>` → 0 hits.
  - W2-T1 (after W1): hand-fix plumbing — `button.tsx`, `badge.tsx`,
    `dashboard.tsx` in registry (`Icon` → `IconSvgElement`,
    `renderIconNode` wraps via `HugeiconsIcon`); `toasty.tsx` drop
    `weight="fill"`; copy the 4 files to `app/components/` mirrors.
    Check: `pnpm --filter @therealtinhtute/registry typecheck` exit 0;
    `diff -q` each pair → identical.
  - W2-T2 (parallel-safe with W2-T1, different files): fix icon-as-value
    render sites the codemod can't — `playground.tsx` GROUPS nav
    (`<HugeiconsIcon icon={item.icon}/>`), `dashboard.tsx` nav config
    (registry side covered by W2-T1 file, app side by the mirror copy),
    any leftover JSX in `app/demos/`. Check:
    `pnpm --filter app typecheck` exit 0.
  - W3-T1: `pnpm --filter app remove @phosphor-icons/react` and
    `pnpm --filter @therealtinhtute/registry remove @phosphor-icons/react lucide-react`.
    Check: `pnpm install` exit 0; `pnpm lint` exit 0; both typechecks
    exit 0.
- **Proof**: zero `@phosphor-icons` refs repo-wide (excl. lockfile→then
  lockfile clean after install); typecheck + lint green; mirrors still
  byte-identical.

### Phase 3: Registry metadata and docs

- **Slug**: `registry-meta`
- **story_id**: story-registry-meta-20260923
- **Status**: checked
- **Goal**: R3, R6, R5(partial). Consumer-facing metadata and docs carry
  Hugeicons; built registry artifacts regenerated.
- **Waves/Tasks**:
  - W1-T1: `packages/registry/registry.json` — replace every
    `"@phosphor-icons/react"` in item `dependencies` with
    `"@hugeicons/react"` + `"@hugeicons/core-free-icons"`. Check:
    `pnpm --filter @therealtinhtute/registry validate` exit 0.
  - W1-T2: `app/components.json` `iconLibrary` → `"hugeicons"`;
    `PRODUCT.md` + `README.md` Phosphor mentions → Hugeicons;
    `THIRD_PARTY_LICENSES.md` update if Phosphor listed. Check:
    `grep -ri phosphor PRODUCT.md README.md app/components.json` → 0 hits.
  - W1-T3: `pnpm --filter @therealtinhtute/registry build` then
    `pnpm --filter app sync-registry`; Check: `grep -l phosphor
packages/registry/public/r/*.json` → 0 hits; built item JSONs list
    hugeicons deps; `pnpm --filter @therealtinhtute/registry validate:build`
    exit 0.
  - W1-T4: `pnpm --filter @therealtinhtute/registry e2e` — consumer-install
    smoke incl. `render-check.tsx` SSR render. Check: exit 0.
- **Proof**: validate + validate:build + e2e all exit 0; built artifacts
  phosphor-free.

### Phase 4: /check and closure

- **Slug**: `hugeicons-check`
- **story_id**: story-hugeicons-check-20260923
- **Status**: checked
- **Goal**: R5 full. Gate the whole diff, visual-probe the showroom, close
  the plan.
- **Waves/Tasks**:
  - W1-T1: run `/check` — validate, validate:build, e2e, typecheck, lint,
    prettier, `pnpm -r build`; SSR probe of `/`; browser probe (headless,
    light+dark): nav icons, sidebar chevrons, toast glyph, button icons
    render, zero console errors. Check: gate verdict APPROVED or findings
    resolved.
  - W1-T2: move plan to `docs/plans/completed/`; conventional commit;
    `git push origin main`. Check: `git status` clean; commit on
    `origin/main`.
- **Proof**: `/check` entry appended under `## Validation`; initiative
  commit(s) on `main`.

## Progress

- 2026-09-23 | phase: deps-and-map | wave: W1 | task: phase-start | task_status: in-progress | verification: plan phase status + Current State set | surfaces: docs/plans/active/hugeicons-migration.md
- 2026-09-23 | phase: deps-and-map | wave: W1 | task: W1-T1 installs | task_status: DONE | verification: `pnpm --filter app add @hugeicons/react@^1.1.10 @hugeicons/core-free-icons@^4.3.5` → added 2; `pnpm --filter @therealtinhtute/registry add -D ...` → added 2; entries confirmed in both package.jsons; note: pnpm was absent from PATH, installed `pnpm@12.2.1` globally via npm | surfaces: app/package.json, packages/registry/package.json, pnpm-lock.yaml
- 2026-09-23 | phase: deps-and-map | wave: W1 | task: W1-T2 icon-map.json + coverage | task_status: DONE | verification: node coverage script → 56 files, 80 imported names (79 icons + `Icon` type), 79 map keys, unmapped: none, missing targets: none — every map value resolves to `node_modules/@hugeicons/core-free-icons/dist/esm/<Name>.js` | surfaces: packages/registry/scripts/icon-map.json
- 2026-09-23 | phase: deps-and-map | wave: W1 | summary | task_status: DONE | verification: installs clean, map complete 79/79, targets verified 0 missing | surfaces: package.jsons, pnpm-lock.yaml, scripts/icon-map.json
- 2026-09-23 | phase: component-swap | wave: W1 | task: phase-start | task_status: in-progress | verification: plan phase status + Current State set | surfaces: docs/plans/active/hugeicons-migration.md
- 2026-09-23 | phase: component-swap | wave: W1 | task: W1-T1 codemod | task_status: DONE | verification: `node packages/registry/scripts/migrate-icons.mjs packages/registry/src app/components app/demos app/lib` → 54 files migrated; mid-run found `@phosphor-icons/react/dist/ssr` subpath import (toasty.tsx ×2) missed by initial regex — widened IMPORT_RE + added `CheckCircleIcon`→`CheckmarkCircle01Icon` to map; post-run `grep -rn "phosphor" src app` → 0 source refs, `weight=`/`fill-current` → 0 | surfaces: packages/registry/scripts/migrate-icons.mjs, scripts/icon-map.json, 54 .tsx files across both trees
- 2026-09-23 | phase: component-swap | wave: W2 | task: W2-T1 plumbing | task_status: DONE | verification: `pnpm --filter @therealtinhtute/registry typecheck` → exit 0; hand-fixed 7 files (button, badge, dropdown-menu, date-picker, input-group, toasty, sidebar) — renderIconNode/icon-render sites now `React.isValidElement → Array.isArray→HugeiconsIcon → legacy ComponentType` fallback; sidebar `icon` prop widened to `Icon | ComponentType | ReactNode` | surfaces: 7 registry files + app mirrors via cp
- 2026-09-23 | phase: component-swap | wave: W2 | task: W2-T2 app leftovers | task_status: DONE | verification: `pnpm --filter app typecheck` → exit 0; playground.tsx stray `\0ICON_IMPORTS\0` placeholder removed (codemod placeholder bug on dual-import files — fixed in migrate-icons.mjs); nav icons flow as data into widened `Sidebar.MenuButton` icon prop | surfaces: app/components/playground.tsx, app/demos/*, app/components/ui/sidebar.tsx
- 2026-09-23 | phase: component-swap | wave: W3 | task: W3-T1 dep removal | task_status: DONE | verification: `pnpm --filter app remove @phosphor-icons/react`; `pnpm --filter @therealtinhtute/registry remove @phosphor-icons/react lucide-react`; `pnpm install` clean; lockfile grep `phosphor|lucide` → 0 | surfaces: app/package.json, packages/registry/package.json, pnpm-lock.yaml
- 2026-09-23 | phase: component-swap | wave: W3 | summary | task_status: DONE | verification: mirrors byte-identical (diff -q all 49 shared files); `pnpm lint` exit 0 (added `node:process`/`node:console` imports to codemod for flat-config no-undef); registry validate exit 0 | surfaces: all migrated files
- 2026-09-23 | phase: registry-meta | wave: W1 | task: phase-start | task_status: in-progress | verification: plan phase status + Current State set | surfaces: docs/plans/active/hugeicons-migration.md
- 2026-09-23 | phase: registry-meta | wave: W1 | task: W1-T1 registry.json deps | task_status: DONE | verification: python rewrite → 22 items updated, `"@phosphor-icons/react"` → `"@hugeicons/react"` + `"@hugeicons/core-free-icons"` | surfaces: packages/registry/registry.json
- 2026-09-23 | phase: registry-meta | wave: W1 | task: W1-T2 config + docs | task_status: DONE | verification: `app/components.json` iconLibrary `lucide`→`hugeicons`; PRODUCT.md/README.md phosphor mentions → Hugeicons; `grep -in phosphor PRODUCT.md README.md` → 0 | surfaces: app/components.json, PRODUCT.md, README.md
- 2026-09-23 | phase: registry-meta | wave: W1 | task: W1-T3 build + sync + validate:build | task_status: DONE | verification: `pnpm --filter @therealtinhtute/registry build` exit 0; `pnpm --filter app sync-registry` copied; `grep -l phosphor public/r/*.json` → 0, `grep -l hugeicons` → 25 files; `validate:build` exit 0 (54 built files schema-clean) | surfaces: packages/registry/public/r/_, app/public/r/_
- 2026-09-23 | phase: registry-meta | wave: W1 | task: W1-T4 e2e | task_status: DONE | verification: `pnpm --filter @therealtinhtute/registry e2e` → exit 0 — consumer install of all 53 items, vite build, theme-token asserts, SSR render-check all OK (log /tmp/e2e.log) | surfaces: packages/registry/scripts/e2e-smoke.sh (unchanged)
- 2026-09-23 | phase: registry-meta | wave: W1 | summary | task_status: DONE | verification: validate exit 0 post-swap; consumer-facing artifacts phosphor-free; e2e consumer proves hugeicons install+render end-to-end | surfaces: registry.json, components.json, docs, public/r/*
- 2026-09-23 | phase: hugeicons-check | wave: W1 | task: phase-start | task_status: in-progress | verification: plan phase status + Current State set | surfaces: docs/plans/active/hugeicons-migration.md
- 2026-09-23 | phase: hugeicons-check | wave: W1 | task: W1-T1 build+probes | task_status: DONE | verification: `pnpm -r build` exit 0 (registry shadcn build + app sync-registry + next build, 4/4 static pages); `pnpm format` → all unchanged; SSR probe on :3010 (3000 is an unrelated Dokploy container) → 938KB, 58 SVGs, 0 lucide/phosphor classes; playwright-core chromium probe → svgLight 66, svgDark 66, dark class applied, errs [] ; screenshots /tmp/showroom-light.png /tmp/showroom-dashboard.png | surfaces: whole tree
- 2026-09-23 | phase: hugeicons-check | wave: W1 | task: W1-T1 independent review | task_status: DONE | verification: background subagent (agent 194c5686) cold-reviewed full diff → 2 major + 9 minor findings; ALL resolved: input-group registry item missing `@hugeicons/react` dep (added); 5 icon props still `ReactNode`-only vs R4 (banner, empty, breadcrumbs ×2, resource-list-page, command-palette ResultItem — widened to `Icon | ReactNode` + renderIconNode); DropdownMenu.SubTrigger icon parity (widened + renderIconNode); `className=""` leftovers removed (select, combobox ×2); `ArrowRightIcon`→`ArrowRight02Icon` remap (collided with CaretRight→ArrowRight01); registry.json rewritten surgically (22-line diff, was 300-line churn); codemod fill-current regex fixed; self-alias imports simplified; stale JSDoc `<WarningCircle/>`→`<AlertCircleIcon/>` | surfaces: 8 registry files + mirrors, registry.json, icon-map.json, migrate-icons.mjs, app/demos/empty.tsx, app/components/playground.tsx
- 2026-09-23 | phase: hugeicons-check | wave: W1 | task: W1-T1 post-fix re-gate | task_status: DONE | verification: both typechecks exit 0; `pnpm lint` exit 0; `pnpm format` unchanged; validate exit 0 (53 items); registry build + validate:build exit 0 (54 files); public/r re-synced (`diff -rq` → identical); e2e re-run exit 0 (install, vite build, theme asserts, SSR render-check — /tmp/e2e.log); `pnpm -r build` exit 0; all 49+ shared mirror files byte-identical; `grep phosphor|lucide` sources → 0; input-group.json now declares `@hugeicons/react` | surfaces: whole tree

## Decisions

- 2026-09-23 | component-swap | Codemod preserves local binding names via `X as LocalName` aliases — all value usages (`icon={X}`, nav config arrays, variant maps) needed zero call-site changes; only JSX tags and imports transformed.
- 2026-09-23 | component-swap | `@phosphor-icons/react/dist/ssr` subpath import in `toasty.tsx` was missed by the brainstorm audit (real count: 80 icons + `Icon` type across 56 files, not 78). Map extended with `CheckCircleIcon`→`CheckmarkCircle01Icon`.
- 2026-09-23 | component-swap | Icon-rendering helper pattern standardized: `React.isValidElement` → `Array.isArray` (IconSvgElement data) → legacy `ComponentType` fallback. Applied to `renderIconNode` in button/badge/dropdown-menu, `SidebarMenuButton` iconNode, `input-group` sizedIcon, `date-picker` Chevron, `toasty` ToastIcon — 7 plumbing files vs the 4 estimated in the plan.
- 2026-09-23 | component-swap | `weight="fill"` (toasty variant icons) dropped per plan — free set is stroke-only; `weight="bold"` → `strokeWidth={2}`; `fill-current` stripped.
- 2026-09-23 | component-swap | `lucide-react` devDep confirmed orphan (zero source refs) — removed alongside phosphor.
- 2026-09-23 | hugeicons-check | Independent-review remediation: every documented icon slot now accepts `Icon | ReactNode` with a uniform `renderIconNode` (element → data array → ComponentType → node passthrough), matching the button/badge/dropdown-menu/sidebar pattern. `input-group` registry item declares `@hugeicons/react` directly rather than relying on transitive `@therealtinhtute/button`. `ArrowRightIcon` remapped to `ArrowRight02Icon` to keep the command-palette "go" arrow distinct from the breadcrumb chevron.

## Current State and Next Action

- Active phase: `hugeicons-check` (final)
- lifecycle_status: completed
- Anchors: all phases checked; independent subagent review complete and remediated; e2e + full build + browser probes all green post-fix
- Blockers: none
- exact_next_action: done — plan closed 2026-09-23

## Validation

- 2026-09-23 | phase: deps-and-map | verdict: APPROVED
  - `pnpm --filter @therealtinhtute/registry validate` → exit 0 — 53 registry items validated, 60 TS/TSX files dep-closure clean
  - `pnpm --filter @therealtinhtute/registry typecheck` → exit 0 — tsc --noEmit
  - `pnpm --filter app typecheck` → exit 0 — next typegen + tsc --noEmit
  - `pnpm lint` → exit 0 — eslint .
  - coverage check (node, inline) → 56 files / 80 imported names / 79 map keys / unmapped: none / missing targets: none
  - judge: same-session; judge_model: SWE-2 Max; diff scope: package.json deps, lockfile, scripts/icon-map.json only
  - proof_gaps: `pnpm -r build` not run (deps+map only; build gates phases 3–4); browser probe deferred to phase 4
  - receipt: context_sources=plan+diff / policy=check.md gate / judge=same-session / judge_model=SWE-2 Max / retries=0 / rollback_point=pre-install tree / failure_ledger: absent / enforcement: local-only / not_independently_verified: built bundle + browser render

- 2026-09-23 | phase: component-swap | verdict: APPROVED
  - `pnpm --filter @therealtinhtute/registry validate` → exit 0 — 53 items, 60 TS/TSX dep-closure clean
  - `pnpm --filter @therealtinhtute/registry typecheck` → exit 0 — tsc --noEmit
  - `pnpm --filter app typecheck` → exit 0 — next typegen + tsc --noEmit
  - `pnpm lint` → exit 0 — eslint .
  - `pnpm install` → exit 0 — lockfile clean, `grep phosphor|lucide pnpm-lock.yaml` → 0
  - `grep -rn "phosphor" packages/registry/src app --include="*.tsx" --include="*.ts"` → 0 matches
  - mirror diff (`diff -q` per shared file) → all identical
  - judge: same-session; judge_model: SWE-2 Max; diff scope: codemod over 54 files + 7 plumbing files + dep removals
  - proof_gaps: runtime render of each icon unproven (typecheck only); `pnpm -r build`, e2e, and browser probe gate at phases 3–4; icon-map glyph correctness eyeball check deferred to phase 4
  - receipt: context_sources=plan+diff+typecheck / policy=check.md gate / judge=same-session / judge_model=SWE-2 Max / retries=0 / rollback_point=phase-1 tree / failure_ledger: absent / enforcement: local-only / not_independently_verified: icon glyphs render correctly, registry build output, consumer install

- 2026-09-23 | phase: registry-meta | verdict: APPROVED
  - `pnpm --filter @therealtinhtute/registry validate` → exit 0 — 53 items validated post-deps swap
  - `pnpm --filter @therealtinhtute/registry build` → exit 0 — 53 items built
  - `pnpm --filter @therealtinhtute/registry validate:build` → exit 0 — 54 built files schema-clean
  - `pnpm --filter app sync-registry` → exit 0
  - `pnpm --filter @therealtinhtute/registry e2e` → exit 0 — fresh consumer: 53-item add, vite build, theme asserts, SSR render-check all pass
  - `grep -l phosphor packages/registry/public/r/*.json` → 0; `grep -l hugeicons` → 25
  - `grep -in phosphor PRODUCT.md README.md` → 0
  - judge: same-session; judge_model: SWE-2 Max; diff scope: registry.json deps, components.json, PRODUCT/README, rebuilt public/r
  - proof_gaps: showroom browser render (glyph-level eyeball) deferred to phase 4; `pnpm -r build` full monorepo build not yet run
  - receipt: context_sources=plan+diff+e2e-log / policy=check.md gate / judge=same-session / judge_model=SWE-2 Max / retries=0 / rollback_point=phase-2 tree / failure_ledger: absent / enforcement: local-only / not_independently_verified: showroom visual output, full monorepo build

- 2026-09-23 | phase: hugeicons-check | verdict: APPROVED
  - `pnpm --filter @therealtinhtute/registry validate` → exit 0 — 53 items, dep-closure clean post-remediation
  - `pnpm --filter @therealtinhtute/registry build` → exit 0; `validate:build` → exit 0 — 54 built files schema-clean; `input-group.json` now declares `@hugeicons/react`
  - `pnpm --filter @therealtinhtute/registry typecheck` → exit 0; `pnpm --filter app typecheck` → exit 0
  - `pnpm lint` → exit 0; `pnpm format` → all files unchanged (prettier-clean)
  - `pnpm --filter @therealtinhtute/registry e2e` → exit 0 — consumer install of all 53 items, vite build, theme-token asserts, SSR render-check (log /tmp/e2e.log)
  - `pnpm -r build` → exit 0 — registry shadcn build + app sync-registry + next build, 4/4 static pages
  - SSR probe (`/` on :3010; port 3000 is an unrelated Dokploy app) → 938,459 bytes SSR, 58 SVGs, 0 `lucide`/`phosphor` classes
  - Browser probe (playwright-core + system chromium, clicked theme toggle + toast) → `{"svgLight":66,"svgDark":66,"dark":"dark","errs":[]}`; screenshots /tmp/showroom-light.png, /tmp/showroom-dashboard.png
  - mirror parity → `diff -q`/`diff -rq` all shared files identical (components + public/r)
  - `grep -rln "phosphor-icons\|lucide" packages/registry/src app/components app/demos` → 0
  - judge: independent-subagent (agent 194c5686, cold diff review) + same-session remediation re-gate; judge_model: SWE-2 Max
  - independent review findings → 2 major + 9 minor, ALL resolved and re-verified (see Progress entries): input-group missing dep; ReactNode-only icon slots ×6; `className=""` leftovers ×3; ArrowRightIcon glyph collision; codemod fill-current regex; self-alias imports; stale JSDoc; registry.json formatting churn reduced to 22-line diff; toasty fill→stroke accepted per plan
  - proof_gaps: none blocking — glyph-level semantics of 5 debatable mappings (ToggleLeft→ToggleOff, SquaresFour→DashboardSquare01, FrameCorners→FullScreen, Browsers→WebDesign01, Textbox→TextSelection) eyeballed acceptable in showroom screenshots; Pro-set upgrade path unchanged (renderer identical)
  - receipt: context_sources=plan+diff+review-report+logs / policy=check.md gate / judge=independent-subagent+same-session / judge_model=SWE-2 Max / retries=1 (remediation round) / rollback_point=pre-migration tree / failure_ledger: subagent-review findings ledger (resolved, see Progress) / enforcement: local-only / not_independently_verified: none outstanding
