"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/ui/command-palette";

const fruits = ["Apple", "Banana", "Cherry"];

export const notes =
  "Spotlight-style command/search overlay for keyboard-driven workflows. Drive `open`/`onOpenChange` on `CommandPalette.Root`, pass `items` plus a `filter` for arrow-key navigation and search, and compose `Input`, `List`, `Results`, and `Empty` inside. Escape closes the palette.";

export function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-3">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen(true)}
      >
        Open palette
      </Button>
      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        items={fruits}
        filter={(item, query) =>
          item.toLowerCase().includes(query.toLowerCase())
        }
      >
        <CommandPalette.Input placeholder="Search fruits…" />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(item: string) => (
              <CommandPalette.Item
                key={item}
                value={item}
                onClick={() => setOpen(false)}
              >
                {item}
              </CommandPalette.Item>
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No results</CommandPalette.Empty>
        </CommandPalette.List>
      </CommandPalette.Root>
    </div>
  );
}
