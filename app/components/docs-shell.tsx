import Link from 'next/link';
import { DocsToc } from '@/components/docs-toc';
import type { Doc } from '@/lib/docs';

/**
 * Docs chrome shared by `/docs` and `/docs/<slug>`: topic nav, the rendered
 * article, an on-page table of contents, and previous/next links. The article
 * body keeps the `.mono-doc` typography from `docs.css`.
 */
export function DocsShell({
  doc,
  docs,
  previous,
  next,
  html,
}: {
  doc: Doc;
  docs: Doc[];
  previous?: Doc;
  next?: Doc;
  html: string;
}) {
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

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row">
        <nav aria-label="Docs" className="lg:sticky lg:top-20 lg:w-52 lg:shrink-0 lg:self-start">
          <ul className="grid gap-1">
            {docs.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={entry.href}
                  aria-current={entry.slug === doc.slug ? 'page' : undefined}
                  className={
                    entry.slug === doc.slug
                      ? 'block rounded-md px-2 py-1 text-sm text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand'
                      : 'block rounded-md px-2 py-1 text-sm text-kumo-subtle transition-colors duration-200 hover:bg-kumo-interact hover:text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand'
                  }
                >
                  {entry.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article className="min-w-0 flex-1">
          <div dangerouslySetInnerHTML={{ __html: html }} />
          <nav
            aria-label="Docs pages"
            className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-kumo-line pt-4 text-sm"
          >
            {previous ? (
              <Link
                href={previous.href}
                className="rounded-md px-2 py-1 text-kumo-subtle transition-colors duration-200 hover:bg-kumo-interact hover:text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand"
              >
                ← {previous.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={next.href}
                className="rounded-md px-2 py-1 text-kumo-subtle transition-colors duration-200 hover:bg-kumo-interact hover:text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand"
              >
                {next.title} →
              </Link>
            ) : null}
          </nav>
        </article>

        {doc.headings.length > 0 ? (
          <aside className="hidden xl:sticky xl:top-20 xl:block xl:w-44 xl:shrink-0 xl:self-start">
            <DocsToc headings={doc.headings} />
          </aside>
        ) : null}
      </div>
    </main>
  );
}
