# Theming

Every token ships as a CSS variable, so a theme swap never touches component
code. Install the theme item once:

```bash
pnpm dlx shadcn add @therealtinhtute/theme-default
```

The item writes the token layers into your stylesheet: the `@theme inline`
bridge that maps `--color-*` utilities onto the semantic variables, the light
`:root` values, and the `.dark` overrides.

## Token layers

- **Primitives** — `--background`, `--foreground`, `--primary`, `--border`,
  `--radius`, and the `--chart-*` ramp.
- **Kumo compatibility** — `--kumo-*` fills, lines and surfaces used by the
  ported components, plus the `--text-color-kumo-*` text bridge.
- **Utilities** — the vendored Kumo class layer (`animate-*`, `skeleton-line`,
  `no-scrollbar`, …) that the components reference by name.

## Light and dark

Dark mode is the `.dark` class plus a `data-mode="dark"` attribute on the root
element; both are set together so CSS and component logic agree.

```tsx
const root = document.documentElement;
const next = root.getAttribute('data-mode') !== 'dark';
root.setAttribute('data-mode', next ? 'dark' : 'light');
root.classList.toggle('dark', next);
```

## Brand values

- Primary: `#124b68` — `oklch(0.3917 0.0748 236.055)` light,
  `oklch(0.52 0.105 223.128)` dark.
- Focus ring: `oklch(15% 0 0)` light, `oklch(93.5% 0 0)` dark.
- Radius: `0.625rem`, scaled proportionally for `sm`/`md`/`lg`/`xl`.
- Type: Archivo for sans, Google Sans Code for mono, Xanh Mono for the serif
  and heading slots.

Text tokens carry a contrast floor: placeholder text and warning text are
lightness-tuned per mode so both clear 4.5:1 on the surfaces they sit on.

## Where the tokens live

`packages/tokens/src` is the source of truth. `pnpm --filter
@therealtinhtute/tokens generate` writes `dist/themes/default.css` and
`dist/registry/theme-default.json`, which are then synced into `app/app/theme.css`
and the `theme-default` item in `registry.json`. Editing generated output
directly is drift — change the generator and regenerate.
