"use client";

import { Autocomplete } from "@/components/ui/autocomplete";

const fruits = ["Apple", "Banana", "Cherry"];

export const notes =
  "Free-form text input with filterable suggestions — the entered value isn't constrained to the list (use Combobox for strict selection). Compose `Autocomplete.InputGroup` + `Content` + `List` with an item render function; `label` wires up the Field wrapper.";

export function Demo() {
  return (
    <Autocomplete items={fruits} label="Fruit">
      <Autocomplete.InputGroup placeholder="Search fruits…" />
      <Autocomplete.Content>
        <Autocomplete.List>
          {(item: string) => (
            <Autocomplete.Item key={item} value={item}>
              {item}
            </Autocomplete.Item>
          )}
        </Autocomplete.List>
      </Autocomplete.Content>
    </Autocomplete>
  );
}
