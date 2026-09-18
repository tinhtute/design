"use client";

import { Combobox } from "@/components/ui/combobox";

const fruits = ["Apple", "Banana", "Cherry", "Mango", "Orange"];

export const notes =
  "Filterable single-select for picking from a long list — type to narrow options, arrow keys to navigate. `items` feeds the list and `label` wires up a Field wrapper; compose `TriggerInput`, `Content`, `List`, `Item`, and `Empty` for the no-match state.";

export function Demo() {
  return (
    <Combobox items={fruits} label="Fruit">
      <Combobox.TriggerInput placeholder="Pick a fruit…" />
      <Combobox.Content>
        <Combobox.List>
          {(item: string) => (
            <Combobox.Item key={item} value={item}>
              {item}
            </Combobox.Item>
          )}
        </Combobox.List>
        <Combobox.Empty>No fruits found.</Combobox.Empty>
      </Combobox.Content>
    </Combobox>
  );
}
