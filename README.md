# @therealtinhtute/design

A source-first [shadcn](https://ui.shadcn.com) registry porting the Cloudflare
Kumo component catalog — built on Base UI primitives and Hugeicons icons, with a
design-token theme (`#124b68` brand). Components install directly into your
source tree; there is no runtime dependency on `@cloudflare/kumo`.

The registry ships 53 items: 44 UI primitives, 4 blocks, 2 patterns
(`data-table`, `filter-bar`), the `theme-default` theme, the
`third-party-licenses` attribution file, and the `utils` helper lib.

## Install

Configure the registry once in `components.json`, then add components with the
shadcn CLI:

```bash
pnpm dlx shadcn add @therealtinhtute/button
pnpm dlx shadcn add @therealtinhtute/theme-default
```

Each item's source is copied into your project (e.g. `components/ui/button.tsx`)
— you own the code and can edit it freely.

## Development

This is a pnpm + Turborepo monorepo:

- `packages/registry` — canonical component sources and the registry builder
- `packages/tokens` — theme/token generation
- `app` — Next.js showroom (`mono`) previewing every component with usage
  notes, copyable source, and install commands

Run the showroom:

```bash
pnpm install
pnpm --filter app dev
```

## Validation

Gate commands for changes (full list and project conventions in
[`docs/PROJECT.md`](docs/PROJECT.md)):

```bash
pnpm --filter @therealtinhtute/registry validate        # schema-check registry.json
pnpm --filter @therealtinhtute/registry validate:build  # validate built output
pnpm --filter @therealtinhtute/registry e2e             # consumer-install smoke test
pnpm --filter app typecheck && pnpm lint && pnpm -r build
```

---
- 22.09.2026
