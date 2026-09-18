"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export const notes =
  "Primary action trigger. Use `variant` for emphasis (primary → destructive), `size` for density, and `icon` for leading glyphs; `loading` swaps content for a spinner and disables interaction.";

export function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary" icon={PlusIcon}>
        Create worker
      </Button>
    </div>
  );
}
