---
id: plan-component-docs-202609180251
intake_id: intake-component-docs-202609180251
slug: component-docs-depth
title: Component Docs Depth — Code Samples, Real Demos, Install Instructions, Usage Notes
status: active
lane: normal
input_type: change-request
created: 2026-09-18
updated: 2026-09-18
---

# Component Docs Depth — Code Samples, Real Demos, Install Instructions, Usage Notes

## Outcome

The showroom becomes a usable docs surface for consumers: every component page lets a visitor read a short usage note, see a real demo, copy the exact code that produces it, and copy the `shadcn add` install command — without leaving the page. Pattern components (`data-table`, `filter-bar`, `dashboard`) carry the same JSDoc conventions as ported components. A consumer landing on the repo README can install a component in one read.

Success looks like:
1. Every showroom page renders a per-component usage note (when to use / primary variants / a11y) under the registry description.
2. Every one of the 49 showroom pages shows its demo's source in a copyable block, sourced from the same module that renders it — no hand-maintained duplicate JSX strings that can drift.
3. Every showroom page shows a copyable install command for that item.
4. Named stub demos render real content — no empty tables, dead handlers, or placeholder-only mounts.
5. `dashboard`, `data-table`, `filter-bar`, `page-header`, `resource-list-page` have JSDoc coverage at parity with ported components; `app/` and `packages/registry/` copies remain byte-identical.
6. Root `README.md` replaces the `# UI` stub with product purpose + install quickstart.
7. Gate commands in `docs/PROJECT.md` pass; hash navigation unchanged.

## Authority and Requirements

### Authoritative Sources
- Owner request (2026-09-18): "hãy lên plan để improve" the component docs, then "Tui muốn code mô tả về mỗi components ở docs của nó" — per-component descriptions must live on each component's docs page, following the read-only docs audit in the same session — findings: zero code samples, stub demos (`data-table` empty render, `filter-bar` dead handler, `toasty` no real toast), JSDoc gaps on the three new pattern components, `README.md` is a `# UI` stub, `chart` has no showroom entry.
- `packages/registry/registry.json` — names, titles, descriptions of all 53 items (description text itself is not rewritten by this initiative).
- `PRODUCT.md` — canonical install UX: `pnpm dlx shadcn add @therealtinhtute/{component}`.
- Cloudflare Kumo docs-site convention (`packages/kumo-docs-astro`, MIT, pin `a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf`): each component doc pairs an intro paragraph + live preview + its source — the pattern this initiative ports to the showroom.
- Prior completed plan `docs/plans/completed/showroom-sidebar-clarity.md` — the showroom already wires registry descriptions into the page header; usage notes and code samples extend that same block.
- `docs/plans/completed/shadcn-lint-baseline.md` — establishes `packages/registry/src/components` ↔ `app/components` byte-identical mirror; edits land in registry source and mirror to `app/`.

### Falsifiable Requirements
1. **R1 (usage notes)**: each showroom slug's demo module exports a non-empty `notes` string; the page renders it under the registry description for all 49 slugs (50 if `chart` is added per R5).
2. **R2 (code samples, single-source)**: each showroom slug renders a copyable code block whose content is the actual source of the displayed demo, produced by the same module that renders it; `playground.tsx` holds no second hand-maintained copy of demo JSX (no duplicated demo-JSX string literals).
3. **R3 (install command)**: each showroom page displays the item's install command (`pnpm dlx shadcn add @therealtinhtute/{name}`) in copyable form.
4. **R4 (demo substance)**: showroom code contains no `columns={[]}`, `data={[]}`, `onValueChange={() => undefined}`, or equivalent dead props; `data-table` shows at least 3 populated rows, `filter-bar` filters a visible list, `toasty` fires a real toast from a trigger button.
5. **R5 (chart gap resolved)**: the `chart` registry item either gains a showroom nav entry and demo, or this plan records the owner's explicit exclusion decision.
6. **R6 (JSDoc parity)**: `dashboard.tsx`, `data-table.tsx`, `filter-bar.tsx`, `page-header.tsx`, `resource-list-page.tsx` carry file-level and exported-props JSDoc consistent with catalog convention; `cmp` exits 0 for each `app/components/` ↔ `packages/registry/src/components/` pair.
7. **R7 (README)**: root `README.md` states the product, the `shadcn add` install command, and dev/build/test commands; the `# UI`-only stub is gone.
8. **R8 (no regressions)**: `pnpm --filter app typecheck`, `pnpm lint`, `pnpm -r build`, `pnpm --filter @therealtinhtute/registry validate`, `validate:build`, and `e2e` all exit 0; `#slug` navigation still selects components.

## Non-goals

- A full docs site: no MDX pipeline, no per-slug routes, no docs-framework migration. The hash-based showroom stays the docs surface.
- Auto-generated props/API tables (deferred — candidate follow-up initiative).
- Rewriting the 53 registry descriptions; changing any component's runtime behavior or styling.
- Theme/token changes (`theme.css`, `packages/tokens`).
- Any runtime dependency on `@cloudflare/kumo`.

---

## Approach and Risks

### Implementation Approach
- **Demo-doc module pattern** (shadcn-docs convention): replace the `Canvas()` switch inside `app/components/playground.tsx` with one self-contained module per slug at `app/demos/{slug}.tsx`. Each module is the docs unit: it exports `Demo` (the live render, owning its own state so the snippet is copy-pasteable) and `notes` (the R1 usage string). A `app/demos/index.ts` manifest maps slug → `{ Demo, notes }`; `playground.tsx` looks the slug up instead of switching.
- **Single-source code samples**: `app/app/page.tsx` is a server component — it reads each `app/demos/{slug}.tsx` from disk via `node:fs` at render/build time and passes a `{ [slug]: source }` map into `<Playground>`. The code block therefore always shows the file that actually renders the demo; `pnpm dev` re-reads per request so sources never go stale. The code panel and the install command (R3, interpolated per slug) render via the existing `ClipboardText`/`Code` components — dogfooding the catalog.
- **Stub fixes ride the migration**: `data-table`, `filter-bar`, `toasty` modules are written with real content during the same pass that creates all demo modules; `chart` gets a nav entry plus a minimal `EChart` demo (fallback: owner rules exclusion at review → manifest simply has no `chart` entry and the decision is recorded in Decisions).
- **JSDoc + README last**: add file-level and exported-props JSDoc to the five pattern/block files in `packages/registry/src/components/` (canonical), `cp` to `app/components/` to preserve byte-identity, then write root `README.md`. Independent of the showroom work; sequenced last because it is lowest-risk.

### Constraints & Dependencies
- `page.tsx` must stay a server component (it already is) for `fs` source reads; `playground.tsx` stays `"use client"` and receives `sources` as a prop. Serialization cost ≈ 49 × ~2 KB — acceptable for a docs page.
- `app/tsconfig.json` sets `resolveJsonModule`; the `registry.json` static import for descriptions is already proven in production (prior plan).
- `packages/registry/public/` and `app/public/r` are gitignored build output; `pnpm -r build` regenerates.
- Phase `migrate-all-demos` depends on `demo-doc-modules` (the manifest + Playground consumption contract must exist first). Phase `jsdoc-readme` has no dependency on the other two.

### Rejected Alternatives
- **`react-element-to-jsx-string` runtime serialization**: rejected — adds a runtime dependency, mangles compound-component JSX (`Select.Item` etc.), and the output is not the code a consumer would paste.
- **Hand-maintained `EXAMPLES: Record<slug, string>`**: rejected — duplicates every demo as a string; guaranteed drift (violates R2's single-source rule).
- **`import demo from '*.tsx?raw'` / raw-loader**: rejected — Turbopack has no supported raw-import equivalent without custom loaders; `fs` in the server component is the idiomatic Next.js path.
- **MDX docs site / per-slug routes**: rejected — non-goal; effort is disproportionate for a registry whose value prop is `shadcn add`.
- **Putting `notes` in `registry.json`**: rejected — keeps the published item schema stock shadcn; notes are a showroom-layer concern and travel with the demo module, not the registry payload.

### Primary Risks & Mitigations
- **Risk**: `fs.readFileSync` path/cwd assumptions break under `turbo` or deployed builds. **Mitigation**: resolve via `path.join(process.cwd(), "demos", ...)` inside `app/`; verification includes `pnpm -r build` (static prerender) plus a dev-mode browser probe — both entry paths exercised.
- **Risk**: demos lose shared interactivity (dialog/palette open state, pagination page). **Mitigation**: each `Demo` owns `useState` — required anyway so the displayed source is self-contained and paste-able.
- **Risk**: notes blurbs vary in quality/length across 49 modules. **Mitigation**: one-sentence convention (when-to-use + primary variants + a11y where relevant); spot-check in browser probe; worst case is a text edit, no logic.
- **Risk**: `chart` demo adds ECharts wiring cost for a low-level wrapper. **Mitigation**: demo renders the smallest real `EChart` (line, 3 points); exclusion is the documented fallback.
- **Proof gap (declared)**: `app` has no unit-test harness; proof is registry validators + e2e + browser DOM/visual probe, same as prior plans.
- **Recovery**: each phase is one revertable commit; no data or external state changes.

---

## Phases and Verification

### Phase 1: Demo-Doc Module Pipeline
- **Slug**: `demo-doc-modules`
- **Story ID**: `story-demo-modules-202609180251`
- **Status**: `checked`
- **Goal**: Stand up the `app/demos/` module convention, notes/source plumbing, and the docs panel UI (R1, R2, R3) proven on pilot slugs.
- **Dependencies**: none
- **Allowed surfaces**: `app/demos/**` (new), `app/components/playground.tsx`, `app/app/page.tsx`
- **Avoided surfaces**: `packages/registry/**`, `app/components/ui/**`, theme/token files, `README.md`
- **Wave 1**:
  - T1.1 — Create `app/demos/` with pilot modules `button.tsx`, `dialog.tsx`, `badge.tsx`, `timeseries-chart.tsx` (covers stateless, stateful-dialog, variants, echarts cases): each exports `Demo` (self-contained state) and `notes`. Create `app/demos/index.ts` exporting `DEMOS: Record<slug, { Demo, notes }>`. Output: new files.
  - T1.2 — `app/app/page.tsx`: read `app/demos/*.tsx` sources via `node:fs` into `{ [slug]: source }`, pass to `<Playground sources={…}>`. Output: edited file.
- **Wave 2** (after Wave 1):
  - T1.3 — `playground.tsx`: replace `Canvas` lookup for pilot slugs with `DEMOS[slug]`; render docs panel per page — registry description (existing), `notes` paragraph, live demo, copyable code block (source string) and install command via `ClipboardText`/`Code`. Output: edited file.
- **Verification**:
  - `pnpm --filter app typecheck`
  - `pnpm lint`
  - `pnpm -r build`
  - `ls app/demos/*.tsx` lists pilot files; `grep -l 'export const notes' app/demos/*.tsx` covers each pilot.
  - Browser probe with `pnpm --filter app dev` running: `agent-browser open http://localhost:3000/#button` → page shows notes paragraph, live demo, a code block whose text equals `app/demos/button.tsx` file content, and install command text containing `shadcn add @therealtinhtute/button`; `#dialog` demo opens/closes via its own state.
- **Stop conditions**: `fs` source read fails under `next build` prerender → stop and escalate (do not add webpack/turbopack loaders without owner approval); any gate command fails twice with the same error → escalate.

### Phase 2: Migrate All Demos + Substance Fixes
- **Slug**: `migrate-all-demos`
- **Story ID**: `story-migrate-demos-202609180251`
- **Status**: `checked`
- **Goal**: Every showroom slug lives in `app/demos/` with `Demo` + `notes`; stub demos get real content; `chart` resolved (R1–R5).
- **Dependencies**: `demo-doc-modules`
- **Allowed surfaces**: `app/demos/**`, `app/components/playground.tsx` (nav `GROUPS` + Canvas removal)
- **Avoided surfaces**: `packages/registry/**`, `app/components/ui/**`, `app/app/page.tsx` (except a path fix if the pipeline changed), theme/token files, `README.md`
- **Wave 1**:
  - T2.1 — Write the remaining ~46 demo modules (all `GROUPS` slugs except pilots) including stub fixes: `data-table` with ≥3 columns × ≥3 rows of real data, `filter-bar` filtering a visible list, `toasty` with a trigger button firing a real toast; each with `notes`. Output: new files.
  - T2.2 — Add `chart` to `GROUPS` (Data visualization) with `app/demos/chart.tsx` (minimal `EChart` line demo + notes) — OR record owner exclusion in Decisions and skip the module. Output: edited file + new file.
- **Wave 2** (after Wave 1):
  - T2.3 — Delete `Canvas()` and its shared-state props from `playground.tsx`; all slugs resolve through `DEMOS`; dead imports removed. Output: edited file.
- **Verification**:
  - `pnpm --filter app typecheck`
  - `pnpm lint`
  - `pnpm -r build`
  - `grep -nE "columns=\{\[\]\}|data=\{\[\]\}|onValueChange=\{\(\) => undefined\}" app/demos/ app/components/playground.tsx` → no matches (R4).
  - `for` each slug in `GROUPS`: `app/demos/{slug}.tsx` exists and `grep -l 'export const notes'` matches; count `= 50` (or 49 with chart-exclusion decision recorded).
  - `grep -c 'function Canvas' app/components/playground.tsx` → `0`.
  - `pnpm --filter @therealtinhtute/registry validate && pnpm --filter @therealtinhtute/registry validate:build && pnpm --filter @therealtinhtute/registry e2e`
  - Browser probe: `#data-table` renders populated rows; `#filter-bar` typing filters the list; `#toasty` click shows a toast; `#chart` (if added) renders an ECharts canvas; spot-check `#select`/`#combobox` code panels match their module sources; every page shows notes + install command. Screenshots light+dark at 1280px and 482px.
- **Stop conditions**: any gate command fails twice with the same error → escalate; a slug cannot be made self-contained (e.g. needs app-level provider not expressible in a module) → stop and escalate rather than reintroducing shared state.

### Phase 3: JSDoc Parity + README
- **Slug**: `jsdoc-readme`
- **Story ID**: `story-jsdoc-readme-202609180251`
- **Status**: `planned`
- **Goal**: Pattern/block components get catalog-convention JSDoc; root README becomes a real quickstart (R6, R7).
- **Dependencies**: none (independent of phases 1–2; sequenced last)
- **Allowed surfaces**: `packages/registry/src/components/{dashboard,data-table,filter-bar,page-header,resource-list-page}.tsx`, their `app/components/` mirrors, `README.md`
- **Avoided surfaces**: `app/demos/**`, `playground.tsx`, `app/components/ui/**` (JSDoc coverage already adequate), registry.json descriptions
- **Wave 1**:
  - T3.1 — Add file-level docblock (purpose, composition pattern, usage pointer) + exported-props JSDoc to the five registry files; `cp` each to `app/components/` mirror. Output: edited files.
  - T3.2 — Write root `README.md`: product identity (`@therealtinhtute/ui`), install (`pnpm dlx shadcn add @therealtinhtute/{component}`), showroom dev command, gate commands pointer to `docs/PROJECT.md`. Output: edited file.
- **Verification**:
  - `cmp app/components/{name}.tsx packages/registry/src/components/{name}.tsx` exits 0 for all five files.
  - `grep -c '/\*\*' packages/registry/src/components/data-table.tsx` ≥ 2 (file block + props).
  - `grep -n 'shadcn add' README.md` → at least one line; `# UI` stub gone.
  - `pnpm --filter app typecheck`, `pnpm lint`, `pnpm -r build`, registry `validate`/`validate:build`/`e2e` all exit 0.
- **Stop conditions**: JSDoc wording would conflict with the ported-file license-header convention → escalate; gates fail twice identically → escalate.

---

## Current State and Next Action

- active_phase: jsdoc-readme
- lifecycle_status: in-progress
- planning_status: planned
- latest_progress: 2026-09-18T04:30Z phase migrate-all-demos CHECKED — e2e blocker resolved via owner-approved scope add (assertions now theme-derived); full e2e green
- latest_validation: 2026-09-18T04:30Z APPROVED (in-session gate, phase migrate-all-demos)
- blockers: none
- open_items: none
- exact_next_action: work full — start phase `jsdoc-readme` (JSDoc 5 files + mirror + README)

## Progress

- 2026-09-18T03:05Z | phase: demo-doc-modules | wave: 1 | task: phase-start | task_status: in-progress | summary: Run anchor; phase set in-progress per work-full step 3. | surfaces: docs/plans/active/component-docs-depth.md
- 2026-09-18T03:10Z | phase: demo-doc-modules | wave: 1 | task: T1.1 | task_status: done | summary: Created `app/demos/{button,dialog,badge,timeseries-chart}.tsx` — each `"use client"`, self-contained state, exports `Demo` + `notes`; `app/demos/index.ts` exports `DEMOS: Record<string, DemoModule>` manifest. | surfaces: app/demos/
- 2026-09-18T03:12Z | phase: demo-doc-modules | wave: 1 | task: T1.2 | task_status: done | summary: `app/app/page.tsx` reads `app/demos/*.tsx` via `readdirSync`/`readFileSync` at `path.join(process.cwd(), "demos")`, passes `sources` map into `<Playground>`; stays a server component. | surfaces: app/app/page.tsx
- 2026-09-18T03:20Z | phase: demo-doc-modules | wave: 2 | task: T1.3 | task_status: done | summary: `playground.tsx` takes `sources` prop, looks up `DEMOS[slug]` — migrated slugs render `<entry.Demo/>` + notes paragraph + `ClipboardText` install command + `Code.Block` of the module's own source; unmigrated slugs keep `Canvas` fallback. | surfaces: app/components/playground.tsx
- 2026-09-18T03:25Z | phase: demo-doc-modules | wave: summary | task_status: done | summary: Both waves complete; `pnpm --filter app typecheck` ✓ `pnpm lint` ✓ `pnpm -r build` ✓ (page prerenders static, fs read works at build); `ls app/demos/*.tsx` = 4, `grep -l 'export const notes'` = 4. Browser probe (playwright-core + headless chromium, port 3100 — agent-browser absent in env): 10/10 PASS — notes render, install cmd text, code block byte-equals `app/demos/button.tsx`, dialog own-state open/Escape-close, hash nav switches slug+title, echarts canvas mounts, non-migrated `#input` still renders Canvas fallback, no 482px overflow. | surfaces: app/demos/, app/app/page.tsx, app/components/playground.tsx
- 2026-09-18T03:40Z | phase: migrate-all-demos | wave: 1 | task: phase-start | task_status: in-progress | summary: Run anchor; phase set in-progress. Execution strategy: 6 background sub-agents write disjoint `app/demos/{slug}.tsx` batches; orchestrator owns manifest/GROUPS/Canvas-removal/gates. | surfaces: docs/plans/active/component-docs-depth.md
- 2026-09-18T04:00Z | phase: migrate-all-demos | wave: 1 | task: T2.1 | task_status: done | summary: 46 demo modules written by 6 parallel sub-agents (disjoint file sets, pilot convention). Agents verified props against component sources; flagged findings recorded in Decisions. Orchestrator fixed 5 @shadcn/lint errors (`h-[560px]`→`h-140`, `p-4` off LayerCard, `text-kumo-subtle` off TableCell). | surfaces: app/demos/ (46 new files)
- 2026-09-18T04:02Z | phase: migrate-all-demos | wave: 1 | task: T2.2 | task_status: done | summary: `chart` added to GROUPS (Data visualization, ChartBarIcon) with `app/demos/chart.tsx` minimal EChart line demo + notes — owner inclusion path per R5, not exclusion. | surfaces: app/demos/chart.tsx, app/components/playground.tsx
- 2026-09-18T04:05Z | phase: migrate-all-demos | wave: 2 | task: T2.3 | task_status: done | summary: `Canvas()` deleted; playground.tsx 840→290 lines; all 50 slugs resolve via `DEMOS`; shared dialog/palette/page state and dead imports removed; `index.ts` manifest registers all 50 modules. | surfaces: app/components/playground.tsx, app/demos/index.ts
- 2026-09-18T04:10Z | phase: migrate-all-demos | wave: summary | task_status: done | summary: `typecheck` ✓ `lint` ✓ `build` ✓; dead-prop grep clean; `function Canvas` count = 0; 50/50 files have notes+Demo and manifest entries. Browser probe (playwright-core, /tmp/pw/probe2.mjs, :3100): all 50 pages render notes + install cmd + code block byte-equal to module source; data-table 10 rows; filter-bar applies query to visible list; toasty fires real "Worker deployed" toast; #chart h2+canvas mount; zero page errors. BLOCKER: `pnpm --filter @therealtinhtute/registry e2e` fails 2 checks on stale `--background` assertions predating this diff (see blockers). | surfaces: app/demos/, app/components/playground.tsx
- 2026-09-18T04:25Z | phase: migrate-all-demos | wave: gate | task: e2e-fix | task_status: done | summary: Owner approved scope add for `packages/registry/scripts/e2e-smoke.sh`. Replaced hardcoded Kumo `--background` values with assertions that read expected values from the consumer's installed `globals.css` and compare numerically (handles LightningCSS `%`/leading-zero/`deg` normalization) — self-updating, cannot go stale on palette changes. `pnpm --filter @therealtinhtute/registry e2e` → all checks passed. | surfaces: packages/registry/scripts/e2e-smoke.sh
- 2026-09-18T04:30Z | phase: migrate-all-demos | wave: gate | task: phase-gate | task_status: checked | summary: In-session gate APPROVED; full gate suite green including previously-failing e2e. Phase status → checked (non-final phase per playbook). | surfaces: docs/plans/active/component-docs-depth.md

## Decisions

- 2026-09-18T03:25Z | phase: demo-doc-modules | task: verification | type: tooling-substitution | summary: Plan named `agent-browser` for the browser probe; binary absent in this env. Substituted `playwright-core` + headless Chromium (`/tmp/pw/probe.mjs`, dev server on :3100 — :3000 is an unrelated Dokploy container). Same assertions executed; probe script is a scratchpad artifact, not committed.
- 2026-09-18T03:10Z | phase: demo-doc-modules | task: T1.1 | type: convention | summary: `notes` lives inside each demo module (not in the manifest or registry.json) so one file = demo + description + its own displayed source; `DEMOS` typed as `Record<string, DemoModule>` for direct slug lookup in `playground.tsx`.
- 2026-09-18T04:00Z | phase: migrate-all-demos | task: T2.1 | type: api-findings | summary: Sub-agent discoveries while writing modules: `Radio` requires `Radio.Item` inside `Radio.Group` (old `Canvas` case used a wrong shape); `CommandPalette` demo keeps its own `Results`/filter state; `Chart` prop is `options` (not `option`) and needs explicit height; `BubbleMap`/`ChoroplethMap` require correct echarts module sets (map/scatter/geo/visualMap); `DataTable` sorting uses `column.toggleSorting`; `FilterBar` uses `onFilter` for apply-on-click; `Code` declares a `values` prop its implementation never reads — demo avoids it.
- 2026-09-18T04:10Z | phase: migrate-all-demos | task: wave-summary | type: blocker | summary: Registry e2e fails only on `--background` token greps hardcoded to pre-Walter Kumo values; commit 70774eb regenerated the theme item with Walter `oklch(0.9798…)`/`oklch(0.2679…)` after the last green e2e run, so the failure predates this diff. `packages/registry/scripts/e2e-smoke.sh` is outside phase allowed surfaces — escalated to owner rather than edited (contract-drift guard).
- 2026-09-18T04:25Z | phase: migrate-all-demos | task: e2e-fix | type: scope-add (owner-approved) | summary: Owner ruled option 1 — fix the stale assertion. `e2e-smoke.sh` step 9 now extracts expected `--background` from the consumer's installed `globals.css` and compares to built CSS numerically (python3, normalizing LightningCSS `%`/leading-zero/`deg` forms). Test is theme-derived and cannot go stale on future palette changes.

## Validation

APPROVED
- phase: demo-doc-modules
- scope: on target
- depth: standard (new docs pipeline + showroom render path; no shipped component code touched)
- proof:
  - `pnpm --filter app typecheck` -> pass
  - `pnpm lint` -> pass
  - `pnpm -r build` -> pass (`/` prerendered static; `fs` source read succeeded at build)
  - `ls app/demos/*.tsx` -> badge, button, dialog, timeseries-chart (4 pilot files)
  - `grep -l 'export const notes' app/demos/*.tsx` -> 4/4 pilot modules
  - `git status --short` -> only `app/app/page.tsx`, `app/components/playground.tsx`, `app/demos/`, `docs/plans/active/` changed — inside allowed surfaces (pass)
  - Browser probe `node /tmp/pw/probe.mjs` against `pnpm --filter app dev` (:3100) -> 10/10 PASS: notes paragraph renders for button and badge; install command `pnpm dlx shadcn add @therealtinhtute/button` present; `<pre>` code block text byte-equals `app/demos/button.tsx` file content (single-source verified); dialog opens via own state and closes on Escape; `#badge` nav updates hash + h2 + notes; `#timeseries-chart` mounts an echarts canvas; unmigrated `#input` still renders via `Canvas` fallback without docs panel; no horizontal overflow at 482px
- review: APPROVED
- judge: same-session
- judge_model: swe-2-max
- blockers: 0 critical, 0 major
- not_independently_verified: no independent reviewer examined the diff; probe covered pilot slugs plus one unmigrated fallback, not every hash/slug combination; visual styling of the docs panel (notes/code spacing) was asserted via DOM text, not human screenshot review
- receipt: context_sources=docs/plans/active/component-docs-depth.md,app/demos/,app/app/page.tsx,app/components/playground.tsx / policy=docs/playbooks/check.md / judge=same-session / judge_model=swe-2-max / retries=0 / rollback_point=pre-phase-1 commit 70774eb / failure_ledger=absent / enforcement=local-only / not_independently_verified=see above
- proof_gaps: `app` has no unit-test harness (declared in plan risk); probe substituted for agent-browser (tooling-substitution decision recorded)

APPROVED
- phase: migrate-all-demos
- scope: on target (plus one owner-approved scope add: `packages/registry/scripts/e2e-smoke.sh` step 9)
- depth: standard
- proof:
  - `pnpm --filter app typecheck` -> pass (all 50 demo modules)
  - `pnpm lint` -> pass (5 @shadcn/lint errors found+fixed: arbitrary `h-[560px]`, child-owned `p-4`/`text-kumo-subtle`)
  - `pnpm -r build` -> pass
  - `pnpm --filter @therealtinhtute/registry validate` / `validate:build` -> pass
  - `pnpm --filter @therealtinhtute/registry e2e` -> all checks passed (after owner-approved assertion fix; earlier run failed 2 stale token greps predating this diff)
  - dead-prop grep (`columns={[]}`/`data={[]}`/no-op `onValueChange`) -> no matches
  - `grep -c 'function Canvas' app/components/playground.tsx` -> 0; file 840->290 lines
  - 50/50 `app/demos/*.tsx` export `notes` + `Demo`; 50/50 manifest entries; `chart` in GROUPS
  - Browser probe `node /tmp/pw/probe2.mjs` (:3100) -> all PASS: every slug page renders notes + install command + code block byte-equal to its module source; data-table 10 rows; filter-bar applies query to visible list; toasty fires real toast "Worker deployed"; `#chart` mounts canvas; zero page errors across all 50 pages
  - `git status` -> only `app/demos/**`, `app/components/playground.tsx`, plan file, `e2e-smoke.sh` (approved) changed
- review: APPROVED
- judge: same-session
- judge_model: swe-2-max
- blockers: 0
- not_independently_verified: no independent reviewer; demo *content quality* (variant coverage per component) asserted via probe presence checks, not human design review; dark-mode visuals not screenshotted this phase
- receipt: context_sources=docs/plans/active/component-docs-depth.md,app/demos/,app/components/playground.tsx,packages/registry/scripts/e2e-smoke.sh / policy=docs/playbooks/check.md / judge=same-session / judge_model=swe-2-max / retries=1 (e2e stale-assertion fix) / rollback_point=commit 048568a / failure_ledger=absent / enforcement=local-only / not_independently_verified=see above
- proof_gaps: no unit-test harness (declared risk); probe substituted for agent-browser
