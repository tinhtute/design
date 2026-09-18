"use client";

import { Loader } from "@/components/ui/loader";

export const notes =
  "Spinner for indeterminate waits — inline next to a label or centered in a loading region. `size` takes presets (`sm`/`base`/`lg`) or a pixel number; it renders `role=\"status\"` so pass `aria-label` to localize the screen-reader announcement (default \"Loading\").";

export function Demo() {
  return (
    <div className="flex items-center gap-4">
      <Loader size="sm" />
      <Loader size="base" />
      <Loader size="lg" />
    </div>
  );
}
