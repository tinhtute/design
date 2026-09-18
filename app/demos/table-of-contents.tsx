"use client";

import { useState } from "react";
import { TableOfContents } from "@/components/ui/table-of-contents";

export const notes =
  "Presentational 'on this page' section nav rendering a nav landmark. Compose Title + List + Item (`href`, `active` — sets aria-current) and `Group` for nested subsections. Pair with `useTableOfContentsActiveId` for scrollspy; the component itself is purely visual.";

export function Demo() {
  const [activeId, setActiveId] = useState("installation");

  return (
    <TableOfContents>
      <TableOfContents.Title>On this page</TableOfContents.Title>
      <TableOfContents.List>
        <TableOfContents.Item
          href="#overview"
          active={activeId === "overview"}
          onClick={() => setActiveId("overview")}
        >
          Overview
        </TableOfContents.Item>
        <TableOfContents.Group label="Getting started">
          <TableOfContents.Item
            href="#installation"
            active={activeId === "installation"}
            onClick={() => setActiveId("installation")}
          >
            Installation
          </TableOfContents.Item>
          <TableOfContents.Item
            href="#setup"
            active={activeId === "setup"}
            onClick={() => setActiveId("setup")}
          >
            Setup
          </TableOfContents.Item>
        </TableOfContents.Group>
        <TableOfContents.Item
          href="#api-reference"
          active={activeId === "api-reference"}
          onClick={() => setActiveId("api-reference")}
        >
          API reference
        </TableOfContents.Item>
      </TableOfContents.List>
    </TableOfContents>
  );
}
