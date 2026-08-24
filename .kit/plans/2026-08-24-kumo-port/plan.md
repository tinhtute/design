# Port Cloudflare Kumo components into @therealtinhtute/ui

Date: 2026-08-24 · Status: awaiting approval
Upstream: https://github.com/cloudflare/kumo (MIT) — pin commit at implementation start, record hash here.

## Goal

Clone Kumo component source into the monoui shadcn registry so components ship through the existing registry CI/CD, themed with the repo's own primary color (`--primary` from `packages/tokens/src/themes/default/theme.json`). Wave 1 scope: **button, badge, input** (+ transitive Kumo deps).

## Approach: token bridge, not class rewrite

Keep Kumo's internal class vocabulary (`bg-kumo-base`, `ring-kumo-line`, …) inside ported files. Add a **kumo-compat variable layer** to the theme pipeline that maps kumo semantic tokens onto the existing palette:

| kumo token | routes to |
|---|---|
| `kumo-brand` | `var(--primary)` |
| `kumo-danger` | `var(--destructive)` |
| `kumo-base` / `kumo-tint` | `var(--background)` / `var(--muted)` (confirm visually) |
| `kumo-line` / `kumo-hairline` | `var(--border)` |
| `kumo-default` / `kumo-strong` | `var(--foreground)` |
| `kumo-subtle` | `var(--muted-foreground)` |
| status hues (success/warning/info, badge red/green/orange/purple/teal/blue) | Kumo's own values (no shadcn equivalent; primary-driven tokens are what rebrand) |

Implementation: extend `packages/tokens` generator with a kumoCompat mapping → emitted as extra `cssVars` entries (`--color-kumo-*`) on the existing `theme-default` registry item. This is exactly how the item already maps `--color-primary` etc., so consumer Tailwind v4 picks up `bg-kumo-*` utilities automatically.

Rejected alternative: rewriting every class string to shadcn tokens — high churn per component, loses upstream sync fidelity, and Kumo's runtime vars (`--kumo-button-emphasis-bg`, `color-mix` gradients) would still need porting by hand.

## New dependencies (registry devDeps + registryItem `dependencies`)

- `@phosphor-icons/react` — Button icon prop, Badge icon slot (Kumo's icon system; not swapping for lucide)
- `@base-ui/react` — Input primitive (confirmed import in kumo input.tsx)

## Ported items (wave 1)

Registry item names prefixed `kumo-`; source under `src/components/kumo/` to avoid collision with existing shadcn `ui/button`. Export names stay Kumo's (`Button`, `Badge`, `Input`). Each ported file gets header: `Adapted from cloudflare/kumo (MIT), commit <hash>`.

| Item | Files | Transitive Kumo deps |
|---|---|---|
| `kumo-badge` | badge.tsx + resolve-variant util | none |
| `kumo-button` | button.tsx | `kumo-loader`, `kumo-tooltip`, phosphor |
| `kumo-input` | input.tsx | `kumo-field`, `@base-ui/react/input` |

Shared utils (`resolve-variant`, `link-provider`) copied into the kumo folder and shipped as part of the first item that needs them.

## Phases (each independently mergeable & publishable)

1. **Badge + token bridge**: generator emits kumoCompat vars; port badge; full local gate green; push → CI deploys.
2. **Button**: port loader, tooltip, button; add phosphor dep; gate green.
3. **Input**: port field, input; add base-ui dep; gate green.

Verification per phase (existing pipeline): `pnpm build && pnpm typecheck && pnpm validate && pnpm validate:build && pnpm e2e`; extend e2e smoke to fetch each new `/r/<item>.json` asserting 200 JSON. Manual acceptance: install item via `npx shadcn@latest add <url>/r/kumo-badge.json` into a scratch Vite+Tailwind v4 app with a non-neutral `--primary`, render light + dark, screenshot.

## Risks

- **Fragile assumption**: consumer projects run Tailwind v4 (spacing like `h-6.5`, `light-dark()`, `@theme inline` cssVars). Registry is already v4-shaped; declare v4 as a requirement in item descriptions rather than supporting v3.
- Kumo's dark mode uses `color-scheme`/`light-dark()` vs this repo's `.dark` class — mapping layer must emit per-mode values consistent with the existing generator output; verify dark screenshots in acceptance.
- Upstream drift: pinned commit recorded; re-sync is manual.

## Out of scope

Remaining 40 Kumo components, Figma plugin/token sync, Base UI primitives re-export, Tailwind v3 support, renaming Kumo exports.
