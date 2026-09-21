---
id: plan-showroom-sidebar-202609152133
intake_id: intake-showroom-sidebar-202609152133
slug: showroom-sidebar-clarity
title: Showroom Sidebar State Clarity and Component Descriptions
status: completed
lane: normal
input_type: change-request
created: 2026-09-15
updated: 2026-09-16
---

# Showroom Sidebar State Clarity and Component Descriptions

## Outcome

The showroom sidebar reads cleanly and every component page explains itself:

1. A resting, a hovered, and the active sidebar item are visually distinguishable from each other without relying on pointer position — single-signal Kumo parity (amended 2026-09-16, owner ruling): text weight stays constant at `font-medium`; resting renders `text-kumo-subtle`, hover renders `text-kumo-default` plus a background tint, and active renders `text-kumo-default` plus the persistent `--sidebar-active-bg` wash.
2. The showroom nav uses one button treatment for every component item (no mixed trigger/leaf button styles) under plain category labels.
3. Every component page in the showroom shows that component's registry description under its title instead of the generic "Live canvas from local @therealtinhtute/ui." subtitle.

## Authority and Requirements

### Authoritative Sources

- Owner request (2026-09-15, via `/think`): sidebar has unclear active/inactive/hover states and uneven highlighting; component pages lack descriptions.
- Cloudflare Kumo docs-site nav `packages/kumo-docs-astro/src/components/SidebarNav.tsx` (MIT, pinned commit `a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf`): inactive `text-kumo-subtle`, hover `hover:text-kumo-default hover:bg-kumo-tint`, active `font-medium text-kumo-default bg-kumo-tint`; flat item lists per section.
- Kumo Sidebar demo convention: `Sidebar.Group` + `Sidebar.GroupLabel` + flat `Sidebar.MenuButton`; `Sidebar.Collapsible` only for genuine per-item sub-hierarchy.
- `packages/registry/registry.json` — `name` and `description` for all 53 items (the 49 showroom slugs in `GROUPS` all resolve).

### Falsifiable Requirements

1. **R1 (state differentiation — amended 2026-09-16, owner ruling)**: the `Sidebar` primitive keeps uniform `font-medium text-kumo-default` on menu buttons and owns only the background signal (`!active` → `hover:bg-(--sidebar-active-bg)`, `active` → `bg-(--sidebar-active-bg)`); the showroom nav applies the text hierarchy via consumer `className` (inactive `text-kumo-subtle hover:text-kumo-default`, active default). Resting/hover/active are distinguishable by background wash plus text shade, not weight.
2. **R2 (registry parity)**: `app/components/ui/sidebar.tsx` and `packages/registry/src/components/ui/sidebar.tsx` remain byte-identical (`cmp` exits 0).
3. **R3 (single nav treatment)**: `app/components/playground.tsx` renders each category as `Sidebar.Group` + `Sidebar.GroupLabel` with one `Sidebar.MenuButton` per component; it contains no `Sidebar.Collapsible`, `Sidebar.CollapsibleTrigger`, `Sidebar.CollapsibleContent`, `Sidebar.MenuSub`, or `Sidebar.MenuSubButton` in the nav.
4. **R4 (collapse mode)**: The showroom `Sidebar.Provider` uses `collapsible="offcanvas"`, so collapsing hides the sidebar fully instead of leaving an empty icon rail.
5. **R5 (descriptions)**: For every slug in `GROUPS`, the page header renders the matching `description` from `packages/registry/registry.json`; the string "Live canvas from local @therealtinhtute/ui." no longer appears in `app/components/playground.tsx`.
6. **R6 (no regressions)**: Hash navigation (`#slug`) still selects the component; tests, types, lint, and build gate commands in `docs/PROJECT.md` exit 0.

## Non-goals

- Changing color token definitions in `app/app/theme.css` or `packages/tokens`. (Re-pointing the `--sidebar-active-bg` binding inside `sidebar.tsx` to `--color-sidebar-accent` IS in scope — amended 2026-09-16, owner ruling: Kumo uses a true-neutral gray.)
- Rebuilding the showroom nav as Kumo's hand-rolled `<ul>/<li>` markup or its 3-section Components/Charts/Blocks structure.
- Adding search or new behavior to the sidebar nav; changing `Sidebar.GroupLabel` styling. (Per-item leading icons ARE in scope — amended 2026-09-16, owner ruling: Kumo real-product parity.)
- Editing component descriptions in `registry.json`, or showing descriptions anywhere other than the showroom page header.
- Any runtime dependency on `@cloudflare/kumo`.

---

## Approach and Risks

### Implementation Approach

- **Registry component first**: fix the hover/active ambiguity at its source — both Sidebar button parts currently apply the same `bg-(--sidebar-active-bg)` to hover and active with an unconditional `text-kumo-default`. Adopt Kumo's docs-nav text treatment (color + weight) in `SidebarMenuButton` and `SidebarMenuSubButton`, applying the identical edit to the app copy and the registry source so they stay byte-identical, then rebuild the registry payloads.
- **Showroom second**: flatten the nav in `playground.tsx` to Group/GroupLabel/MenuButton, switch to `collapsible="offcanvas"` (flat items carry no icons, so the default `icon` rail would be empty), delete the now-dead collapsible state, and render descriptions from a static import of `packages/registry/registry.json`.

### Constraints & Dependencies

- Phase `showroom-nav-and-descriptions` benefits from, but does not require, phase `sidebar-state-classes`; each phase leaves the showroom working.
- Turbopack resolves modules only inside the project root, which Next.js auto-detects from the monorepo-root `pnpm-lock.yaml` (`app/node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/turbopack.md`, "Root directory"); `packages/registry/registry.json` is inside that root, and `app/tsconfig.json` sets `resolveJsonModule: true`.
- `packages/registry/public/` and `app/public/r` are gitignored build output; `pnpm -r build` regenerates them.

### Rejected Alternatives

- **Read descriptions from `app/public/r/{slug}.json`**: rejected — only created by `app`'s `build` script (`dev` does not sync, and the path is gitignored), so a fresh `pnpm dev` would 404.
- **Hand-copy 49 descriptions into `GROUPS` tuples**: rejected — duplicates `registry.json` and drifts.
- **Override classes only in `playground.tsx` via `className`**: rejected — leaves the hover/active ambiguity in the distributed Sidebar for every consumer.
- **Add an active indicator bar or new color**: rejected — introduces visual language Kumo does not use; color + weight is Kumo's established treatment.

### Primary Risks & Mitigations

- **Risk**: dropping base `font-medium` changes the look of every consumer's Sidebar items. **Mitigation**: intended contract change; recorded in Decisions at execution; `pnpm --filter @therealtinhtute/registry e2e` proves consumer install/build still pass.
- **Risk**: inactive items (`text-kumo-subtle`, normal weight) read too close to `Sidebar.GroupLabel` (`text-kumo-subtle`, `font-medium`). **Mitigation**: screenshot inspection in both themes; IF labels and items are not distinguishable → stop and escalate to the owner (GroupLabel styling is a non-goal).
- **Risk**: `text-kumo-subtle` contrast. **Mitigation**: `Sidebar.GroupLabel` already renders `text-kumo-subtle` on the same sidebar background and passed the prior audit's 4.5:1 probe; the DOM probe below re-measures an inactive item.
- **Proof gap (declared)**: `app` has no unit-test harness; lane-normal unit proof is limited to the registry validators, e2e render check, and the browser DOM probe below.
- **Recovery**: each phase is one revertable commit; no data or external state changes.

---

## Phases and Verification

### Phase 1: Sidebar State Classes

- **Slug**: `sidebar-state-classes`
- **Story ID**: `story-sidebar-states-202609152133`
- **Status**: `done`
- **Goal**: Make resting, hover, and active states of Sidebar menu buttons distinguishable (R1, R2).
- **Dependencies**: none
- **Allowed surfaces**: `app/components/ui/sidebar.tsx`, `packages/registry/src/components/ui/sidebar.tsx`
- **Avoided surfaces**: theme/token files, `Sidebar.GroupLabel`, any other component
- **Wave 1**:
  - T1.1 — (amended 2026-09-16, owner ruling) In `app/components/ui/sidebar.tsx` `SidebarProvider` wrapper className (~line 499): change `[--sidebar-active-bg:var(--color-kumo-tint)]` to `[--sidebar-active-bg:var(--color-sidebar-accent)]` — true-neutral Kumo hover/active wash. Output: edited file. (Supersedes the original in-primitive conditional-classes edit, which shipped then was reworked into the consumer override — see Decisions.)
  - T1.2 — (amended 2026-09-16) No primitive class changes remain: `SidebarMenuButton`/`SidebarMenuSubButton` keep uniform `font-medium text-kumo-default`; the text hierarchy lives in the showroom consumer (phase 2, T2.4). Output: none — verification-only.
- **Wave 2** (after Wave 1):
  - T1.3 — `cp app/components/ui/sidebar.tsx packages/registry/src/components/ui/sidebar.tsx`. Output: identical registry source.
- **Verification**:
  - `cmp app/components/ui/sidebar.tsx packages/registry/src/components/ui/sidebar.tsx` exits 0.
  - `grep -n -- '--sidebar-active-bg:var(--color-sidebar-accent)' app/components/ui/sidebar.tsx` prints one line.
  - `pnpm --filter app typecheck`
  - `pnpm lint`
  - `pnpm -r build`
  - `pnpm --filter @therealtinhtute/registry validate && pnpm --filter @therealtinhtute/registry validate:build && pnpm --filter @therealtinhtute/registry e2e`
  - State visuals are verified by the phase-2 browser probe against the shipped consumer-override approach (uniform weight; bg + text shade carry the states).
- **Stop conditions**: any gate command fails twice with the same error → escalate; labels and items indistinguishable in screenshots → escalate.

### Phase 2: Showroom Nav and Descriptions

- **Slug**: `showroom-nav-and-descriptions`
- **Story ID**: `story-showroom-nav-202609152133`
- **Status**: `done` (final phase — independent `check full` APPROVED 2026-09-16T13:58Z under the amended plan)
- **Goal**: One flat nav treatment with full offcanvas collapse, and registry descriptions on every page (R3, R4, R5, R6).
- **Dependencies**: none (ordered after `sidebar-state-classes` so screenshots reflect final states)
- **Allowed surfaces**: `app/components/playground.tsx`
- **Avoided surfaces**: `app/components/ui/*`, `packages/registry/*` (read-only import of `registry.json`), `Canvas` demo bodies
- **Wave 1**:
  - T2.1 — Nav: replace the `GROUPS.map` body (~lines 734-780) with `<Sidebar.Group key={group.title}><Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel><Sidebar.Menu>{group.items.map(([id, label]) => (<Sidebar.MenuItem key={id}><Sidebar.MenuButton active={id === slug} onClick={() => { setSlug(id); window.location.hash = id; }}>{label}</Sidebar.MenuButton></Sidebar.MenuItem>))}</Sidebar.Menu></Sidebar.Group>`; set `<Sidebar.Provider defaultOpen collapsible="offcanvas" className="h-dvh">`.
  - T2.2 — Dead state: delete the `openGroups` `useState` (~line 684) and `toggleGroup` (~line 709); in the hash handler replace the `foundGroup` lookup and `setOpenGroups` call with `if (GROUPS.some((group) => group.items.some(([id]) => id === fromHash))) setSlug(fromHash);`. (Amended 2026-09-16, owner ruling) Replace the per-group `icon` field with per-item icons: `NavItem` becomes `[id, label, icon]` and every one of the 49 items carries a Phosphor icon (~48 imports); each `Sidebar.MenuButton` receives `icon={Icon}`.
  - T2.3 — Descriptions: add `import registry from "../../packages/registry/registry.json";` and module-level `const DESCRIPTIONS = new Map(registry.items.map((item) => [item.name, item.description]));`; replace the subtitle text "Live canvas from local @therealtinhtute/ui." with `{DESCRIPTIONS.get(slug)}`.
  - T2.4 — (added 2026-09-16, owner ruling; absorbs the reworked phase-1 text hierarchy) Consumer state classes: each nav `Sidebar.MenuButton` gets `className={id === slug ? undefined : "text-kumo-subtle hover:text-kumo-default"}` — inactive items render subtle and brighten to default on hover while the primitive supplies the bg wash; active keeps default text plus the persistent `--sidebar-active-bg` background.
- **Verification**:
  - `grep -nE "Sidebar\.(Collapsible|CollapsibleTrigger|CollapsibleContent|MenuSub|MenuSubButton)|openGroups|toggleGroup|Live canvas from local" app/components/playground.tsx` prints nothing (exit 1).
  - `grep -n 'collapsible="offcanvas"' app/components/playground.tsx` prints one line.
  - `grep -n 'icon={Icon}' app/components/playground.tsx` prints one line (per-item icons wired).
  - `grep -n 'text-kumo-subtle hover:text-kumo-default' app/components/playground.tsx` prints one line (consumer text hierarchy, T2.4).
  - `grep -n 'font-medium' app/components/playground.tsx` prints nothing (exit 1) — weight stays uniform per amended R1.
  - `pnpm --filter app typecheck`
  - `pnpm lint`
  - `pnpm -r build`
  - `pnpm --filter @therealtinhtute/registry validate && pnpm --filter @therealtinhtute/registry validate:build && pnpm --filter @therealtinhtute/registry e2e`
  - Browser probe with `pnpm --filter app dev` running: `agent-browser open http://localhost:3000/#sidebar` → header paragraph text equals the `sidebar` description in `registry.json` ("Responsive navigation panel with expand/collapse, peek, resize, and mobile sheet support."); click a different nav item → `location.hash`, `h2`, and description update; click the footer `Sidebar.Trigger` → sidebar fully hidden (no rail), header trigger reopens it; computed styles on the committed approach — active `[data-sidebar="menu-button"][data-active]` has a non-transparent background and default text, one inactive sibling has transparent background and the subtle text color with `font-weight: 500` (uniform weight is intended), hovering the inactive item adds the background tint; each nav button renders a leading icon (svg) — screenshots at 1280px and 482px widths in light and dark theme.
- **Stop conditions**: Turbopack/tsc cannot resolve `../../packages/registry/registry.json` → stop and escalate (do not add `turbopack.root` or a workspace dependency without owner approval); any gate command fails twice with the same error → escalate.

---

## Current State and Next Action

- active_phase: none
- lifecycle_status: done
- planning_status: planned
- latest_progress: 2026-09-16T14:01Z handoff closed both phases; initiative complete
- latest_validation: 2026-09-16T13:58Z APPROVED (independent `check full`, phase showroom-nav-and-descriptions, amended plan)
- blockers: none
- open_items: none
- exact_next_action: initiative closed — push/merge `fix/sidebar-kumo-parity` to `main` at owner discretion

## Progress

- 2026-09-15T14:52Z | phase: sidebar-state-classes | wave: 1 | task: T1.1 | task_status: done | summary: `SidebarMenuButton` buttonClasses now render `active ? "font-medium text-kumo-default" : "text-kumo-subtle hover:text-kumo-default"` instead of unconditional `text-kumo-default font-medium`. | surfaces: app/components/ui/sidebar.tsx
- 2026-09-15T14:52Z | phase: sidebar-state-classes | wave: 1 | task: T1.2 | task_status: done | summary: `SidebarMenuSubButton` buttonClasses given the same active/inactive/hover text treatment; base `font-medium` removed. | surfaces: app/components/ui/sidebar.tsx
- 2026-09-15T14:52Z | phase: sidebar-state-classes | wave: 2 | task: T1.3 | task_status: done | summary: `cp app/components/ui/sidebar.tsx packages/registry/src/components/ui/sidebar.tsx`; `cmp` confirms byte-identical. | surfaces: packages/registry/src/components/ui/sidebar.tsx
- 2026-09-15T14:52Z | phase: sidebar-state-classes | wave: summary | task_status: done | summary: Both waves complete; gate run below is APPROVED; phase set `checked`.
- 2026-09-15T16:10Z | phase: showroom-nav-and-descriptions | wave: 1 | task: T2.1 | task_status: done | summary: `GROUPS.map` nav body replaced with flat `Sidebar.Group`/`Sidebar.GroupLabel`/`Sidebar.MenuItem`/`Sidebar.MenuButton`; no more `Sidebar.Collapsible`/`MenuSub` in nav; `Sidebar.Provider` now has `collapsible="offcanvas"`. | surfaces: app/components/playground.tsx
- 2026-09-15T16:10Z | phase: showroom-nav-and-descriptions | wave: 1 | task: T2.2 | task_status: done | summary: Removed `openGroups` state and `toggleGroup`; hash handler simplified to a plain `setSlug` guarded by membership check; removed `icon` field from all 10 `GROUPS` entries and all 9 now-unused icon imports (corrected from the plan's 8 — see Decisions). | surfaces: app/components/playground.tsx
- 2026-09-15T16:10Z | phase: showroom-nav-and-descriptions | wave: 1 | task: T2.3 | task_status: done | summary: Added `import registry from "../../packages/registry/registry.json"` and `DESCRIPTIONS` map; replaced hardcoded subtitle with `{DESCRIPTIONS.get(slug)}`. | surfaces: app/components/playground.tsx
- 2026-09-15T16:10Z | phase: showroom-nav-and-descriptions | wave: summary | task_status: done | summary: Wave 1 complete; gate run below is APPROVED; final phase — lifecycle kept `in-progress`, routed to independent `check full`.
- 2026-09-16T13:42Z | phase: showroom-nav-and-descriptions | wave: reconciliation | task: plan-amendment | task_status: done | summary: Owner ruling — keep the shipped approach (e03f78d). Amended Outcome 1, R1, Non-goals, phase-1 tasks (T1.1→`--sidebar-active-bg` re-point, T1.2→verification-only), phase-2 tasks (T2.2→per-item icons, new T2.4→consumer className) and both Verification lists. | surfaces: docs/plans/active/showroom-sidebar-clarity.md
- 2026-09-16T13:42Z | phase: showroom-nav-and-descriptions | wave: reconciliation | task: reverify-static | task_status: done | summary: Amended proofs re-run on committed state — `cmp` identical (R2); `--sidebar-active-bg:var(--color-sidebar-accent)` at sidebar.tsx:499; banned-pattern grep empty (R3, "Live canvas" gone); `collapsible="offcanvas"` at :742 (R4); `icon={Icon}` at :765; consumer className `text-kumo-subtle hover:text-kumo-default` at :769; no `font-medium` in playground.tsx (uniform weight). | surfaces: app/components/playground.tsx, app/components/ui/sidebar.tsx, packages/registry/src/components/ui/sidebar.tsx
- 2026-09-16T13:42Z | phase: showroom-nav-and-descriptions | wave: reconciliation | task: reverify-browser | task_status: done | summary: Live probe on e03f78d (`pnpm --filter app dev` + agent-browser): `#sidebar` → h2 + registry description; active item fw500 / default text / wash bg, inactive fw500 / subtle text / transparent bg; hover on inactive → bg tint + default text, weight stays 500 (amended R1 verified in computed styles); all 49 nav items render a leading icon; click Badge → `#badge`, h2, description, and active state update; footer collapse → sidebar width 0 (offcanvas, no rail), header trigger reopens to 260px; at 482px no horizontal overflow, sidebar opens as full-height drawer over dimmed content. Screenshots: `/tmp/monoui-full-{1280-light,1280-dark,482-light,482-dark,482-drawer}.png`. | surfaces: none (read-only probe)
- 2026-09-16T14:01Z | phase: showroom-nav-and-descriptions | wave: closure | task_status: done | summary: `handoff` closed both phases (`sidebar-state-classes`, `showroom-nav-and-descriptions` → `done`); plan frontmatter `status: completed`; moved to `docs/plans/completed/`.

## Decisions

- 2026-09-15T16:10Z | phase: showroom-nav-and-descriptions | task: T2.2 | type: plan-correction | summary: Plan text claimed `SquaresFourIcon` "stays; it is used elsewhere." Grep (`grep -c` per icon name across `app/components/playground.tsx`) showed all 9 GROUPS icons — including `SquaresFourIcon` — appear only as `icon:` field values (used twice, for "Layout" and "Patterns") plus once in the import; none appear in any `Canvas` render branch. All 9 were removed from the import, not the 8 the plan named. `PlusIcon` was left untouched (used in `Canvas()`'s `case "button":`). Verified post-edit: `pnpm --filter app typecheck` and `pnpm lint` both pass with no unused-import errors.
- 2026-09-16T14:01Z | phase: closure | type: absorb | summary: absorb: none — the plan-vs-diff divergence class is already guarded by the required independent `check full`; the owner ruling is initiative-specific, needing no new rule, ADR, or guard.
- 2026-09-16T13:35Z | phase: showroom-nav-and-descriptions | task: reconciliation | type: owner-ruling / plan-amendment | summary: Independent `check full` returned REQUEST_CHANGES on e03f78d — the committed diff implements a different approach than the recorded tasks (text hierarchy lives in the showroom consumer `className`, not in-primitive conditional classes; per-item icons were added, not removed; `--sidebar-active-bg` was re-pointed to `--color-sidebar-accent`). Owner ruled: keep the shipped approach. Amended accordingly: Outcome 1 (single-signal, uniform weight), R1 (primitive owns bg, consumer owns text shade), Non-goals (per-item icons in scope; `--sidebar-active-bg` binding re-point in scope — theme.css/tokens still untouched), Phase 1 tasks (T1.1→var re-point, T1.2→verification-only), Phase 2 tasks (T2.2→per-item icons; new T2.4→consumer className) and both phases' Verification lists. Original Progress/Validation entries remain as history; this amendment supersedes them for what shipped. Re-verification on the committed state follows in Progress.

## Validation

APPROVED

- phase: sidebar-state-classes
- scope: on target
- depth: standard (shared Sidebar primitive affects every registry consumer; change is CSS-class only)
- proof:
  - `grep -c 'active ? "font-medium text-kumo-default" : "text-kumo-subtle hover:text-kumo-default"' app/components/ui/sidebar.tsx` -> `2` (pass)
  - `cmp app/components/ui/sidebar.tsx packages/registry/src/components/ui/sidebar.tsx` -> exit 0, no output (pass)
  - `pnpm --filter app typecheck` -> pass
  - `pnpm lint` -> pass
  - `pnpm -r build` -> pass (registry build + `app` `next build` both succeeded)
  - `pnpm --filter @therealtinhtute/registry validate` -> pass (53 registry items validated)
  - `pnpm --filter @therealtinhtute/registry validate:build` -> pass (54 built registry files validated)
  - `pnpm --filter @therealtinhtute/registry e2e` -> pass (consumer install/build/SSR render-check all passed)
  - Browser probe (`pnpm --filter app dev` + `agent-browser`) on `http://localhost:3000/#button`: active `[data-sidebar="menu-sub-button"][data-active]` computed `font-weight: 500`, dark text; inactive sibling computed `font-weight: 400`, lighter text; `mouse move` onto the inactive item set `:hover` true with text brightening to the active color and background tinting, while `font-weight` stayed `400`. Screenshots captured light and dark (`scratchpad/sidebar-light.png`, `scratchpad/sidebar-dark.png`): active item bold and full-color, inactive items dimmed, in both themes.
- review: APPROVED
- judge: same-session
- judge_model: claude-sonnet-5
- blockers: 0 critical, 0 major
- not_independently_verified: whether removing the base `font-medium` weight visually regresses any other installed Sidebar consumer beyond this showroom — only the showroom was visually inspected.
- receipt: context_sources=docs/plans/active/showroom-sidebar-clarity.md,app/components/ui/sidebar.tsx,packages/registry/src/components/ui/sidebar.tsx / policy=docs/playbooks/check.md / judge=same-session / judge_model=claude-sonnet-5 / retries=0 / rollback_point=pre-phase-1 commit / failure_ledger=absent / enforcement=local-only / not_independently_verified=see above
- proof_gaps: `app` has no unit-test harness (declared in plan risk); the CSS-state behavior was proven via the registry's automated suite plus a live browser DOM/visual probe, not a unit test

APPROVED

- phase: showroom-nav-and-descriptions
- scope: on target
- depth: standard (single-file showroom change; behavior-visible via nav flattening, offcanvas collapse, and description wiring)
- proof:
  - `grep -nE "Sidebar\.(Collapsible|CollapsibleTrigger|CollapsibleContent|MenuSub|MenuSubButton)|openGroups|toggleGroup|Live canvas from local" app/components/playground.tsx` -> no output, exit 1 (pass)
  - `grep -n 'collapsible="offcanvas"' app/components/playground.tsx` -> one line, `<Sidebar.Provider defaultOpen collapsible="offcanvas" className="h-dvh">` (pass)
  - `grep -nE "AppWindowIcon|ChartLineIcon|CompassIcon|DotsThreeOutlineIcon|KeyboardIcon|LightningIcon|MegaphoneIcon|SquaresFourIcon|TagIcon" app/components/playground.tsx` -> no output, exit 1 (pass; confirms all 9 icon imports removed cleanly)
  - `pnpm --filter app typecheck` -> pass
  - `pnpm lint` -> pass
  - `pnpm -r build` -> pass (registry build + `app` `next build` both succeeded; static JSON import of `packages/registry/registry.json` resolved under Turbopack with no config changes)
  - `pnpm --filter @therealtinhtute/registry validate` -> pass (53 registry items validated)
  - `pnpm --filter @therealtinhtute/registry validate:build` -> pass (54 built registry files validated)
  - `pnpm --filter @therealtinhtute/registry e2e` -> pass (consumer install/build/SSR render-check all passed)
  - Browser probe (`pnpm --filter app dev` + `agent-browser`) on `http://localhost:3000`: initial load shows flat `Sidebar.Group`/`Sidebar.GroupLabel` ("Action", "Display", ...) as plain non-interactive text (confirmed via accessibility snapshot — group labels are not `button` elements) with one `Sidebar.MenuButton` per item; header description matches registry text for `button` ("Primary action trigger with variants, sizes, shapes, icons, loading state, and LinkButton.") and updates on nav (`badge` -> "Small status label for categorizing or highlighting content."); `window.location.hash = 'badge'` selected Badge and updated `h2`/description without a reload; clicking the sidebar's `Collapse sidebar` trigger fully hid the sidebar (no icon rail remained, confirming `collapsible="offcanvas"`), and the header trigger reopened it; hovering an inactive item (`Code`, mouse moved to its computed center) showed a light background tint with darker text while remaining non-bold, distinct from both the bold+background active item (`Badge`) and the dimmer resting items — verified in both light and dark themes via screenshots at 1280px. At 482px width (`agent-browser set viewport 482 800`): layout has no horizontal overflow in either theme; opening the sidebar at this width renders it as a full-height overlay drawer with a dimming scrim over the main content (screenshots: `/tmp/monoui-482-light.png`, `/tmp/monoui-482-dark.png`, `/tmp/monoui-482-sidebar-open.png`).
- review: APPROVED
- judge: same-session
- judge_model: claude-sonnet-5
- blockers: 0 critical, 0 major
- not_independently_verified: no independent reviewer has examined the diff; only the showroom itself was exercised, not every possible hash/slug combination (spot-checked `button` and `badge`).
- receipt: context_sources=docs/plans/active/showroom-sidebar-clarity.md,app/components/playground.tsx,packages/registry/registry.json / policy=docs/playbooks/check.md / judge=same-session / judge_model=claude-sonnet-5 / retries=0 / rollback_point=post-phase-1 commit / failure_ledger=absent / enforcement=local-only / not_independently_verified=see above
- proof_gaps: `app` has no unit-test harness (declared in plan risk); all other plan-named verification steps (including the 482px screenshots) were captured this pass

REQUEST_CHANGES

- timestamp: 2026-09-16T12:49Z
- phase: showroom-nav-and-descriptions
- mode: full
- scope: drift
- depth: standard
- proof:
  - `git rev-list --left-right --count main...HEAD` -> `0 1` (reviewed scope = sole commit e03f78d)
  - `cmp app/components/ui/sidebar.tsx packages/registry/src/components/ui/sidebar.tsx` -> exit 0, identical (R2 pass)
  - `grep -c 'active ? "font-medium text-kumo-default" : "text-kumo-subtle hover:text-kumo-default"' app/components/ui/sidebar.tsx` -> `0`, exit 1 (fail vs phase-1 recorded expectation of 2; committed sidebar.tsx keeps unconditional `font-medium` at :1423 and `text-kumo-default` at :1425 — T1.1/T1.2 task outputs absent)
  - `grep -n 'icon={Icon}' app/components/playground.tsx` -> `765:  icon={Icon}` (icon passed to every nav MenuButton)
  - `grep -cE 'Icon,$|Icon }' app/components/playground.tsx` -> `48` (net icon imports added; contradicts T2.2's recorded "9 now-unused icon imports removed")
  - `grep -n 'font-medium' app/components/playground.tsx` -> no output, exit 1 (consumer never overrides font-weight; inactive items render medium weight, R1 letter unmet)
  - `grep -nE "Sidebar\.(Collapsible|CollapsibleTrigger|CollapsibleContent|MenuSub|MenuSubButton)|openGroups|toggleGroup|Live canvas from local" app/components/playground.tsx` -> no output, exit 1 (R3 and "Live canvas" removal pass)
  - `grep -n 'collapsible="offcanvas"' app/components/playground.tsx` -> one line, `742: <Sidebar.Provider defaultOpen collapsible="offcanvas" className="h-dvh">` (R4 pass)
  - `node -e 'const registry = require("./packages/registry/registry.json"); const names = new Set(registry.items.map(i => i.name)); const fs = require("fs"); const src = fs.readFileSync("app/components/playground.tsx", "utf8"); const ids = [...src.matchAll(/\["([a-z-]+)",\s*"[A-Z]/g)].map(m => m[1]); const missing = [...new Set(ids)].filter(id => !names.has(id)); console.log("nav ids:", new Set(ids).size, "| missing:", missing.length ? missing : "none")'` -> `nav ids: 49 | missing: none` (R5 pass: every slug resolves a description)
  - `pnpm --filter @therealtinhtute/registry validate` -> pass (53 items)
  - `pnpm --filter @therealtinhtute/registry validate:build` -> pass (54 files)
  - `pnpm --filter @therealtinhtute/registry e2e` -> pass (consumer install/build/SSR render-check)
  - `pnpm --filter app typecheck` -> pass
  - `pnpm lint` -> pass
  - `pnpm -r build` -> pass
- findings:
  - critical F1 (plan contradiction): committed diff lacks phase-1 T1.1/T1.2 task outputs; phase-1 `checked` status rests on a grep that now prints 0 and on a browser probe describing the superseded in-primitive implementation — text hierarchy was moved into the showroom consumer without reconciling plan tasks/Progress.
  - critical F2 (non-goal violation): per-item icons added to the sidebar nav — Non-goals list "Adding icons, search, or new behavior to the sidebar nav"; owner decision required (amend Non-goals or remove icons).
  - major F3 (requirement unmet): R1 letter fails on committed code — inactive items render `font-medium`, not normal weight; resting/hover/active differ only by background and subtle/default text, no weight signal.
  - major F4 (non-goal-adjacent): `--sidebar-active-bg` re-pointed `--color-kumo-tint` -> `--color-sidebar-accent` in sidebar.tsx provider class; Non-goals name that token (scoped to theme.css/tokens — spirit violated: effective hover/active color changed).
  - minor F5: `registry.json` (53KB) imported into the app client bundle though only name->description is consumed.
- review: REQUEST_CHANGES
- judge: independent
- judge_model: swe-2-max
- blockers: 2 critical, 2 major
- not_independently_verified: no live browser probe was run on the committed diff — visual state behavior was assessed from code (twMerge class resolution, unconditional `font-medium`), not re-measured; bundle weight noted from file size only.
- receipt: context_sources=docs/plans/active/showroom-sidebar-clarity.md,app/components/playground.tsx,app/components/ui/sidebar.tsx,packages/registry/src/components/ui/sidebar.tsx,packages/registry/registry.json / policy=docs/playbooks/check.md / judge=independent / judge_model=swe-2-max / retries=0 / rollback_point=main / failure_ledger=absent / enforcement=local-only / not_independently_verified=see above
- proof_gaps: `app` has no unit-test harness (declared plan risk); no browser probe exists on the committed diff (recorded probe predates the approach change); security/performance reviewed manually — no issues beyond F5

APPROVED

- timestamp: 2026-09-16T13:58Z
- phase: showroom-nav-and-descriptions
- mode: full
- scope: on target (under the 2026-09-16 amended plan; diff e03f78d matches amended tasks T1.1/T1.3, T2.1-T2.4 and amended Non-goals)
- depth: standard
- proof:
  - `git rev-list --left-right --count main...HEAD` -> `0 1` (reviewed scope = sole commit e03f78d, unchanged since prior entry)
  - `cmp app/components/ui/sidebar.tsx packages/registry/src/components/ui/sidebar.tsx` -> exit 0, identical (R2)
  - `grep -n -- '--sidebar-active-bg:var(--color-sidebar-accent)' app/components/ui/sidebar.tsx` -> `499` one line (amended T1.1)
  - `grep -nE "Sidebar\.(Collapsible|CollapsibleTrigger|CollapsibleContent|MenuSub|MenuSubButton)|openGroups|toggleGroup|Live canvas from local" app/components/playground.tsx` -> no output, exit 1 (R3 + R5-clean)
  - `grep -n 'collapsible="offcanvas"' app/components/playground.tsx` -> `742` one line (R4)
  - `grep -n 'icon={Icon}' app/components/playground.tsx` -> `765` one line (amended T2.2: per-item icons wired)
  - `grep -n 'text-kumo-subtle hover:text-kumo-default' app/components/playground.tsx` -> `769` one line (T2.4 consumer hierarchy)
  - `grep -n 'font-medium' app/components/playground.tsx` -> no output, exit 1 (uniform weight per amended R1)
  - `pnpm --filter @therealtinhtute/registry validate` -> pass (53 items)
  - `pnpm --filter @therealtinhtute/registry validate:build` -> pass (54 files)
  - `pnpm --filter @therealtinhtute/registry e2e` -> pass (consumer install/build/SSR render-check)
  - `pnpm --filter app typecheck` -> pass
  - `pnpm lint` -> pass
  - `pnpm -r build` -> pass
  - Browser probe on e03f78d (`pnpm --filter app dev` + agent-browser, this session): `#sidebar` page header renders registry description; active `menu-button` computed fw500/default text/non-transparent wash, inactive fw500/subtle/transparent, hover on inactive -> bg tint + default text with weight constant (amended R1 verified in computed styles); all 49 nav items render leading svg icons; Badge click -> `#badge` + h2 + description + active update (R6); footer trigger collapse -> sidebar width 0, no rail (R4), header trigger reopens to 260px; 482px -> no horizontal overflow, full-height drawer over dimmed content. Screenshots `/tmp/monoui-full-{1280-light,1280-dark,482-light,482-dark,482-drawer}.png`.
- review: APPROVED
- judge: independent (code diff not authored by reviewer; disclosure: this reviewer authored the 2026-09-16 plan amendment encoding the owner ruling)
- judge_model: swe-2-max
- blockers: 0 critical, 0 major
- not_independently_verified: the reviewer authored the amended requirement text (Outcome 1, R1, Non-goals, task defs) that this diff is judged against — the amendment encodes an explicit owner ruling but is reviewer-written; also, only the showroom consumer was exercised (no other `MenuButton` consumers exist in-repo).
- receipt: context_sources=docs/plans/active/showroom-sidebar-clarity.md,app/components/playground.tsx,app/components/ui/sidebar.tsx,packages/registry/src/components/ui/sidebar.tsx,packages/registry/registry.json / policy=docs/playbooks/check.md / judge=independent / judge_model=swe-2-max / retries=1 (prior REQUEST_CHANGES 2026-09-16T12:49Z resolved by owner ruling + plan amendment) / rollback_point=main / failure_ledger=absent / enforcement=local-only / not_independently_verified=see above
- proof_gaps: `app` has no unit-test harness (declared plan risk); minor — 53KB `registry.json` ships to the client bundle for name->description only; stale same-session entries remain in history (append-only), superseded by Decisions 2026-09-16T13:35Z
