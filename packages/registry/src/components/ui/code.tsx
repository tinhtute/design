"use client";

/**
 * Adapted from cloudflare/kumo (MIT), commit a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf.
 * Syntax highlighting powered by Shiki (MIT) — see THIRD_PARTY_LICENSES.md.
 */
import { useEffect, useState, type CSSProperties } from "react";
import { Check as CheckIcon, Copy as CopyIcon } from "@phosphor-icons/react";
import type { HighlighterCore, LanguageRegistration } from "shiki/core";
import { cn } from "@/lib/utils";
import { resolveVariant } from "@/lib/resolve-variant";
import { monoDarkTheme, monoLightTheme } from "./code-themes";

/** Code language variant definitions. */
export const KUMO_CODE_VARIANTS = {
  lang: {
    ts: {
      classes: "",
      description: "TypeScript code",
    },
    tsx: {
      classes: "",
      description: "TypeScript JSX code",
    },
    jsonc: {
      classes: "",
      description: "JSON with comments",
    },
    bash: {
      classes: "",
      description: "Shell/Bash commands",
    },
    css: {
      classes: "",
      description: "CSS styles",
    },
  },
} as const;

export const KUMO_CODE_DEFAULT_VARIANTS = {
  lang: "ts",
} as const;

/**
 * Styling metadata for Code component (for AI/Figma plugin consumption)
 */
export const KUMO_CODE_STYLING = {
  /** Base semantic tokens used */
  baseTokens: ["text-kumo-subtle"],
  /** Typography and layout */
  typography: {
    fontFamily: "font-mono",
    fontSize: "text-sm",
    lineHeight: "leading-[20px]",
  },
  /** Container dimensions */
  dimensions: {
    margin: "m-0",
    padding: "p-0",
    width: "w-auto",
  },
  /** Border and background */
  appearance: {
    borderRadius: "rounded-none",
    border: "border-none",
    background: "bg-transparent",
  },
} as const;

/**
 * Styling metadata for CodeBlock component (for AI/Figma plugin consumption)
 */
export const KUMO_CODEBLOCK_STYLING = {
  /** Base semantic tokens used */
  baseTokens: ["bg-kumo-base", "border-kumo-fill", "text-kumo-default"],
  /** Container styling */
  container: {
    minWidth: "min-w-0",
    borderRadius: "rounded-md",
    border: "border border-kumo-fill",
    background: "bg-kumo-base",
  },
  /** Header bar (title + copy button) */
  header: {
    borderBottom: "border-b border-kumo-hairline",
    padding: "py-1 pl-3.5 pr-1.5",
    title: "font-mono text-xs text-kumo-subtle",
  },
  /** Inner code element padding */
  innerPadding: "p-2.5 (10px)",
  /** Parsed dimensions */
  dimensions: {
    borderRadius: 6, // md = 6px
    padding: 10, // p-2.5 = 10px
    headerHeight: 36, // py-1 + size-7 copy button
  },
} as const;

// Derived types from KUMO_CODE_VARIANTS
export type KumoCodeLang = keyof typeof KUMO_CODE_VARIANTS.lang;

export interface KumoCodeVariantsProps {
  /**
   * Language hint for the code content.
   * - `"ts"` — TypeScript code
   * - `"tsx"` — TypeScript JSX code
   * - `"jsonc"` — JSON with comments
   * - `"bash"` — Shell/Bash commands
   * - `"css"` — CSS styles
   * @default "ts"
   */
  lang?: KumoCodeLang;
}

export function codeVariants({
  lang = KUMO_CODE_DEFAULT_VARIANTS.lang,
}: KumoCodeVariantsProps = {}) {
  return cn(
    // Base styles
    "m-0 w-auto rounded-none border-none bg-transparent p-0 font-mono text-sm leading-[20px] text-kumo-subtle",
    // Apply lang-specific styles (fallback to default if lang not in map)
    resolveVariant(
      KUMO_CODE_VARIANTS.lang,
      lang,
      KUMO_CODE_DEFAULT_VARIANTS.lang,
    ).classes,
  );
}

// Legacy type alias for backwards compatibility
export type CodeLang = KumoCodeLang;

/**
 * Code component props.
 *
 * @example
 * ```tsx
 * <Code code="const x = 1;" lang="ts" />
 * <Code code="export API_KEY={{apiKey}}" lang="bash"
 *   values={{ apiKey: { value: "sk_live_123", highlight: true } }}
 * />
 * ```
 */
export interface CodeProps extends KumoCodeVariantsProps {
  /** The code string to display. */
  code: string;
  /** Template values for `{{key}}` interpolation. Values with `highlight: true` are visually emphasized. */
  values?: Record<
    string,
    {
      value: string;
      highlight?: boolean;
    }
  >;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/**
 * Simple code component without syntax highlighting.
 *
 * Renders code in a monospace font with customizable language metadata.
 * For a highlighted, bordered container version, use `Code.Block` or `CodeBlock`.
 *
 * **Styling:**
 * - Typography: `font-mono text-sm leading-[20px]`
 * - Colors: `text-kumo-subtle` with `bg-transparent`
 * - No borders or padding (use CodeBlock for styled container)
 * - Supports all semantic tokens via className prop
 */
function CodeComponent({
  code,
  lang = KUMO_CODE_DEFAULT_VARIANTS.lang,
  className,
  style,
}: CodeProps) {
  return (
    <pre
      className={cn("overflow-x-auto", codeVariants({ lang }), className)}
      style={style}
    >
      {code}
    </pre>
  );
}

CodeComponent.displayName = "Code";

/* ------------------------------------------------------------------ */
/* Shiki client highlighting                                           */
/* ------------------------------------------------------------------ */

/**
 * Canonical Shiki grammar ids bundled for client-side highlighting.
 * The full chain for embedded grammars is present (tsx → jsx →
 * javascript) so `createHighlighterCore` never needs late loads.
 */
const CLIENT_LANGS = [
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

/**
 * Alias map from markdown fence ids (and the legacy `KumoCodeLang`
 * values) to canonical Shiki grammar ids.
 */
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
  txt: "txt",
  text: "txt",
  plaintext: "txt",
};

type LangLoader = () => Promise<{ default: LanguageRegistration[] }>;

/** Statically-analyzable dynamic imports — keeps bundles fine-grained. */
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

/** Dual-theme rendering with CSS-variable colors only (no inline color). */
const DUAL_THEMES = { light: monoLightTheme, dark: monoDarkTheme } as const;

let highlighterPromise: Promise<HighlighterCore> | null = null;

/**
 * Singleton highlighter for the client path — JavaScript RegExp engine
 * (no WASM), fine-grained bundle (core + curated langs + mono themes).
 * All modules are lazy-loaded on first use.
 */
function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] =
      await Promise.all([
        import("shiki/core"),
        import("shiki/engine/javascript"),
      ]);
    const langs = (
      await Promise.all(
        CLIENT_LANGS.map((id) => LANG_LOADERS[id]().then((m) => m.default)),
      )
    ).flat();
    return createHighlighterCore({
      themes: [monoLightTheme, monoDarkTheme],
      langs,
      engine: createJavaScriptRegexEngine(),
    });
  })();
  return highlighterPromise;
}

/** Highlight `code` with the mono dual themes; unknown langs → plain text. */
async function highlightCode(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter();
  const canonical = LANG_ALIASES[lang] ?? lang;
  if (!highlighter.getLoadedLanguages().includes(canonical)) {
    const loader = LANG_LOADERS[canonical];
    if (!loader) {
      // `text` is a built-in grammar of the core — no loader needed.
      return highlighter.codeToHtml(code, {
        lang: "text",
        themes: DUAL_THEMES,
        defaultColor: false,
      });
    }
    await highlighter.loadLanguage(...(await loader()).default);
  }
  return highlighter.codeToHtml(code, {
    lang: canonical,
    themes: DUAL_THEMES,
    defaultColor: false,
  });
}

/**
 * Client-side highlighted code. Renders plain text first (identical on
 * server and client, so hydration never mismatches) and swaps in the
 * highlighted HTML once the lazy highlighter resolves.
 */
function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    highlightCode(code, lang).then((out) => {
      if (!cancelled) setHtml(out);
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  if (html !== null) {
    // Full `<pre class="shiki">` HTML from Shiki; styled by code.css.
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <pre className="m-0 p-2.5 font-mono text-sm leading-[20px] text-kumo-subtle">
      {code}
    </pre>
  );
}

/* ------------------------------------------------------------------ */
/* Copy button                                                         */
/* ------------------------------------------------------------------ */

/** Accessible copy button with clipboard fallback for older browsers. */
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
      aria-live="polite"
      className="inline-flex size-7 items-center justify-center rounded-md text-kumo-subtle transition-colors duration-200 hover:bg-kumo-interact hover:text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand"
    >
      {copied ? (
        <CheckIcon className="size-3.5 text-kumo-success" weight="bold" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* CodeBlock                                                           */
/* ------------------------------------------------------------------ */

/**
 * CodeBlock component props — code inside a bordered, highlighted container.
 *
 * @example
 * ```tsx
 * // Server-rendered (docs): pre-highlight with Shiki and pass `html`
 * <CodeBlock lang="tsx" html={await codeToHtml(source, { lang: "tsx", themes: { light: "mono-light", dark: "mono-dark" } })} />
 *
 * // Client-side (dynamic content): pass `code`, highlighted in the browser
 * <CodeBlock lang="tsx" code={`const greeting = "Hello!";`} />
 * ```
 */
export interface CodeBlockProps {
  /** The code string to display (also used by the copy button). */
  code: string;
  /**
   * Language hint for the code content. Any Shiki alias is accepted
   * (`ts`, `tsx`, `js`, `bash`, `sh`, `jsonc`, `md`, …).
   * @default "ts"
   */
  lang?: string;
  /**
   * Pre-highlighted Shiki HTML (server-rendered docs path). When
   * provided, no client-side highlighting runs. Shiki output for the
   * `mono-light` / `mono-dark` dual themes with `defaultColor: false`.
   */
  html?: string;
  /** Filename or label rendered in the header bar. */
  title?: string;
  /** Show line numbers (CSS counters, no JS). @default true */
  showLineNumbers?: boolean;
  /** Show the copy-to-clipboard button. @default true */
  copyButton?: boolean;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/**
 * Code block with border, background container, and Shiki syntax
 * highlighting (mono dual themes).
 *
 * **Two rendering modes:**
 * - `html` provided → renders the pre-highlighted HTML verbatim (zero
 *   client highlight JS; the docs-site path).
 * - `code` only → highlights in the browser with a singleton
 *   fine-grained highlighter (JavaScript RegExp engine, no WASM).
 *
 * **Styling:**
 * - Container: `min-w-0 rounded-md border border-kumo-fill bg-kumo-base`
 * - Header bar (optional `title` + copy button): `border-b border-kumo-hairline`
 * - Inner padding: 10px (`p-2.5`), `font-mono text-sm leading-[20px]`
 * - Token colors follow the design system's dark mode via CSS variables
 *   (`code.css` ships with this component)
 */
function CodeBlockComponent({
  code,
  lang = KUMO_CODE_DEFAULT_VARIANTS.lang,
  html,
  title,
  showLineNumbers = true,
  copyButton = true,
  className,
  style,
}: CodeBlockProps) {
  const showHeader = Boolean(title) || copyButton;
  return (
    <div
      className={cn(
        "mono-codeblock min-w-0 overflow-hidden rounded-md border border-kumo-fill bg-kumo-base",
        className,
      )}
      style={style}
      data-line-numbers={showLineNumbers ? "true" : undefined}
    >
      {showHeader ? (
        <div className="flex items-center gap-2 border-b border-kumo-hairline py-1 pl-3.5 pr-1.5">
          {title ? (
            <span className="min-w-0 truncate font-mono text-xs text-kumo-subtle">
              {title}
            </span>
          ) : null}
          {copyButton ? (
            <div className="ml-auto">
              <CopyButton code={code} />
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="overflow-x-auto font-mono text-sm leading-[20px] text-kumo-default">
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <HighlightedCode code={code} lang={lang} />
        )}
      </div>
    </div>
  );
}

CodeBlockComponent.displayName = "CodeBlock";

// Export Code with Block sub-component (for registry detection)
export const Code = Object.assign(CodeComponent, {
  Block: CodeBlockComponent,
});

// Backward-compatible standalone export
export const CodeBlock = CodeBlockComponent;
