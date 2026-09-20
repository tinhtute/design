---
id: plan-shiki-codeblock-20260920
intake_id: intake-shiki-codeblock-20260920
slug: shiki-codeblock-integration
title: Shiki Syntax Highlighting for Code / CodeBlock and Showroom Docs
status: completed
lane: normal
input_type: change-request
created: 2026-09-20
updated: 2026-09-20
---

# Shiki Syntax Highlighting for Code / CodeBlock and Showroom Docs

## Outcome

The `code` registry item gains real syntax highlighting powered by Shiki (v4.4.3, the current
stable line whose APIs the requested v3 line and v4 share; v3 itself is EOL and the repo requires
Node ≥ 24):

1. `Code` stays a plain monospace snippet (backward compatible); `Code.Block` / `CodeBlock` becomes
   a highlighted, bordered code block with an optional filename title bar, copy button, and line
   numbers, in a **server-rendered mode** (`html` prop, zero client highlight JS) and a
   **client mode** (fine-grained Shiki bundle, JavaScript RegExp engine — no WASM).
2. Colors come from two custom Shiki themes (`mono-light`, `mono-dark`) derived from the design
   tokens, emitted as dual-theme CSS variables (`defaultColor: false`) so the block follows the
   design system's `data-mode="dark"` / `.dark` switch with no `!important` and no re-render.
3. The showroom (docs site) pre-highlights every demo source on the server and renders it through
   the same component, proving the server path; the `code` demo page exercises the client path.
4. The registry ships the component source, the themes file, and the required CSS as three files;
   consumers get `shiki` + `@shikijs/langs` via the item `dependencies`; `THIRD_PARTY_LICENSES.md`
   gains the Shiki MIT entry.

## Authority and Requirements

### Authoritative Sources

- Owner request (2026-09-20): research `shikijs/shiki@v3` and integrate it into the design system
  starting from the CodeBlock component and the code blocks on docs sites; full plan approved
  ("tạo plan full đi rồi làm luôn hết").
- Shiki v4.4.3 docs (current; v3 → v4 removes deprecated APIs only, Node ≥ 20): dual themes via
  `themes: { light, dark }` + `defaultColor: false` + CSS variables; fine-grained bundles
  (`createHighlighterCore`); engines extracted to `shiki/engine/javascript` (JS RegExp, no WASM —
  237/238 grammars supported, including every language chosen below) and `shiki/engine/oniguruma`
  (WASM); `@shikijs/langs/<id>` subpath dynamic imports; Next.js integration pattern
  (server component `codeToHtml` / client singleton).
- `DESIGN.md` / `PRODUCT.md`: brand `#124b68`, kumo semantic tokens, "zero runtime vendor
  dependencies" (no `@cloudflare/kumo`), strict WCAG 2.1 AA, source-code-first registry.
- `app/app/theme.css`: authoritative light/dark token values used as the syntax palette source.
- `packages/registry/registry.json`: item schema (`files` types `registry:ui` / `registry:lib` /
  `registry:css`, `dependencies` npm field); the registry e2e expects an exact 53-name catalog, so
  the `code` item must not split and no new item is added.
- Kumo `code.tsx` (MIT, pinned commit `a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf`): `Code` plain
  text + `Code.Block` bordered container; container tokens `bg-kumo-base` / `border-kumo-fill`,
  inner padding `p-2.5`, `font-mono text-sm leading-[20px]`.

### Falsifiable Requirements

1. **R1 (API continuity)**: `Code` accepts `code`, `lang`, `values`, `className`, `style` exactly
   as today; `CodeBlock`/`Code.Block` keeps `code` + `lang` and gains `html`, `title`,
   `showLineNumbers` (default true), `copyButton` (default true), `className`, `style`; old
   exports (`CodeLang`, `KUMO_CODE_VARIANTS`, `codeVariants`, `KUMO_CODE_STYLING`,
   `KUMO_CODEBLOCK_STYLING`) remain.
2. **R2 (server mode)**: when `html` is provided, the component renders it via
   `dangerouslySetInnerHTML` inside the styled container and performs no client highlighting.
3. **R3 (client mode)**: without `html`, the component highlights in the browser via a singleton
   `createHighlighterCore` using `createJavaScriptRegexEngine`, custom themes `mono-light` /
   `mono-dark`, and a curated statically-analyzable `@shikijs/langs/*` loader map
   (typescript, tsx, jsx, javascript, json, css, html, bash, shellscript, diff, markdown, mdx,
   txt) with alias resolution (ts → typescript, js → javascript, sh → shellscript, jsonc → json,
   md → markdown, …); unknown languages fall back to plain `text` rendering.
4. **R4 (dual theme)**: `codeToHtml` runs with `themes: { light: mono-light, dark: mono-dark }`
   and `defaultColor: false`; the shipped `code.css` applies `var(--shiki-light)` by default and
   `var(--shiki-dark)` under `html[data-mode="dark"]` / `.dark`, scoped to `.shiki` spans, without
   `!important`.
5. **R5 (registry payload)**: `registry.json` `code` item lists `dependencies: ["shiki",
   "@shikijs/langs", "@phosphor-icons/react"]` and three files — `code.tsx` (`registry:ui`),
   `code-themes.ts` (`registry:lib`), `code.css` (`registry:css`); `shadcn build` succeeds;
   `THIRD_PARTY_LICENSES.md` contains the Shiki (MIT, © Pine Wu / Anthony Fu) entry.
6. **R6 (parity)**: `app/components/ui/code.tsx`, `code-themes.ts`, `code.css` are byte-identical
   to the registry sources (`cmp` exits 0).
7. **R7 (showroom server path)**: `app/app/page.tsx` pre-highlights all demo sources server-side
   (`tsx`); the SSR HTML for the showroom contains `class="shiki"` blocks with `--shiki-dark`
   variables; `Playground` renders demo sources through `Code.Block` with `html`, filename title
   (`<slug>.tsx`), line numbers, and copy button.
8. **R8 (client path proof)**: the `code` demo page renders a `Code.Block` without `html` and
   shows highlighted output after hydration (visual check), with plain text before highlight
   resolves (no hydration mismatch).
9. **R9 (a11y)**: the copy button has an `aria-label`, visible focus ring via `--kumo-focus`, and
   keyboard activation; line-number pseudo-elements are `user-select: none`.
10. **R10 (gates)**: `pnpm --filter @therealtinhtute/registry validate && validate:build`,
    `pnpm --filter app typecheck`, `pnpm lint`, `pnpm -r build` exit 0; registry `e2e` runs when
    network permits (53-name exact set intact).

## Non-goals

- No Markdown/MDX pipeline in this change: the repo has no markdown docs content yet; the
  `@shikijs/rehype` recipe (same themes, transformers for diff/highlight/focus, `inline` option)
  is documented in the plan and shipped CSS supports its annotation classes, but no unified
  pipeline is wired.
- No changes to `app/app/theme.css` or `packages/tokens` (palette consumed as-is).
- No new registry items, no catalog count change (53 exact set preserved).
- No Twoslash / type-check annotations, no WASM in the client path, no `@shikijs/transformers`
  dependency in the registry item (annotations are CSS-only; copy button is implemented in React).
- No runtime dependency on `@cloudflare/kumo`.

## Approach and Risks

### Implementation Approach

- **Registry first**: write `code-themes.ts` (two Shiki themes, hex palette converted from the
  token oklch values in `app/app/theme.css`), rewrite `code.tsx` (container `figure`-style div
  with header bar + `overflow-x-auto` body; client singleton highlighter; copy button with
  clipboard fallback), add `code.css` (dual-theme token colors, line numbers via CSS counters,
  doc-annotation classes). Then update `registry.json` and `THIRD_PARTY_LICENSES.md`, install
  `shiki` + `@shikijs/langs` in both `packages/registry` (dev) and `app` (runtime), and rebuild
  the registry payloads (`shadcn build`).
- **Showroom second**: byte-copy the three files to `app/components/ui/`, import `code.css` from
  `app/app/globals.css`, add `app/lib/highlight.ts` (server singleton, oniguruma WASM engine),
  make `page.tsx` async and pass pre-highlighted HTML to `Playground`, and update the `code` demo
  to exercise the client path.
- **Validate**: gates in R10, then a rendered-page probe (curl SSR HTML for `class="shiki"`) and
  a browser screenshot pass in light + dark mode for the `code` demo and a demo-source block.

### Constraints & Dependencies

- `packages/registry/public/` and `app/public/r` are gitignored build output; `shadcn build`
  regenerates the former and `app`'s `build` script syncs it.
- Client bundle must stay fine-grained: the loader map is an explicit object of dynamic imports
  (statically analyzable), never a template-literal import.
- `createHighlighterCore` needs every embedded grammar present (tsx → jsx → javascript), so the
  curated set includes the full chain.
- Turbopack/Next server bundling supports the same dynamic subpath imports; the server singleton
  avoids re-initializing the highlighter per request.

### Rejected Alternatives

- **Use the `shiki` full/web bundle in the client path**: rejected — ~1.3 MB gz shipped into every
  consumer; fine-grained core + JS engine is ~100–250 KB total and WASM-free.
- **Use bundled themes (github / min / vitesse)**: rejected — colors would clash with the kumo
  palette; custom `mono-light`/`mono-dark` themes are derived from the design tokens.
- **Oniguruma WASM in the client path**: rejected — consumers would need WASM loading plumbing;
  the JS RegExp engine covers all chosen grammars (compat reference: 237/238).
- **`@shikijs/transformers` for line numbers / copy**: rejected — CSS counters and a small React
  button avoid a dependency and keep a11y in our control.
- **New `code-block` registry item**: rejected — breaks the e2e 53-name exact set and splits one
  component across two installs.

### Primary Risks & Mitigations

- **Risk**: custom theme colors read wrong on either mode. **Mitigation**: palette mapped 1:1
  from token values (script-converted oklch → hex), screenshot pass in both modes, contrast kept
  on token pairs that already pass the AA audit.
- **Risk**: client highlighting causes a flash of plain text. **Mitigation**: initial render is
  plain text (identical server/client), highlight swaps in on resolve — no hydration mismatch.
- **Risk**: `dangerouslySetInnerHTML` in server mode. **Mitigation**: content is repository-owned
  demo sources; `html` prop is opt-in; plain `code` fallback always present.
- **Risk**: registry consumer build breaks on `@shikijs/langs` subpath imports. **Mitigation**:
  documented pattern from Shiki docs; validated by the registry e2e consumer build when network
  is available.
- **Recovery**: each phase is one revertable commit; no data or external state changes.

---

## Phases and Verification

### Phase 1: Registry component, themes, CSS, registry payload

- **Slug**: `registry-shiki-codeblock`
- **Status**: done
- **Goal**: R1–R6, R9. `code-themes.ts`, `code.tsx`, `code.css` in
  `packages/registry/src/components/ui/`; `registry.json` `code` item updated; licenses updated;
  deps installed; registry build regenerates `public/r`.
- **Proof**: `shadcn build` exit 0; `validate` OK (53 items, deps closure 60 files);
  `validate:build` OK (54 built files); `tsc --noEmit` OK; `cmp` parity OK for all three files;
  licenses `grep` OK.
- **Execution notes (2026-09-20)**:
  - `code.css` is registered as `registry:lib` (target `components/ui/code.css`) because the
    local registry-item schema has no `registry:css` file type; consumers import it from their
    own CSS. Recorded deviation from the original plan's `registry:css`.
  - Shiki v4 has no `ShikiTheme` type export; themes are typed with a local `MonoSyntaxTheme`
    interface (structural subset of `ThemeRegistration` from `@shikijs/types`) so the shipped
    component needs no extra dependency.
  - `@shikijs/langs/*` modules default-export `LanguageRegistration[]` (arrays); the client and
    server loaders flatten them and pass them through `loadLanguage(...arr)`.
  - `txt` has no grammar module; `text` is a built-in core grammar used for unknown languages.
  - Dark-mode purple/teal are lightness-tuned variants of the badge purple/teal hues (4.88:1 /
    6.44:1 on the dark surface; raw token values measured 2.15:1 / 2.83:1). All other syntax
    colors are 1:1 token conversions (light warning 3.94:1, above the 3:1 code-text bar).
  - `registry.json` was initially re-serialized with `indent=1` by an editing script; restored
    from git and re-applied as a 16-line minimal diff (2-space indent, raw unicode).

### Phase 2: Showroom server-side highlighting

- **Slug**: `showroom-shiki-server`
- **Status**: done
- **Goal**: R6–R8. `app/lib/highlight.ts` server singleton; async `page.tsx`; `Playground`
  renders `Code.Block` with `html` + `title`; `code` demo updated; `code.css` imported in
  `globals.css`.
- **Proof**: `pnpm --filter app typecheck` OK; SSR probe on built app (`next start`): exactly one
  `class="shiki shiki-themes mono-light mono-dark"` block for the active demo, 20 `--shiki-dark`
  CSS variables, `data-line-numbers="true"`, filename title, copy button with `aria-label`,
  token spans with only CSS-variable colors (no inline `color:` — `defaultColor: false`
  confirmed).

### Phase 3: Gates, visual proof, plan completion

- **Slug**: `shiki-codeblock-gates`
- **Status**: done
- **Goal**: R10 plus browser verification of the `code` demo (client path) and a demo-source
  block (server path) in light and dark mode; review diff; move plan to `docs/plans/completed/`.
- **Proof**:
  - Gates: `validate` / `validate:build` OK; `pnpm --filter app typecheck` OK; `pnpm lint` OK;
    `pnpm -r build` OK; registry **e2e-smoke passed end-to-end** (fresh consumer installs the
    full 53-item catalog incl. `code` with shiki deps, vite build, theme-token CSS asserts, SSR
    render-check) — no silent-skip needed.
  - DOM verification (headless Chromium 1234): light mode keyword `rgb(18,75,104)` (#124b68
    brand), string `rgb(0,96,69)` (#006045); dark mode keyword `rgb(118,172,206)` (#76acce),
    string `rgb(164,244,207)` (#a4f4cf); container bg `#faf8f5` / `#262624` per mode; line
    numbers rendered via `::before` counters (32px gutter); copy button flips to "Copied" and
    reverts after 2s, clipboard receives the code; zero console/page errors on the client
    highlight path (3 shiki blocks, 116 token spans, 44 numbered lines on the demo page).
  - Pixel probe on screenshots: light `#faf8f5`, dark `#262624` code surfaces confirmed.
  - `prettier --check` clean on all changed files; `git status` shows only intended files.
