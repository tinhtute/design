'use client';

import { TableOfContents } from '@/components/ui/table-of-contents';
import type { DocHeading } from '@/lib/docs';

/**
 * Client boundary for the docs table of contents: the registry's
 * `table-of-contents` item uses hooks and ships without a `use client`
 * directive, so the docs shell stays a server component and only this wrapper
 * crosses the boundary.
 */
export function DocsToc({ headings }: { headings: DocHeading[] }) {
  return (
    <TableOfContents>
      <TableOfContents.Title>On this page</TableOfContents.Title>
      <TableOfContents.List>
        {headings.map((heading) => (
          <TableOfContents.Item key={heading.id} href={`#${heading.id}`}>
            {heading.text}
          </TableOfContents.Item>
        ))}
      </TableOfContents.List>
    </TableOfContents>
  );
}
