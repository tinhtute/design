# Getting started

Install any component with the shadcn CLI — the registry resolves the
component, its dependencies, and the license metadata for you:

```bash
pnpm dlx shadcn add @therealtinhtute/button
```

Inline code works too: use `` `npx shadcn add @therealtinhtute/code{:bash}` `` for
shell, or `` `Code.Block` {:tsx} `` for TSX snippets.

## Theming

Every token ships as a CSS variable, so your theme swaps in both modes:

```ts
const theme = useTheme(); // [!code highlight]
return theme === 'dark' ? 'mono-dark' : 'mono-light';
```

Diffs are annotated with `[!code ++]` and `[!code --]`:

```tsx
function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}!</p>; // [!code --]
  return <p>Welcome, {name}!</p>; // [!code ++]
}
```

Focus lines with `[!code focus]`, or flag problems with `[!code error]`:

```bash
pnpm install # [!code focus]
pnpm deploy --invalid-flag # [!code error]
```

## Configuration

```jsonc
{
  // Registry settings
  "name": "mono",
  "components": ["button", "code", "sidebar"],
  "theme": "default",
}
```

| Flag          | Default | Purpose                         |
| ------------- | ------- | ------------------------------- |
| `highlight`   | `false` | Render dual-theme syntax colors |
| `lineNumbers` | `true`  | Show a CSS-counter gutter       |
| `copyButton`  | `true`  | Copy the raw source             |

## Next steps

- Browse the component catalog in the showroom.
- Read `docs/plans/completed/shiki-codeblock-integration.md` for the
  highlighting architecture.
