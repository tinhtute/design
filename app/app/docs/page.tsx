import { readFileSync } from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { renderMarkdown } from '@/lib/markdown';

export default async function DocsPage() {
  const source = readFileSync(
    path.join(process.cwd(), 'content', 'docs', 'getting-started.md'),
    'utf8',
  );
  const html = await renderMarkdown(source);

  return (
    <main className="mono-doc min-h-dvh bg-kumo-base text-kumo-default">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-kumo-line bg-kumo-base px-6 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <img src="/logo-solid.svg" alt="" className="size-6 shrink-0" />
          <span className="font-mono text-sm font-bold">mono docs</span>
        </div>
        <Link
          href="/"
          className="rounded-md px-2 py-1 text-sm text-kumo-subtle transition-colors duration-200 hover:bg-kumo-interact hover:text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand"
        >
          Showroom
        </Link>
      </header>
      <article
        className="mx-auto max-w-3xl px-6 py-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
