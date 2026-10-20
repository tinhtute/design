'use client';

import { useState } from 'react';
import { DateRangePicker } from '@/components/ui/date-range-picker';

export const notes =
  'Deprecated dual-calendar range selector with hover preview, a timezone footer, and reset; prefer `DatePicker` with `mode="range"` in new code. Receive the range through `onStartDateChange` / `onEndDateChange` (both get `null` on reset).';

export function Demo() {
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <DateRangePicker onStartDateChange={setStart} onEndDateChange={setEnd} timezone="UTC" />
      <p className="text-sm text-kumo-subtle">
        {start ? start.toDateString() : 'No start'} – {end ? end.toDateString() : 'No end'}
      </p>
    </div>
  );
}
