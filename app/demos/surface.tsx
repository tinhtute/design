'use client';

import { Surface } from '@/components/ui/surface';

export const notes =
  'Deprecated single-layer card kept for Kumo compatibility — it renders a `LayerCard`. Prefer `LayerCard` in new code; `color` is accepted but no longer changes the surface.';

export function Demo() {
  return (
    <Surface className="max-w-sm">
      <div className="px-5 py-4 text-sm text-kumo-default">
        Workers usage resets on the first of each month.
      </div>
    </Surface>
  );
}
