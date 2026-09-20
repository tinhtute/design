---
id: plan-docs-markdown-20260920
intake_id: intake-docs-markdown-20260920
slug: docs-markdown-pipeline
title: Docs Markdown Pipeline with Shiki Highlighting
status: completed
lane: normal
input_type: change-request
created: 2026-09-20
updated: 2026-09-20
---

# Docs Markdown Pipeline with Shiki Highlighting

## Outcome

The showroom gains a real docs path that renders Markdown through a unified
pipeline with Shiki highlighting — the piece deliberately deferred in
`docs/plans/completed/shiki-codeblock-integration.md` (non-goal there):

1. `app/lib/markdown.ts` — server-side `renderMarkdown(md)` using
   `remark-parse` → `remark-rehype` → `@shikijs/rehype/core` (reusing the
   existing mono dual-theme highlighter singleton from `app/lib/highlight.ts`)
   → `rehype-stringify`, with the docs annotation transformers
   (`transformerNotationDiff`, `transformerNotationHighlight`,
   `transformerNotationFocus`, `transformerNotationErrorLevel`) and inline
   code highlighting (`{:lang}` marker).
2. A real consumer: `app/content/docs/getting-started.md` rendered at
   `/docs` (`app/app/docs/page.tsx`), styled by `app/app/docs.css` with kumo
   tokens; the showroom header links to it.
3. The existing `code.css` dual-theme rules and annotation classes style the
   generated blocks with zero additional CSS for tokens; docs typography
   (headings, lists, tables, inline code) uses `--kumo-*` tokens.

## Authority and Requirements

### Authoritative Sources

- Owner request (2026-09-20): "implement full this plan then run /check" —
  completion of the shiki-codeblock-integration initiative, including the
  deferred docs pipeline ("có … update hết mọi nơi liên quan").
- `docs/plans/completed/shiki-codeblock-integration.md`: non-goal "No
  Markdown/MDX pipeline in this change … the `@shikijs/rehype` recipe (same
  themes, transformers for diff/highlight/focus, `inline` option) is
  documented in the plan and shipped CSS supports its annotation classes".
- Shiki v4.4.3 docs — `@shikijs/rehype`: `rehypeShikiFromHighlighter` from
  `@shikijs/rehype/core` with a custom highlighter; `inline:
'tailing-curly-colon'`; postprocess transformers do not run (notation
  transformers do).
- `app/app/theme.css` + `packages/registry/src/components/ui/code.css`:
  tokens and shipped Shiki CSS consumed as-is (no token changes).
- Next.js 16 app-router conventions already established in this repo
  (`app/app/page.tsx` server component pattern; per-page CSS import).

### Falsifiable Requirements

1. **R1 (pipeline)**: `renderMarkdown(md)` returns HTML containing
   `class="shiki shiki-themes mono-light mono-dark"` for fenced blocks with
   `--shiki-light` / `--shiki-dark` CSS variables and no inline `color:`
   (`defaultColor: false`).
2. **R2 (transformers)**: fenced blocks annotated with `[!code highlight]`,
   `[!code ++]` / `[!code --]`, `[!code focus]`, `[!code error]` render the
   matching `.line.highlighted` / `.diff.add` / `.diff.remove` /
   `.focused` / `.error` classes.
3. **R3 (inline)**: `` `code{:ts}` `` renders as highlighted inline code
   (no `shiki` pre wrapper).
4. **R4 (consumer)**: `/docs` (server component) renders
   `app/content/docs/getting-started.md`; SSR HTML contains at least one
   shiki block and the annotation classes; the showroom header has a link to
   `/docs`.
5. **R5 (no regressions)**: `pnpm --filter app typecheck`, `pnpm lint`,
   `pnpm -r build`, registry `validate`/`validate:build` exit 0; existing
   showroom `/` still renders highlighted demo sources.

## Non-goals

- No MDX loader / `.mdx` route files — the pipeline is string-in/HTML-out,
  wired to a server component; MDX syntax layers can build on it later.
- No changes to `packages/registry` (component, CSS, themes, licenses) — the
  docs pipeline is showroom-side (`app`).
- No docs content beyond one sample guide page.
- No Twoslash / type-check annotations.

## Approach and Risks

### Implementation Approach

- **Server pipeline first**: export the existing highlighter singleton from
  `app/lib/highlight.ts`; add `app/lib/markdown.ts` with the unified chain;
  add app deps `unified`, `remark-parse`, `remark-rehype`, `rehype-stringify`,
  `@shikijs/rehype`, `@shikijs/transformers`.
- **Consumer second**: sample markdown content, `/docs` page with
  `dangerouslySetInnerHTML` inside a `.mono-doc` wrapper, `docs.css` for
  markdown typography, header link in `playground.tsx`.
- **Validate**: typecheck/lint/build, SSR probe on `/docs` (shiki classes,
  annotation classes, inline code), browser probe light/dark, then `/check`.

### Constraints & Dependencies

- The rehype plugin needs the highlighter instance; reuse the same singleton
  so grammars/themes load once per process.
- Notation transformers are HAST-based and work under `@shikijs/rehype`
  (postprocess transformers do not — none used).
- `docs.css` must be imported by the page (global styles in app router);
  token colors switch via `html[data-mode="dark"]` like the rest of the app.

### Rejected Alternatives

- **`@shikijs/rehype` default export (full bundle)**: rejected — pulls the
  entire `shiki` bundle into the server module; `…/core` reuses our
  fine-grained singleton.
- **Client-side markdown rendering**: rejected — docs are static content;
  server rendering keeps highlight JS at zero and matches the showroom's
  server-side demo-source path.
- **Extending `code.css` with prose styles**: rejected — typography belongs
  to the docs surface, not the shipped component CSS.

### Primary Risks & Mitigations

- **Risk**: transformer classes don't apply under rehype. **Mitigation**:
  notation transformers operate on HAST; verified by SSR probe (R2) before
  /check.
- **Risk**: `defaultColor: false` unsupported by the rehype options type.
  **Mitigation**: rehype passes options through to `codeToHast`; fallback to
  passing theme objects if the type complains.
- **Recovery**: each step is one revertable commit; no data or external
  state changes.

---

## Phases and Verification

### Phase 1: Pipeline

- **Slug**: `docs-md-pipeline`
- **Status**: done
- **Goal**: R1–R3. Deps added; `highlight.ts` exports the singleton;
  `app/lib/markdown.ts` renders markdown with mono dual themes, annotation
  transformers, and inline highlighting.
- **Proof**: `pnpm --filter app typecheck` OK; SSR probe on built `/docs`
  shows `class="shiki"` blocks, `--shiki-dark` vars, no inline `color:`,
  `line highlighted` / `line diff add` / `line diff remove` / `line focused`
  / `highlighted error` classes, and inline-code highlighting
  (`--shiki-light` on inline spans, `tailing-curly-colon`).
- **Execution notes (2026-09-20)**:
  - `rehypeShikiFromHighlighter` types its parameter as
    `HighlighterGeneric<any, any>`; a core highlighter (`HighlighterCore`)
    is not directly assignable due to generic variance — widened at the
    call boundary with a comment (no behavior change).
  - Tables require GFM: added `remark-gfm` (initial probe showed
    `<table>` missing with plain `remark-parse`).

### Phase 2: Consumer page

- **Slug**: `docs-md-consumer`
- **Status**: done
- **Goal**: R4–R5. Sample content, `/docs` page, `docs.css`, showroom header
  link; `/` unchanged.
- **Proof**: `pnpm -r build` OK (`/` + `/docs` static); SSR probes: `/docs`
  contains table + shiki + annotation classes; `/` contains `href="/docs"`
  link, highlighted demo source, line numbers, title bar. Browser probe
  (headless Chromium, light+dark): keyword `#124b68` / `#76acce`, diff
  lines render full-width `display:block` tinted backgrounds
  (`--kumo-success-tint` / dark variant), zero page errors.
- **Execution notes (2026-09-20)**:
  - `shadcn/no-unknown-classes` rejected `mono-doc` when its CSS was
    imported per-page; moved `@import "./docs/docs.css"` into
    `globals.css` (same chain as `theme.css` / `code.css`) — resolves the
    rule and keeps the class Tailwind-known.
  - Full-width line backgrounds required moving `.mono-codeblock .shiki
.line` to a generic `.shiki .line` in the shipped `code.css` (docs
    blocks render outside the component wrapper); synced to the app copy,
    registry rebuilt (`validate`/`validate:build`/`e2e` all pass).

### Phase 3: /check and closure

- **Slug**: `docs-md-check`
- **Status**: checked
- **Goal**: Run the `/check` gate on the full diff; resolve findings; move
  plan to `docs/plans/completed/`; commit and push.
- **Proof**: `/check` report (see `## Validation`); `git status` shows only
  intended files; commits pushed via SSH (token-free path — `gh` PAT lacks
  repo scope, recorded in session).

## Current State and Next Action

Phase 2 (`docs-md-consumer`) is implemented and its automated proof is
captured (see the phase entry above). Phase 3 (`docs-md-check`) is
`checked` (verdict `APPROVED`, see `## Validation` below): the plan moves
to `docs/plans/completed/`, and the work is committed and pushed.

## Validation

- 2026-09-20 | phase: docs-md-check | verdict: APPROVED | judge: same-session | judge_model: deepseek-v4-flash-max | proof_gaps: none — visual pixel review of docs typography not independently verified (DOM computed-style probes used instead); registry e2e depends on network availability for consumer deps
  - `npx --yes pnpm@12.2.1 --filter app typecheck` -> pass (next typegen + tsc --noEmit, exit 0)
  - `npx --yes pnpm@12.2.1 --filter @therealtinhtute/registry validate` -> pass (53 items, validate-deps closure, exit 0)
  - `npx --yes pnpm@12.2.1 --filter @therealtinhtute/registry validate:build` -> pass (54 built files against schema, exit 0)
  - `npx --yes pnpm@12.2.1 lint` -> pass (eslint, exit 0)
  - `npx --yes pnpm@12.2.1 exec prettier --check app/lib/markdown.ts app/app/docs/page.tsx app/content/docs/getting-started.md app/app/globals.css app/components/playground.tsx app/lib/highlight.ts packages/registry/src/components/ui/code.css app/components/ui/code.css docs/plans/active/docs-markdown-pipeline.md` -> pass (clean after one prettier --write pass, exit 0)
  - `npx --yes pnpm@12.2.1 --filter @therealtinhtute/registry exec shadcn build` -> pass (registry payload rebuilt with formatted code.css, exit 0)
  - `npx --yes pnpm@12.2.1 -r build` -> pass (/docs static route generated, exit 0)
  - `npx --yes pnpm@12.2.1 --filter @therealtinhtute/registry e2e` -> pass (fresh consumer install + vite build + theme-token asserts + SSR render-check, exit 0)
  - SSR probe `curl http://127.0.0.1:3213/docs` -> pass: `<table>` (remark-gfm), `class="shiki"` dual-theme blocks, `--shiki-dark` vars, no inline `color:`, `line diff add/remove`, `line highlighted`, `line focused`, `highlighted error`, inline-code highlighting; `/` probe: `href="/docs"` link, highlighted demo source, `data-line-numbers`, filename title
  - Browser probe (playwright-core chromium-1234, light+dark) -> pass: keyword rgb(18,75,104)/rgb(118,172,206), diff lines `display:block` with `--kumo-success-tint` backgrounds, docs link visible, zero page errors
  - receipt: context_sources=docs/plans/active/docs-markdown-pipeline.md,PRODUCT.md,app/app/theme.css,packages/registry/src/components/ui/code.css / policy=docs/playbooks/check.md / judge=same-session / judge_model=deepseek-v4-flash-max / retries=1 (prettier findings resolved via --write) / rollback_point=uncommitted working tree (git checkout) / failure_ledger: absent / enforcement: local-only / not_independently_verified=visual pixel review of docs typography, e2e network-dependent
