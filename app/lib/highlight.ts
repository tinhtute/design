import type { HighlighterCore, LanguageRegistration } from "shiki/core";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import { monoDarkTheme, monoLightTheme } from "@/components/ui/code-themes";

/**
 * Server-side Shiki highlighter for docs/showroom content.
 *
 * Uses the Oniguruma WASM engine (maximum fidelity, Node runtime) and
 * the mono dual themes; output is consumed by `Code.Block`'s `html`
 * prop, so no highlighting runs in the browser.
 *
 * The highlighter is a module-level singleton: grammars and the WASM
 * engine load once per process, not per request.
 */

const LANG_IDS = [
  "typescript",
  "tsx",
  "jsx",
  "javascript",
  "json",
  "jsonc",
  "css",
  "html",
  "bash",
  "shellscript",
  "diff",
  "markdown",
  "mdx",
] as const;

/** Alias map from markdown fence ids to canonical Shiki grammar ids. */
const LANG_ALIASES: Record<string, string> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  json: "json",
  jsonc: "jsonc",
  css: "css",
  html: "html",
  bash: "bash",
  sh: "shellscript",
  diff: "diff",
  md: "markdown",
  mdx: "mdx",
  txt: "text",
  text: "text",
  plaintext: "text",
};

type LangLoader = () => Promise<{ default: LanguageRegistration[] }>;

/** Statically-analyzable dynamic imports — same set as the client path. */
const LANG_LOADERS: Record<string, LangLoader> = {
  typescript: () => import("@shikijs/langs/typescript"),
  tsx: () => import("@shikijs/langs/tsx"),
  jsx: () => import("@shikijs/langs/jsx"),
  javascript: () => import("@shikijs/langs/javascript"),
  json: () => import("@shikijs/langs/json"),
  jsonc: () => import("@shikijs/langs/jsonc"),
  css: () => import("@shikijs/langs/css"),
  html: () => import("@shikijs/langs/html"),
  bash: () => import("@shikijs/langs/bash"),
  shellscript: () => import("@shikijs/langs/shellscript"),
  diff: () => import("@shikijs/langs/diff"),
  markdown: () => import("@shikijs/langs/markdown"),
  mdx: () => import("@shikijs/langs/mdx"),
};

let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= (async () => {
    const langs = (
      await Promise.all(
        LANG_IDS.map((id) => LANG_LOADERS[id]().then((m) => m.default)),
      )
    ).flat();
    return createHighlighterCore({
      themes: [monoLightTheme, monoDarkTheme],
      langs,
      engine: createOnigurumaEngine(() => import("shiki/wasm")),
    });
  })();
  return highlighterPromise;
}

/**
 * Highlight `code` as HTML with the mono dual themes
 * (`defaultColor: false` — colors live in `--shiki-light` /
 * `--shiki-dark` CSS variables, applied by `code.css`).
 * Unknown languages fall back to plain text.
 */
export async function highlightCode(
  code: string,
  lang = "tsx",
): Promise<string> {
  const highlighter = await getHighlighter();
  const canonical = LANG_ALIASES[lang] ?? lang;
  return highlighter.codeToHtml(code, {
    lang: highlighter.getLoadedLanguages().includes(canonical)
      ? canonical
      : "text",
    themes: { light: monoLightTheme, dark: monoDarkTheme },
    defaultColor: false,
  });
}
