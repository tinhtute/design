import Link from 'next/link';
import { DocsToc } from '@/components/docs-toc';
import { SiteBar, SiteBrand, SiteIndexLabel } from '@/components/site-frame';
import { SkipLink } from '@/components/skip-link';
import type { Doc } from '@/lib/docs';

const DOCS_CONTENT_ID = 'docs-content';

/**
 * Docs chrome shared by `/docs` and `/docs/<slug>`: the shared site rail and
 * bar around topic nav, the rendered article, an on-page table of contents,
 * and previous/next links.
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
    <div className="mono-index flex min-h-dvh flex-col bg-kumo-base text-kumo-default lg:flex-row">
      <SkipLink targetId={DOCS_CONTENT_ID}>Skip to documentation</SkipLink>
      <aside
        data-site-rail=""
        className="flex flex-col gap-5 border-b border-kumo-line px-3 py-4 lg:sticky lg:top-0 lg:h-dvh lg:w-65 lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0"
      >
        <SiteBrand />
        <nav aria-label="Docs">
          <ul className="grid gap-0.5">
            {docs.map((entry, i) => (
              <li key={entry.slug}>
                <Link
                  href={entry.href}
                  aria-current={entry.slug === doc.slug ? 'page' : undefined}
                  className={
                    entry.slug === doc.slug
                      ? 'flex min-h-8 items-center gap-2 rounded-md bg-sidebar-accent px-2 py-1 text-sm text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-focus'
                      : 'flex min-h-8 items-center gap-2 rounded-md px-2 py-1 text-sm text-kumo-subtle hover:bg-sidebar-accent hover:text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-focus'
                  }
                >
                  <span aria-hidden="true" className="w-5 shrink-0">
                    <SiteIndexLabel>{String(i + 1).padStart(2, '0')}</SiteIndexLabel>
                  </span>
                  {entry.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <SiteBar
          section="docs"
          start={
            <span className="hidden sm:inline">
              <SiteIndexLabel>Documentation</SiteIndexLabel>
            </span>
          }
        />
        <main
          id={DOCS_CONTENT_ID}
          tabIndex={-1}
          className="mx-auto flex w-full max-w-5xl flex-1 gap-8 px-4 py-8 sm:px-8 sm:py-10"
        >
          <article className="min-w-0 flex-1">
            {doc.headings.length > 0 && <DocsToc headings={doc.headings} collapsible />}
            <div className="mono-prose" dangerouslySetInnerHTML={{ __html: html }} />
            <nav
              aria-label="Docs pages"
              className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-kumo-line pt-4 text-sm"
            >
              {previous ? (
                <Link
                  href={previous.href}
                  className="rounded-md px-2 py-1 no-underline text-kumo-subtle hover:bg-kumo-interact hover:text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand"
                >
                  ← {previous.title}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={next.href}
                  className="rounded-md px-2 py-1 no-underline text-kumo-subtle hover:bg-kumo-interact hover:text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand"
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
        </main>
      </div>
    </div>
  );
}
