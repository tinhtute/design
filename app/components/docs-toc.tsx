'use client';

import { TableOfContents } from '@/components/ui/table-of-contents';
import type { DocHeading } from '@/lib/docs';

/**
 * Client boundary for the docs table of contents: the registry's
 * `table-of-contents` item uses hooks and ships without a `use client`
 * directive, so the docs shell stays a server component and only this wrapper
 * crosses the boundary.
 */
export function DocsToc({
  headings,
  collapsible = false,
}: {
  headings: DocHeading[];
  collapsible?: boolean;
}) {
  const contents = (
    <TableOfContents>
      {!collapsible && <TableOfContents.Title>On this page</TableOfContents.Title>}
      <TableOfContents.List>
        {headings.map((heading) => (
          <TableOfContents.Item
            key={heading.id}
            href={`#${heading.id}`}
            className="overflow-visible wrap-anywhere whitespace-normal"
          >
            {heading.text}
          </TableOfContents.Item>
        ))}
      </TableOfContents.List>
    </TableOfContents>
  );

  if (!collapsible) return contents;

  return (
    <details className="mb-6 rounded-md border border-kumo-line px-3 py-2 xl:hidden">
      <summary className="cursor-pointer rounded-sm text-sm font-semibold focus-visible:ring-2 focus-visible:ring-kumo-focus">
        On this page
      </summary>
      <div className="pt-3">{contents}</div>
    </details>
  );
}
