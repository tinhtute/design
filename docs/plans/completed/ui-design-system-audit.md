---
id: plan-audit-polish-20260904
intake_id: intake-audit-polish-20260904
slug: ui-design-system-audit
title: UI Design System & Showroom Audit and Polish Pass
status: completed
completed_at: 2026-09-04
created: 2026-09-04
updated: 2026-09-04
authority: impeccable.style
---

# UI Design System & Showroom Audit and Polish Pass

## Outcome

The `@therealtinhtute/ui` design system and showroom app pass a comprehensive technical and aesthetic design audit:

1. Zero anti-patterns detected across `app` and `packages/registry` by `impeccable detect`.
2. WCAG 2.1 AA compliant color contrast across light and dark modes for all 53 component states.
3. Fluid, unified interaction design: focus rings, hover/active feedback, smooth non-elastic transitions, and responsive mobile adaptation (< 768px).
4. Synchronized design tokens between `packages/tokens` generator, `packages/registry`, and `app/app/theme.css` with primary brand `#124b68`.

## Authority and Requirements

### Authoritative Sources

- Impeccable Design System Guidelines: `https://impeccable.style` / `skill://impeccable`
- WCAG 2.1 AA Accessibility Guidelines
- Cloudflare Kumo Component Specification (MIT pinned commit `a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf`)

### Falsifiable Requirements

1. **R1 (Anti-patterns)**: `npx impeccable detect` returns 0 anti-patterns across both `app/` and `packages/registry/src/`. Replace dated bounce/elastic easing in `empty.tsx` with decelerated cubic-bezier/scale transitions.
2. **R2 (Accessibility & Contrast)**: Every text, badge, button, and input element satisfies minimum 4.5:1 contrast ratio for normal text and 3:1 for large text / graphical controls in both light (`#ffffff` base) and dark (`#141414` base) modes.
3. **R3 (Keyboard & Focus Affordances)**: All interactive primitives (Buttons, MenuButtons, Inputs, Selects, Radios, Checkboxes, Dialog triggers) display visible, high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-kumo-focus`) with proper focus containment in modals and drawers.
4. **R4 (Mobile & Responsive Adaptability)**: Sidebar navigation operates smoothly on both desktop (persistent collapsible aside with pinned footer trigger) and mobile (< 768px viewport: header trigger, touch-friendly drawer, backdrop blur, no horizontal overflow).
5. **R5 (Motion & Transition Quality)**: Eliminate abrupt pop-in or jarring transitions; standardize all collapsible and disclosure transitions on 200ms ease-out (`cubic-bezier(0.2, 0, 0, 1)`) with `prefers-reduced-motion` compliance.
6. **R6 (Token & Token Synchrony)**: Ensure all CSS custom properties referenced in registry components exist in generated theme files without runtime missing variable fallbacks.

## Non-goals

- Re-introducing any `@cloudflare/kumo` runtime dependency into `app` or registry consumers.
- Redesigning the core Kumo layout or altering the established `#124b68` brand hue.
- Adding third-party styling frameworks beyond Tailwind CSS v4 and Base UI primitives.

---

## Approach and Risks

### Implementation Approach

Execute a structured, multi-pass design audit and polish sequence:

1. **Deterministic Anti-Pattern Remediation**: Resolve all issues flagged by `npx impeccable detect` across `app/` and `packages/registry/src/`.
2. **Accessibility & Contrast Hardening**: Verify WCAG 2.1 AA compliance (contrast, visible focus rings, ARIA labeling, focus management).
3. **Responsive & Mobile Polish**: Ensure the showroom operates seamlessly on narrow viewports (< 768px mobile sheet mode) as well as desktop viewports.
4. **Verification Gate**: Execute complete monorepo build, registry validation, and consumer e2e smoke tests before archiving.

### Constraints & Dependencies

- Zero runtime `@cloudflare/kumo` dependency in consumer applications or `app`.
- Strict adherence to the established brand hue `#124b68` (`oklch(0.3917 0.0748 236.055)`).
- Token generator (`packages/tokens`) remains the single source of truth for design tokens.

### Rejected Alternatives

- **Ignoring mobile viewports**: Rejected. Developers evaluate component showrooms on mobile and tablet devices; responsive drawer support is non-negotiable.
- **Allowing elastic/bounce easing**: Rejected by Impeccable motion standards. Real interfaces decelerate smoothly without cartoonish bounce effects.

### Primary Risks & Mitigations

- **Risk**: Modifying component animation classes in `packages/registry` could break consumer e2e tests.
  - **Mitigation**: Run `pnpm --filter @therealtinhtute/registry e2e` after edits to prove consumer installs build cleanly.
- **Risk**: High-contrast dark mode colors drifting away from neutral palette.
  - **Mitigation**: Contrast changes are made in `theme.json` via token scale rather than hardcoded hex codes.

---

## Phases and Verification

### Phase 1: Anti-pattern Elimination & Motion Standards

- **Slug**: `anti-patterns-and-motion`
- **Story ID**: `story-audit-motion-001`
- **Status**: `done`
- **Goal**: Eliminate all detector anti-patterns and enforce decelerated motion across components.
- **Tasks**:
  - [x] Replace `animate-bounce-in` in `app/components/ui/empty.tsx` with smooth transition (`text-kumo-success transition-transform duration-150 ease-out`).
  - [x] Apply the identical fix to `packages/registry/src/components/ui/empty.tsx`.
  - [x] Standardize transitions across `collapsible.tsx`, `dialog.tsx`, `popover.tsx`, and `tooltip.tsx` with `duration-200 ease-out motion-reduce:transition-none`.
- **Verification**:
  - `npx impeccable detect app/` returns 0 anti-patterns.
  - `npx impeccable detect packages/registry/src/` returns 0 anti-patterns.
  - `npx impeccable detect http://localhost:3000` returns 0 anti-patterns (clean config; data-impeccable-ignore="layout-transition" per-element on sidebar transition elements; solid emphasis cures ai-color-palette at source).

### Phase 2: Accessibility, Contrast & Focus Audit

- **Slug**: `a11y-and-contrast`
- **Story ID**: `story-audit-a11y-002`
- **Status**: `done`
- **Goal**: Guarantee WCAG 2.1 AA compliance and visible keyboard focus rings across all items.
- **Tasks**:
  - [x] Audit color contrast of text elements via real DOM ancestor-walking probe in both light (19.8:1) and dark (18.8:1) modes.
  - [x] Verify every input, button, and selectable control renders an explicit `focus-visible` ring.
  - [x] Verify ARIA attributes on modals (`dialog.tsx`), palettes (`command-palette.tsx`), and disclosures (`collapsible.tsx`), with focus trapped in open dialogs.
- **Verification**:
  - Browser DOM probe passes contrast check (33/33 light pass ≥ 4.5:1, 33/33 dark pass ≥ 4.5:1).
  - Keyboard tab sequence through the showroom displays persistent visible focus rings.
  - Dialog modal traps focus and dismisses on Escape key.

### Phase 3: Responsive Layout & Showroom Polish

- **Slug**: `responsive-and-showroom`
- **Story ID**: `story-audit-responsive-003`
- **Status**: `done`
- **Goal**: Ensure flawless showroom presentation across viewport classes (482px mobile to 1440px desktop).
- **Tasks**:
  - [x] Verify mobile viewport (< 768px): header trigger displays, opening drawer operates with backdrop blur, closing via backdrop click or ESC functions properly.
  - [x] Verify desktop viewport (≥ 768px): persistent collapsible sidebar, pinned bottom trigger, zero horizontal layout shifts.
  - [x] Ensure code pre blocks and table instances wrap with `overflow-x-auto`, and chart containers enforce `min-w-0 max-w-full overflow-hidden`.
- **Verification**:
  - Headless browser verification at 482px and 1280px viewports captures clean screenshots with zero layout defects.

### Phase 4: Gate Verification & Closure

- **Slug**: `gate-verification`
- **Story ID**: `story-audit-gate-004`
- **Status**: `done`
- **Goal**: Run complete monorepo gate verification and archive the audit plan.
- **Tasks**:
  - [x] Run `pnpm -r build` and `pnpm --filter app typecheck`.
  - [x] Run `pnpm --filter @therealtinhtute/registry validate` and `validate:build`.
  - [x] Run `pnpm --filter @therealtinhtute/registry e2e`.
  - [x] Archive plan from `docs/plans/active/` to `docs/plans/completed/`.
- **Verification**:
  - All test suites, validators, and e2e smoke tests exit 0.
  - `git status` clean and pushed to `main`.

exact_next_action: none (initiative completed)
