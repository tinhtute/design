"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { InputGroup } from "@/components/ui/input-group";

export const notes =
  "Compound text input for composing icons, inline suffixes, and compact buttons around a field. Set `label`, `size`, `disabled`, and `error` on `InputGroup`; `InputGroup.Input`, `Addon`, `Suffix`, and `Button` inherit them via context.";

export function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup label="Search">
        <InputGroup.Addon>
          <MagnifyingGlassIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Search workers…" />
      </InputGroup>
      <InputGroup label="Subdomain" description="Pick a name for your Worker.">
        <InputGroup.Input placeholder="my-worker" />
        <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
      </InputGroup>
    </div>
  );
}
