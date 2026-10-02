import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
} from '@shikijs/transformers';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import {
  monoDarkHcTheme,
  monoDarkTheme,
  monoLightHcTheme,
  monoLightTheme,
} from '@/components/ui/code-themes';
import { headingId } from './docs';
import { getHighlighter } from './highlight';

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/**
 * Adds `id` anchors to `h2`/`h3` headings so the docs table of contents can
 * link to them. Uses the same `headingId` as `lib/docs.ts` — no `rehype-slug`
 * dependency, and both sides cannot drift.
 */
function rehypeHeadingIds() {
  return (tree: HastNode) => {
    for (const node of tree.children ?? []) {
      if (node.type !== 'element' || !/^h[23]$/.test(node.tagName ?? '')) continue;
      const text = (node.children ?? [])
        .map((child) => child.value ?? '')
        .join('')
        .trim();
      if (!text) continue;
      node.properties = { ...node.properties, id: headingId(text) };
    }
  };
}

/**
 * Server-side Markdown → HTML pipeline for docs content.
 *
 * `remark-parse` → `remark-rehype` → Shiki (four mono themes via the
 * shared highlighter singleton, `defaultColor: false` so `code.css`
 * drives token colors — including `data-code-theme='hc'` variants) →
 * `rehype-stringify`.
 *
 * Features:
 * - Fenced code blocks with the docs annotation transformers:
 *   `[!code highlight]`, `[!code ++]` / `[!code --]`, `[!code focus]`,
 *   `[!code error|warning|info]`
 * - Inline code highlighting via the trailing-curly-colon marker:
 *   `` `npx shadcn add x{:bash}` ``
 *
 * The output is rendered with `dangerouslySetInnerHTML` inside a
 * `.mono-doc` wrapper (see `app/app/docs.css`).
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  // The rehype plugin types its parameter as `HighlighterGeneric<any, any>`;
  // a core highlighter (langs loaded dynamically) is not directly
  // assignable due to generic variance, so widen at this boundary.
  const highlighter = (await getHighlighter()) as unknown as Parameters<
    typeof rehypeShikiFromHighlighter
  >[0];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHeadingIds)
    .use(rehypeShikiFromHighlighter, highlighter, {
      themes: {
        light: monoLightTheme,
        dark: monoDarkTheme,
        'light-hc': monoLightHcTheme,
        'dark-hc': monoDarkHcTheme,
      },
      defaultColor: false,
      inline: 'tailing-curly-colon',
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerNotationFocus(),
        transformerNotationErrorLevel(),
      ],
    })
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}
