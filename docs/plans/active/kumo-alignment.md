---
id: plan-kumo-alignment-20261020
intake_id: intake-kumo-alignment-20261020
slug: kumo-alignment
title: Kumo design-rule alignment and 2.15.0 catalog catch-up
status: active
lane: normal
input_type: new-initiative
created: 2026-10-20
updated: 2026-11-11
---

# Kumo design-rule alignment and 2.15.0 catalog catch-up

## Outcome

1. **Registry rule pass** — the 44 registry UI components obey the 15 Kumo
   design rules in `.claude/skills/kumo-design/SKILL.md`, with every colour
   token in `DESIGN.md` unchanged.
2. **Showroom redesign** — the whole `app` showroom (Playground home and
   `/docs`) is redesigned from one owner-chosen direction out of 2–3 mocks;
   navigation, grouping, routes and page layout may change; chrome and demos
   obey the same rules, tokens unchanged.
3. **Catalog catch-up** — the registry ships the 9 items present in the Kumo
   2.15.0 catalog but missing locally, and the source pin moves to 2.15.0.

## Authority and Requirements

### Authoritative Sources

- `.claude/skills/kumo-design/SKILL.md`: the 15 rules (mirror of upstream
  `packages/kumo-docs-astro/src/components/skill/design-tips.tsx`, unchanged
  between pin `a5800aa` and 2.15.0).
- `DESIGN.md`: locked colour tokens — primary `#124b68`, focus ring,
  border/line, light/dark background, placeholder contrast ≥ 4.5:1, status
  hues. Its Typography line `tracking-tight` is overridden by the user's
  decision (Decisions, 2026-10-20).
- Catalog authority: `https://unpkg.com/@cloudflare/kumo@2.15.0/ai/component-registry.json`
  (54 entries); source tag `@cloudflare/kumo@2.15.0` →
  `d0fb43fed66e509eea953a5934359583b7854795` (resolve to commit in P3-W1).
- `docs/plans/completed/kumo-full-catalog.md`: the port pattern (canonical
  names, Base UI primitives, MIT + pin header, `third-party-licenses`
  dependency, showroom demo per item). Icons are Hugeicons per
  `hugeicons-migration.md`.
- `docs/PROJECT.md`: gate commands. `AGENTS.md`: feature branch + PR.

### Falsifiable Requirements

1. **R1 (tokens locked)**: `git diff main -- packages/tokens DESIGN.md` shows no
   change to any colour value; only the Typography tracking line and the Kumo
   section may change in `DESIGN.md`.
2. **R2 (registry rules)**: a rule-by-rule audit table for all 44 components
   exists in Progress; each finding is fixed or recorded as a justified
   exception in Decisions. Mechanical probes over
   `packages/registry/src/components/ui` return 0: `font-bold`, `tracking-`,
   hover `transition-colors`, `uppercase` on headings.
3. **R7 (redesign direction)**: 2–3 distinct mocks of the showroom exist and
   the owner's chosen one is recorded in Decisions before any showroom code
   changes; the shipped showroom matches it, every registry item stays
   reachable from navigation and keeps its demo, code and props views.
4. **R3 (showroom rules)**: the same audit and probes over `app/` (excluding
   `app/components/ui`, which mirrors the registry) return 0 or justified
   exceptions.
5. **R4 (catalog)**: `registry.json` contains `button-group`,
   `date-range-picker`, `globe-map`, `inline-copy-text`, `layer-dialog`,
   `menubar`, `slider`, `surface`, `tag-input`; each file has the MIT + 2.15.0
   pin header, depends on `third-party-licenses`, and has a showroom demo.
6. **R5 (pin)**: every ported/updated source header and
   `kumo-source-manifest.json` cite the 2.15.0 commit; README item counts match
   `registry.json`.
7. **R6 (gates)**: registry validate / validate:build / e2e, app a11y (0
   violations), visual (baselines updated only after each diff is reviewed),
   typecheck, lint, `pnpm -r build` all exit 0.

## Non-goals

- No colour token value changes; no new palette.
- No Flow (absent from the 2.15.0 catalog); no `cloudflare-logo`.
- No behaviour back-port of the 34 upstream-touched existing components beyond
  what a rule fix needs — drift fixes are a separate initiative.
- No change to docs content (prose) or registry component APIs as part of the
  showroom redesign.

## Approach and Risks

### Implementation Approach

Audit-then-fix per surface, smallest blast radius first: registry components
(source of truth) → showroom → new items. Each rule is applied by its intent:
`content-text-size` targets content text (14px = `text-sm`), not headings;
`hover-color-transitions` removes colour transitions on hover only;
`shadow-borders` keeps the border or the shadow per element, never both.
Visual baselines are regenerated per phase after a screenshot-diff review.
New items follow the existing port pattern (copy upstream source at the pin,
swap icons to Hugeicons, map Kumo tokens to our theme, add registry entry +
demo).

### Constraints & Dependencies

- P2 depends on P1 (showroom mirrors registry components in `app/components/ui`).
- P3 depends on P1 so new items land already rule-compliant.
- Hugeicons replaces Phosphor in every new item; any icon without a Hugeicons
  match stops and escalates.

### Rejected Alternatives

- One big-bang PR: screenshot diffs too large to review; rollback loses P3.
- Adopting Kumo's own palette: violates the locked tokens.

### Primary Risks & Mitigations

- **Blind baseline updates** hide regressions → diff each changed snapshot
  before `visual:update`; record counts in Progress.
- **Over-applying `content-text-size`** shrinks headings/display text → only
  content/interactive text changes; headings keep their scale.
- **New items need tokens missing from our theme** (e.g. `surface`) → map to
  existing tokens; if impossible, stop and ask (token lock).
- **GlobeMap pulls a heavy geo dependency** → check bundle/dependency before
  porting; escalate if a new runtime dependency is required.

Recovery: each phase is its own commit set; revert per phase.

## Phases and Verification

### Phase 1: Registry rule pass

- **Slug**: `registry-rules`
- **story_id**: story-registry-rules-20261020
- **Status**: checked
- **Goal**: R1, R2.
- **Surfaces**: `packages/registry/src/components/ui/**`, `app/components/ui/**`
  (mirror), `DESIGN.md` Typography line. Avoid: `packages/tokens/**`.
- **Waves/Tasks**:
  - W1-T1: audit all 44 components against 15 rules; write the table to
    Progress. Check: table covers 44 × 15.
  - W1-T2: fix findings (drop `tracking-tight`, remove hover colour
    transitions, resolve shadow+border, text sizes, icon alignment, radii).
    Check: R2 probes = 0; `git diff main -- packages/tokens` empty.
  - W1-T3: gates. Check: registry validate/validate:build/e2e, app a11y,
    typecheck, lint, build; visual diff reviewed then `visual:update`.
- **Stop**: a fix requires a token value change.

### Phase 2: Showroom redesign

- **Slug**: `showroom-redesign`
- **story_id**: story-showroom-rules-20261020
- **Status**: in progress
- **Depends on**: `registry-rules`
- **Goal**: R1 and R7, then R3 and R6 on the gates wave.
- **Surfaces**: `docs/mocks/showroom-redesign/**` and this plan, then shared
  chrome in `app/app/layout.tsx`, `app/app/globals.css`, and a shared module
  under `app/components/`. After shell, Playground and docs chrome run in
  parallel. The gates wave is the only writer of
  `app/visual/__screenshots__/**`. Leave colour values in
  `app/app/theme.css` unchanged. Also leave `packages/tokens/**`,
  `app/content/docs/**`, `app/components/ui/**`, and `packages/registry/**`
  unchanged.
- **Waves/Tasks**:
  - **Mocks.** Done. The three direction images are in
    `docs/mocks/showroom-redesign/`. Decisions names A Refine designeer.
    Check that the branch diff lists no `app/` or `packages/` paths.
  - **Shell.** Put the same designeer frame on `/` and `/docs`. Keep the
    brand mark, dashed hairlines, and mono index labels. Do not rewrite
    Playground `GROUPS`. Do not edit docs prose. Check that both routes
    share that frame and that colour tokens stay unchanged.
  - **Playground and docs.** Run these in parallel after shell. Playground
    tightens grouping and the specimen layout. It keeps all 59 sidebar
    slugs, Demo, Code, and Props, `/#slug`, and Search (Meta+K). Docs
    aligns its chrome to the shared shell and keeps
    `nav[aria-label="Docs"]`. Check that each change stays in its own
    file list.
  - **Gates.** Run `pnpm --filter app a11y`. Review screenshot diffs, then
    run `visual:update`, then `pnpm --filter app visual`. Record counts in
    Progress. Set this phase to checked when the R3, R7, and R6 app gates
    pass.
- **Stop**: a change needs a colour token edit.

### Phase 3: Catalog catch-up to 2.15.0

- **Slug**: `catalog-2-15`
- **story_id**: story-catalog-2-15-20261020
- **Status**: checked
- **Depends on**: `registry-rules`
- **Goal**: R4, R5.
- **Surfaces**: `packages/registry/src/components/ui/*`,
  `packages/registry/registry.json`, `app/demos/**`, showroom nav,
  `docs/plans/completed/kumo-source-manifest.json`, README.
- **Waves/Tasks**:
  - W3-T1: resolve the 2.15.0 commit; port leaf items (`surface`, `slider`,
    `inline-copy-text`, `button-group`, `tag-input`). Check: files + headers +
    registry entries; `validate` passes.
  - W3-T2: port composed items (`layer-dialog`, `menubar`,
    `date-range-picker`, `globe-map`). Check: same.
  - W3-T3: demos for all 9; repin manifest + headers; README counts. Check:
    `rg -L <2.15.0 sha>` over ported headers empty; counts match.
  - W3-T4: full gate set (R6); move plan to `docs/plans/completed/`; commit,
    push branch, open PR.
- **Stop**: new runtime dependency or token needed; upstream source not
  matching the catalog entry.

## Progress

- 2026-10-20 | phase: registry-rules | wave: W1 | task: W1-T1/T2 audit+fix | task_status: DONE | verification: 3 parallel audits (forms 14, overlays 14, display 16) over all 15 rules; 29 registry files changed; probes `font-bold|tracking-|uppercase` = 0; hover `transition-colors` removed; exceptions: switch state transition, xs/sm `text-xs` compact API, opacity reveals, fill-only highlight radii, LayerCard `p-4`, legend KPI `text-lg`, mono = body 14px (no 13px step) | surfaces: packages/registry/src/components/ui/*, DESIGN.md
- 2026-10-20 | phase: registry-rules | wave: W1 | task: W1-T3 gates | task_status: DONE | verification: baselines were stale since b9f3f0a (101/101 failing on main) → regenerated from main in a worktree (101 passed) and committed 1fc1637; `app/components/ui` found to be a hand mirror, not synced by build → mirrored (`diff -rq` empty); visual then failed 48 (24 demos, max ratio 0.02, reviewed: button text size, table props) → updated, 101 passed; build, validate:build, e2e, app typecheck, lint, a11y 109/0 pass; `git diff main -- packages/tokens` empty | surfaces: app/components/ui/*, app/visual/__screenshots__/*
- 2026-10-20 | phase: catalog-2-15 | wave: W3 | task: W3-T1..T3 port | task_status: DONE | verification: worktree commit e021a93 merged; 9 items with MIT + 69ff967 headers, registry 62 items, demos + nav wired, manifest repinned, README counts; globe-map uses existing d3-geo + bundled land mask (no new dependency) | surfaces: packages/registry/**, app/demos/*, app/components/playground.tsx, README.md, kumo-source-manifest.json
- 2026-10-20 | phase: catalog-2-15 | wave: W3 | task: W3-T4 gates | task_status: DONE (PR pending) | verification: validate 62, build, validate:build, e2e, app typecheck, lint, a11y 127/0; visual 118 failed only on sidebar nav shift + 18 new snapshots (reviewed button diff, menubar and globe-map actuals) → updated, 119 passed | surfaces: app/visual/__screenshots__/*, .claude/skills/kumo-design/SKILL.md
- 2026-11-11 | phase: showroom-redesign | wave: mocks | task: direction A | task_status: DONE | verification: Decisions names A Refine designeer; three pngs under docs/mocks/showroom-redesign/; diff against feat/showroom-redesign has no app/ or packages/ paths | surfaces: docs/plans/active/kumo-alignment.md
- 2026-11-12 | phase: showroom-redesign | wave: shell | task: shared chrome | task_status: DONE | verification: new `app/components/site-frame.tsx` (SiteBrand, SiteBar, SiteIndexLabel); `/` swaps brand + header to it, `/docs` becomes rail (brand + Docs nav, dashed right hairline) + SiteBar; frame probe on `/`, `/docs`, `/docs/theming` × light/dark 6/6 (bar dashed, brand in rail at x=12, rail dashed, one h1, Site nav aria-current); typecheck, `pnpm -r build`, a11y 127/0 pass; app lint 81 errors identical on base checkout (all in untouched `components/ui/**`, `dashboard.tsx`), changed files clean; diff vs feat/showroom-mocks empty over theme.css, tokens, content/docs, components/ui, registry, screenshots; GROUPS unchanged; R3 probes in site-frame = 0; visual 116 pass / 3 fail, not updated: docs-pages (expected shell change; also stale TOC case from 3f9859a), date-range-picker light/dark (calendar shows current month — date-dependent, pre-existing) | surfaces: app/components/site-frame.tsx, app/components/playground.tsx, app/components/docs-shell.tsx
- 2026-11-12 | phase: showroom-redesign | wave: shell | summary: one frame on both routes from a shared module; layout.tsx and globals.css unchanged (slots fit better than a root frame because Playground's bar holds client state); Playground/docs inner chrome (docs nav bullets + hover transitions, Demo/Code/Props tabs) left for their waves
- 2026-11-12 | phase: showroom-redesign | wave: shell | task: shared chrome fix + re-verify | task_status: DONE | verification: `.mono-doc a` (unlayered, docs.css) recoloured SiteBar links on /docs → `mono-doc` scoped to docs `<main>`; probe now also compares computed Site-nav link colour/size/decoration per aria-current state across routes: identical, current ≠ non-current; 390px: `/` no overflow, `/docs` bar fits but page scrollWidth 438 from `pre.shiki` without overflow-x (docs prose CSS, pre-existing); a11y 127/0; correction: documented lint gate `pnpm lint` exits 0 on this branch and base — the earlier "81 errors" came from `pnpm --filter app lint`, not a gate | surfaces: app/components/docs-shell.tsx

## Current State and Next Action

- Active phase: `showroom-redesign`
- lifecycle_status: in progress
- Branch: `feat/showroom-shell` (base `feat/showroom-mocks`)
- Blockers: none
- Open items: shell work is uncommitted on `feat/showroom-shell`; date-range-picker baselines are date-dependent (gates wave must review, consider freezing the demo date); docs-pages visual test stops at its first mismatch, so the other docs snapshots are uncompared; `/docs` overflows at 390px from `pre.shiki` (docs wave).
- exact_next_action: Commit the shell wave on `feat/showroom-shell`, then run Playground and docs waves in parallel from it — Playground in `app/components/playground.tsx` (tighten grouping, specimen layout, Demo/Code/Props); docs in `app/components/docs-shell.tsx` + `app/app/docs/docs.css` (R3 hover transitions, code-block overflow), each in its own file list.

## Decisions

- 2026-10-20 | scope | All `DESIGN.md` colour tokens locked; scope = registry +
  showroom; port new catalog items in this initiative.
- 2026-10-20 | typography | Kumo `font-tracking` wins over `DESIGN.md`
  `tracking-tight` for headings.
- 2026-10-20 | catalog | Follow the 2.15.0 catalog: drop Flow (not listed), add
  GlobeMap (listed, new since 2.13.0).

- 2026-10-20 | showroom-redesign | Owner chose to fold a full showroom redesign
  (Playground + `/docs`, IA may change) into this plan instead of the P2
  rule-only pass; direction picked from 2–3 mocks. P2 phase definition needs
  `to-plan` to re-plan it around R7.

- 2026-10-20 | text-scale | Kumo's theme maps text-base to 14px; our Tailwind default is 16px, so ported `text-base` content text becomes `text-sm`. `Text` keeps variant name `base` (API unchanged) with class `text-sm`.
- 2026-11-11 | showroom-redesign | direction A Refine designeer. Keep dashed hairlines and mono index labels. Tighten grouping. Playground and docs share one chrome. Colour tokens stay locked. Phase 2 in this plan is the re-plan the 2026-10-20 entry left open.
- 2026-11-11 | text-scale | `--text-2xs` index labels stay at `0.625rem`. `content-text-size` sets content text at 14px. Those labels are the mono index numbers in Playground and docs. They are chrome, not content text. The smaller size is a justified exception. Do not edit colour tokens in `app/app/theme.css`. Shell may change the label size later. It must leave those colour values unchanged.
- 2026-11-12 | showroom-redesign / shell | Shell lives in a shared module (`app/components/site-frame.tsx`) consumed by `playground.tsx` and `docs-shell.tsx`; `app/app/layout.tsx` and `globals.css` stay unchanged although the wave listed them. Rationale: Playground's bar holds client state (search, sidebar trigger), so slots fit better than a root-layout frame.
- 2026-11-12 | showroom-redesign / shell | `/docs` was restructured into rail + stage, beyond an import-and-swap, because mock A's markup is a rail with the brand on top and a dashed right hairline. A slim top bar stays over the stage on both routes, although mock A shows none, to keep Search (Meta+K), section links, and the theme toggle reachable.

## Validation
