---
id: 01M0T5PW90KMGTCEH70Z0G9G7R
type: plan
intake_id: 01M0T5P3KBE0MSMHBH9DE61JPA
lane: normal
status: active
created: 2026-08-24
updated: 2026-08-24
---

# Plan: Kumo component port — Cloudflare Kumo (MIT) re-themed onto @therealtinhtute/ui

## Outcome
- result: The public `@therealtinhtute/ui` registry ships Kumo-sourced components (`kumo-badge`, `kumo-button`, `kumo-input` plus transitive `kumo-loader`, `kumo-tooltip`, `kumo-field`) that render with the consumer's own shadcn palette via a generated kumo-compat token bridge, distributed through the existing CI/CD pipeline.
- success_signals:
  - A fresh Tailwind v4 + React 19 consumer runs `shadcn add <registry-url>/r/kumo-badge.json` (and button/input equivalents) successfully.
  - Rendered components take their emphasis colors from the consumer's `--primary` / `--destructive` (verified with a non-neutral test primary) in both light and dark mode.
  - Built `/r/kumo-*.json` items validate against `ui.shadcn.com/schema/registry-item.json`; e2e smoke fetches each with HTTP 200 + JSON content-type from the live host.
  - Every ported file carries attribution "Adapted from cloudflare/kumo (MIT)" plus the pinned upstream commit hash.

## Authority and Requirements
- authority:
  - Owner-approved design, 2026-08-24: `.kit/plans/2026-08-24-kumo-port/plan.md` (approach chosen via AskUserQuestion: port-source-into-registry, core-3 first).
  - cloudflare/kumo source, MIT license (https://github.com/cloudflare/kumo); upstream commit hash recorded in Progress before first port.
  - Existing initiative contract: docs/plans/completed/therealtinhtute-ui.md (R1–R9 pipeline, Tailwind v4 + React 19 constraints).
- requirements:
  - R1 [accepted]: Token bridge maps kumo semantic tokens onto the existing palette — `kumo-brand→--primary`, `kumo-danger→--destructive`, `kumo-base→--background`, `kumo-tint→--muted`, `kumo-line`/`kumo-hairline→--border`, `kumo-default`/`kumo-strong→--foreground`, `kumo-subtle→--muted-foreground`; status hues without a shadcn equivalent (success/warning/info, badge red/green/orange/purple/teal/blue) keep Kumo's own values. Emitted as `--color-kumo-*` entries by `packages/tokens` (`src/generator/`) onto both the CSS output and the `theme-default` registry item. | source: approved design
  - R2 [accepted]: Ported files keep Kumo's internal class vocabulary (`bg-kumo-*`, runtime vars like `--kumo-button-emphasis-bg`); classes are NOT rewritten to shadcn utilities. | source: approved design (rejected alternative)
  - R3 [accepted]: Registry items are named `kumo-*`, sources live under `packages/registry/src/components/kumo/`, Kumo export names are preserved; each ported file carries MIT attribution + pinned commit. | source: approved design
  - R4 [accepted]: Wave-1 scope is badge, button (+loader, tooltip), input (+field). New dependencies `@phosphor-icons/react` and `@base-ui/react` are declared in registry item `dependencies` and installed as workspace devDeps. | source: approved design
  - R5 [accepted]: Every phase passes the full local gate — `pnpm --filter @therealtinhtute/tokens generate typecheck validate` + `pnpm --filter @therealtinhtute/registry build typecheck validate validate:build e2e` — then deploys through the existing workflow on merge to main; e2e smoke extended to cover each new `/r/kumo-*.json`. | source: existing R5/R9 contract
  - R6 [accepted]: Consumers must run Tailwind v4 + React 19 (Kumo uses `h-6.5`-style spacing, `light-dark()`, `@theme inline`); stated in item descriptions rather than supported. | source: approved design risk

## Non-goals
- NG1: Porting the remaining ~37 Kumo components (autocomplete, chart, dialog, …) — later slices.
- NG2: Figma plugin / Figma token sync.
- NG3: Re-exporting Base UI primitives as a public surface.
- NG4: Tailwind v3 or React 18 support.
- NG5: Renaming Kumo exports or building a compatibility alias layer to the existing shadcn `ui/*` components.
- NG6: npm package publishing; distribution stays registry-URL single channel.

## Approach and Risks
- approach: Token bridge instead of class rewrite. Extend `packages/tokens/src/generator/` (`shared.ts` mapping table, `css.ts` light/dark emission, `registry.ts` theme-default cssVars, `types.ts`) so every theme gains `--color-kumo-*` variables routed per R1; then copy Kumo component sources verbatim into `src/components/kumo/` with import paths adjusted to the copied utils, register them as `kumo-*` items in `packages/registry/registry.json`, and ship through the proven build+deploy pipeline. Chosen because it keeps per-component porting mechanical (verbatim copy + import fix), preserves upstream sync fidelity, and concentrates all rebranding in one generated file layer.
- constraints:
  - Registry item schema conformance — no invented fields; deps only via `dependencies`/`registryDependencies`.
  - Tailwind v4 (`@theme inline`), React 19, TypeScript, pnpm, oklch.
  - Kumo dark mode relies on `light-dark()` driven by `color-scheme`; bridge values must be emitted per-mode consistent with the existing `.dark`/light-dual output of the generator.
  - Upstream pinned at one commit for the whole initiative; recorded before wave 1 of phase `kumo-token-bridge-badge`.
- risks:
  - Consumer Tailwind must be v4 or `bg-kumo-*`/spacing utilities do not exist → mitigation R6: requirement stated in item descriptions; e2e scratch app pins v4.
  - Dark-mode mismatch (color-scheme vs `.dark`) could render wrong emphasis in dark → check includes explicit dark screenshot acceptance with non-neutral primary.
  - Mapping approximations (`kumo-base←background`, `kumo-tint←muted`) may look off against Kumo's reference screenshots → acceptance compares against https://kumo-ui.com visuals; adjust mapping in generator (single-file fix) if off.
  - Recovery: bridge is additive cssVars + an isolated `components/kumo/` folder — revert = drop the added cssVars entries, delete the folder, remove registry.json entries; no data or external state touched beyond a redeploy.
- rejected_alternatives:
  - Rewrite all classes to shadcn tokens — high churn, loses sync fidelity, still requires hand-porting runtime `color-mix` gradient vars; declined (owner decision).
  - Consume `@cloudflare/kumo` as an npm dependency with var overrides — components stay out of the registry, override API undocumented; declined (owner decision).
  - Restyle existing shadcn components to look like Kumo — not a source clone; declined (owner decision).

## Phases and Verification
<!-- Phase and task definitions are immutable after to-plan. Do not add task status fields. Append-only Progress is the sole task execution-status source. Only each phase lifecycle status changes to mirror DB transitions: to-plan=planned; work after run create=in-progress; clean durable check=checked; closing handoff=done. Each planned phase records phase_slug, story_id, status, goal, depends_on, waves, tasks, and checks. -->
- planning_status: planned

- phase_slug: kumo-token-bridge-badge
  story_id: 01M0T5PW9JX77P0RT56RE28AKY
  status: planned
  goal: Emit kumo-compat CSS variables through the tokens generator onto theme-default and port Kumo Badge as registry item kumo-badge.
  depends_on: none
  surfaces:
    touched: packages/tokens/src/generator/*, packages/tokens/src/themes/default/theme.json (only if a kumoCompat config block lives there), packages/tokens/dist/* (generated), packages/registry/src/components/kumo/{resolve-variant.ts,badge.tsx}, packages/registry/registry.json, packages/registry/scripts/e2e-smoke.sh
    avoided: existing src/components/ui/*, CI workflow files, tokens schema files unless validation needs a new field
  waves:
    - wave: 1
      tasks:
        - T1: Record pinned upstream commit hash in Progress (git rev-parse of cloned/tagged cloudflare/kumo HEAD used for all copies).
          expected_output: Progress entry with full 40-char commit hash.
        - T2: Add kumoCompat token map (R1 table) to generator types + shared map; emit `--color-kumo-*` in css.ts (light+dark) and registry.ts (theme-default cssVars).
          expected_output: `dist/themes/default.css` contains the new vars in both modes; `dist/registry/theme-default.json` carries matching cssVars entries.
          check: pnpm --filter @therealtinhtute/tokens generate && git diff --stat dist/ && pnpm --filter @therealtinhtute/tokens validate && pnpm --filter @therealtinhtute/tokens typecheck
        - T3: Copy `resolve-variant` util + `badge.tsx` from pinned upstream; adjust imports to local utils; keep export names; add attribution header.
          expected_output: src/components/kumo/badge.tsx compiles standalone; `kumo-badge` entry appended to registry.json with correct dependencies.
      stop_conditions: generator output no longer validates against tokens schemas; badge source diverges structurally from pinned commit (unexpected imports) → halt, record trace, escalate to owner.
    - wave: 2
      tasks:
        - T4: Full local gate + extend e2e smoke with `/r/kumo-badge.json` assertion.
          expected_output: all commands exit 0; built public/r/kumo-badge.json exists and validates.
          check: pnpm --filter @therealtinhtute/registry build && pnpm --filter @therealtinhtute/registry typecheck && pnpm --filter @therealtinhtute/registry validate && pnpm --filter @therealtinhtute/registry validate:build && pnpm --filter @therealtinhtute/registry e2e
  escalation_route: blocker trace → owner decision via AskUserQuestion.

- phase_slug: kumo-button
  story_id: 01M0T5PWBPE1RJX56KFRZDM82K
  status: planned
  goal: Port Kumo Button plus transitive Loader and Tooltip as kumo-button, kumo-loader, kumo-tooltip registry items with @phosphor-icons/react dependency.
  depends_on: kumo-token-bridge-badge
  surfaces:
    touched: packages/registry/src/components/kumo/{loader.tsx,tooltip.tsx,button.tsx,link-provider.ts}, packages/registry/registry.json, packages/registry/package.json (@phosphor-icons/react devDep), scripts/e2e-smoke.sh
    avoided: packages/tokens/* (bridge frozen after phase 1 unless a visual defect forces a mapped-value fix), existing ui/*
  waves:
    - wave: 1
      tasks:
        - T1: Add `@phosphor-icons/react` to registry devDependencies.
          expected_output: pnpm install resolves; lockfile updated.
          check: pnpm install --frozen-lockfile=false && pnpm --filter @therealtinhtute/registry typecheck
        - T2: Port loader.tsx, tooltip.tsx (+ link-provider util), then button.tsx in dependency order; three registry.json entries (`kumo-loader`, `kumo-tooltip`, `kumo-button`) wired with dependencies + registryDependencies.
          expected_output: three compiled sources; button imports resolve within kumo folder + phosphor.
      stop_conditions: tooltip/loader pull Base UI primitives not anticipated in scope → record trace, decide expand-or-defer with owner before continuing.
    - wave: 2
      tasks:
        - T3: Full local gate + e2e assertions for the three new items.
          check: pnpm --filter @therealtinhtute/registry build && pnpm --filter @therealtinhtute/registry typecheck && pnpm --filter @therealtinhtute/registry validate && pnpm --filter @therealtinhtute/registry validate:build && pnpm --filter @therealtinhtute/registry e2e
  escalation_route: blocker trace → owner decision via AskUserQuestion.

- phase_slug: kumo-input
  story_id: 01M0T5PWCBVGTJX9E80PX141P1
  status: planned
  goal: Port Kumo Input plus Field as kumo-input and kumo-field registry items with @base-ui/react dependency.
  depends_on: kumo-token-bridge-badge
  surfaces:
    touched: packages/registry/src/components/kumo/{field.tsx,input.tsx}, packages/registry/registry.json, packages/registry/package.json (@base-ui/react devDep), scripts/e2e-smoke.sh
    avoided: packages/tokens/*, existing ui/input.tsx
  waves:
    - wave: 1
      tasks:
        - T1: Add `@base-ui/react` to registry devDependencies.
          expected_output: pnpm install resolves; lockfile updated.
          check: pnpm install --frozen-lockfile=false && pnpm --filter @therealtinhtute/registry typecheck
        - T2: Port field.tsx then input.tsx; two registry.json entries (`kumo-field`, `kumo-input`) wired with dependencies + registryDependencies.
          expected_output: compiled sources; input imports Base UI input primitive + local field.
      stop_conditions: Base UI package name/version mismatch vs upstream imports (`@base-ui/react` vs `@base_ui/*`) → verify against pinned upstream package.json, record trace if irreconcilable.
    - wave: 2
      tasks:
        - T3: Full local gate + e2e assertions for both new items.
          check: pnpm --filter @therealtinhtute/registry build && pnpm --filter @therealtinhtute/registry typecheck && pnpm --filter @therealtinhtute/registry validate && pnpm --filter @therealtinhtute/registry validate:build && pnpm --filter @therealtinhtute/registry e2e
        - T4: Fresh-consumer manual acceptance once for the whole initiative — scratch Vite + Tailwind v4 app, non-neutral `--primary` (e.g. oklch(0.55 0.2 260)), install all six kumo items, render light+dark, screenshot comparison against kumo-ui.com references.
          expected_output: screenshots saved under .kit/reports/kumo-port/; emphasis color visibly follows test primary in both modes.
          check: npx shadcn@latest add <live-host>/r/kumo-badge.json kumo-button.json kumo-input.json (plus loader/tooltip/field) exits 0 in scratch app; visual inspection logged in Validation.
  escalation_route: blocker trace → owner decision via AskUserQuestion.

## Progress
<!-- Append-only durable entries record timestamp, phase, wave, task, task_status, run_id, trace_id, exact verification/result, and changed surfaces or blocker. -->
- none

## Decisions
<!-- Append-only durable entries record timestamp, phase/task, decision, and rationale. -->
- none

## Validation
<!-- Append-only durable entries record timestamp, phase, exact command/result/output, run_id, check_id, verdict, and proof_gaps. -->
- none

## Current State and Next Action
- active_phase: none
- lifecycle_status: planned
- latest_run_id: none
- latest_trace_ids: []
- latest_check_id: none
- latest_handoff_id: none
- blockers: none
- open_items: [execute phase kumo-token-bridge-badge]
- exact_next_action: work full on phase kumo-token-bridge-badge (start by pinning the upstream cloudflare/kumo commit)
