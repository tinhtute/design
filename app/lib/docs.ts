import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const docsDir = path.join(process.cwd(), 'content', 'docs');

export interface DocHeading {
  id: string;
  text: string;
}

export interface Doc {
  slug: string;
  title: string;
  description: string;
  headings: DocHeading[];
  markdown: string;
  href: string;
}

/**
 * Docs order and blurbs. The first entry is the `/docs` index; every entry is
 * also reachable at `/docs/<slug>`. Titles come from each file's `# ` heading,
 * and the table of contents from its `## ` headings — one source per fact.
 */
const DOC_ENTRIES: { slug: string; description: string }[] = [
  {
    slug: 'getting-started',
    description: 'Install components and see how the registry resolves them.',
  },
  {
    slug: 'theming',
    description: 'Token layers, light and dark mode, and the theme item.',
  },
  {
    slug: 'registry',
    description: 'How items are authored, validated, and published.',
  },
  {
    slug: 'validation',
    description: 'The gate commands that prove a change.',
  },
];

/** Anchor id for a heading — shared by the TOC and the rendered headings. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function parse(slug: string, description: string, markdown: string): Doc {
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? slug;
  const headings = [...markdown.matchAll(/^##\s+(.+)$/gm)].map((match) => {
    const text = match[1].trim();
    return { id: headingId(text), text };
  });
  return {
    slug,
    title,
    description,
    headings,
    markdown,
    href: slug === DOC_ENTRIES[0].slug ? '/docs' : `/docs/${slug}`,
  };
}

export function getDocs(): Doc[] {
  return DOC_ENTRIES.map(({ slug, description }) =>
    parse(slug, description, readFileSync(path.join(docsDir, `${slug}.md`), 'utf8')),
  );
}

export function getDoc(slug: string): Doc | undefined {
  return getDocs().find((doc) => doc.slug === slug);
}

export function getDocSlugs(): string[] {
  return DOC_ENTRIES.filter((entry) => entry.slug !== DOC_ENTRIES[0].slug).map(
    (entry) => entry.slug,
  );
}

export function getDocNeighbours(slug: string): { previous?: Doc; next?: Doc } {
  const docs = getDocs();
  const index = docs.findIndex((doc) => doc.slug === slug);
  return { previous: docs[index - 1], next: docs[index + 1] };
}

/** Fails the build when a documented page has no markdown file. */
export function assertDocsComplete(): void {
  const files = new Set(readdirSync(docsDir).map((file) => file.replace(/\.md$/, '')));
  for (const { slug } of DOC_ENTRIES) {
    if (!files.has(slug)) throw new Error(`docs: content/docs/${slug}.md is missing`);
  }
}
