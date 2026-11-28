# Getting started

Find a component in the [showroom](/), try its demo, then open **Code** for
the install command. Start with the [Button demo](/#button).

## Configuration

In your React + Tailwind project, run `pnpm dlx shadcn init` if you do not
have a `components.json` yet. Merge this entry into `registries`, keeping the
rest of your configuration and any other registries:

```json
{
  "registries": {
    "@therealtinhtute": "https://design.tinhtute.me/r/{name}.json"
  }
}
```

## Theming

Install the theme once to add the CSS variables for light and dark modes.
Review the stylesheet changes if your app already defines a theme.

```bash
pnpm dlx shadcn add @therealtinhtute/theme-default
```

## Install your first component

```bash
pnpm dlx shadcn add @therealtinhtute/button
```

The CLI resolves the component, its dependencies and attribution. Import
`Button` from `@/components/ui/button` (or your configured UI alias) and
render `<Button>Save changes</Button>`.

## Next steps

- Return to the [Button demo](/#button) for examples and props.
- Read [Theming](/docs/theming) to customize tokens, or [Registry](/docs/registry)
  to learn what gets installed.
