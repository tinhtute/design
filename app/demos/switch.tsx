"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export const notes =
  "Binary toggle for settings that apply immediately. `label` wires up a Field for an accessible name; control state with `checked`/`onCheckedChange`, and tune appearance with `size` and `variant`.";

export function Demo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <Switch label="Enabled" checked={enabled} onCheckedChange={setEnabled} />
  );
}
