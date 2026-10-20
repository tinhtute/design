'use client';

import { Slider } from '@/components/ui/slider';

export const notes =
  'Base UI slider with value badges and min/max labels. Pass a number for one thumb or an array to `value`/`defaultValue` for a range; `size="sm"` tightens it for toolbars, and `format` styles the badges via `Intl.NumberFormat`.';

export function Demo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Slider label="Volume" defaultValue={40} />
      <Slider
        label="Price"
        defaultValue={[25, 75]}
        format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
        getAriaLabel={(index) => (index === 0 ? 'Minimum price' : 'Maximum price')}
      />
    </div>
  );
}
