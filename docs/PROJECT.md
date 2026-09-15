# PROJECT — identity

## What is this project?
- `@therealtinhtute/ui` is an open-source, source-first shadcn/ui registry and design system porting the full Kumo component catalog with custom `#124b68` brand tokens.

## Who is it for?
- Frontend engineers and product teams building modern web applications who want enterprise-grade Base UI + Phosphor components via standard `shadcn add`.

## Non-goals
- Runtime dependency on `@cloudflare/kumo` package in consumer applications.
- Proprietary Cloudflare trademarks or deprecated components.
- Closed npm UI package distribution.

## How do we run the tests?
- `pnpm build`
- `pnpm --filter app typecheck`
- `pnpm --filter @therealtinhtute/registry validate && pnpm --filter @therealtinhtute/registry validate:build`
- `pnpm --filter @therealtinhtute/registry e2e`

## Architecture in one breath
- runtime shape: Monorepo with Turborepo: Next.js specimen showroom (`app`), static shadcn registry (`packages/registry`), token/theme generator (`packages/tokens`).
- where state lives: Static JSON metadata (`registry.json`, `public/r/*.json`) and design tokens (`theme.json`).
- entrypoints: Showroom at `app/app/page.tsx`, registry distribution endpoint at `packages/registry/public/r/`.

## What are we working on right now?
- plan: docs/plans/active/ui-design-system-audit.md (active)
