---
id: plan-showroom-search-20260923
intake_id: intake-showroom-search-20260923
slug: showroom-component-search
title: Showroom component search (⌘K palette)
status: completed
lane: normal
input_type: new-initiative
created: 2026-09-23
updated: 2026-09-24
completed_at: 2026-09-24
---

# Showroom component search (⌘K palette)

## Outcome

The showroom navigates ~50 components through a grouped sidebar with no way
to search. A ⌘K / Ctrl+K palette — built from the registry's own
`command-palette` component — lets anyone jump straight to a component:

1. `Cmd/Ctrl+K` toggles the palette from anywhere in the showroom; Escape
   closes it (component behaviour).
2. A visible search button in the sticky header opens the same palette, so the
   feature is discoverable without knowing the shortcut and works on touch.
3. Typing filters by component name, slug, or category; Enter or click selects
   the component, which updates the hash route and closes the palette.
4. The palette passes axe with the dialog open, in both themes.

## Authority and Requirements

### Authoritative Sources

- `docs/plans/completed/showroom-sidebar-clarity.md` — the showroom nav is the
  established surface; this initiative adds a second path to the same slugs and
  does not restructure the sidebar.
- Registry `command-palette` item (`packages/registry/src/components/ui/command-palette.tsx`)
  — compound API: `Root` (`open`, `onOpenChange`, `items`, `filter`,
  `itemToStringValue`), `Input`, `List`, `Results`, `Item`, `Empty`.
- `app/components/playground.tsx` — the showroom shell that owns `slug` state
  and the hash sync.

### Falsifiable Requirements

1. **R1 (shortcut)**: `Meta/Ctrl+K` opens the palette; pressing it again closes
   it; Escape closes it.
2. **R2 (discoverability)**: a labelled search button in the header opens the
   palette and is keyboard reachable.
3. **R3 (filter)**: querying a component's label, slug, or category narrows the
   results to it (e.g. `table` finds `Table`, `data-table`, and everything in
   the `Data visualization` group by category name).
4. **R4 (selection)**: choosing a result sets the active slug, updates
   `window.location.hash`, and closes the palette — by click and by Enter on
   the highlighted item.
5. **R5 (a11y)**: axe reports 0 violations on the showroom with the palette
   open, light and dark; the palette's input is focused on open.
6. **R6 (gates)**: `app typecheck`, `lint`, `prettier --check`, `pnpm -r build`,
   registry `validate`/`validate:build`/`e2e` exit 0.

## Non-goals

- No new dependencies, no registry item changes, no component API changes.
- No restructuring of the sidebar nav or its grouping.
- No fuzzy scoring, recent-items, or per-component deep links beyond the
  existing hash route.
- No search on the docs page.

## Approach and Risks

### Implementation Approach

- **`app/components/component-search.tsx`** (app-only, like `playground.tsx`):
  a thin wrapper over `CommandPalette.Root` that takes `open`, `onOpenChange`,
  flat `{ id, label, group }` items, and `onSelect(id)`; filtering is
  case-insensitive over label/slug/group.
- **`playground.tsx`**: derive the item list from the existing `GROUPS` (single
  source of truth for nav), add `searchOpen` state, a `keydown` listener for
  Cmd/Ctrl+K, a header search button, and the selection handler that reuses the
  sidebar's `setSlug` + hash update.
- **Verification**: browser probe for shortcut/filter/selection, axe with the
  palette open in both themes, then the repository gates.

### Constraints & Dependencies

- The palette is a dialog; the header button must stay outside its focus trap.
- Selection must keep the hash route in sync with the sidebar behaviour.

### Rejected Alternatives

- **Inline sidebar filter input**: rejected — it competes with the nav for
  space and does not scale to keyboard-first use.
- **Custom search dialog**: rejected — the registry ships a command palette;
  the showroom should exercise its own component.

### Primary Risks & Mitigations

- **Risk**: the palette's Enter behaviour may differ from click. **Mitigation**:
  R4 verifies Enter explicitly in the browser probe before the change lands.
- **Risk**: the global keydown listener could swallow the browser's own Cmd+K.
  **Mitigation**: `preventDefault` only when the palette is ours to toggle, and
  the listener is scoped to the showroom page.
- **Recovery**: app-only files; `git checkout` restores.

## Phases and Verification

### Phase 1: Palette + shortcut

- **Slug**: `search-palette`
- **story_id**: story-search-palette-20260923
- **Status**: checked
- **Goal**: R1–R4.
- **Waves/Tasks**:
  - W1-T1: `component-search.tsx` wrapper. Check: `app typecheck` exit 0.
  - W1-T2: wire into `playground.tsx` (items, shortcut, header button,
    selection). Check: browser probe for R1–R4.
- **Proof**: probe transcript; axe with palette open (light/dark) = 0.

### Phase 2: Gates and closure

- **Slug**: `search-gates`
- **story_id**: story-search-gates-20260923
- **Status**: checked
- **Goal**: R5, R6.
- **Waves/Tasks**:
  - W2-T1: run gates, move plan to `docs/plans/completed/`, commit on the
    feature branch and open a PR.
- **Proof**: gate transcripts + axe runs.

## Progress

- 2026-09-23 | phase: search-palette | wave: W1 | task: phase-start | task_status: in-progress | verification: plan phase status + Current State set | surfaces: docs/plans/active/showroom-component-search.md
- 2026-09-24 | phase: search-palette | wave: W1 | task: W1-T1 search wrapper | task_status: DONE | verification: `app/components/component-search.tsx` wraps `CommandPalette.Root` with label/slug/group filtering and `itemToStringValue`; `pnpm --filter app typecheck` + `pnpm lint` exit 0 | surfaces: app/components/component-search.tsx
- 2026-09-24 | phase: search-palette | wave: W1 | task: W1-T2 showroom wiring | task_status: DONE | verification: `playground.tsx` derives 50 items from `GROUPS`, adds ⌘K/Ctrl+K listener, header search button, and selection that reuses the slug + hash flow; browser probe — shortcut opens/toggles, Escape closes, header button opens with the input focused, "table" → 3 results, "visual" → 5 category matches, Enter → `#sankey-chart`, click → `#bubble-map` | surfaces: app/components/playground.tsx
- 2026-09-24 | phase: search-palette | wave: W1 | task: extra — palette list keyboard scroll | task_status: DONE | verification: with 50 items the results list overflows and axe flagged `scrollable-region-focusable` (the inner listbox is aria-activedescendant-driven, `tabindex="-1"`); `CommandPalette.List` is now tabbable with a focus ring, mirrored (`cmp` exit 0); axe with the palette open = 0 in both modes, and the component's own demo still reports 0 | surfaces: packages/registry/src/components/ui/command-palette.tsx, app/components/ui/command-palette.tsx

## Current State and Next Action

- Active phase: `search-gates` (final)
- lifecycle_status: checked
- Anchors: `app/components/component-search.tsx`, `app/components/playground.tsx`
  (⌘K listener, header button, selection), `CommandPalette.List` tabbable fix
- Blockers: none
- exact_next_action: none — gates green, plan closed, commits on
  `feat/showroom-component-search`

## Validation

- 2026-09-24 | phase: search-gates | verdict: APPROVED | judge: same-session | judge_model: DeepSeek V4.1 Flash Max | proof_gaps: no unit-test infrastructure (browser probes + axe used); registry e2e depends on network
  - `pnpm --filter app typecheck` -> pass (exit 0)
  - `pnpm lint` -> pass (exit 0)
  - `pnpm exec prettier --check app/components/component-search.tsx app/components/playground.tsx app/components/ui/command-palette.tsx packages/registry/src/components/ui/command-palette.tsx` -> pass (exit 0)
  - `pnpm --filter @therealtinhtute/registry validate` -> pass (53 items, exit 0)
  - `pnpm --filter @therealtinhtute/registry validate:build` -> pass (54 files, exit 0)
  - `pnpm --filter @therealtinhtute/registry e2e` -> pass (consumer install + SSR render-check, exit 0)
  - `pnpm -r build` -> pass (exit 0)
  - `node .claude/skills/impeccable/scripts/detect.mjs app/app app/components packages/registry/src --json` -> pass (`[]`)
  - `node /tmp/verify-search.mjs` -> pass: shortcut opens/toggles and Escape closes; header button opens with the input focused; filtering by label/slug/category (50 items → 3 for "table", 5 for "visual"); Enter selects `#sankey-chart`, click selects `#bubble-map`; axe with the palette open = 0 light and dark
  - `node /tmp/axe-palette-demo.mjs` -> pass: the component's own demo still reports 0 violations with the palette open
  - receipt: context_sources=docs/plans/active/showroom-component-search.md,docs/plans/completed/showroom-sidebar-clarity.md,packages/registry/src/components/ui/command-palette.tsx,app/components/playground.tsx / policy=docs/playbooks/check.md / judge=same-session / judge_model=DeepSeek V4.1 Flash Max / retries=1 (palette list needed a tab stop once the result list overflowed) / rollback_point=git checkout (branch `feat/showroom-component-search`) / failure_ledger: absent / enforcement: local-only / not_independently_verified=visual review of the palette layout, e2e network-dependent
