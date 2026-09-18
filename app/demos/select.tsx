"use client";

import { Select } from "@/components/ui/select";

export const notes =
  "Dropdown for picking one option from a list. Pass `items` as an object map or compose `Select.Option` children; always provide `label` (visible) or `aria-label` so the trigger has an accessible name.";

export function Demo() {
  return (
    <Select
      label="Fruit"
      placeholder="Pick a fruit"
      items={{ apple: "Apple", banana: "Banana", cherry: "Cherry" }}
    />
  );
}
