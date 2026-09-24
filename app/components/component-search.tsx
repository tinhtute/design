'use client';

import { CommandPalette } from '@/components/ui/command-palette';

export interface ComponentSearchItem {
  id: string;
  label: string;
  group: string;
}

/**
 * ⌘K palette for the showroom — built from the registry's own
 * `CommandPalette` so the search surface exercises the shipped component.
 * Filtering matches the component label, its slug, and its category.
 */
export function ComponentSearch({
  open,
  onOpenChange,
  items,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ComponentSearchItem[];
  onSelect: (id: string) => void;
}) {
  return (
    <CommandPalette.Root
      open={open}
      onOpenChange={onOpenChange}
      items={items}
      itemToStringValue={(item) => item.label}
      filter={(item, query) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          item.label.toLowerCase().includes(q) ||
          item.id.includes(q) ||
          item.group.toLowerCase().includes(q)
        );
      }}
    >
      <CommandPalette.Input placeholder="Search components…" />
      <CommandPalette.List>
        <CommandPalette.Results>
          {(item: ComponentSearchItem) => (
            <CommandPalette.Item key={item.id} value={item} onClick={() => onSelect(item.id)}>
              <span className="truncate">{item.label}</span>
              <span className="ms-auto shrink-0 text-xs text-kumo-subtle">{item.group}</span>
            </CommandPalette.Item>
          )}
        </CommandPalette.Results>
        <CommandPalette.Empty>No components found</CommandPalette.Empty>
      </CommandPalette.List>
    </CommandPalette.Root>
  );
}
