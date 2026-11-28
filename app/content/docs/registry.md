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

## Compose a worker inventory

Start on [Dashboard](/#dashboard): keep summary metrics in the overview and use
an informational `Banner` with a link to the task, not a destructive action.
The [worker inventory](/#resource-list-page) combines `ResourceListPage`,
`FilterBar`, and `DeleteResource`. Open its **Code** tab for the copyable
mini-app. The demo uses local data; refreshing and deleting do not contact a
server.

- [Filter bar](/#filter-bar): keep draft and applied queries separate. Apply
  with the button or Enter in the field. Clearing the draft is not applying it.
  Announce the result count and distinguish no matches (offer Reset filter) from
  an inventory with no deployments.
- Refresh: keep the last loaded data usable while a labeled `Loader` is
  visible. In the demo the first refresh fails; an error `Banner` gives context,
  and the same control becomes **Retry refresh**. A successful retry clears
  the message and confirms the refresh.
- [Delete resource](/#delete-resource): confirm the exact name, pass
  `isDeleting` during the request, and keep the confirmation and row on failure.
  The dialog demo lets you retry a simulated failure. On success, remove the
  row in the app, announce the change, and move focus to a stable heading if
  the original row action is gone. On cancel, keep the row and return focus
  to its action.
- At 320 px, let filters and row actions wrap. Keep a wider data table in its
  own scroll region rather than widening the page.

### Compose with primitives and HTML

- Use `Collapsible.DefaultTrigger` and `Collapsible.DefaultPanel` for one
  disclosure, such as **About worker states**. This is not a multi-section
  Accordion with coordinated expansion or arrow-key navigation.
- Use `ul`/`li` for unordered resources or `ol`/`li` for sequenced steps.
  Nest links and buttons in the item as separate controls; a list is not a
  keyboard-managed listbox. Use `hr` between different topics and a CSS border
  for purely decorative lines (including vertical ones).
- For images, use HTML `img` with intrinsic dimensions, responsive CSS, and
  `srcset` for density variants (or `picture` for art direction). For example:

  ```html
  <img src="/worker-topology.png" srcset="/worker-topology@2x.png 2x"
       width="320" height="180" alt="Two regions route traffic to the worker"
       style="max-width: 100%; height: auto">
  ```

  If loading fails, use the app's image error handler to replace the broken
  image with text covering the same information. Use `alt=""` for decoration.
  Neither HTML alone nor the registry supplies an automatic fallback policy.
- Use a structured `Banner` for longer notices; use its `action` slot for a
  supplementary action or an inline link when that fits better at narrow
  widths. A Banner is not automatically a live alert: reserve `role="alert"`
  for newly surfaced urgent errors, not persistent information.

There is no Avatar or Carousel registry item. Prefer a text identity or static
card list until a product flow needs behavior beyond those alternatives.

## Validation

```bash
pnpm --filter @therealtinhtute/registry validate        # manifest + dependency closure
pnpm --filter @therealtinhtute/registry validate:build  # built payload against the schema
pnpm --filter @therealtinhtute/registry e2e             # fresh consumer install + SSR render
```

The e2e smoke test installs the whole catalog into a temporary consumer,
builds it, and asserts the theme tokens and rendered output — the same path a
consumer takes.
