---
id: 01M0ANQW05BCEE28FYH76VT8NF
type: plan
intake_id: 01M0ANR8NSEACM3EJMEA8E53C8
lane: normal
status: completed
created: 2026-08-18
updated: 2026-08-20
---

# Plan: @therealtinhtute/ui — public shadcn/ui Registry + design system

## Outcome
- result: A public, statically-hosted personal shadcn Registry `@therealtinhtute/ui` where a consumer project registers one registry URL and `shadcn add` installs real source components plus a data-driven light/dark design-token theme that renders correctly.
- success_signals:
  - Fresh consumer app: `shadcn registry add @therealtinhtute=<host>/r` then `shadcn add button card input badge data-table filter-bar dashboard` all succeed.
  - Installed components render with default light and dark theme tokens (oklch CSS variables, `--radius` single source) in the consumer project.
  - Built `registry.json` and per-item JSON validate against `ui.shadcn.com/schema/registry.json` + `registry-item.json`.
  - Registry served from a public static host (Cloudflare Pages default) with no server, no auth, no rate limiting; URL tracks `main` via CI.

## Authority and Requirements
- authority:
  - prompt.md (product brief, 2026-08-18)
  - Interview-validated spec, accepted by owner 2026-08-18 (decisions D1–D8)
  - Current shadcn/ui Registry docs + `shadcn-ui/ui` source (verified Aug 2026): item types, `registry:build` → `public/r/`, `styles/{style}/{name}.json` layout, `cssVars {theme,light,dark}`, no `version` field in schema
- requirements:
  - R1 [accepted]: Registry is static JSON built with `shadcn registry:build`, served from a public static host; no auth or server. | source: D1
  - R2 [accepted]: Consumers register one registry URL, then add items by short name (`shadcn add button`); built layout is `styles/{style}/{name}.json` + `index.json` + `registries.json`. | source: D2
  - R3 [accepted]: Token system is data-driven — `theme.json` per theme in `packages/tokens`; a generator emits `globals.css` CSS variables (oklch, `--radius` single source + derived radius scale) and `registry:theme` items; component items carry `cssVars`. | source: D3
  - R4 [accepted]: Repo is a minimal pnpm workspace with `packages/tokens` + `packages/registry`; docs app deferred. | source: D4
  - R5 [accepted]: Single-channel versioning — registry URL tracks `main`; git history is the version; CI rebuilds on push. | source: D5
  - R6 [accepted]: Public GitHub repo + public static host; no access machinery. | source: D6
  - R7 [accepted]: Hierarchy maps to shadcn item types — `registry:ui` primitives, `registry:component` composites/patterns, `registry:block`/`registry:page`; "pattern" is a curation label, not a new type. | source: D7
  - R8 [accepted]: MVP items — Button, Input, Badge, Card (`registry:ui`); DataTable, FilterBar (`registry:component`); Dashboard shell (`registry:block`); default light + dark theme. | source: D8
  - R9 [accepted]: End-to-end smoke test proves a fresh consumer installs all MVP items and renders them with the theme. | source: Success condition

## Non-goals
- NG1: Docs website (`apps/docs`) — deferred beyond MVP.
- NG2: Registry server, private registry, auth, rate limiting, protected endpoints.
- NG3: Per-item versioning or pinned URL releases — single channel only.
- NG4: A custom component hierarchy/taxonomy beyond shadcn item types.
- NG5: Large component breadth (the full 50-component catalog) in the first slice.
- NG6: Turborepo or multi-workflow CI complexity — single GitHub Actions build+deploy.
- NG7: Tailwind v3 or React 18 support — MVP targets Tailwind v4 + React 19.

## Approach and Risks
- approach: Incremental vertical slices, each ending in a verifiable artifact. (1) init minimal pnpm workspace + tooling; (2) build the data-driven token system (theme.json → generator → globals.css + registry:theme items); (3) author the 7 MVP items as source + registry.json with correct deps/registryDependencies/cssVars; (4) produce and schema-validate the built `public/r/` layout via `shadcn registry:build`; (5) prove the whole pipeline with a fresh-consumer e2e smoke install + render; (6) automate build+validate+deploy on push. Chosen because each phase yields an observable artifact and de-risks the CLI/registry mechanics early (e2e before deploy automation).
- constraints:
  - Registry item schema conformance (types, files, dependencies, registryDependencies, cssVars) — do not invent fields.
  - `styles/{style}/{name}.json` + `index.json` + `registries.json` layout; style name `default`.
  - Tailwind v4 (`@theme inline`), React 19, TypeScript, pnpm, Radix where a primitive needs it.
  - oklch color values; `--radius` single source with derived `--radius-sm…4xl`.
  - Public static hosting, single channel, no auth.
- rejected_alternatives:
  - GitHub-only registry (no build) — slower per-item resolution, no theme generation, harder to grow; declined for static-JSON build (D1).
  - Next.js registry server — real ops + auth burden not needed in MVP (D1).
  - npm-package registry style — publish step + versioning surface; declined for registry-URL + short names (D2).
  - Plain hand-written CSS variables — loses data-driven theming value (D3).
  - Single flat package — deps would bleed between tokens and registry; declined for minimal workspace (D4).
  - Pinned per-release URLs — overhead with no consumer need yet (D5).
  - 4-layer explicit hierarchy — pattern layer has no shadcn type behind it (D7).
- risks:
  - Registry CLI behavior drifts from the Aug 2026 research summary. → Mitigate: validate every item against the published schema; run `shadcn registry:build` early (phase 3/4); if a mechanism contradicts research, stop and verify against current shadcn docs/source before proceeding.
  - `registry:build` requires a shadcn-aware project context. → Mitigate: keep `packages/registry` self-contained per official `shadcn registry:build` usage; verify command early.
  - Theme CSS variables don't apply in the consumer (Tailwind v4 `@theme inline` wiring). → Mitigate: e2e render + explicit dark-toggle token check (phase 5).
  - DataTable dependency surface (@tanstack/react-table) version mismatches. → Mitigate: pin deps, resolve in e2e (phase 5).
  - Static-host choice stalls progress. → Mitigate: default to Cloudflare Pages (free, zero config); document the Vercel swap path.
- recovery: If any registry mechanism or schema field behaves differently than documented, stop the phase, re-verify against `ui.shadcn.com/docs/registry` and `shadcn-ui/ui` source, update this plan's constraints if a field/type changed, then resume.

## Phases and Verification
<!-- Phase and task definitions are immutable after to-plan. Do not add task status fields. Append-only Progress is the sole task execution-status source. Only each phase lifecycle status changes to mirror DB transitions: to-plan=planned; work after run create=in-progress; clean durable check=checked; closing handoff=done. Each planned phase records phase_slug, story_id, status, goal, depends_on, waves, tasks, and checks. -->
- planning_status: planned
- phases:
  - phase: workspace-init
    story_id: 01M0ANVJQMS813P184SPMGYA7Z
    status: done
    goal: Initialize minimal pnpm workspace: packages/tokens + packages/registry, TS/ESLint/Prettier tooling.
    depends_on: none
    waves:
      - wave: 1
        tasks:
          - Root package.json (private) + pnpm-workspace.yaml with packages/tokens, packages/registry; stub packages each with package.json + src/index.ts.
          - Root tsconfig.base.json + per-package tsconfig; shared ESLint flat config + Prettier config.
        expected_outputs:
          - pnpm install resolves; `pnpm lint` and `pnpm -r typecheck` pass on stubs.
        checks:
          - pnpm install (exit 0, no peer warnings for stubs)
          - pnpm lint
          - pnpm -r typecheck
  - phase: token-system
    story_id: 01M0ANVJQWG0GQ1F9GXZ8JE2J0
    status: done
    goal: Build data-driven token system: theme.json -> generator -> globals.css CSS variables + registry:theme items (default light/dark).
    depends_on: workspace-init
    waves:
      - wave: 1
        tasks:
          - Define token schema in packages/tokens: theme.json shape for colors (oklch), typography, radius, spacing, shadows, borders, motion; author default light + dark theme.json.
          - Implement generator: theme.json -> emits Tailwind-v4 globals.css (styles.css) with @theme inline, :root (light) + .dark overrides, --radius single source + derived --radius-sm..4xl.
          - Emit registry:theme items (cssVars {theme, light, dark}) for both themes; wire into a tokens/registry output consumed by packages/registry.
        expected_outputs:
          - Generator run produces styles.css for light + dark with expected variables; theme items validate against registry-item.json.
        checks:
          - pnpm --filter @therealtinhtute/tokens generate
          - Assert generated CSS contains --radius, --color-background, --color-primary for both :root and .dark
          - Validate emitted registry:theme item JSON against ui.shadcn.com/schema/registry-item.json
  - phase: registry-items
    story_id: 01M0ANVJR36TQ5GFWGQ7BE8KBY
    status: done
    goal: Author MVP component source + registry.json entries (button, input, badge, card, data-table, filter-bar, dashboard block) with correct types/deps/registryDependencies/cssVars.
    depends_on: token-system
    waves:
      - wave: 1
        tasks:
          - Author registry:ui primitives: button, input, badge, card (.tsx source following shadcn conventions; Radix for button/card primitives).
          - wave 1b: Author registry:component composites: data-table (registryDependencies: table, button, dropdown-menu, checkbox; dependencies: @tanstack/react-table) and filter-bar.
          - wave 1c: Author registry:block dashboard shell (registryDependencies on primitives/composites; layout skeleton).
          - wave 1d: Write packages/registry/registry.json with $schema and all item entries (name/type/files/dependencies/registryDependencies/cssVars).
        expected_outputs:
          - registry.json validates; every referenced file exists; deps are real package versions.
        checks:
          - Validate registry.json against ui.shadcn.com/schema/registry.json
          - Script asserts each item's files[] paths exist on disk
          - pnpm lint && pnpm -r typecheck
  - phase: registry-build
    story_id: 01M0ANVJRBGTWEB0Z3SMDSZRJ1
    status: done
    goal: Produce and validate built registry artifact layout public/r/ via shadcn registry:build (styles/default/{name}.json, index.json, registries.json).
    depends_on: registry-items
    waves:
      - wave: 1
        tasks:
          - Run `shadcn registry:build` (or the registry package's build script) from packages/registry to emit public/r/.
          - Validate built per-item JSON against registry-item.json schema and index.json against registry.json schema.
          - Serve public/ locally and curl each item path (styles/default/{name}.json) for 200.
        expected_outputs:
          - public/r/styles/default/{name}.json for all items + index.json + registries.json exist; schema-valid; serveable.
        checks:
          - pnpm --filter registry build (registry:build) exit 0
          - Schema validation of built items + index
          - Local static server + curl each item -> 200
  - phase: e2e-smoke
    story_id: 01M0ANVJRJ80MNJWJHRD2AZ4TA
    status: done
    goal: Prove fresh consumer installs and renders all MVP items with light/dark theme via local registry.
    depends_on: registry-build
    waves:
      - wave: 1
        tasks:
          - Script scaffolds a temp consumer app (Vite + React + TS + Tailwind v4 + components.json) in a tmp dir.
          - Register local registry URL (or file-based registry), run `shadcn add button card input badge data-table filter-bar dashboard`; assert files land under src/components + deps install.
          - Apply theme (globals.css) and build the consumer app; render check asserting components mount and dark toggle changes token variables.
        expected_outputs:
          - All add commands exit 0; consumer build passes; rendered DOM contains the components; dark mode applies --color-background swap.
        checks:
          - e2e script exit 0 (all installs + build)
          - Grep built consumer CSS for both :root and .dark token blocks
          - Optional: headless render assertion that button/card/data-table appear in DOM
  - phase: ci-deploy
    story_id: 01M0ANVJRSWZ7JZEYCNN34HEFX
    status: done
    goal: Automate build+validate+deploy on push to main via GitHub Actions so registry URL tracks git.
    depends_on: e2e-smoke
    waves:
      - wave: 1
        tasks:
          - Write .github/workflows/registry.yml: pnpm install, lint, typecheck, tokens generate, registry:build, schema validation, e2e smoke.
          - Add Cloudflare Pages (default) or Vercel deploy step publishing public/ (registry artifact only).
          - Post-deploy verification job: fetch registry URL index.json + a sample item, assert 200 + content-type json.
        expected_outputs:
          - Workflow green on push to main; public registry URL serves index.json + styles/default/button.json.
        checks:
          - gh workflow run / CI green on a push
          - curl <registry-url>/r/index.json and /r/styles/default/button.json -> 200 JSON

## Progress
<!-- Append-only durable entries record timestamp, phase, wave, task, task_status, run_id, trace_id, exact verification/result, and changed surfaces or blocker. -->
- `2026-08-18T15:06:25Z` — wave 1, task Root package.json (private) + pnpm-workspace.yaml + stub packages (tokens, registry) with package.json + src/index.ts. task_status: `DONE`. run: `01M0APDEFFDQ9M0757AB3NVNM4`. summary: pnpm install exit 0; workspace resolves 2 packages clean.
- `2026-08-18T15:06:25Z` — wave 1, task Root tsconfig.base.json + per-package tsconfig + shared ESLint flat config + Prettier config. task_status: `DONE`. run: `01M0APDEFFDQ9M0757AB3NVNM4`. summary: pnpm lint exit 0; pnpm -r typecheck exit 0.
- `2026-08-18T15:06:25Z` — wave 1. run: `01M0APDEFFDQ9M0757AB3NVNM4`. summary: workspace-init wave 1 complete: minimal pnpm workspace (tokens + registry) + TS/ESLint/Prettier tooling scaffolded and verified.
- `2026-08-18T15:51:09Z` — wave 1, task Define token schema (Theme type) + author default light/dark theme.json. task_status: `DONE`. run: `01M0ARRNJ2Z9Y9FRN1SGJD7Q4F`. summary: Theme type + default theme.json: oklch semantic colors (light/dark), radius + radiusScale, typography, spacing, shadows, motion.
- `2026-08-18T15:51:09Z` — wave 1, task Implement generator: theme.json -> Tailwind-v4 globals.css (@theme inline + :root + .dark, --radius single source + derived scale). task_status: `DONE`. run: `01M0ARRNJ2Z9Y9FRN1SGJD7Q4F`. summary: buildThemeCss emits dist/themes/default.css; assertions: --radius/--color-background/--color-primary present in :root and .dark.
- `2026-08-18T15:51:09Z` — wave 1, task Emit registry:theme items (cssVars theme/light/dark) wired for packages/registry consumption. task_status: `DONE`. run: `01M0ARRNJ2Z9Y9FRN1SGJD7Q4F`. summary: theme-default.json emitted; validated OK against vendored ui.shadcn.com/schema/registry-item.json (ajv).
- `2026-08-18T15:51:09Z` — wave 1. run: `01M0ARRNJ2Z9Y9FRN1SGJD7Q4F`. summary: token-system wave 1 complete: data-driven theme.json -> generator -> globals.css + schema-valid registry:theme item (default light/dark).
- `2026-08-18T16:15:03Z` — wave 1, task Author registry:ui primitives: button, input, badge, card. task_status: `DONE`. run: `01M0ASD01XHVSF5DM1QEEX2TKN`. summary: button/input/badge/card (shadcn v4 conventions) + supporting table/checkbox/dropdown-menu primitives under src/components/ui.
- `2026-08-18T16:15:03Z` — wave 1, task Author registry:component composites: data-table and filter-bar. task_status: `DONE`. run: `01M0ASD01XHVSF5DM1QEEX2TKN`. summary: data-table (sorting/selection/column visibility/pagination on @tanstack/react-table) + filter-bar authored.
- `2026-08-18T16:15:03Z` — wave 1, task Author registry:block dashboard shell (registryDependencies on primitives/composites). task_status: `DONE`. run: `01M0ASD01XHVSF5DM1QEEX2TKN`. summary: dashboard shell: sidebar nav, stat cards, recent-orders data table.
- `2026-08-18T16:15:03Z` — wave 1, task Write packages/registry/registry.json with $schema and all item entries. task_status: `DONE`. run: `01M0ASD01XHVSF5DM1QEEX2TKN`. summary: 12 items (theme-default + utils + 4 MVP ui + table/checkbox/dropdown-menu + data-table/filter-bar + dashboard), schema-valid.
- `2026-08-18T16:16:19Z` — wave 1. run: `01M0ASD01XHVSF5DM1QEEX2TKN`. summary: registry-items wave 1 complete: 12 items + registry.json; registry.json + items validate, files exist, lint + typecheck pass.
- `2026-08-18T16:15:03Z` — wave 1, task Author registry:ui primitives: button, input, badge, card. task_status: `DONE`. run: `01M0ASD01XHVSF5DM1QEEX2TKN`. summary: button/input/badge/card authored (shadcn v4 conventions, Radix slot) + supporting table/checkbox/dropdown-menu primitives under src/components/ui.
- `2026-08-18T16:15:03Z` — wave 1, task Author registry:component composites: data-table and filter-bar. task_status: `DONE`. run: `01M0ASD01XHVSF5DM1QEEX2TKN`. summary: data-table (sorting/selection/column visibility/pagination on @tanstack/react-table) + filter-bar authored.
- `2026-08-18T16:15:03Z` — wave 1, task Author registry:block dashboard shell (registryDependencies on primitives/composites). task_status: `DONE`. run: `01M0ASD01XHVSF5DM1QEEX2TKN`. summary: dashboard shell: sidebar nav, stat cards, recent-orders data table.
- `2026-08-18T16:15:03Z` — wave 1, task Write packages/registry/registry.json with $schema and all item entries. task_status: `DONE`. run: `01M0ASD01XHVSF5DM1QEEX2TKN`. summary: 12 items: theme-default + utils + 4 MVP ui + table/checkbox/dropdown-menu + data-table/filter-bar + dashboard.
- `2026-08-18T16:16:19Z` — wave 1. run: `01M0ASD01XHVSF5DM1QEEX2TKN`. summary: registry-items wave 1 complete: 12 items authored + registry.json; registry.json+items validate against schemas, files exist, lint + typecheck pass.
- `2026-08-18T16:21:51Z` — wave 1, task Run shadcn registry:build (or the registry package build script) from packages/registry to emit public/r/. task_status: `DONE`. run: `01M0ATRPYBBYCV3V754P8YV030`. summary: shadcn build (CLI 4.18.0, added as devDep) emits public/r/: flat {name}.json x12 + registry.json with inlined file content.
- `2026-08-18T16:21:51Z` — wave 1, task Validate built per-item JSON against registry-item.json schema and index.json against registry.json schema. task_status: `DONE`. run: `01M0ATRPYBBYCV3V754P8YV030`. summary: validate:build: 12 items OK against registry-item.json, registry.json OK against registry.json schema (13 files).
- `2026-08-18T16:21:51Z` — wave 1, task Serve public/ locally and curl each item path for 200. task_status: `DONE`. run: `01M0ATRPYBBYCV3V754P8YV030`. summary: python http.server on public/; 13/13 /r/{name}.json + /r/registry.json -> 200 application/json.
- `2026-08-18T16:21:57Z` — wave 1. run: `01M0ATRPYBBYCV3V754P8YV030`. summary: registry-build wave 1 complete: shadcn build -> public/r/ (flat layout, sources inlined); 13 built files schema-valid; 13/13 paths served 200 JSON.
- `2026-08-19T04:13:55Z` — wave 1, task Script scaffolds a temp consumer app (Vite + React + TS + Tailwind v4 + components.json) in a tmp dir.. task_status: `DONE`. run: `01M0BY1AGKECE92SKP664XCMJ1`. summary: e2e-smoke.sh scaffolds a fresh consumer in a tmp dir: package.json, tsconfig, vite.config with @ alias, index.html, globals.css, components.json, and a main.tsx rendering all MVP components plus a dark toggle..
- `2026-08-19T04:13:55Z` — wave 1, task Register local registry URL (or file-based registry), run shadcn add button card input badge data-table filter-bar dashboard; assert files land under src/components + deps install.. task_status: `DONE`. run: `01M0BY1AGKECE92SKP664XCMJ1`. summary: shadcn registry add @therealtinhtute=http://127.0.0.1:8791/r/{name}.json; shadcn add of all 7 items + theme-default created 11 files including table/dropdown-menu/checkbox/utils; all expected files asserted present..
- `2026-08-19T04:13:55Z` — wave 1, task Apply theme (globals.css) and build the consumer app; render check asserting components mount and dark toggle changes token variables.. task_status: `DONE`. run: `01M0BY1AGKECE92SKP664XCMJ1`. summary: Consumer vite build passed; built CSS contains :root background oklch(100% 0 0) for light and .dark oklch(14.5% 0 0); SSR render-check confirmed button, badge, filter-bar, data-table rows, and dashboard content in rendered output..
- `2026-08-19T04:14:36Z` — wave 1. run: `01M0BY1AGKECE92SKP664XCMJ1`. summary: e2e-smoke wave 1 complete: a fresh consumer (Vite + React 19 + TS + Tailwind v4) registered the local @therealtinhtute registry, installed all 7 MVP items + theme-default via shadcn add (11 files), built successfully, and rendered with correct light/dark tokens (built-CSS :root/.dark assertions + SSR render-check all pass).
- `2026-08-19T06:00:53Z` — wave 1. task_status: `in-progress`. run: `01M0C9Q2FBSZF577B87DT8BN3C`. summary: ci-deploy wave 1 started: author .github/workflows/registry.yml (build+validate → Cloudflare Pages deploy of public/ → post-deploy URL verification); create GitHub repo, commit + push to main; wire deploy secrets.
- `2026-08-19T06:13:37Z` — wave 1, task Write .github/workflows/registry.yml: pnpm install, lint, typecheck, tokens generate, registry:build, schema validation, e2e smoke.. task_status: `DONE`. run: `01M0C9Q2FBSZF577B87DT8BN3C`. summary: registry.yml authored: build job = checkout+pnpm+node20, install --frozen-lockfile, lint, typecheck, tokens generate, registry build, validate:build, e2e, upload-artifact public/; YAML parses (jobs build/deploy/verify); local command chain proven exit 0 by parallel verifier..
- `2026-08-19T06:13:37Z` — wave 1, task Add Cloudflare Pages (default) or Vercel deploy step publishing public/ (registry artifact only).. task_status: `DONE`. run: `01M0C9Q2FBSZF577B87DT8BN3C`. summary: deploy job: cloudflare/pages-action@v1 (directory packages/registry/public, branch main, gitHubToken), gated on secrets.CLOUDFLARE_API_TOKEN != "", artifact round-trip build->deploy via upload/download-artifact..
- `2026-08-19T06:13:37Z` — wave 1, task Post-deploy verification job: fetch registry URL index.json + a sample item, assert 200 + content-type json.. task_status: `DONE`. run: `01M0C9Q2FBSZF577B87DT8BN3C`. summary: verify job curls https://<project>.pages.dev/r/registry.json + /r/button.json asserting HTTP 200 + content-type json — flat-layout paths, since index.json/styles-default do not exist in the CLI 4.18.0 flat build (see decision)..
- `2026-08-19T06:13:49Z` — wave 1. run: `01M0C9Q2FBSZF577B87DT8BN3C`. summary: ci-deploy wave 1 implementation complete: .github/workflows/registry.yml authored (build -> Cloudflare Pages deploy -> live-URL verify), YAML valid, all 7 CI commands proven exit 0 locally by parallel verifier, verify paths adapted to flat public/r/ layout (decision 01M0CAEXQ1QJXKSW35KBSKJQHQ). Phase checks (CI green on push to main, live URL 200 JSON) still pending external infra: create+push GitHub repo, wire Cloudflare Pages secrets..
- `2026-08-20T13:39:16Z` — wave 1. run: `01M0C9Q2FBSZF577B87DT8BN3C`. summary: ci-deploy correction: GitHub rejected secrets in the deploy job-level if (run 32364726176); replaced it with vars.VERCEL_ENABLED, actionlint now passes, and the full local CI chain remains green. Corrected workflow is ready to push; Vercel project/authentication, VERCEL_* secrets, and VERCEL_ENABLED=true remain external blockers for deploy and live URL proof..
- `2026-08-20T13:42:27Z` — wave 1. run: `01M0C9Q2FBSZF577B87DT8BN3C`. summary: GitHub Actions run 32375572918 passed after the workflow fix: build job green in 48s, registry-public artifact uploaded; deploy and verify were intentionally skipped because repository variable VERCEL_ENABLED is unset. Only annotation is GitHub's Node 20 deprecation notice for v4 actions; no job failure..
- `2026-08-20T13:55:56Z` — wave 1. run: `01M0C9Q2FBSZF577B87DT8BN3C`. summary: GitHub Actions run 32376843343 completed green end-to-end: build 44s, deploy 37s, verify 4s. Vercel deployment protection was disabled for the public project; verify job fetched /r/registry.json and /r/button.json from the live deployment and asserted HTTP 200 application/json for both..
- `2026-08-20T13:59:11Z` — wave 1. run: `01M0C9Q2FBSZF577B87DT8BN3C`. summary: ci-deploy phase complete and checked: final durable check 01M0FQDE49X4XNEHFRK8B0DV54 APPROVED; GitHub Actions run 32376843343 build/deploy/verify all green; public Vercel registry endpoints /r/registry.json and /r/button.json returned HTTP 200 application/json..
- `2026-08-20T14:00:59Z` — handoff recorded. handoff: `01M0FQK83ZQB8SV877AT9FKDWK`. run: `01M0C9Q2FBSZF577B87DT8BN3C`. check: `01M0FQDE49X4XNEHFRK8B0DV54`. open items: Optional lifecycle cleanup: close the five historical checked phases in dependency order before completing the initiative.; Run zharness plan complete --json after every phase is done..
- `2026-08-20T14:09:28Z` — handoff recorded. handoff: `01M0FR2SCGP4A2JWEYW8TRMCT0`. run: `01M0APDEFFDQ9M0757AB3NVNM4`. check: `01M0APJTWWE3MGE3A8Y1YP4N4B`. phase closed.
- `2026-08-20T14:11:15Z` — handoff recorded. handoff: `01M0FR61E1BECTEQWR0XWRMRKK`. run: `01M0ARRNJ2Z9Y9FRN1SGJD7Q4F`. check: `01M0AS44CDB6WQAWKBKV9EDZRP`. phase closed.
- `2026-08-20T14:11:53Z` — handoff recorded. handoff: `01M0FR76BHG9JJEAWV8KJXYW66`. run: `01M0ASD01XHVSF5DM1QEEX2TKN`. check: `01M0ATJ4G1G73FEVGCDPRX19DV`. phase closed.
- `2026-08-20T14:12:42Z` — handoff recorded. handoff: `01M0FR8PCRM3EX5V3RRBSVMNK4`. run: `01M0ATRPYBBYCV3V754P8YV030`. check: `01M0ATW3R039W411TG9YZTD641`. phase closed.
- `2026-08-20T14:13:28Z` — handoff recorded. handoff: `01M0FRA2W95TJ6M44CSTHQNXCY`. run: `01M0BY1AGKECE92SKP664XCMJ1`. check: `01M0C44A1SGGGEDER96XFQG2K0`. phase closed.
- `2026-08-20T14:14:19Z` — handoff recorded. handoff: `01M0FRBMT3VGED28QJSXQG9TF9`. run: `01M0C9Q2FBSZF577B87DT8BN3C`. check: `01M0FQDE49X4XNEHFRK8B0DV54`. phase closed.

## Decisions
<!-- Append-only durable entries record timestamp, phase/task, decision, and rationale. -->
- `2026-08-18T16:15:00Z` — phase: registry-items. decision: data-table's registryDependencies (`table`, `dropdown-menu`, `checkbox`) are authored as first-party `registry:ui` primitives in this registry rather than cross-referencing the official @shadcn registry. rationale: keeps the registry self-contained, makes `@/components/ui/*` imports resolve in-repo for the typecheck phase check, and matches the personal-registry goal; the plan's listed registryDependencies are preserved verbatim (data-table registryDependencies: table, button, dropdown-menu, checkbox, utils).
- `2026-08-18T16:30:00Z` — phase: registry-build. decision: the current shadcn CLI (4.18.0) `build` emits a flat layout — `public/r/{name}.json` per item + `public/r/registry.json` — not the researched `styles/{style}/{name}.json` + `index.json` + `registries.json`. rationale: verified empirically against the shipped CLI; the flat layout is what the current CLI serves/consumes, so the plan's `styles/default` layout constraint is superseded for MVP; the e2e phase registers the flat `/r` URL.
- `2026-08-19T06:13:43Z` — ci-deploy post-deploy verification curls flat-layout paths /r/registry.json + /r/button.json instead of the plan check text /r/index.json + /r/styles/default/button.json. (phase: `ci-deploy`), task: Post-deploy verification job. rationale: The shadcn CLI 4.18.0 build emits a flat public/r/ layout (registry-build decision 2026-08-18T16:30): per-item {name}.json + registry.json, no index.json, no styles/default/ subdir. registry.json is the built index; button.json is the sample item..
- `2026-08-20T11:37:14Z` — Deploy host switched from Cloudflare Pages to Vercel in ci-deploy registry.yml. (phase: `ci-deploy`), task: Add Cloudflare Pages (default) or Vercel deploy step publishing public/ (registry artifact only).. rationale: Owner chose Vercel over Cloudflare Pages during the ci-deploy credential gate. Deploy job uses amondnet/vercel-action@v42 (working-directory packages/registry/public, vercel-args --prod --yes), gated on secrets.VERCEL_TOKEN; verify job curls the deployment URL from deploy.outputs.deployment-url for /r/registry.json + /r/button.json (200 + json content-type)..
- `2026-08-20T13:37:23Z` — Use repository variable VERCEL_ENABLED to gate the deploy job instead of testing secrets in job-level if. (phase: `ci-deploy`), task: Add Cloudflare Pages (default) or Vercel deploy step publishing public/ (registry artifact only).. rationale: GitHub Actions forbids the secrets context in job-level if expressions (actionlint and run 32364726176 both confirmed workflow registration failure). vars is available at job scope; set VERCEL_ENABLED=true only after Vercel project and VERCEL_TOKEN/VERCEL_ORG_ID/VERCEL_PROJECT_ID secrets are configured. This preserves an intentional skip until external deployment is ready..
- `2026-08-20T13:55:56Z` — Disable Vercel project SSO deployment protection for the public registry project. (phase: `ci-deploy`), task: Post-deploy verification job. rationale: The new project defaulted to ssoProtection.deploymentType=all_except_custom_domains, causing anonymous registry requests to return HTTP 302 to vercel.com/sso-api despite the production deployment being READY. The initiative requires a public static host with no auth; PATCH /v9/projects/{id} with {"ssoProtection":null} removed the protection, after which both registry.json and button.json returned HTTP 200 application/json..
- `2026-08-20T14:01:24Z` — Leave initiative closure as an optional lifecycle follow-up after the ci-deploy product phase is checked. (phase: `ci-deploy`), task: Closing handoff. rationale: The product outcome is complete and handoff 01M0FQK83ZQB8SV877AT9FKDWK records it. `zharness handoff --close-phase` cannot close the final phase while the five historical prerequisite phases remain checked rather than done; no product blocker remains. Close those historical phases in dependency order, then run plan complete if full lifecycle closure is desired..
- `2026-08-20T14:14:56Z` — plan completed. rationale: every phase_slug is a done story.

## Validation
<!-- Append-only durable entries record timestamp, phase, exact command/result/output, run_id, check_id, verdict, and proof_gaps. -->
- `2026-08-18T15:07:05Z` — check. verdict: `APPROVED`. check: `01M0APJTWWE3MGE3A8Y1YP4N4B`. run: `01M0APDEFFDQ9M0757AB3NVNM4`. phase: `workspace-init`. judge: `same-session` (deepseek-v4-flash).
  - `pnpm install` → Validation entry 2026-08-18T15:06: pnpm install exit 0, 109 packages
  - `pnpm lint` → Validation entry 2026-08-18T15:06: eslint exit 0
  - `pnpm -r typecheck` → Validation entry 2026-08-18T15:06: tsc --noEmit exit 0 for tokens + registry
- `2026-08-18T15:51:29Z` — check. verdict: `APPROVED`. check: `01M0AS44CDB6WQAWKBKV9EDZRP`. run: `01M0ARRNJ2Z9Y9FRN1SGJD7Q4F`. phase: `token-system`. judge: `same-session` (deepseek-v4-flash).
  - `pnpm --filter @therealtinhtute/tokens generate` → Validation entry 2026-08-18T15:20: generated default.css + theme-default.json, exit 0
  - `pnpm --filter @therealtinhtute/tokens validate` → Validation entry 2026-08-18T15:20: theme-default.json OK against registry-item.json, exit 0
  - `pnpm -r typecheck` → Validation entry 2026-08-18T15:20: tsc --noEmit exit 0 for tokens + registry
  - `pnpm lint` → Validation entry 2026-08-18T15:20: eslint exit 0
- `2026-08-18T16:17:00Z` — check. verdict: `APPROVED`. check: `01M0ATJ4G1G73FEVGCDPRX19DV`. run: `01M0ASD01XHVSF5DM1QEEX2TKN`. phase: `registry-items`. judge: `same-session` (deepseek-v4-flash).
  - `pnpm --filter @therealtinhtute/registry validate` → Validation entry 2026-08-18T16:17: registry.json + 12 items validate against registry.json + registry-item.json schemas, all referenced files present, exit 0
  - `pnpm lint` → Validation entry 2026-08-18T16:17: eslint exit 0
  - `pnpm -r typecheck` → Validation entry 2026-08-18T16:17: tsc --noEmit exit 0 for tokens + registry
  - proof_gaps: none for this gate; component source authored by the judging agent (same-session) — consumer-side compile + theme application deferred to the phase 5 e2e.
- `2026-08-18T16:16:36Z` — check. verdict: `APPROVED`. check: `01M0ATJ4G1G73FEVGCDPRX19DV`. run: `01M0ASD01XHVSF5DM1QEEX2TKN`. phase: `registry-items`. judge: `same-session` (deepseek-v4-flash).
  - `pnpm --filter @therealtinhtute/registry validate` → Validation entry 2026-08-18T16:17:00Z: registry.json + 12 items validate, all referenced files present, exit 0
  - `pnpm lint` → Validation entry 2026-08-18T16:17:00Z: eslint exit 0
  - `pnpm -r typecheck` → Validation entry 2026-08-18T16:17:00Z: tsc --noEmit exit 0 for tokens + registry
- `2026-08-18T16:22:03Z` — check. verdict: `APPROVED`. check: `01M0ATW3R039W411TG9YZTD641`. run: `01M0ATRPYBBYCV3V754P8YV030`. phase: `registry-build`. judge: `same-session` (deepseek-v4-flash).
  - `pnpm --filter @therealtinhtute/registry build` → Validation entry 2026-08-18T16:35:00Z: shadcn build exit 0, 12 items + registry.json emitted under public/r/ with inlined sources
  - `pnpm --filter @therealtinhtute/registry validate:build` → Validation entry 2026-08-18T16:35:00Z: 13 built files OK against registry-item.json + registry.json schemas, exit 0
  - `pnpm -r typecheck` → Validation entry 2026-08-18T16:35:00Z: tsc --noEmit exit 0 for tokens + registry
  - `pnpm lint` → Validation entry 2026-08-18T16:35:00Z: eslint exit 0
- `2026-08-19T04:23:03Z` — check. verdict: `APPROVED`. check: `01M0C44A1SGGGEDER96XFQG2K0`. run: `01M0BY1AGKECE92SKP664XCMJ1`. phase: `e2e-smoke`. judge: `same-session` (deepseek-v4-flash).
  - `bash packages/registry/scripts/e2e-smoke.sh` → Validation entry 2026-08-19T04:22:22Z: e2e-smoke all checks passed (registry build+validate, consumer scaffold+install, shadcn add 7 items+theme, consumer build, :root/.dark CSS tokens, SSR render)
  - `pnpm lint` → Validation entry 2026-08-19T04:22:22Z: eslint exit 0
  - `pnpm -r typecheck` → Validation entry 2026-08-19T04:22:22Z: tsc --noEmit exit 0 for tokens + registry
  - proof_gaps: browser-level dark-toggle interaction (real-browser class toggle) not independently verified — dark correctness proven via built-CSS :root/.dark token blocks + SSR render output; e2e script authored and fixed (ROOT path, SHADCN array) by the judging agent (same-session).
- `2026-08-20T13:37:35Z` — check. verdict: `REQUEST_CHANGES`. check: `01M0FP8CVCATFBWXFFGA775S93`. run: `01M0C9Q2FBSZF577B87DT8BN3C`. phase: `ci-deploy`. judge: `same-session` (gpt-5.6-luna).
  - `actionlint .github/workflows/registry.yml` → 2026-08-20T13:37: workflow parses and actionlint exits 0 after replacing forbidden secrets job-if with vars.VERCEL_ENABLED
  - `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm --filter @therealtinhtute/tokens generate && pnpm --filter @therealtinhtute/registry build && pnpm --filter @therealtinhtute/registry validate:build && pnpm --filter @therealtinhtute/registry e2e` → 2026-08-20T13:37: all commands exit 0; 13 built registry files validate; fresh consumer e2e passes
  - `gh run view 32364726176` → initial push run failed before jobs with workflow-file issue; actionlint identified .github/workflows/registry.yml:37 secrets context forbidden at job scope
  - `gh workflow run registry.yml --ref main` → not run after fix: corrected workflow is not pushed yet
  - `curl <vercel-deployment-url>/r/registry.json && curl <vercel-deployment-url>/r/button.json` → not run: no Vercel project/authentication or GitHub VERCEL_* secrets/VERCEL_ENABLED variable configured
- `2026-08-20T13:57:49Z` — check. verdict: `APPROVED`. check: `01M0FQDE49X4XNEHFRK8B0DV54`. run: `01M0C9Q2FBSZF577B87DT8BN3C`. phase: `ci-deploy`. judge: `same-session` (gpt-5.6-luna).
  - `actionlint .github/workflows/registry.yml` → Final gate: actionlint exit 0; workflow jobs build/deploy/verify parse successfully.
  - `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm --filter @therealtinhtute/tokens generate && pnpm --filter @therealtinhtute/registry build && pnpm --filter @therealtinhtute/registry validate:build && pnpm --filter @therealtinhtute/registry e2e` → Final gate: all commands exit 0; 13 built files schema-valid; fresh consumer installs all MVP items, builds, and render-checks successfully.
  - `gh run view 32376843343 --repo therealtinhtute/therealtinhtute-ui --json conclusion --jq .conclusion` → GitHub Actions run 32376843343 -> success; build, deploy, and verify jobs all green.
  - `curl -sS -o /dev/null -w '%{http_code} %{content_type}' https://therealtinhtute-keb6kfaqr-therealtinhtute.vercel.app/r/registry.json` → Live proof -> 200 application/json; charset=utf-8.
  - `curl -sS -o /dev/null -w '%{http_code} %{content_type}' https://therealtinhtute-keb6kfaqr-therealtinhtute.vercel.app/r/button.json` → Live proof -> 200 application/json; charset=utf-8.
  - `git diff --check` → Final gate -> clean.

## Current State and Next Action
- active_phase: none
- lifecycle_status: done
- latest_run_id: 01M0C9Q2FBSZF577B87DT8BN3C
- latest_trace_ids: [01M0FQFXZZE3C0RMPT1Q9GYG37, 01M0FQA064K3C6QSCK79GXKWJ3, 01M0FPH9PZVHBS5219YQ2PGX8X, 01M0FPBFJXY6DZ44AFZC1K2G4Y]
- latest_check_id: 01M0FQDE49X4XNEHFRK8B0DV54
- latest_handoff_id: 01M0FRBMT3VGED28QJSXQG9TF9
- blockers:
  - none
- open_items:
  - none
- exact_next_action: run `zharness plan complete --json`
