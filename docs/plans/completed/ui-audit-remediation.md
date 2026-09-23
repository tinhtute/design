---
id: plan-ui-audit-remediation-20260923
intake_id: intake-ui-audit-remediation-20260923
slug: ui-audit-remediation
title: UI/UX Audit Remediation — Contrast, Motion, Keyboard Access, Docs, Showroom
status: completed
lane: normal
input_type: new-initiative
created: 2026-09-23
updated: 2026-09-23
completed_at: 2026-09-23
---

# UI/UX Audit Remediation — Contrast, Motion, Keyboard Access, Docs, Showroom

## Outcome

The 2026-09-23 read-only UI/UX audit findings are resolved at their sources of truth:

1. **Contrast (WCAG 2.1 AA)**: light syntax tokens and the `--text-color-kumo-placeholder`
   token (light + dark) reach ≥ 4.5:1 on their real surfaces; axe reports zero
   `color-contrast` violations on the showroom pages that previously failed.
2. **Motion**: the toast/clipboard bump animations use decelerated easing
   (`ease-out-quart`) instead of the upstream bounce curve that contradicts
   `DESIGN.md`; `prefers-reduced-motion` covers both bump classes.
3. **Keyboard access**: the props-table scroll container is focusable with an
   accessible name (axe `scrollable-region-focusable` = 0).
4. **Docs**: `/docs` no longer renders the raw `{:bash}` marker.
5. **Showroom UX**: the install command is readable on narrow viewports instead
   of silently truncating.
6. **Design context**: `DESIGN.md` matches the shipped tokens (fonts, focus ring,
   surfaces) so the Impeccable workflow reads true context.
7. **Detector**: `impeccable detect` returns 0 anti-patterns across `app/` and
   `packages/registry/src/` (the remaining `side-tab` hit is waived inline with
   a documented reason).

## Authority and Requirements

### Authoritative Sources

- Owner request (2026-09-23): "ok đó, dứt hết đi" — execute the audit remediation list.
- `PRODUCT.md`: "Strict WCAG 2.1 AA accessibility compliance"; `DESIGN.md`:
  "strict ban on bounce/elastic animations", "Decelerated / exponential easing
  (`ease-out-quart`)".
- `docs/plans/completed/ui-design-system-audit.md` R1/R2/R5: 0 detector
  anti-patterns, ≥ 4.5:1 text contrast, decelerated motion.
- Theme authority: `packages/tokens/src` (run
  `pnpm --filter @therealtinhtute/tokens generate`); `app/app/theme.css` and the
  `theme-default` item in `registry.json` are manual sync targets
  (`docs/plans/completed/shadcn-lint-baseline.md`).
- Component authority: `packages/registry/src/components/**` is canonical;
  `app/components/**` is a byte-identical mirror (same source).
- Audit evidence (2026-09-23, read-only): axe-core 4.12.1 on the running
  showroom — light `#a1a1a1` on `#ffffff` = 2.58:1 (select placeholder),
  dark `#737373` on `#18181b` = 3.73:1 (select placeholder), light syntax
  `#bd6500` on `#faf8f5` = 3.94:1 and `#058378` = 4.37:1; `impeccable detect`
  — `docs.css:95` side-tab, `theme.css:348,352` bounce easing.

### Falsifiable Requirements

1. **R1 (syntax contrast)**: `monoLightTheme` tokens `constant.numeric` and
   `constant.language` (and `constant.character.escape`) compute ≥ 4.5:1 on
   `#faf8f5`; axe reports 0 `color-contrast` violations on `#dialog`,
   `#command-palette`, `#chart`, `#select`, `#empty`, `#data-table` (light).
2. **R2 (placeholder contrast)**: `--text-color-kumo-placeholder` computes
   ≥ 4.5:1 on `#ffffff` (light control) and on `#18181b` (dark control); axe
   reports 0 `color-contrast` violations on `#select` in both modes after
   hydration settles.
3. **R3 (motion policy)**: `impeccable detect` reports 0 `bounce-easing`
   findings; the emitted theme CSS (generated + `app/app/theme.css` + the
   `theme-default` item `css`) animates both bump classes with
   `cubic-bezier(0.25, 1, 0.5, 1)` and disables both under
   `prefers-reduced-motion: reduce`.
4. **R4 (keyboard scroll)**: axe `scrollable-region-focusable` = 0 on `/`
   (390px viewport) and on `#toasty`; the props-table container exposes
   `tabindex="0"`, `role="region"`, and an accessible name in the SSR HTML.
5. **R5 (docs)**: the rendered `/docs` HTML contains no literal `{:bash}` or
   `{:tsx}` marker text outside code fences, and the inline-code examples still
   demonstrate the marker syntax.
6. **R6 (mobile install command)**: at a 390px viewport the install command is
   not truncated — its text is fully reachable (scrollable) rather than
   ellipsized; desktop keeps the single-line treatment.
7. **R7 (design context)**: `DESIGN.md` typography, focus-ring, surface, and
   radius values equal the values in `app/app/theme.css` /
   `packages/tokens/src/themes/default/theme.json`.
8. **R8 (gates)**: `tokens generate`, `registry validate`, `registry
   validate:build`, `registry e2e`, `app typecheck`, `lint`, `prettier --check`,
   `pnpm -r build` all exit 0; `impeccable detect` reports 0 anti-patterns.

## Non-goals

- No showroom command-palette/search feature (interaction model is an owner
  decision; recorded as follow-up).
- No new runtime or dev dependencies, no CI workflow changes, no a11y test
  harness in this initiative.
- No component API, prop, or visual redesign beyond the token/easing values
  above; no new variants.
- No rewrite of the docs pipeline (`app/lib/markdown.ts`) — the docs defect is
  content-level.
- No touch of the stale root `theme-default.json` (unreferenced by builds;
  reported only).
- No change to Kumo component structure/parity beyond the documented motion and
  placeholder deviations.

## Approach and Risks

### Implementation Approach

- **Tokens first, mirrors second**: edit `packages/tokens/src/generator/shared.ts`
  (placeholder pair, KUMO_UTILITY_CSS easing + reduced-motion), run
  `pnpm --filter @therealtinhtute/tokens generate`, then apply the same value
  changes surgically to `app/app/theme.css` (manual copy, prettier-formatted)
  and to the `theme-default` item in `registry.json` (`cssVars.light/dark`,
  `css`).
- **Syntax palette**: edit the canonical
  `packages/registry/src/components/ui/code-themes.ts`
  (`#bd6500` → `#aa5b00` = 4.71:1, `#058378` → `#05766c` = 5.19:1, and 4.90:1
  on the danger tint) and mirror byte-identically to
  `app/components/ui/code-themes.ts`.
- **Keyboard access**: `app/components/props-table.tsx` (app-only) gains
  `tabIndex={0}`, `role="region"`, and `aria-label={`${displayName} props`}` on
  the existing `overflow-x-auto` wrapper — the standard scroll-region fix.
- **Docs**: rewrite the two broken inline examples in
  `app/content/docs/getting-started.md` as a small fenced block that shows the
  marker syntax literally; `{:bash}` inside a fence is never consumed by the
  tailing-curly-colon inline transformer.
- **Mobile install strip**: `clipboard-text.tsx` keeps `truncate` on ≥ md and
  scrolls horizontally below it (`max-md:overflow-x-auto`), mirrored to the app.
- **Verification**: axe-core (Chromium via the local Playwright install),
  `impeccable detect`, SSR `curl` probes, and the repository gate commands.

### Constraints & Dependencies

- The generated theme CSS is not committed; the manual copies
  (`app/app/theme.css`, `registry.json` theme item) must be updated in the same
  change or consumers drift from the showroom.
- `registry.json` `css` must stay an object map (shadcn schema), not a string.
- `app/components/ui/**` must stay byte-identical to
  `packages/registry/src/components/ui/**` (registry parity).

### Rejected Alternatives

- **Keep upstream bounce for Kumo parity**: rejected — `DESIGN.md` and the
  completed audit R1/R5 already ruled decelerated easing, and the detector
  flags the curve; parity does not override a locked design policy.
- **Fix only the dark placeholder**: rejected — the light placeholder fails
  worse (2.58:1) once hydration settles; `PRODUCT.md` commits to strict AA.
- **Waive placeholder contrast via detector ignore**: rejected — the violation
  is real text contrast, not a false positive.
- **Re-copy the whole generated `theme.css`**: rejected — would import
  formatting churn and unrelated drift; the surgical value edits keep the copy
  honest.
- **Add a scrollable-region wrapper component**: rejected — a single app-only
  table wrapper does not justify an abstraction.

### Primary Risks & Mitigations

- **Risk**: the light placeholder change is visually noticeable
  (`#a1a1a1` → `#747474`). **Mitigation**: it is the minimum that satisfies
  4.5:1; flagged in the report for an owner veto with a one-line revert path.
- **Risk**: the `theme-default` item drift (root `theme-default.json` is already
  stale) misleads the sync. **Mitigation**: sync only `registry.json`'s item —
  the file the build publishes; report the root file as pre-existing drift.
- **Risk**: axe misses the violation without a hydration wait (as the first
  audit pass did). **Mitigation**: every axe run waits for hydration before
  analysis; R2 re-runs both modes.
- **Recovery**: every change is token/value-level; `git checkout` on the
  branch restores the previous state; no external state is touched.

## Phases and Verification

### Phase 1: Contrast remediation

- **Slug**: `contrast-remediation`
- **story_id**: story-contrast-remediation-20260923
- **Status**: checked
- **Goal**: R1, R2. Light syntax tokens AA-compliant; placeholder token AA in
  both modes; generated CSS + manual copies synced.
- **Waves/Tasks**:
  - W1-T1: `code-themes.ts` (registry) numeric/escape → `#aa5b00`, constant →
    `#05766c`; mirror to `app/components/ui/code-themes.ts`. Check: byte-identical
    `cmp`; computed ratios ≥ 4.5.
  - W1-T2: `generator/shared.ts` placeholder `{light: oklch(56% 0 0), dark:
oklch(65% 0 0)}`; `tokens generate`; apply to `app/app/theme.css` and the
    `theme-default` item `cssVars` in `registry.json`. Check: generated CSS
    carries the new values; `validate` exits 0.
- **Proof**: axe `color-contrast` = 0 on the six light pages + `#select`
  light/dark; computed contrast table printed.

### Phase 2: Motion policy + keyboard access

- **Slug**: `motion-keyboard`
- **story_id**: story-motion-keyboard-20260923
- **Status**: checked
- **Goal**: R3, R4. Decelerated bump easing, reduced-motion parity, focusable
  props-table scroll region.
- **Waves/Tasks**:
  - W2-T1: `KUMO_UTILITY_CSS` easing → `cubic-bezier(0.25, 1, 0.5, 1)` for both
    bump classes; add `.animate-toast-bump` to the reduced-motion block;
    regenerate; sync `app/app/theme.css` + `registry.json` theme item `css`.
    Check: `impeccable detect` 0 findings; emitted CSS inspected.
  - W2-T2: props-table wrapper gains `tabIndex`/`role`/`aria-label`. Check:
    axe `scrollable-region-focusable` = 0 on `/` @390px and `#toasty`.
- **Proof**: detect output; axe runs; SSR HTML probe for `tabindex="0"`.

### Phase 3: Docs, showroom UX, design context

- **Slug**: `docs-and-context`
- **story_id**: story-docs-and-context-20260923
- **Status**: checked
- **Goal**: R5, R6, R7. Marker leak gone, install command readable on mobile,
  DESIGN.md matches shipped values; the `side-tab` detector hit is waived with
  a documented reason.
- **Waves/Tasks**:
  - W3-T1: `getting-started.md` inline examples → fenced block. Check: rendered
    `/docs` contains no bare `{:bash}`; the block renders.
  - W3-T2: `clipboard-text.tsx` mobile scroll treatment; mirror to app. Check:
    390px DOM probe `scrollWidth > clientWidth` reachable without truncation.
  - W3-T3: `DESIGN.md` typography/focus/surfaces/radius values corrected;
    `docs.css` blockquote gets an inline detector waiver. Check: values equal
    `theme.css`; detect 0.
- **Proof**: `curl /docs` probe; DOM probe; detect output; DESIGN.md diff.

### Phase 4: Gates and closure

- **Slug**: `gates-closure`
- **story_id**: story-gates-closure-20260923
- **Status**: checked
- **Goal**: R8. Full gate run, plan closure, commit on a feature branch.
- **Waves/Tasks**:
  - W4-T1: run `tokens generate`, registry `validate` / `validate:build` /
    `e2e`, `app typecheck`, `lint`, `prettier --check`, `pnpm -r build`.
    Check: all exit 0.
  - W4-T2: move this plan to `docs/plans/completed/`, commit on
    `fix/ui-audit-remediation` (PR path per `AGENTS.md`). Check: `git status`
    clean; branch carries the commits.
- **Proof**: gate transcripts; commit list.

## Progress

- 2026-09-23 | phase: contrast-remediation | wave: W1 | task: phase-start | task_status: in-progress | verification: plan phase status + Current State set | surfaces: docs/plans/active/ui-audit-remediation.md
- 2026-09-23 | phase: contrast-remediation | wave: W1 | task: W1-T1 syntax tokens | task_status: DONE | verification: registry `code-themes.ts` `constant.numeric`/`escape` `#bd6500`→`#a45800`, `constant.*` `#058378`→`#05766c`, mirrored to app (`cmp` exit 0); computed ratios — `#a45800` 4.98 on `#faf8f5` / 4.71 on `#fcefed`, `#05766c` 5.19 / 4.90; axe `color-contrast` = 0 on `#dialog`,`#command-palette`,`#chart`,`#select`,`#data-table`,`/` (light) | surfaces: packages/registry/src/components/ui/code-themes.ts, app/components/ui/code-themes.ts
- 2026-09-23 | phase: contrast-remediation | wave: W1 | task: W1-T2 placeholder token | task_status: DONE | verification: `tokens generate` → `dist/themes/default.css` + registry theme item carry `oklch(56% 0 0)` light / `oklch(65% 0 0)` dark; synced `app/app/theme.css` + `registry.json` theme item; served CSS resolves `#747474` (light, 4.65:1 on `#ffffff`) and `#8f8f8f` (dark, 5.48:1 on `#18181b`); axe `#select` = 0 in both modes after hydration wait; `registry validate` exit 0 | surfaces: packages/tokens/src/generator/shared.ts, app/app/theme.css, packages/registry/registry.json
- 2026-09-23 | phase: contrast-remediation | wave: W1 | task: summary | task_status: DONE | verification: R1/R2 met except a NEW finding — `empty.tsx` command line renders `text-kumo-brand` `#f6821f` on `#f7f7f7` = 2.41:1 (Kumo-parity brand orange as text). Deferred: brand-color policy is an owner decision, outside this plan's non-goals | surfaces: packages/registry/src/components/ui/empty.tsx
- 2026-09-23 | phase: motion-keyboard | wave: W2 | task: W2-T1 bump easing + reduced motion | task_status: DONE | verification: `KUMO_UTILITY_CSS` both bump classes → `cubic-bezier(0.25, 1, 0.5, 1)`, `.animate-toast-bump` added to the reduced-motion guard, deviation note added; regenerated + synced to `app/app/theme.css` and the registry theme item; served CSS shows `cubic-bezier(.25, 1, .5, 1)` and both classes disabled under reduced motion; `impeccable detect` = 0 findings (was 3) | surfaces: packages/tokens/src/generator/shared.ts, app/app/theme.css, packages/registry/registry.json
- 2026-09-23 | phase: motion-keyboard | wave: W2 | task: W2-T2 props-table scroll region | task_status: DONE | verification: wrapper gains `role="region"`, `aria-label="{Component} props table"`, `tabIndex={0}`; axe `scrollable-region-focusable` = 0 on `/` @390px and `#toasty` (was 3 + 2 nodes) | surfaces: app/components/props-table.tsx
- 2026-09-23 | phase: docs-and-context | wave: W3 | task: W3-T1 docs marker | task_status: DONE | verification: `getting-started.md` inline examples moved into an `md` fence; rendered `/docs` — `{:bash}`/`{:tsx}` present only inside `<pre>`, none in prose | surfaces: app/content/docs/getting-started.md
- 2026-09-23 | phase: docs-and-context | wave: W3 | task: W3-T2 mobile install command | task_status: DONE | verification: `clipboard-text.tsx` span `max-md:overflow-x-auto` + `tabIndex={0}`, mirrored (`cmp` exit 0); 390px probe — scrollWidth 368 > clientWidth 269, overflow-x auto, tabIndex 0; 1440px unchanged (711 = 711, overflow hidden) | surfaces: packages/registry/src/components/ui/clipboard-text.tsx, app/components/ui/clipboard-text.tsx
- 2026-09-23 | phase: docs-and-context | wave: W3 | task: W3-T3 design context + detector waiver | task_status: DONE | verification: `DESIGN.md` fonts (Archivo/Google Sans Code/Xanh Mono), focus ring, surfaces, border, placeholder and easing now equal `theme.css`; `docs.css` blockquote carries `impeccable-disable-line side-tab: markdown blockquote convention`; `impeccable detect --json` = `[]` | surfaces: DESIGN.md, app/app/docs/docs.css

## Decisions

- 2026-09-23 | contrast-remediation | Final amber token is `#a45800`, not the
  `#aa5b00` named in the phase text: `#aa5b00` measures 4.45:1 on the danger
  annotation tint (`#fcefed`), below AA. `#a45800` passes on both code surfaces
  (4.98:1 on `#faf8f5`, 4.71:1 on `#fcefed`).
- 2026-09-23 | contrast-remediation | The light placeholder was fixed together
  with the dark one: once hydration settles, axe reports 2.58:1 for the light
  select placeholder, worse than the dark failure. Both are the same token.
- 2026-09-23 | contrast-remediation | `empty.tsx` command-line text keeps Kumo
  brand orange (`#f6821f`, 2.41:1 on `#f7f7f7`). Changing it would break the
  documented Kumo-parity text-brand bridge, so it is deferred to an owner
  ruling rather than decided here.
- 2026-09-23 | motion-keyboard | The bump easing deviates from the vendored
  Kumo utility layer on purpose; the deviation is documented at the
  `KUMO_UTILITY_CSS` declaration so an upstream re-vendor does not silently
  restore the bounce curve.

## Current State and Next Action

- Active phase: `gates-closure` (final)
- lifecycle_status: checked
- Anchors: `packages/tokens/src/generator/shared.ts` (placeholder, easing,
  reduced-motion), `packages/registry/src/components/ui/code-themes.ts` (syntax
  palette), `app/app/theme.css` + `registry.json` theme item (synced),
  `app/components/props-table.tsx`, `app/content/docs/getting-started.md`,
  `DESIGN.md`
- Blockers: none
- Open finding (owner decision): `empty.tsx` command line uses Kumo brand orange
  `#f6821f` as text on `#f7f7f7` = 2.41:1 — needs a brand-color ruling
- exact_next_action: none — gates green, plan moved to `docs/plans/completed/`,
  commits on `fix/ui-audit-remediation`

## Validation

- 2026-09-23 | phase: gates-closure | verdict: APPROVED | judge: same-session | judge_model: DeepSeek V4.1 Flash Max | proof_gaps: no unit-test infrastructure in the repo (axe-core + DOM/SSR probes used as functional evidence); registry e2e depends on network; the `empty.tsx` brand-orange contrast finding is deferred to an owner ruling, not fixed
  - `pnpm --filter @therealtinhtute/tokens generate` -> pass (regenerated `dist/themes/default.css` + `dist/registry/theme-default.json`, exit 0)
  - `pnpm --filter @therealtinhtute/registry validate` -> pass (53 items, validate-deps closure, exit 0)
  - `pnpm --filter @therealtinhtute/registry validate:build` -> pass (54 built files against schema, exit 0)
  - `pnpm --filter @therealtinhtute/registry e2e` -> pass (fresh consumer install of all 53 items + vite build + theme-token asserts + SSR render-check, exit 0)
  - `pnpm --filter app typecheck` -> pass (next typegen + tsc --noEmit, exit 0)
  - `pnpm lint` -> pass (eslint, exit 0)
  - `pnpm exec prettier --check DESIGN.md app/app/theme.css app/app/docs/docs.css app/components/props-table.tsx app/components/ui/clipboard-text.tsx app/components/ui/code-themes.ts app/content/docs/getting-started.md packages/registry/registry.json packages/registry/src/components/ui/clipboard-text.tsx packages/registry/src/components/ui/code-themes.ts packages/tokens/src/generator/shared.ts` -> pass (exit 0)
  - `pnpm -r build` -> pass (routes `/`, `/_not-found`, `/docs` prerendered, exit 0)
  - `node .claude/skills/impeccable/scripts/detect.mjs app/app app/components packages/registry/src --json` -> pass (`[]`, 0 anti-patterns; was 3)
  - `node /tmp/verify.mjs contrast` -> pass except the deferred finding: axe-core 4.12.1, 0 `color-contrast` violations on `#dialog`, `#command-palette`, `#chart`, `#select`, `#data-table`, `/` (light), `/` (dark), `#select` (dark); `#empty` (light) reports `#f6821f` on `#f7f7f7` = 2.41:1 (deferred)
  - `node /tmp/verify.mjs full` -> pass (0 violations at 390px, dark `/`, `/docs`)
  - `node /tmp/verify.mjs scroll` -> pass (axe `scrollable-region-focusable` = 0 at 390px and on `#toasty`; was 3 + 2 nodes)
  - `node /tmp/probe5.mjs` / `node /tmp/probe4.mjs` -> pass (resolved `--text-color-kumo-placeholder`: light `lab(48.96%)`, dark `lab(59.4%)`; select placeholder span consumes the token)
  - `node /tmp/probe-mobile.mjs` -> pass (390px: scrollWidth 368 > clientWidth 269, overflow-x auto, tabIndex 0, mask-image applied; 1440px: 711 = 711, overflow hidden)
  - `curl -s http://localhost:3100/docs` + prose/fence probe -> pass (`{:bash}`/`{:tsx}` only inside `<pre>`, none in prose)
  - `cmp packages/registry/src/components/ui/code-themes.ts app/components/ui/code-themes.ts` + `cmp .../clipboard-text.tsx ...` -> pass (exit 0, registry parity held)
  - `node -e "require('./packages/registry/public/r/theme-default.json')"` probe -> pass (built item carries `cubic-bezier(0.25, 1, 0.5, 1)`, both reduced-motion guards, `oklch(56% 0 0)` / `oklch(65% 0 0)`)
  - receipt: context_sources=docs/plans/active/ui-audit-remediation.md,PRODUCT.md,DESIGN.md,packages/tokens/src/generator/shared.ts,packages/registry/src/components/ui/code-themes.ts,app/components/props-table.tsx,app/content/docs/getting-started.md / policy=docs/playbooks/check.md / judge=same-session / judge_model=DeepSeek V4.1 Flash Max / retries=2 (dev-server CSS compile lag on the dark token; `#aa5b00` amber rejected at 4.45:1 on the danger tint and retuned to `#a45800`) / rollback_point=git checkout (branch `fix/ui-audit-remediation`) / failure_ledger: absent / enforcement: local-only / not_independently_verified=visual pixel review of the placeholder/mask changes, registry e2e network-dependent, no automated a11y/visual regression gate in CI
