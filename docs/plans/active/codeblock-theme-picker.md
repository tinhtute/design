---
id: plan-codeblock-theme-picker-20260930
intake_id: intake-codeblock-theme-picker-20260930
slug: codeblock-theme-picker
title: End-User Code Theme Picker — Multi-Theme CodeBlock via CSS Variables
status: active
lane: normal
input_type: change-request
created: 2026-09-30
updated: 2026-10-01
---

# End-User Code Theme Picker — Multi-Theme CodeBlock via CSS Variables

## Outcome

End users of the showroom pick the code theme of `Code.Block` from a picker next to the
existing light/dark toggle. The choice recolors every code block site-wide instantly with
CSS only — no re-highlight, no re-render — and persists across reloads without flash or
hydration mismatch. The registry `code` item gains the multi-theme capability (N Shiki
themes emitted as CSS variables, selected by an ancestor attribute); with no selection,
rendering is unchanged from today.

Success conditions:

- Picker control in the showroom header; selecting a theme updates the computed token
  colors of all rendered code blocks immediately, with zero console errors and zero
  re-highlighting.
- Preference survives reload: restored before hydration, no FOUC, no hydration mismatch.
- With no stored preference, SSR HTML and computed colors are identical to today.
- Registry parity, catalog integrity, and all gate commands pass.

## Authority and Requirements

### Authoritative Sources

- Owner request (2026-09-30): brainstorm on codeblock themes; decision made in session —
  the theme is chosen by the **end user** (picker UI), direction: N-theme via CSS
  variables (alternatives rejected below).
- Shiki v4.4.3 dual-themes docs (verified 2026-09-30): `themes` accepts an arbitrary
  number of themes; each token span carries one CSS variable per key (`--shiki-<key>`);
  `defaultColor: false` emits no default color, so CSS fully controls application via
  ancestor attribute selectors (documented `data-theme` pattern).
- `docs/plans/completed/shiki-codeblock-integration.md`: existing dual-theme architecture
  (`defaultColor: false`, `code.css` light/dark scoping under `data-mode`/`.dark`),
  registry constraints (exact 53-name catalog; `code` item must not split; themes must be
  derived from design tokens — bundled third-party themes were explicitly rejected), and
  the measured contrast baseline (dark purple/teal 4.88:1 / 6.44:1, light warning 3.94:1).
- `app/components/ui/code-themes.ts` (`MonoSyntaxTheme` interface + `mono-light` /
  `mono-dark`), `app/components/ui/code.css` (variable application + annotation classes),
  `app/components/ui/code.tsx` (server `html` path + client singleton path).
- `app/components/theme-toggle.tsx` + `app/app/layout.tsx`: mode-switch pattern —
  `data-mode` + `.dark` on `<html>`, `localStorage('theme')`, client-only toggle;
  observed gap: nothing restores the stored mode on load (write-only persistence).
- `app/app/theme.css`: authoritative token palette (syntax colors derive from it).
- `docs/PROJECT.md`: gate commands, WCAG 2.1 AA stance, monorepo architecture.

### Falsifiable Requirements

1. **R1 (multi-theme output)**: both highlighter singletons (client JS-engine and server
   oniguruma) load all four themes; every `codeToHtml` call runs with
   `themes: { light, dark, 'light-hc', 'dark-hc' }` and `defaultColor: false`; every token
   span carries `--shiki-light`, `--shiki-dark`, `--shiki-light-hc`, `--shiki-dark-hc`.
2. **R2 (theme set)**: exactly four themes — existing `mono-light` / `mono-dark`
   (defaults, unchanged values) plus new `mono-light-hc` / `mono-dark-hc`, high-contrast
   variants derived only from kumo token hues (lightness/weight tuning, no foreign
   palettes); every token color of the new themes measures ≥ 4.5:1 against its surface
   (existing themes keep their measured baseline).
3. **R3 (CSS-only switching)**: `code.css` maps selection via
   `html[data-code-theme='…']` ancestor selectors to the matching variables; absent
   attribute → behavior identical to today; no `!important`; no JS re-highlight; no React
   re-render on switch.
4. **R4 (picker UX)**: a picker control next to `ThemeToggle` in the playground header —
   keyboard accessible, aria-labelled, visible `--kumo-focus` ring; writes
   `data-code-theme` on `<html>` and persists to a new `localStorage` key (e.g.
   `code-theme`); an inline pre-hydration script restores it (SSR-safe, no flash, no
   hydration mismatch; pattern checked against the local Next.js docs in
   `node_modules/next/dist/docs/`).
5. **R5 (registry payload)**: new themes live in `code-themes.ts` (same file; item file
   list stays `code.tsx`, `code-themes.ts`, `code.css`); no new registry item; 53-name
   catalog intact; `shadcn build` succeeds; `app/components/ui/*` copies stay
   byte-identical (`cmp` exit 0); no new npm dependency.
6. **R6 (a11y)**: picker passes the axe sweep (`pnpm --filter app a11y`) in light + dark;
   theme switching is keyboard-operable end to end.
7. **R7 (gates + proof)**: `pnpm --filter @therealtinhtute/registry validate &&
validate:build`, `pnpm --filter app typecheck`, `pnpm lint`, `pnpm -r build` exit 0;
   registry `e2e` when network permits; browser probe: switching themes changes computed
   token colors in both modes with zero console errors, and clearing the preference
   restores today's rendering.

## Non-goals

- No bundled third-party themes (github/nord/dracula/…) — token-derived only, per the
  completed plan's rejected alternative.
- No per-block `theme` prop on the registry component (v1) and no BYO/import-theme API —
  switching is ancestor-attribute-driven.
- No `mono-dark-dim` (or further flavors) — proposed during brainstorm, cut for a clean
  2×2 mode×theme matrix; can be pulled in at review.
- No fix for the observed mode-restore gap (`localStorage 'theme'` is write-only today) —
  adjacent scope, named for the owner; the picker's own restore is in scope (R4).
- No changes to `app/app/theme.css` or `packages/tokens`; no markdown/MDX pipeline
  changes; no new registry items (catalog stays 53).

## Approach and Risks

### Implementation Approach

Extend the proven dual-theme CSS-variable architecture to four themes; registry-first,
then byte-copy to `app` (the exact pattern proven by `shiki-codeblock-integration`).
Selection is an ancestor attribute (`html[data-code-theme]`) read by `code.css`; the
picker is showroom-only UI that writes the attribute and `localStorage`, restored by an
inline pre-hydration script in `layout.tsx`.

- **Phase 1 (capability)**: author `mono-light-hc` / `mono-dark-hc` in
  `packages/registry/src/components/ui/code-themes.ts`; extend `code.tsx`'s
  `DUAL_THEMES` (line 253) and both `codeToHtml` call sites plus the
  `createHighlighterCore` theme array to all four themes; add `data-code-theme`
  selectors to `code.css`; byte-copy the three files to `app/components/ui/`; extend
  `app/lib/highlight.ts` (server singleton) the same way.
- **Phase 2 (picker)**: pre-hydration restore script in `app/app/layout.tsx` (pattern
  verified against the local Next.js docs in `node_modules/next/dist/docs/` — this Next
  version may differ from training data); new `app/components/code-theme-toggle.tsx`
  (accessible picker, `localStorage['code-theme']`); render it next to `ThemeToggle` in
  the playground header (`playground.tsx:317`).
- **Phase 3 (gates + proof)**: full gate suite, browser proof matrix
  {light, dark} × {default, hc}, feature branch + PR, plan to `completed/`.

Why preferred: reuses the proven zero-JS variable mechanism (Shiki v4.4.3 docs, verified
2026-09-30), touches no catalog name, no dependency, no token file, and keeps the
no-selection rendering byte-identical.

### Constraints & Dependencies

- Shiki derives each variable name from the `themes` object key: keys `light-hc` /
  `dark-hc` → `--shiki-light-hc` / `--shiki-dark-hc`; `defaultColor: false` stays.
- Registry item `code` keeps its 3-file list and dependencies; only file contents change.
- Client bundle grows by two theme objects (~120 lines each) — negligible; grammars and
  engines unchanged.
- HTML output grows: each token span carries 4 CSS variables instead of 2 — measured in
  the Phase 3 probe.
- `app/components/ui/*` must stay byte-identical to registry sources (`cmp` exit 0).

### Rejected Alternatives

- **Re-highlight on theme switch (JS)**: rejected — violates R3 (no re-render), adds
  latency and state; CSS variable switching is instant and free.
- **Token-first CSS palette refactor (brainstorm option C)**: rejected — largest refactor
  for no end-user-visible gain in this initiative.
- **BYO `theme` prop (brainstorm option D)**: rejected — breaks the variable architecture
  (inline colors, no auto dark-switch) and brand consistency.
- **`mono-dark-dim` fifth theme**: deferred — keeps a clean 2×2 mode×theme matrix.

### Primary Risks & Mitigations

- **Risk**: an HC token hue cannot reach ≥ 4.5:1 on its surface while staying
  token-derived. **Mitigation**: measure during T1.1 with a contrast script; if a hue
  cannot reach the bar without leaving the token palette → stop, escalate to owner
  (product decision, not a tuning detail).
- **Risk**: restore script causes hydration mismatch or flash. **Mitigation**:
  attribute-only write before hydration on `<html>` (already `suppressHydrationWarning`);
  verify zero React warnings in the probe; pattern taken from local Next.js docs.
- **Risk**: registry e2e is network-gated. **Mitigation**: run when network permits; only
  e2e may be recorded as skipped, with the reason; all other gates are hard.
- **Recovery**: each phase is one revertable commit on a feature branch; no data or
  external state changes; clearing `localStorage['code-theme']` restores today's behavior
  by construction (absent attribute = current CSS path).

### Stop Conditions

- The same verification command fails twice → escalate.
- HC contrast unreachable within token-derived constraint → escalate (product decision).
- Next.js docs show no safe pre-hydration script pattern → escalate with findings.

## Phases and Verification

### Phase 1: Multi-theme capability (registry + app component + server lib)

- **Story ID**: `story-theme-capability-20261001`
- **Slug**: `theme-capability`
- **Status**: checked
- **Goal**: R1, R2, R3, R5 — four-theme output, HC theme authoring, CSS switching
  capability, registry payload integrity.
- **Dependencies**: none
- **Allowed surfaces**: `packages/registry/src/components/ui/code-themes.ts`,
  `packages/registry/src/components/ui/code.tsx`,
  `packages/registry/src/components/ui/code.css`,
  `app/components/ui/code-themes.ts`, `app/components/ui/code.tsx`,
  `app/components/ui/code.css`, `app/lib/highlight.ts`
- **Avoided surfaces**: `app/app/layout.tsx`, `app/components/playground.tsx`,
  `app/app/theme.css`, `packages/tokens`, registry catalog names, `app/lib/highlight.ts`
  language set
- **Wave 1**:
  - T1.1 — Author `mono-light-hc` / `mono-dark-hc` in registry `code-themes.ts`
    (`satisfies MonoSyntaxTheme`; kumo token hues, lightness/weight tuning only) and
    measure every token color ≥ 4.5:1 against `#faf8f5` / `#262624` with a contrast
    script; tune until it passes. Output: edited file + measured table in Progress.
  - T1.2 — `code.tsx`: extend the theme map (`DUAL_THEMES` → four keys `light`, `dark`,
    `light-hc`, `dark-hc`) in both `codeToHtml` calls and the `createHighlighterCore`
    theme array. Output: edited file.
  - T1.3 — `code.css`: add `html[data-code-theme='hc']` selectors applying
    `--shiki-light-hc` by default and `--shiki-dark-hc` under `data-mode='dark'`/`.dark`;
    no `!important`; absent attribute path untouched. Output: edited file.
- **Wave 2** (after wave 1):
  - T1.4 — Byte-copy the three files to `app/components/ui/` (`cp`). Output: 3 mirrors.
  - T1.5 — `app/lib/highlight.ts`: load all four themes in the singleton and pass all
    four in `codeToHtml`. Output: edited file.
- **Verification**:
  - `cmp` exit 0 for the three copied files (R5 parity).
  - `pnpm --filter @therealtinhtute/registry validate && pnpm --filter
@therealtinhtute/registry validate:build` exit 0; `shadcn build` payload regenerated.
  - `pnpm --filter app typecheck` exit 0.
  - Contrast script output: every HC token ≥ 4.5:1 (R2).
  - SSR probe on built app: token spans carry `--shiki-light-hc` / `--shiki-dark-hc`
    (R1); with no attribute, computed colors match today's baseline.

### Phase 2: Showroom picker, persistence, pre-hydration restore

- **Story ID**: `story-showroom-picker-20261001`
- **Slug**: `showroom-picker`
- **Status**: checked
- **Goal**: R4, R6 — end-user picker in the showroom header, `data-code-theme` +
  `localStorage['code-theme']`, restore before hydration without flash/mismatch.
- **Dependencies**: phase 1 (variables must exist before CSS can switch them)
- **Allowed surfaces**: `app/app/layout.tsx`,
  `app/components/code-theme-toggle.tsx` (new), `app/components/playground.tsx`
- **Avoided surfaces**: registry sources, `app/lib/highlight.ts`, `app/components/ui/*`
- **Wave 1**:
  - T2.1 — Check `node_modules/next/dist/docs/` for the sanctioned inline
    before-interactive script pattern; add the restore script to `app/app/layout.tsx`
    (reads `localStorage['code-theme']`, sets `html[data-code-theme]`, no-op when
    absent). Output: edited file + doc reference recorded.
  - T2.2 — Create `app/components/code-theme-toggle.tsx`: picker listing Default /
    High contrast; sets/removes `data-code-theme` on `<html>`, writes
    `localStorage['code-theme']`; keyboard operable, `aria-label`, `--kumo-focus` ring;
    mirrors `theme-toggle.tsx` conventions (Button/Hugeicons, `'use client'`). Output:
    new file.
- **Wave 2** (depends on T2.2):
  - T2.3 — Render the picker next to `ThemeToggle` in the playground header
    (`playground.tsx` header, line ~317). Output: edited file.
- **Verification**:
  - `pnpm --filter app typecheck` and `pnpm lint` exit 0.
  - `pnpm --filter app a11y` passes (light + dark) (R6).
  - Browser probe: selecting High contrast changes computed token colors of all rendered
    blocks instantly; reload restores the choice with no flash and zero console errors /
    React warnings; clearing the key restores default rendering (R4, R7 partial).

### Phase 3: Gates, visual proof, branch + PR, completion

- **Story ID**: `story-theme-picker-gates-20261001`
- **Slug**: `theme-picker-gates`
- **Status**: planned
- **Goal**: R7 end-to-end proof; feature branch + PR (AGENTS.md git rule); move plan to
  `docs/plans/completed/`.
- **Dependencies**: phases 1–2
- **Allowed surfaces**: git branch/commits/push/PR, this plan file
- **Avoided surfaces**: all product source (proof-only)
- **Wave 1**:
  - T3.1 — Full gates: `pnpm --filter @therealtinhtute/registry validate &&
validate:build`, registry `e2e` (when network permits), `pnpm --filter app typecheck`,
    `pnpm lint`, `pnpm -r build`.
  - T3.2 — Proof matrix: computed token colors for {light, dark} × {default, hc} +
    screenshots; SSR probe: 4 variables per token span, `class="shiki shiki-themes
mono-light mono-dark mono-light-hc mono-dark-hc"`.
  - T3.3 — Review full diff; commit on a feature branch (never `main`), push, open PR;
    move plan to `docs/plans/completed/` after owner-visible proof.
- **Verification**: all gate commands exit 0 (R7); probe matrix recorded in Progress;
  PR URL exists; `git status` clean of unintended files.
- **Stop conditions**: identical gate failure twice → escalate; e2e network-blocked →
  record the skip with reason (e2e only).

## Current State and Next Action

- active_phase: none — phase showroom-picker checked
- lifecycle_status: checked (phase showroom-picker)
- planning_status: planned
- latest_progress: 2026-10-02T04:36Z wave-2 summary — picker live, a11y 113/113, prod probes clean
- latest_validation: 2026-10-02T04:36Z APPROVED (mode: gate, judge: same-session, phase showroom-picker)
- blockers: none
- open_items: none
- exact_next_action: work full — final phase `theme-picker-gates`
  (`story-theme-picker-gates-20261001`)

## Progress

- 2026-10-02T03:45Z | phase: theme-capability | wave: 1 | task: phase-start | task_status: in-progress | summary: Run anchor; phase set in-progress per work-full step 3. Branch feat/codeblock-theme-picker (uncommitted metric-dashboard/stat-card WIP belongs to another task, untouched). | surfaces: docs/plans/active/codeblock-theme-picker.md
- 2026-10-02T03:55Z | phase: theme-capability | wave: 1 | task: T1.1 | task_status: done | summary: Authored `mono-light-hc` + `mono-dark-hc` (satisfies MonoSyntaxTheme) + docblock updated. Contrast solver (HSL lightness shift, hue locked; /tmp/hc-solve.mjs): LIGHT-HC on #faf8f5 — numeric #a45800→#824600 (7.01), type #9810fa→#7d04d3 (7.00), constant #05766c→#046058 (7.03), invalid #c10007→#af0006 (7.01); keyword/string/function already ≥7; comment 9.19, default 17.38. DARK-HC on #262624 — keyword→#87b7d4 (7.04), numeric→#ff9721 (7.00), function→#73b4ff (7.00), type→#d199ff (7.01), constant→#46c3b6 (7.03), invalid→#ff9193 (7.02); string 11.85, comment 7.36, default 8.33 kept. All ≥4.5 (R2). | surfaces: packages/registry/src/components/ui/code-themes.ts
- 2026-10-02T03:55Z | phase: theme-capability | wave: 1 | task: T1.2 | task_status: done | summary: `DUAL_THEMES` → `CODE_THEMES` { light, dark, light-hc, dark-hc } in both `codeToHtml` calls; `createHighlighterCore` loads all four themes; dual-theme docstrings updated. | surfaces: packages/registry/src/components/ui/code.tsx
- 2026-10-02T03:55Z | phase: theme-capability | wave: 1 | task: T1.3 | task_status: done | summary: `code.css` adds `html[data-code-theme='hc']` selectors → `--shiki-light-hc`; dark branch covers `html[data-mode='dark']`, `html.dark`, and nested `.dark` ancestors → `--shiki-dark-hc`; no `!important`; default path untouched (R3). | surfaces: packages/registry/src/components/ui/code.css
- 2026-10-02T03:56Z | phase: theme-capability | wave: 1 | task: wave-summary | task_status: done | summary: Wave 1 complete — 3 registry files edited; hc selectors placed after defaults so equal-specificity rules resolve correctly. | surfaces: packages/registry/src/components/ui/
- 2026-10-02T03:56Z | phase: theme-capability | wave: 2 | task: T1.4 | task_status: done | summary: Byte-copied code-themes.ts / code.tsx / code.css to `app/components/ui/`; `cmp` exit 0 on all three (R5 parity). | surfaces: app/components/ui/{code-themes.ts,code.tsx,code.css}
- 2026-10-02T03:57Z | phase: theme-capability | wave: 2 | task: T1.5 | task_status: done | summary: `app/lib/highlight.ts`: `MONO_THEMES` map + singleton loads all four themes; `codeToHtml` passes all four; docblocks updated (prettier re-wrapped one import). | surfaces: app/lib/highlight.ts
- 2026-10-02T03:57Z | phase: theme-capability | wave: 2 | task: wave-summary | task_status: done | summary: Wave 2 complete — app mirrors identical; server singleton emits all four variables. Verification: `validate` OK (55 items — catalog grew to 55 via parallel metric-dashboard/stat-card WIP; `code` item unchanged, this initiative adds no item), `validate:build` OK (54 built), `shadcn build` OK, typecheck OK, lint OK, SSR probe OK (see Validation). | surfaces: packages/registry/public/r/ (gitignored build output)
- 2026-10-02T03:59Z | phase: showroom-picker | wave: 1 | task: phase-start | task_status: in-progress | summary: Run anchor; phase set in-progress per work-full step 3. | surfaces: docs/plans/active/codeblock-theme-picker.md
- 2026-10-02T04:36Z | phase: showroom-picker | wave: 1 | task: T2.1 | task_status: done | summary: Read `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md` + `03-api-reference/02-components/script.md` (Next 16.3.4). Restore implemented via `<Script id="mono-code-theme" strategy="beforeInteractive">` in RootLayout — whitelists `hc`. Raw `<script>` in `<head>` first attempt produced React script-tag console error; `next/script` emits it via the streaming SSR payload and executes during parse — probe shows `data-code-theme="hc"` already set at DOMContentLoaded, zero console output. | surfaces: app/app/layout.tsx
- 2026-10-02T04:36Z | phase: showroom-picker | wave: 1 | task: T2.2 | task_status: done | summary: New `app/components/code-theme-toggle.tsx` — design-system `Select` (items {default, hc}, `size="sm"`, `aria-label="Code theme"`); `useState('default')` matches SSR, `useLayoutEffect` reads `localStorage['code-theme']` and syncs pre-paint + re-applies the attribute after dev StrictMode remounts. First iteration (lazy `useState` initializer reading localStorage) caused a hydration text mismatch on the Select value — fixed to SSR-matching init + layout-effect sync per the same guide. | surfaces: app/components/code-theme-toggle.tsx
- 2026-10-02T04:36Z | phase: showroom-picker | wave: 2 | task: T2.3 | task_status: done | summary: `CodeThemeToggle` rendered next to `ThemeToggle` in the playground header; import added. Pre-existing metric-dashboard/stat-card WIP hunks in playground.tsx untouched. | surfaces: app/components/playground.tsx
- 2026-10-02T04:36Z | phase: showroom-picker | wave: 2 | task: wave-summary | task_status: done | summary: Wave complete. Gates: typecheck OK, lint OK (removed an `eslint-disable` for a nonexistent `react-hooks/exhaustive-deps` rule). `pnpm --filter app a11y` against `next start :3211`: 113 scans, 0 failing (picker present in header on every scan). Probes: chromatic token `Button` — light #9810FA→#7D04D3, dark #D199FF→#BD6CFF on attr toggle (CSS-only, zero JS re-highlight); `data-code-theme` set by DOMContentLoaded on reload with stored `hc`; clearing restores default; zero console errors on production build (dev-mode hydration warning observed once on dev server was probe self-inflicted DOM manipulation; prod is clean). | surfaces: app/components/playground.tsx, app/app/layout.tsx

## Decisions

- 2026-10-02T03:57Z | phase: theme-capability | task: wave-2-verify | type: environment | summary: Registry catalog is now 55 items, not the 53 R5 cites — parallel metric-dashboard/stat-card WIP (pre-existing uncommitted changes on main) added two items. This initiative added none; `code` item file list/dependencies unchanged; requirement intent (no catalog mutation by this work) holds.
- 2026-10-02T04:36Z | phase: showroom-picker | task: T2.1 | type: tooling | summary: Plan said "inline pre-hydration script"; implemented with `next/script` `strategy="beforeInteractive"` per `node_modules/next/dist/docs/.../script.md` — raw `<script>` in the layout produced a React script-tag console error, breaking R4's zero-console-errors bar. Verified at DOMContentLoaded the attribute is already set (pre-paint).
- 2026-10-02T04:36Z | phase: showroom-picker | task: T2.2 | type: bugfix | summary: Lazy `useState(() => localStorage…)` initializer caused a hydration text mismatch on the Select label (SSR 'Default' vs client 'High contrast'). Fixed to SSR-matching `'default'` init + `useLayoutEffect` pre-paint sync — the doc-sanctioned pattern for client-owned preferences.
- 2026-10-02T04:36Z | phase: showroom-picker | task: a11y-run | type: tooling-substitution | summary: Cold `next dev` exceeded the script's 60s navigation timeout; ran the sweep against `pnpm build && next start :3211` with `A11Y_BASE_URL` — same path CI uses per PROJECT.md.
- absorb: none

## Validation

APPROVED

- phase: theme-capability
- scope: on target — diff touches only the three registry `code*` sources, their
  `app/components/ui/` byte-copies, `app/lib/highlight.ts`, and this plan file;
  pre-existing metric-dashboard/stat-card WIP is outside this phase and untouched.
- depth: standard (new themes + CSS attribute switching + server lib; no API break)
- proof:
  - `cmp -s app/components/ui/code-themes.ts packages/registry/src/components/ui/code-themes.ts` -> pass (byte-identical; same for code.tsx, code.css)
  - `pnpm --filter @therealtinhtute/registry validate` -> pass (55 items; `code` OK)
  - `pnpm --filter @therealtinhtute/registry validate:build` -> pass (54 built files)
  - `pnpm --filter @therealtinhtute/registry build` -> pass (`shadcn build` regenerated payloads)
  - `pnpm --filter app typecheck` -> pass
  - `pnpm lint` -> pass
  - `node /tmp/hc-solve.mjs` -> pass: all HC token colors >= 4.5:1 on their surfaces; chromatic tokens solved to ~7:1 (ephemeral solver script, values inlined in code-themes.ts)
  - `pnpm --filter app build` -> pass; SSR probe on `next start -p 3210` root HTML: exactly `class="shiki shiki-themes mono-light mono-dark mono-light-hc mono-dark-hc"`, 5365 token spans each carrying all of `--shiki-light`, `--shiki-dark`, `--shiki-light-hc`, `--shiki-dark-hc` plus `*-bg` vars (symmetric counts), HC-only values (`#7D04D3`, `#824600`, `#046058`) present in output — R1 confirmed (ephemeral probe artifact, not committed)
- review: APPROVED
- judge: same-session
- judge_model: swe-2-high
- blockers: 0 critical, 0 major
- not_independently_verified: no independent reviewer examined the diff; hc CSS selector precedence verified by specificity/order analysis, not a live rendered-pixel check; visual appearance of the two new themes not yet probed in a browser (Phase 3 proof matrix covers it)
- receipt: context_sources=docs/plans/active/codeblock-theme-picker.md,app/components/ui/,packages/registry/src/components/ui/,app/lib/highlight.ts / policy=docs/playbooks/check.md / judge=same-session / judge_model=swe-2-high / retries=0 / rollback_point=branch base b9f3f0a / failure_ledger=absent / enforcement=local-only / not_independently_verified=see above
- proof_gaps: `app` has no unit-test harness (pre-existing repo state, same as prior initiatives); live theme-switch rendering is Phase 2/3 scope, not provable in this phase's diff

APPROVED

- phase: showroom-picker
- scope: on target — diff touches `app/app/layout.tsx`, new
  `app/components/code-theme-toggle.tsx`, `app/components/playground.tsx`
  (import + one line); neighboring uncommitted WIP hunks preserved.
- depth: standard (client preference wiring + SSR restore; no shipped
  component API change)
- proof:
  - `pnpm --filter app typecheck` -> pass
  - `pnpm lint` -> pass
  - `pnpm --filter app build` -> pass (static prerender retained)
  - `A11Y_BASE_URL=http://localhost:3211 pnpm --filter app a11y` -> pass: 113 scans, 0 failing (light + dark + palette), picker present on every scan
  - Browser probe on `next start :3211` (playwright-core headless, ephemeral /tmp scripts): `data-code-theme='hc'` recolors chromatic token — computed color #9810FA -> #7D04D3 in light, #D199FF -> #BD6CFF in dark; reload with stored `hc` shows attribute already set at DOMContentLoaded (pre-paint); clearing the key restores default; zero console errors/warnings on the production build
- review: APPROVED
- judge: same-session
- judge_model: swe-2-high
- blockers: 0 critical, 0 major
- not_independently_verified: no independent reviewer; "no flash before paint" is inferred from the attribute being set by DOMContentLoaded (pre-hydration script executes during parse) — intermediate paint frames were not captured; keyboard interaction with the picker was verified via axe + Base UI semantics, not manual key walkthrough
- receipt: context_sources=docs/plans/active/codeblock-theme-picker.md,app/app/layout.tsx,app/components/code-theme-toggle.tsx,app/components/playground.tsx / policy=docs/playbooks/check.md / judge=same-session / judge_model=swe-2-high / retries=1 (lint eslint-disable fix; probe iteration) / rollback_point=commit c0f5c09 / failure_ledger=absent / enforcement=local-only / not_independently_verified=see above
- proof_gaps: none material — a11y + typecheck + lint + build + live DOM probe all captured; unit tests absent in repo (pre-existing state)
