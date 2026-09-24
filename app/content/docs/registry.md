# Registry

The registry ships source, not a package: components are copied into your tree
and you own the code. There is no runtime dependency on a vendor UI package.

## Install an item

```bash
pnpm dlx shadcn add @therealtinhtute/button
```

`components.json` points at the registry once; every later `add` resolves the
item, its `registryDependencies`, and its license metadata for you. Files land
under your `@/components/ui` alias and can be edited freely.

## What ships

- **UI primitives** — Base UI behaviour with the mono token layer, one item per
  component, each with its own `registryDependencies`.
- **Blocks and patterns** — `dashboard`, `page-header`, `resource-list-page`,
  `data-table`, `filter-bar`, `delete-resource`.
- **Theme and infra** — `theme-default`, `utils` (`cn`, variant resolution,
  link and portal providers), and `third-party-licenses` (the Cloudflare Kumo
  MIT notice).

## How an item is authored

`registry.json` is the manifest: each item declares its `name`, `type`,
`description`, `dependencies`, `registryDependencies`, and the `files` that
copy into a consumer project. `shadcn build` turns the manifest into the static
payload under `packages/registry/public/r/`, which the showroom also serves.

Component conventions:

- Variants are exported as `KUMO_<COMPONENT>_VARIANTS` maps with a matching
  default map, resolved through `resolveVariant`.
- Icons are Hugeicons elements or nodes, standardised on one icon prop shape.
- Components carry JSDoc on their props; the showroom generates its props
  tables from those exported types at prerender, so the docs cannot drift from
  the code.

`packages/registry/src/components` is canonical; `app/components` mirrors it
byte-for-byte so the showroom renders exactly what consumers install.

## Validation

```bash
pnpm --filter @therealtinhtute/registry validate        # manifest + dependency closure
pnpm --filter @therealtinhtute/registry validate:build  # built payload against the schema
pnpm --filter @therealtinhtute/registry e2e             # fresh consumer install + SSR render
```

The e2e smoke test installs the whole catalog into a temporary consumer,
builds it, and asserts the theme tokens and rendered output — the same path a
consumer takes.
