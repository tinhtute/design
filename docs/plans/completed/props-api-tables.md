---
id: plan-props-api-20260920
intake_id: intake-props-api-20260920
slug: props-api-tables
title: Auto-generated Props/API Tables for Component Docs
status: completed
lane: normal
input_type: new-initiative
created: 2026-09-20
updated: 2026-09-20
---

# Auto-generated Props/API Tables for Component Docs

## Outcome

Each component section in the showroom renders a Props table generated from
the component's exported `*Props` types at build time — the follow-up
initiative deferred in `docs/plans/completed/component-docs-depth.md`:

1. A server-side extraction module (`app/lib/props.ts`) uses
   `react-docgen-typescript` over `packages/registry/src/components/ui/*.tsx`
   (registry source is canonical; app copies are mirrors) to produce prop rows:
   name, type (rendered as readable union/intersection text), required flag,
   default value, JSDoc description.
2. The showroom page passes serialized prop metadata to `Playground`; each
   component section gains a Props table (columns: Prop, Type, Required,
   Default, Description) rendered with existing design-system primitives and
   `--kumo-*` tokens.
3. Extraction runs inside the server component during prerender — no codegen
   step, no committed generated artifact, zero drift from source.

## Authority and Requirements

### Authoritative Sources

- `docs/plans/completed/component-docs-depth.md`: "Auto-generated props/API
  tables (deferred — candidate follow-up initiative)"; "the hash-based
  showroom stays the docs surface".
- Owner request (2026-09-20): "ok lamd tiếp theo thôi" — execute the next
  recorded initiative.
- Registry component prop surfaces, e.g.
  `packages/registry/src/components/ui/button.tsx`: discriminated unions,
  `Omit<>`, `React.*HTMLAttributes` extensions — extraction must handle these
  without flattening DOM props into the table.
- `app/app/page.tsx` + `app/components/playground.tsx`: server component
  reads demo sources via `fs` at prerender; `Playground` receives
  `sources`/`highlighted` maps — prop metadata follows the same shape.

### Falsifiable Requirements

1. **R1 (extraction)**: prop metadata for `button` contains `variant`,
   `size`, `icon`, `loading` with readable type text and correct required
   flags; inherited DOM props (e.g. `onCopy`, `formAction`) are excluded or
   collapsed, not listed as individual rows.
2. **R2 (render)**: SSR HTML of `/` contains a props table for `button`
   listing prop names and type text; components without exported props render
   no table (no empty section, no error).
3. **R3 (accuracy spot-check)**: `variant` shows its union members
   (`primary | secondary | ghost | destructive | outline`-shaped); boolean
   props show boolean-ish types; required props are marked.
4. **R4 (zero drift)**: prop data derives from registry `*.tsx` source at
   build; no generated file is committed.
5. **R5 (gates)**: `pnpm --filter app typecheck`, `pnpm lint`,
   `pnpm -r build`, registry `validate`/`validate:build`, `pnpm exec
prettier --check` on changed files exit 0.

## Non-goals

- No per-component docs routes, no MDX — the showroom remains the surface.
- No search/filter/sort UI for props; a readable table only.
- No changes to registry component source, prop APIs, or shipped payloads
  (`public/r`); generator and table are showroom-side (`app`).
- No JSDoc authoring sweep — render existing descriptions as-is; missing
  descriptions render empty.
- No method/callback signature docs beyond prop-level type text.

## Approach and Risks

### Implementation Approach

- **Extract at prerender**: `app/lib/props.ts` calls
  `react-docgen-typescript` `withCustomConfig` once against
  `packages/registry/tsconfig.json`, `parse()` on all
  `packages/registry/src/components/ui/*.tsx` in a single program; memoize
  the result per process. `app/app/page.tsx` (server component, already
  doing `fs` reads at prerender) calls it and passes a serialized
  `Record<slug, ComponentDoc[]>` to `Playground` — same shape as
  `sources`/`highlighted`.
- **Filter DOM props**: `propFilter` drops props whose `parent.fileName`
  resolves into `@types/react` / `node_modules`; when any prop was dropped
  for that reason the row set records `inheritsDomProps: true` so the table
  can print one "…inherits native element attributes" note instead of ~50
  DOM rows.
- **Readable types**: `shouldExtractLiteralValuesFromEnum: true`,
  `shouldRemoveUndefinedFromOptional: true`, `savePropValueAsString: true`;
  render `prop.type.name` (union member lists for literals), truncate at
  ~80 chars.
- **Render**: `app/components/props-table.tsx` (client-safe, props-driven)
  renders a table per exported component doc — Prop, Type, Required,
  Default, Description — styled with `--kumo-*` tokens; `Playground` mounts
  it under the demo for the active slug when the doc array is non-empty.
- **Scope**: all slugs in `GROUPS` that map to a registry ui file; files
  with no exported `*Props` (`bubble-map`, `choropleth-map`, `table`) yield
  empty docs → no table rendered.

### Constraints & Dependencies

- New app dependency `react-docgen-typescript` (dev-time/build-time only —
  runs during prerender, never ships to the client bundle); pin a stable
  `2.x` release.
- Parsing uses `packages/registry/tsconfig.json` so path aliases/types
  resolve exactly as registry source expects.
- `Playground` is a client component: only plain serializable objects may
  cross the boundary (docgen `ComponentDoc` is JSON-safe after stripping
  `parent`/`methods` internals we do not render).
- Multi-export files (`button.tsx` exports `Button`, `LinkButton`,
  `RefreshButton`) produce multiple docs — render one table per export.

### Rejected Alternatives

- **Custom TypeScript Compiler API walker**: rejected — discriminated
  unions, `Omit<>`, and HTML-attribute intersections would reimplement
  docgen's hardest parts for zero dependency savings that matter.
- **`react-docgen` (v7)**: rejected — programmatic config is heavier and
  the extraction features needed here are equivalent.
- **Committed generated JSON (`props.json`)**: rejected — a checked-in
  artifact drifts from source the moment a prop changes; prerender-time
  extraction keeps source as the single truth.
- **Manual prop tables in demo `notes`**: rejected — hand-maintained docs
  rot; the initiative exists precisely to automate this.

### Primary Risks & Mitigations

- **Risk**: discriminated-union props (`ButtonProps =
ButtonWithTextProps | IconOnlyButtonProps`) flatten awkwardly.
  **Mitigation**: docgen merges union members and marks non-shared props
  optional; R3 spot-check on `button` verifies the output is readable —
  fallback is one table per union member.
- **Risk**: `propFilter` signature/behavior differs across versions.
  **Mitigation**: pin `^2.4.x`; the filter is unit-verifiable via the R1
  SSR probe (absence of `onCopy`/`formAction` rows).
- **Risk**: prerender slowdown parsing ~43 files. **Mitigation**: single
  `ts.Program` + module-level memo; measured in `pnpm -r build` timing.
- **Recovery**: app-side only; each phase reverts independently; no
  registry payload or external state touched.

## Phases and Verification

### Phase 1: Props extraction

- **Slug**: `props-extraction`
- **story_id**: story-props-extraction-20260920
- **Status**: checked
- **Goal**: R1, R4, R5(partial). `react-docgen-typescript` added to app
  deps; `app/lib/props.ts` produces `Record<slug, ComponentDoc[]>` with
  DOM-prop filtering and type-text cleanup; `page.tsx` computes the map at
  prerender.
- **Waves/Tasks**:
  - W1-T1: `pnpm --filter app add react-docgen-typescript` (pin `^2.4.x`).
    Check: dep present in `app/package.json`; `pnpm install` clean.
  - W1-T2: implement `app/lib/props.ts` (single program over registry ui
    files, `propFilter` for `@types/react` parents, literal enums as union
    text, memoized export `getPropsBySlug()`). Check:
    `pnpm --filter app typecheck` exit 0.
  - W1-T3: wire `app/app/page.tsx` to compute the map and pass to
    `Playground` (typed prop, serializable). Check:
    `pnpm --filter app typecheck` exit 0.
- **Proof**: after build, SSR probe of `/` shows button prop names
  (`variant`, `size`, `icon`, `loading`) present in serialized data and no
  `onCopy`/`formAction` rows; `pnpm --filter app typecheck` exit 0.

### Phase 2: Props table UI

- **Slug**: `props-table-ui`
- **story_id**: story-props-table-ui-20260920
- **Status**: checked
- **Goal**: R2, R3, R5(partial). `app/components/props-table.tsx` renders
  prop tables; `Playground` mounts them per active slug; empty-doc slugs
  render nothing.
- **Waves/Tasks**:
  - W1-T1: build `PropsTable` (per-export section title, columns
    Prop/Type/Required/Default/Description, `--kumo-*` styling, mono type
    text, `inheritsDomProps` note row). Check:
    `pnpm --filter app typecheck` exit 0.
  - W1-T2: mount in `Playground` below the demo block for the active slug.
    Check: `pnpm lint` + `pnpm exec prettier --check <changed>` exit 0.
- **Proof**: SSR probe of `/` contains a props table with `variant` union
  text and a Required marker; `pnpm -r build` exit 0; browser probe
  (headless Chromium): table visible under `button` section in light+dark,
  zero console errors.

### Phase 3: /check and closure

- **Slug**: `props-check`
- **story_id**: story-props-check-20260920
- **Status**: checked
- **Goal**: R5 full. Run the `/check` gate on the whole diff, resolve
  findings, move plan to `docs/plans/completed/`, commit and push.
- **Waves/Tasks**:
  - W1-T1: run `/check` (validate, validate:build, typecheck, lint, build,
    prettier, registry e2e, SSR+browser probes). Check: gate verdict
    APPROVED or findings resolved.
  - W1-T2: move plan to `docs/plans/completed/`; conventional commits;
    `git push origin main`. Check: `git status` clean; `origin/main` has
    the commits.
- **Proof**: `/check` report entry appended under `## Validation`; git
  log shows the initiative commits on `main`.

## Progress

- 2026-09-20 | phase: props-extraction | wave: W1 | task: phase-start | task_status: in-progress | verification: plan phase status + Current State set | surfaces: docs/plans/active/props-api-tables.md
- 2026-09-20 | phase: props-extraction | wave: W1 | task: W1-T1 dep | task_status: DONE | verification: `pnpm --filter app add react-docgen-typescript@^2.4.0` → installed 2.4.0 (2025-06-10), pnpm-lock clean | surfaces: app/package.json, pnpm-lock.yaml, app/next.config.ts (serverExternalPackages)
- 2026-09-20 | phase: props-extraction | wave: W1 | task: W1-T2 props.ts | task_status: DONE | verification: `pnpm --filter app typecheck` exit 0; direct node probe — button docs = `Button, RefreshButton, LinkButton`, props `icon,loading,shape,size,variant`, DOM props filtered (inheritsDomProps=true), union text `"primary" | "secondary" | …` | surfaces: app/lib/props.ts
- 2026-09-20 | phase: props-extraction | wave: W1 | task: W1-T3 wire page.tsx | task_status: DONE | verification: `pnpm --filter app typecheck` exit 0; `pnpm --filter app build` exit 0; SSR `/` payload contains serialized prop names (`variant`,`size`,`loading`) and zero DOM-prop rows (`onCopy`/`formAction` absent) | surfaces: app/app/page.tsx, app/components/playground.tsx
- 2026-09-20 | phase: props-extraction | wave: W1 | summary | task_status: DONE | verification: phase gate — typecheck pass, lint pass, prettier pass, build pass, SSR probe pass; `react-docgen-typescript` added to `serverExternalPackages` (Next 16 bundles server deps; typescript already auto-external) | surfaces: app/package.json, pnpm-lock.yaml, app/next.config.ts, app/lib/props.ts, app/app/page.tsx, app/components/playground.tsx
- 2026-09-20 | phase: props-table-ui | wave: W1 | task: W1-T1 PropsTable | task_status: DONE | verification: `pnpm --filter app typecheck` exit 0; `pnpm lint` exit 0 (initial 13 `shadcn/no-restyle` errors fixed by styling inner `<code>`/`<span>` — TableCell owns typography) | surfaces: app/components/props-table.tsx
- 2026-09-20 | phase: props-table-ui | wave: W1 | task: W1-T2 mount in Playground | task_status: DONE | verification: `pnpm lint` + `prettier --check` exit 0; `pnpm -r build` exit 0; SSR `/` contains `<h3>Button/RefreshButton/LinkButton props` + `<table>` + `required` cells + "native attributes" note; browser probe (chromium-1228, light+dark): tables render, union types + defaults + JSDoc descriptions visible, 0 console/page errors | surfaces: app/components/playground.tsx
- 2026-09-20 | phase: props-table-ui | wave: W1 | summary | task_status: DONE | verification: 62 required props present across registry (Badge.children, BubbleMap.data…); R2/R3 verified — slugs without exported props render no table | surfaces: app/components/props-table.tsx, app/components/playground.tsx

## Decisions

- 2026-09-20 | props-extraction | Filter docgen results to `displayName`
  starting with uppercase — non-component exports like `buttonVariants`
  were being parsed as docs with prop-like rows. PascalCase is the repo's
  component convention and matches every registry export.
- 2026-09-20 | props-extraction | `react-docgen-typescript` added to
  `next.config.ts` `serverExternalPackages` — Next 16 bundles server
  component deps; docgen pulls the TS compiler and must resolve it via
  native `require`.

## Current State and Next Action

- Active phase: `props-check` (final)
- lifecycle_status: checked
- Anchors: `app/lib/props.ts` (extraction, memoized, DOM-filtered),
  `app/components/props-table.tsx` (Table-based UI), `page.tsx` prerender
  wiring, `next.config.ts` serverExternalPackages
- Blockers: none
- exact_next_action: move plan to `docs/plans/completed/`, commit and push

## Validation

- 2026-09-20 | phase: props-check | verdict: APPROVED | judge: same-session | judge_model: SWE-2 Max | proof_gaps: none — no unit-test infra in repo (direct node probe + SSR/browser DOM probes used as functional evidence); e2e depends on network for consumer deps
  - `npx --yes pnpm@12.2.1 --filter @therealtinhtute/registry validate` -> pass (53 items, validate-deps closure, exit 0)
  - `npx --yes pnpm@12.2.1 --filter @therealtinhtute/registry validate:build` -> pass (54 built files against schema, exit 0)
  - `npx --yes pnpm@12.2.1 --filter app typecheck` -> pass (next typegen + tsc --noEmit, exit 0)
  - `npx --yes pnpm@12.2.1 lint` -> pass (eslint, exit 0)
  - `npx --yes pnpm@12.2.1 exec prettier --check app/lib/props.ts app/components/props-table.tsx app/components/playground.tsx app/app/page.tsx app/next.config.ts app/package.json docs/PROJECT.md docs/plans/active/props-api-tables.md` -> pass (clean after prettier --write on the plan file, exit 0)
  - `npx --yes pnpm@12.2.1 -r build` -> pass (/ + /docs static, exit 0)
  - `npx --yes pnpm@12.2.1 --filter @therealtinhtute/registry e2e` -> pass (fresh consumer install + vite build + theme-token asserts + SSR render-check, exit 0)
  - `cd app && node --experimental-strip-types --input-type=module -e "import('/root/projects/monoui/app/lib/props.ts').then(m => { const r = m.getPropsBySlug(); console.log(Object.keys(r).length); })"` -> pass (42 slugs extracted; button docs = Button/RefreshButton/LinkButton; DOM props filtered; variant union text correct; 62 required props across registry)
  - SSR probe `curl http://127.0.0.1:3213/` -> pass: `<h3>Button props`/`RefreshButton props`/`LinkButton props`, `<table>` with Prop/Type/Required/Default/Description headers, "native attributes" note, serialized `props` payload present
  - Browser probe (playwright-core chromium-1228, light+dark) -> pass: 3 tables render under Button section, union/defaults/descriptions visible, zero console/page errors
  - receipt: context_sources=docs/plans/active/props-api-tables.md,app/lib/props.ts,app/components/props-table.tsx,component-docs-depth.md deferred item / policy=docs/playbooks/check.md / judge=same-session / judge_model=SWE-2 Max / retries=1 (prettier plan file) + 1 stale-server restart / rollback_point=git checkout / failure_ledger: absent / enforcement: local-only / not_independently_verified=visual pixel review (screenshots reviewed in-session), e2e network-dependent
