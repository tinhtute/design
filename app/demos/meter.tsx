'use client';

import { Meter } from '@/components/ui/meter';

export const notes =
  'Progress bar for a measured value within a known range — quotas and usage, not task completion. `label` is linked to the meter for assistive tech; `customValue` replaces the percentage readout and `showValue={false}` hides it.';

export function Demo() {
  return (
    <div className="flex flex-col gap-5">
      <Meter label="KV storage" value={65} customValue="650 MB / 1 GB" />
      <Meter label="Requests today" value={82} />
    </div>
  );
}
