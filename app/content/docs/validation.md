# Validation

Every change is proven by commands, not by description. Run them from the
repository root.

## Gates

```bash
pnpm --filter @therealtinhtute/registry validate        # schema-check registry.json
pnpm --filter @therealtinhtute/registry validate:build  # validate built output
pnpm --filter @therealtinhtute/registry e2e             # consumer-install smoke test
pnpm --filter app typecheck                             # next typegen + tsc --noEmit
pnpm --filter app a11y                                  # axe sweep: 50 demos × light/dark + ⌘K palette
pnpm --filter app visual                                # screenshot snapshots against committed baselines
pnpm lint                                               # eslint, including the design-system rules
pnpm -r build                                           # turbo build across the monorepo
pnpm format                                             # prettier --write
```

The axe sweep and the visual snapshots need a production build
(`pnpm --filter app build`) for the served pages; the axe script starts and
stops its own server when `A11Y_BASE_URL` is unset.

## Visual snapshots

`pnpm --filter app visual` compares every showroom page, in both themes, against
the baselines committed beside the spec. When a change is intentional:

```bash
pnpm --filter app visual:update
```

Review the rewritten PNGs in the diff before committing them — a baseline
update is a design decision, not a formality.

## Continuous integration

- `registry.yml` — on pushes to `main`: lint, typecheck, token generation,
  registry build and validation, consumer e2e, then deploy.
- `a11y.yml` — on pull requests: the axe sweep against a production build.
- `visual.yml` — on pull requests: the screenshot snapshots, uploading the diff
  output when they fail.

A pull request is ready when its gates are green and the diff matches the
intent recorded in its plan.
