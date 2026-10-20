---
name: kumo-design
description: Cloudflare Kumo design rules plus upstream-drift check for this registry. Use when auditing or changing components in packages/registry against Kumo, or when asked whether the port is behind upstream.
---

# Kumo Design (repo-local)

Rules below mirror upstream `packages/kumo-docs-astro/src/components/skill/design-tips.tsx`
(15 rules, unchanged between pin `a5800aa` / 2.13.0 and 2.15.0 as of 2026-10-20).
Our components port Kumo onto Base UI + Hugeicons with our own tokens (see `DESIGN.md`),
so apply rules to behavior and styling, not to Kumo import names.

## Upstream drift check

Pin: `@cloudflare/kumo@2.15.0`, commit `69ff967a00448619feb72367cbbc4d0fa37ecc14`
(`docs/plans/completed/kumo-source-manifest.json`; items ported at 2.13.0 still cite `a5800aa` in headers).

```bash
PIN=69ff967a00448619feb72367cbbc4d0fa37ecc14
# upstream version now
gh api repos/cloudflare/kumo/contents/packages/kumo/package.json --jq .content | base64 -d | grep '"version"'
# components touched since pin
gh api repos/cloudflare/kumo/compare/$PIN...main \
  --jq '[.files[].filename|select(test("packages/kumo/src/components/"))|split("/")[4]]|unique[]'
# new/removed component files since pin
gh api repos/cloudflare/kumo/compare/$PIN...main \
  --jq '.files[]|select(.status!="modified")|select(.filename|test("packages/kumo/src/components/.*\\.tsx$"))|"\(.status) \(.filename)"'
# did the design rules change?
gh api repos/cloudflare/kumo/compare/$PIN...main \
  --jq '.files[]|select(.filename|test("skill/design-tips"))|.patch'
# per-component patch
gh api repos/cloudflare/kumo/compare/$PIN...main \
  --jq '.files[]|select(.filename=="packages/kumo/src/components/<name>/<name>.tsx")|.patch'
```

Map upstream `packages/kumo/src/components/<name>/` → `packages/registry/src/components/ui/<name>.tsx`
(renames: `dropdown`→`dropdown-menu`, `toast`→`toasty`; `chart` split into `*-chart`/`*-map` files).
All 2.15.0 catalog items are ported except `cloudflare-logo` (intentionally skipped); `flow` is not in the catalog.
Type scale: Kumo sets text-sm 13px / text-base 14px / text-lg 16px; our theme uses Tailwind defaults, so port upstream `text-base` as `text-sm`.
`app/components/ui` is a hand-kept mirror of the registry sources — copy changes there too (`diff -rq` must be empty).
Changesets in upstream `.changeset/*.md` and `packages/kumo/CHANGELOG.md` explain behavior changes.

## Audit procedure

1. Run the drift check; classify each touched component: **new** (not ported), **behavior fix** (port it), **docs/test only** (skip).
2. For each registry component, check the rules below; report `file:line`, rule id, fix.
3. Rules conflicting with `DESIGN.md` → report the conflict, don't silently pick one.
4. Verify fixes with the gates in `docs/PROJECT.md` (registry validate, a11y, visual).

## Rules

### `content-text-size` Use 14px for content text

All content text—body, buttons, data, other interactables—must be 14px in size. 16px and above are restricted to headings and subheadings.

**Good**

```tsx
<Text>Content text</Text>
```

**Avoid**

```tsx
<Text size="lg">Content text</Text>
```

### `heading-case` Always sentence case headings

Never capitalize or uppercase headings. Product names must be title-cased.

**Good**

```tsx
<Text as="h2">Recent requests</Text>
```

**Avoid**

```tsx
<Text as="h2">Recent Requests</Text>
```

```tsx
<Text as="h2" DANGEROUS_className="uppercase">
  Recent requests
</Text>
```

### `font-tracking` Never change the font's tracking

Do not use the `tracking-*` classes to change the spacing between characters.

**Good**

```tsx
<span className="text-lg">Worker Metrics</span>
```

**Avoid**

```tsx
<span className="text-lg tracking-tight">Worker Metrics</span>
```

### `font-weight` Never use `font-bold`

Use `font-semibold` for headings and `font-medium` for bold inline text.

**Good**

```tsx
<Text as="h3" variant="heading3">Account settings</Text>
<Text as="strong" bold>required</Text>
```

**Avoid**

```tsx
<Text as="h3" DANGEROUS_className="font-bold">Account settings</Text>
<Text as="strong" DANGEROUS_className="font-bold">required</Text>
```

### `related-text-spacing` Put related text closer together

Related text should have smaller spacing around it than the content it belongs to.

**Good**

```tsx
<div className="grid gap-6">
  <div className="grid gap-1.5">
    <Text as="h3">Web Analytics</Text>
    <Text>Measure site traffic without changing your code.</Text>
  </div>
  <Button>Configure</Button>
</div>
```

**Avoid**

```tsx
<div className="grid gap-4">
  <Text as="h3">Web Analytics</Text>
  <Text>Measure site traffic without changing your code.</Text>
  <Button>Configure</Button>
</div>
```

### `text-spacing` Optically align spacing around text

Spacing around text should take into account its line height. Typically this means vertical spacing should be slightly smaller than horizontal.

**Good**

```tsx
<LayerCard className="px-5 py-4">...</LayerCard>
```

**Avoid**

```tsx
<LayerCard className="p-5">...</LayerCard>
```

### `hover-color-transitions` Never transition colors for hover states

Color changes on hover must be immediate. Transitions on fast interactions make the UI feel sluggish.

**Good**

```tsx
<button className="hover:bg-kumo-tint">...</button>
```

**Avoid**

```tsx
<button className="transition-colors duration-300 hover:bg-kumo-tint">
  ...
</button>
```

### `shadow-borders` Never use borders with drop shadows

Use `ring ring-kumo-line` to create a transparent border that maintains sharp edges.

**Good**

```tsx
<LayerCard className="shadow-md ring ring-kumo-line">...</LayerCard>
```

**Avoid**

```tsx
<LayerCard className="border border-kumo-line shadow-md">...</LayerCard>
```

### `concentric-border-radius` Use concentric border radii

When borders or rings are 8px or less apart, their corner radii must be mathematically concentric: outer radius = inner radius + padding.

**Good**

```tsx
<div className="rounded-xl p-1">
  <div className="rounded-lg">...</div>
</div>
```

**Avoid**

```tsx
<div className="rounded-xl p-1">
  <div className="rounded-xl">...</div>
</div>
```

### `icon-alignment` Align icons with the first line of text

Inline icons must be optically the same size as and be center-aligned with text. Use `h-lh flex items-center` for multi-line alignment.

**Good**

```tsx
<div className="flex items-start gap-2">
  <span className="h-lh flex items-center">
    <Icon />
  </span>
  <Text>Text that may wrap onto multiple lines</Text>
</div>
```

**Avoid**

```tsx
<div className="flex items-start gap-2">
  <span className="flex items-center">
    <Icon />
  </span>
  <Text>Text that may wrap onto multiple lines</Text>
</div>
```

```tsx
<div className="flex items-center gap-2">
  <Icon />
  <Text>Text that may wrap onto multiple lines</Text>
</div>
```

### `inline-monospace-size` Reduce the font size of inline monospaced text

Monospaced text should have a slightly smaller font size (~0.9em) when mixed with regular text.

**Good**

```tsx
<Text size="lg">
  Edit <span className="font-mono text-[0.9em]">wrangler.toml</span> to
  continue.
</Text>
```

**Avoid**

```tsx
<Text size="lg">
  Edit <span className="font-mono">wrangler.toml</span> to continue.
</Text>
```

### `sticky-borders` Use `border` to separate sticky elements from the content

**Good**

```tsx
<div className="sticky top-0 border-b border-kumo-line">...</div>
```

**Avoid**

```tsx
<div className="sticky top-0">...</div>
```

### `collapse-content-size` Maintain content size during collapse animations

Collapsible content must maintain its content size while closing to avoid its content shifting during animations.

**Good**

```tsx
<motion.div animate={{ width: open ? 256 : 0 }}>
  <div className="w-64">...</div>
</motion.div>
```

**Avoid**

```tsx
<motion.div animate={{ width: open ? 256 : 0 }}>
  <div className="w-full min-w-0">...</div>
</motion.div>
```

### `layer-card-nesting` Never stack `LayerCard` on top of one another

**Good**

```tsx
<div>
  <Text as="h3">Recent requests</Text>
  <LayerCard>...</LayerCard>
</div>
```

**Avoid**

```tsx
<LayerCard>
  <Text as="h3">Recent requests</Text>
  <LayerCard>...</LayerCard>
</LayerCard>
```

### `dialog-rendering` Never conditionally render dialogs

Conditionally rendering dialogs disables their open/close animation. Use the `open` prop to determine if a dialog should be visible or not.

**Good**

```tsx
<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog>
    <Dialog.Title>Edit Worker</Dialog.Title>
    <Dialog.Description>Update this Worker's settings.</Dialog.Description>
  </Dialog>
</Dialog.Root>
```

**Avoid**

```tsx
{
  open && (
    <Dialog.Root open>
      <Dialog>
        <Dialog.Title>Edit Worker</Dialog.Title>
      </Dialog>
    </Dialog.Root>
  );
}
```
