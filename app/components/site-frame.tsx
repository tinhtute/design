import Link from 'next/link';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

/**
 * Shared showroom chrome (direction A, "Refine designeer"): the brand mark at
 * the top of the left rail and a slim top bar over the stage with section
 * links, page actions and the theme toggle. `/` and `/docs` both render these
 * inside `.mono-index`, which supplies the white canvas and dashed hairlines.
 */

type Section = 'showroom' | 'docs';

const SECTIONS: { id: Section; href: string; label: string }[] = [
  { id: 'showroom', href: '/', label: 'Showroom' },
  { id: 'docs', href: '/docs', label: 'Docs' },
];

/** Brand mark for the top of the rail. `/` renders it as the page `h1`; docs pages already have one. */
export function SiteBrand({ as: Tag = 'span' }: { as?: 'h1' | 'span' }) {
  return (
    <div data-site-brand="" className="flex min-w-0 items-center gap-2">
      <img src="/logo-solid.svg" alt="" className="size-6 shrink-0" />
      <Tag className="font-serif text-lg text-kumo-default">mono</Tag>
    </div>
  );
}

/** Top bar over the stage: `start` holds per-page context (sidebar trigger, index label), `actions` sit before the section links. */
export function SiteBar({
  section,
  start,
  actions,
}: {
  section: Section;
  start?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header
      data-site-bar=""
      className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-dashed border-kumo-line bg-kumo-base px-3 py-3 sm:gap-3 sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-3">{start}</div>
      <div className="flex items-center gap-2">
        {actions}
        <nav aria-label="Site" className="flex items-center gap-1">
          {SECTIONS.map(({ id, href, label }) => (
            <Link
              key={id}
              href={href}
              aria-current={id === section ? 'page' : undefined}
              className={
                id === section
                  ? 'rounded-md px-2 py-1 text-sm no-underline text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand'
                  : 'rounded-md px-2 py-1 text-sm no-underline text-kumo-subtle hover:bg-kumo-interact hover:text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand'
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

/** Mono index label, e.g. `01/button` or `docs/getting-started`. */
export function SiteIndexLabel({ children }: { children: ReactNode }) {
  return <span className="font-mono text-2xs text-kumo-subtle">{children}</span>;
}
