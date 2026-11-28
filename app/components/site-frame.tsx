import Link from 'next/link';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

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
  onShowroomNavigate,
}: {
  section?: Section;
  start?: ReactNode;
  actions?: ReactNode;
  onShowroomNavigate?: () => void;
}) {
  return (
    <header
      data-site-bar=""
      className="sticky top-0 z-10 flex min-h-14 items-center justify-between gap-2 border-b border-kumo-line bg-kumo-base px-3 py-2 sm:gap-3 sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-3">{start}</div>
      <div className="flex items-center gap-2">
        {actions}
        <nav aria-label="Site" className="flex items-center gap-1">
          {SECTIONS.map(({ id, href, label }) => (
            <Link
              key={id}
              href={href}
              onNavigate={id === 'showroom' ? onShowroomNavigate : undefined}
              aria-current={id === section ? 'page' : undefined}
              className="rounded-md px-2 py-2 text-sm text-kumo-subtle underline-offset-4 hover:bg-kumo-interact hover:text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-focus aria-[current=page]:text-kumo-default aria-[current=page]:underline"
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

export function SiteIndexLabel({ children }: { children: ReactNode }) {
  return <span className="font-mono text-xs text-kumo-subtle tabular-nums">{children}</span>;
}
