---
id: plan-a11y-gate-20260924
intake_id: intake-a11y-gate-20260924
slug: a11y-gate
title: Showroom a11y gate in CI + stale theme artifact cleanup
status: completed
lane: normal
input_type: new-initiative
created: 2026-09-24
updated: 2026-09-24
completed_at: 2026-09-24
---

# Showroom a11y gate in CI + stale theme artifact cleanup

## Outcome

The last two initiatives fixed every axe finding in the showroom, but the
checks lived in throwaway scripts: nothing in the repository prevents the next
change from regressing them. This initiative makes the sweep a first-class
gate and removes a dead artifact:

1. `pnpm --filter app a11y` scans every showroom demo in light and dark plus
   the ⌘K palette with axe-core, and exits non-zero on any WCAG A/AA violation.
2. A GitHub Actions workflow runs that sweep on every pull request against a
   production build (`next start`).
3. The stale root `theme-default.json` — a pre-generator artifact no build
   reads — is deleted; the theme's sources of truth stay
   `packages/tokens/src` and the `theme-default` item in `registry.json`.
4. `README.md` and `docs/PROJECT.md` list the new gate command.

## Authority and Requirements

### Authoritative Sources

- `docs/plans/completed/showroom-a11y-sweep.md` and
  `docs/plans/completed/ui-audit-remediation.md`: receipts record
  `enforcement: local-only` and "no automated a11y/visual regression gate in
  CI" as an explicit proof gap.
- `PRODUCT.md`: "Strict WCAG 2.1 AA accessibility compliance".
- `packages/registry/scripts/e2e-smoke.sh`: precedent for a repo script that
  brings up its own server.
- `docs/PROJECT.md`: "What are the gate commands?" — the list agents read.

### Falsifiable Requirements

1. **R1 (script)**: `pnpm --filter app a11y` scans one page per demo in both
   themes plus the open palette (101 scans at 50 demos), prints PASS/FAIL per
   page, exits 0 when clean and non-zero otherwise; with `A11Y_BASE_URL` unset
   it starts a dev server and stops it on exit.
2. **R2 (CI)**: `.github/workflows/a11y.yml` runs on `pull_request`, builds the
   registry + app, installs chromium, serves `next start`, and runs the sweep
   against it; the job fails when the sweep fails.
3. **R3 (artifact)**: `theme-default.json` is gone from the repository root;
   `pnpm --filter @therealtinhtute/registry validate` and the built
   `public/r/theme-default.json` are unchanged.
4. **R4 (docs)**: `README.md` and `docs/PROJECT.md` list
   `pnpm --filter app a11y`.
5. **R5 (gates)**: `app typecheck`, `lint`, `prettier --check`,
   `pnpm -r build`, registry `validate` / `validate:build` / `e2e`,
   `impeccable detect` all exit 0.

## Non-goals

- No visual-regression screenshots (axe only).
- No changes to the registry payload, components, or themes.
- No change to the existing `registry.yml` workflow or the deploy path.
- No test framework beyond this script (no vitest/jest).

## Approach and Risks

### Implementation Approach

- **`app/scripts/a11y-check.mjs`**: derives the page list from `app/demos/*.tsx`
  (the showroom renders one page per demo), scans each in light and dark with
  four parallel workers, then scans the home page with the ⌘K palette open.
  Uses `A11Y_BASE_URL` when set; otherwise spawns `next dev` on `A11Y_PORT`
  (default 3100) and kills it afterwards. Guards on demo count so a layout
  change fails loudly instead of silently scanning nothing.
- **Dependencies**: `playwright` `^1.63.0` (published 2026-09-04) and
  `@axe-core/playwright` `^4.13.0` (published 2026-09-02) as app devDependencies.
- **`.github/workflows/a11y.yml`**: pull-request workflow, production build,
  `playwright install --with-deps chromium`, server started and stopped inside
  the sweep step so the job is self-contained.
- **Artifact**: `git rm theme-default.json`; nothing in the repo reads it
  (verified by grep outside `node_modules`, `.next`, `.turbo`, and the
  generated `packages/tokens/dist`).
- **Verification**: run the script locally, then the full gate set.

### Constraints & Dependencies

- The CI job adds a browser download (~115 MB) and a production build to PR
  checks; runtime is a few minutes.
- The script must not leave a dev server behind when it fails.

### Rejected Alternatives

- **Reuse `/tmp` probe scripts**: rejected — they are not in the repository and
  depend on a playwright install from another project.
- **Scan a subset in CI**: rejected — the full sweep takes ~2.5 minutes with
  four workers, and the sampled version is exactly what missed three findings
  in the first audit.
- **Keep `theme-default.json` and regenerate it**: rejected — the generated
  item already ships as `public/r/theme-default.json`; a second committed copy
  is the drift this initiative removes.

### Primary Risks & Mitigations

- **Risk**: CI flakiness from timing (hydration before axe). **Mitigation**: the
  script waits for `networkidle` plus a fixed settle delay, and the palette
  check waits for the dialog.
- **Risk**: a future nav change breaks the demo-derived page list.
  **Mitigation**: the count guard fails loudly with a clear message.
- **Recovery**: revert the workflow/script; `git checkout` restores the deleted
  file.

## Phases and Verification

### Phase 1: Sweep script + CI gate

- **Slug**: `a11y-gate`
- **story_id**: story-a11y-gate-20260924
- **Status**: checked
- **Goal**: R1, R2, R4.
- **Waves/Tasks**:
  - W1-T1: `app/scripts/a11y-check.mjs` + `a11y` npm script + devDependencies.
    Check: local run reports 101 scans / 0 failing and exits 0.
  - W1-T2: `.github/workflows/a11y.yml` + README/PROJECT gate docs. Check:
    workflow YAML parses (`yq`/manual review) and the commands match the script.
- **Proof**: local run transcript; CI job result on the PR.

### Phase 2: Artifact cleanup and closure

- **Slug**: `a11y-gate-cleanup`
- **story_id**: story-a11y-gate-cleanup-20260924
- **Status**: checked
- **Goal**: R3, R5.
- **Waves/Tasks**:
  - W2-T1: remove `theme-default.json`; run the gate set; move the plan to
    `docs/plans/completed/`; commit to the open PR branch.
- **Proof**: gate transcripts; `git status` clean.

## Progress

- 2026-09-24 | phase: a11y-gate | wave: W1 | task: phase-start | task_status: in-progress | verification: plan phase status + Current State set | surfaces: docs/plans/active/a11y-gate.md
- 2026-09-24 | phase: a11y-gate | wave: W1 | task: W1-T1 sweep script | task_status: DONE | verification: `app/scripts/a11y-check.mjs` + `a11y` npm script; devDeps `playwright@^1.63.0` (published 2026-09-04) and `@axe-core/playwright@^4.13.0` (2026-09-02); local run `pnpm --filter app a11y` → 101 scans, 0 failing, exit 0, and the spawned dev server is gone afterwards (port free) | surfaces: app/scripts/a11y-check.mjs, app/package.json, pnpm-lock.yaml
- 2026-09-24 | phase: a11y-gate | wave: W1 | task: W1-T2 CI + docs | task_status: DONE | verification: `.github/workflows/a11y.yml` parses (pull_request + workflow_dispatch, 8 steps: install, registry build, app build, playwright install --with-deps, self-contained `next start` + sweep step); README + `docs/PROJECT.md` list the gate; root `eslint.config.js` gains a Node/browser globals override for `**/scripts/**` (lint was failing on `no-undef`) | surfaces: .github/workflows/a11y.yml, README.md, docs/PROJECT.md, eslint.config.js
- 2026-09-24 | phase: a11y-gate-cleanup | wave: W2 | task: W2-T1 artifact + gates | task_status: DONE | verification: `theme-default.json` removed (no reference outside node_modules/.next/.turbo/generated dist); registry validate (53) / validate:build (54) / e2e, app typecheck, lint, prettier, `pnpm -r build`, `impeccable detect` = [] all exit 0 | surfaces: theme-default.json (deleted)

## Current State and Next Action

- Active phase: `a11y-gate-cleanup` (final)
- lifecycle_status: checked
- Anchors: `app/scripts/a11y-check.mjs` (auto server, 4 workers, palette scan),
  `.github/workflows/a11y.yml`, `README.md` + `docs/PROJECT.md` gate lists
- Blockers: none
- exact_next_action: none — plan closed, commits pushed to the open PR branch

## Decisions

- 2026-09-24 | a11y-gate | The script scans against `A11Y_BASE_URL` when set and
  otherwise starts/stops its own dev server: CI keeps the production-build path
  while contributors get a one-command gate.
- 2026-09-24 | a11y-gate | The spawned server runs `detached` and is stopped via
  its process group — killing the `pnpm` wrapper alone left a live `next dev`
  behind (caught in verification).
- 2026-09-24 | a11y-gate | `eslint.config.js` declares Node/browser globals for
  `**/scripts/**` rather than disabling `no-undef` per file, so future scripts
  inherit it.
- 2026-09-24 | a11y-gate-cleanup | `theme-default.json` is deleted rather than
  regenerated: the generated item already ships as
  `packages/registry/public/r/theme-default.json`, and the committed copy is
  exactly the drift this removes.

## Validation

- 2026-09-24 | phase: a11y-gate-cleanup | verdict: APPROVED | judge: same-session | judge_model: DeepSeek V4.1 Flash Max | proof_gaps: the CI job itself has not run yet (no PR run at commit time) — the workflow was validated by YAML parse and by running the same commands locally; visual regression is out of scope
  - `pnpm --filter app a11y` -> pass (101 scans, 0 failing, exit 0; spawned server stopped, port 3100 free)
  - `python3 -c "yaml.safe_load(open('.github/workflows/a11y.yml'))"` -> pass (name "Showroom a11y", triggers pull_request + workflow_dispatch, 1 job, 8 steps)
  - `pnpm --filter app typecheck` -> pass (exit 0)
  - `pnpm lint` -> pass (exit 0, after the scripts globals override)
  - `pnpm exec prettier --check README.md docs/PROJECT.md app/package.json app/scripts/a11y-check.mjs .github/workflows/a11y.yml docs/plans/active/a11y-gate.md eslint.config.js` -> pass (exit 0)
  - `pnpm --filter @therealtinhtute/registry validate` -> pass (53 items, exit 0)
  - `pnpm --filter @therealtinhtute/registry validate:build` -> pass (54 files, exit 0)
  - `pnpm --filter @therealtinhtute/registry e2e` -> pass (consumer install + SSR render-check, exit 0)
  - `pnpm -r build` -> pass (exit 0)
  - `node .claude/skills/impeccable/scripts/detect.mjs app/app app/components packages/registry/src --json` -> pass (`[]`)
  - receipt: context_sources=docs/plans/active/a11y-gate.md,docs/plans/completed/showroom-a11y-sweep.md,PRODUCT.md,docs/PROJECT.md,packages/registry/scripts/e2e-smoke.sh / policy=docs/playbooks/check.md / judge=same-session / judge_model=DeepSeek V4.1 Flash Max / retries=2 (lint globals for scripts; server process group on exit) / rollback_point=git checkout (branch `feat/showroom-component-search`) / failure_ledger: absent / enforcement: ci (pull_request workflow) + local-only for the manual run / not_independently_verified=the CI job's own result, visual regression
